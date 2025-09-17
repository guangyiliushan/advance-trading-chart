/**
 * 缓存管理器
 * 提供多符号数据缓存、预热、增量更新等功能
 */

import type { HistogramData, OhlcData } from 'lightweight-charts';
import type { ChartData, TimeframeSec } from '../types';
import { DataManager } from './data-manager';
import { getWarmupList } from './timeframe.utils';

/**
 * 符号上下文数据结构
 */
interface SymbolContext {
  /** 数据管理器实例 */
  dm: DataManager;
  /** 基准时间框架（秒） */
  baseTfSec: TimeframeSec;
  /** 最后更新时间 */
  lastUpdate: number;
}

/**
 * 缓存管理器配置选项
 */
export interface CacheManagerOptions {
  /** 是否使用Web Worker */
  useWorker?: boolean;
  /** 最大符号缓存数量 */
  maxSymbols?: number;
  /** 默认预热间隔（毫秒） */
  defaultWarmupInterval?: number;
  /** 是否启用自动清理 */
  autoCleanup?: boolean;
}

/**
 * 合并OHLC数据和成交量数据为ChartData格式
 */
function mergeOhlcWithVolumes(ohlc: OhlcData[], vols: HistogramData[]): ChartData[] {
  const out: ChartData[] = new Array(Math.min(ohlc.length, vols.length));
  
  for (let i = 0; i < out.length; i++) {
    const d = ohlc[i];
    const v = vols[i];
    out[i] = {
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: typeof v?.value === 'number' ? Number(v.value) : undefined,
    };
  }
  
  // 如果成交量数组较短或缺失，仍返回OHLC映射数据
  if (!vols || vols.length < ohlc.length) {
    for (let i = (vols?.length ?? 0); i < ohlc.length; i++) {
      const d = ohlc[i];
      out[i] = {
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      } as any;
    }
  }
  
  return out;
}

/**
 * 缓存管理器类
 * 负责管理多个符号的数据缓存和预热策略
 */
export class CacheManager {
  /** 符号映射表 */
  private symbolMap = new Map<string, SymbolContext>();
  
  /** 预热定时器 */
  private warmTimer: NodeJS.Timeout | null = null;
  
  /** 预热时间框架列表 */
  private warmupTfs: TimeframeSec[] = [];
  
  /** 当前符号 */
  private currentSymbol: string | null = null;
  
  /** 配置选项 */
  private options: Required<CacheManagerOptions>;

  constructor(options: CacheManagerOptions = {}) {
    this.options = {
      useWorker: false,
      maxSymbols: 10,
      defaultWarmupInterval: 60000,
      autoCleanup: true,
      ...options
    };
  }

  // ============================================================================
  // 基础数据管理
  // ============================================================================

  /**
   * 初始化或替换符号的基准数据集
   */
  setBase(symbol: string, bars: ChartData[], baseTfSec: TimeframeSec): void {
    let ctx = this.symbolMap.get(symbol);
    
    if (!ctx) {
      ctx = {
        dm: new DataManager(),
        baseTfSec,
        lastUpdate: Date.now()
      };
      this.symbolMap.set(symbol, ctx);
    }
    
    // 如果基准时间框架改变，创建新的数据管理器
    if (ctx.baseTfSec !== baseTfSec) {
      ctx.dm.destroy();
      ctx.dm = new DataManager();
      ctx.baseTfSec = baseTfSec;
    }
    
    ctx.dm.setBaseBars(bars);
    ctx.lastUpdate = Date.now();
    this.currentSymbol = symbol;
    
    // 检查符号数量限制
    this.checkSymbolLimit();
  }

  /**
   * 增量应用基准数据条
   */
  applyBaseBar(symbol: string, bar: ChartData): void {
    const ctx = this.symbolMap.get(symbol);
    if (!ctx) return;
    
    ctx.dm.applyBaseBar(bar);
    ctx.lastUpdate = Date.now();
  }

  /**
   * 批量应用基准数据条
   */
  applyBaseBars(symbol: string, bars: ChartData[]): void {
    const ctx = this.symbolMap.get(symbol);
    if (!ctx) return;
    
    ctx.dm.applyBaseBars(bars);
    ctx.lastUpdate = Date.now();
  }

  // ============================================================================
  // 数据获取
  // ============================================================================

  /**
   * 获取指定时间框架的聚合数据
   * 如果请求的时间框架小于或等于基准时间框架，返回基准数据
   */
  getForTimeframe(symbol: string, tfSec: TimeframeSec): ChartData[] {
    const ctx = this.symbolMap.get(symbol);
    if (!ctx) return [];
    
    const baseMerged = (() => {
      const { d, v } = ctx.dm.getOhlc(ctx.baseTfSec);
      return mergeOhlcWithVolumes(d, v);
    })();

    if (tfSec <= ctx.baseTfSec) {
      // 不向下缩放，直接返回基准聚合结果
      return baseMerged;
    }
    
    const { d, v } = ctx.dm.getOhlc(tfSec);
    return mergeOhlcWithVolumes(d, v);
  }

  /**
   * 获取符号的基准数据
   */
  getBaseData(symbol: string): ChartData[] {
    const ctx = this.symbolMap.get(symbol);
    if (!ctx) return [];
    return ctx.dm.getBaseBars();
  }

  /**
   * 获取符号的基准时间框架
   */
  getBaseTimeframe(symbol: string): TimeframeSec | null {
    const ctx = this.symbolMap.get(symbol);
    return ctx ? ctx.baseTfSec : null;
  }

  // ============================================================================
  // 预热管理
  // ============================================================================

  /**
   * 为指定时间框架列表预热缓存
   */
  warmup(symbol: string, list: TimeframeSec[]): void {
    const ctx = this.symbolMap.get(symbol);
    if (!ctx) return;
    
    const uniq = Array.from(new Set(list)).sort((a, b) => a - b);
    for (const tf of uniq) {
      if (tf < ctx.baseTfSec) continue;
      ctx.dm.getOhlc(tf);
    }
  }

  /**
   * 启动定期预热
   */
  startWarmup(symbol: string, list: TimeframeSec[], intervalMs?: number): void {
    this.stopWarmup();
    this.currentSymbol = symbol;
    this.warmupTfs = list.slice();
    
    // 立即执行一次预热
    this.warmup(symbol, this.warmupTfs);
    
    // 设置定期预热（在基准数据增量更新时很有用）
    const interval = intervalMs ?? this.options.defaultWarmupInterval;
    this.warmTimer = setInterval(() => {
      if (!this.currentSymbol) return;
      this.warmup(this.currentSymbol, this.warmupTfs);
    }, Math.max(10000, interval));
  }

  /**
   * 停止预热
   */
  stopWarmup(): void {
    if (this.warmTimer) {
      clearInterval(this.warmTimer);
      this.warmTimer = null;
    }
  }

  /**
   * 使用推荐的预热列表启动预热
   */
  startRecommendedWarmup(symbol: string, intervalMs?: number): void {
    const ctx = this.symbolMap.get(symbol);
    if (!ctx) return;
    
    const warmupList = getWarmupList(ctx.baseTfSec);
    this.startWarmup(symbol, warmupList, intervalMs);
  }

  // ============================================================================
  // 符号管理
  // ============================================================================

  /**
   * 获取所有已缓存的符号列表
   */
  getCachedSymbols(): string[] {
    return Array.from(this.symbolMap.keys());
  }

  /**
   * 检查符号是否已缓存
   */
  hasSymbol(symbol: string): boolean {
    return this.symbolMap.has(symbol);
  }

  /**
   * 移除符号缓存
   */
  removeSymbol(symbol: string): boolean {
    const ctx = this.symbolMap.get(symbol);
    if (ctx) {
      ctx.dm.destroy();
      this.symbolMap.delete(symbol);
      
      if (this.currentSymbol === symbol) {
        this.stopWarmup();
        this.currentSymbol = null;
      }
      
      return true;
    }
    return false;
  }

  /**
   * 清空所有符号缓存
   */
  clearAllSymbols(): void {
    for (const ctx of this.symbolMap.values()) {
      ctx.dm.destroy();
    }
    this.symbolMap.clear();
    this.stopWarmup();
    this.currentSymbol = null;
  }

  /**
   * 检查符号数量限制并清理
   */
  private checkSymbolLimit(): void {
    if (this.symbolMap.size > this.options.maxSymbols) {
      this.cleanupOldSymbols();
    }
  }

  /**
   * 清理最旧的符号
   */
  private cleanupOldSymbols(): void {
    const symbols = Array.from(this.symbolMap.entries())
      .sort(([, a], [, b]) => a.lastUpdate - b.lastUpdate)
      .slice(0, Math.floor(this.symbolMap.size / 2))
      .map(([symbol]) => symbol);
    
    for (const symbol of symbols) {
      this.removeSymbol(symbol);
    }
  }

  // ============================================================================
  // 统计信息
  // ============================================================================

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    symbolCount: number;
    totalCacheSize: number;
    currentSymbol: string | null;
    isWarmupActive: boolean;
  } {
    let totalCacheSize = 0;
    for (const ctx of this.symbolMap.values()) {
      const stats = ctx.dm.getCacheStats();
      totalCacheSize += stats.totalCacheSize;
    }
    
    return {
      symbolCount: this.symbolMap.size,
      totalCacheSize,
      currentSymbol: this.currentSymbol,
      isWarmupActive: this.warmTimer !== null
    };
  }

  /**
   * 获取符号的详细统计信息
   */
  getSymbolStats(symbol: string): {
    baseTfSec: TimeframeSec;
    lastUpdate: number;
    cacheStats: ReturnType<DataManager['getCacheStats']>;
  } | null {
    const ctx = this.symbolMap.get(symbol);
    if (!ctx) return null;
    
    return {
      baseTfSec: ctx.baseTfSec,
      lastUpdate: ctx.lastUpdate,
      cacheStats: ctx.dm.getCacheStats()
    };
  }

  // ============================================================================
  // 销毁
  // ============================================================================

  /**
   * 销毁缓存管理器，清理所有资源
   */
  destroy(): void {
    this.stopWarmup();
    this.clearAllSymbols();
  }
}

// ============================================================================
// 单例实例
// ============================================================================

/**
 * 默认缓存管理器实例
 */
export const cacheManager = new CacheManager({ useWorker: false });