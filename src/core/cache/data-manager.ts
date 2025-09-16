/**
 * 数据管理器
 * 提供基准数据存储、时间框架聚合、缓存管理等功能
 */

import type { HistogramData, OhlcData, SingleValueData } from 'lightweight-charts';
import type { ChartData, TimeframeSec } from '../types';
import { 
  aggregateToTimeframe, 
  aggregateIncrementalFromBaseBar, 
  toSingleValueCached 
} from '../utils';

/**
 * 单值数据方法类型
 */
export type SingleValueMethod = 'close' | 'open' | 'high' | 'low' | 'hl2' | 'hlc3' | 'ohlc4';

/**
 * OHLC缓存数据结构
 */
export interface OhlcCacheData {
  /** OHLC数据 */
  d: OhlcData[];
  /** 成交量数据 */
  v: HistogramData[];
}

/**
 * 数据管理器配置选项
 */
export interface DataManagerOptions {
  /** 最大缓存条目数 */
  maxCacheSize?: number;
  /** 是否启用自动清理 */
  autoCleanup?: boolean;
  /** 清理间隔（毫秒） */
  cleanupInterval?: number;
}

/**
 * 数据管理器类
 * 负责管理基准时间框架数据和各种聚合缓存
 */
export class DataManager {
  /** 基准周期数据（如 1m） */
  private base: ChartData[] = [];
  
  /** OHLC缓存：tfSec → 聚合缓存 */
  private ohlcCache = new Map<number, OhlcCacheData>();
  
  /** 单值缓存：`${tfSec}:${method}` → 单值缓存 */
  private singleCache = new Map<string, SingleValueData[]>();
  
  /** 配置选项 */
  private options: Required<DataManagerOptions>;
  
  /** 清理定时器 */
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: DataManagerOptions = {}) {
    this.options = {
      maxCacheSize: 50,
      autoCleanup: true,
      cleanupInterval: 300000, // 5分钟
      ...options
    };

    if (this.options.autoCleanup) {
      this.startAutoCleanup();
    }
  }

  // ============================================================================
  // 基准数据管理
  // ============================================================================

  /**
   * 设置基准周期数据
   * 会清空所有缓存
   */
  setBaseBars(bars: ChartData[]): void {
    // 按时间升序排序，保证聚合的前提条件
    this.base = bars.slice().sort((a, b) => Number(a.time as any) - Number(b.time as any));
    this.clearAllCaches();
  }

  /**
   * 获取基准周期数据
   */
  getBaseBars(): ChartData[] {
    return this.base.slice();
  }

  /**
   * 获取基准数据长度
   */
  getBaseLength(): number {
    return this.base.length;
  }

  /**
   * 应用新的基准数据条
   * 支持增量更新和缓存同步
   */
  applyBaseBar(bar: ChartData): void {
    const newTs = Number(bar.time as any);
    const last = this.base[this.base.length - 1];

    let isRealtimeUpdate = false; // 追加或更新最后一根
    let isBackfillUpdate = false; // 回填历史（非最后一根）

    if (!last) {
      this.base.push(bar);
      isRealtimeUpdate = true;
    } else {
      const lastTs = Number(last.time as any);
      if (newTs > lastTs) {
        // 新时间，直接追加
        this.base.push(bar);
        isRealtimeUpdate = true;
      } else if (newTs === lastTs) {
        // 同一时间，替换最后一根（实时修正）
        this.base[this.base.length - 1] = bar;
        isRealtimeUpdate = true;
      } else {
        // 早于最后一根：查找同时间条替换（避免错误覆盖最后一根）
        // 由于 base 通常是按时间升序，优先从尾部向前扫描小范围
        let replaced = false;
        for (let i = this.base.length - 1; i >= 0; i--) {
          const ts = Number(this.base[i].time as any);
          if (ts === newTs) {
            this.base[i] = bar;
            replaced = true;
            break;
          }
          if (ts < newTs) {
            // 已经越过插入点且未找到同时间，视为过期数据，忽略
            break;
          }
        }
        // 如果替换的是历史位置，则标记为回填更新
        if (replaced) {
          isBackfillUpdate = true;
        } else {
          // 未找到同时间条，忽略该条，保持数据一致性
          return;
        }
      }
    }

    if (isRealtimeUpdate) {
      // 向所有已存在缓存做增量聚合
      for (const [tf, cache] of this.ohlcCache) {
        aggregateIncrementalFromBaseBar(cache.d, cache.v, bar, tf);
        // 级联失效对应的 single cache
        this.invalidateSingleCacheForTimeframe(tf);
      }
    } else if (isBackfillUpdate) {
      // 历史数据被回填或修正：失效所有缓存，等待按需重新聚合，保证一致性
      this.clearAllCaches();
    }
  }

  /**
   * 批量应用基准数据条
   */
  applyBaseBars(bars: ChartData[]): void {
    for (const bar of bars) {
      this.applyBaseBar(bar);
    }
  }

  // ============================================================================
  // OHLC数据获取
  // ============================================================================

  /**
   * 获取指定时间框架的OHLC数据
   */
  getOhlc(tfSec: TimeframeSec): OhlcCacheData {
    let cache = this.ohlcCache.get(tfSec);
    if (!cache) {
      const { data, volumes } = aggregateToTimeframe(this.base, tfSec);
      cache = { d: data, v: volumes };
      this.ohlcCache.set(tfSec, cache);
      
      // 检查缓存大小
      this.checkCacheSize();
    }
    return cache;
  }

  /**
   * 获取指定时间框架的OHLC数据（仅数据部分）
   */
  getOhlcData(tfSec: TimeframeSec): OhlcData[] {
    return this.getOhlc(tfSec).d;
  }

  /**
   * 获取指定时间框架的成交量数据
   */
  getVolumeData(tfSec: TimeframeSec): HistogramData[] {
    return this.getOhlc(tfSec).v;
  }

  // ============================================================================
  // 单值数据获取
  // ============================================================================

  /**
   * 获取指定时间框架和方法的单值数据
   */
  getSingle(tfSec: TimeframeSec, method: SingleValueMethod): SingleValueData[] {
    const key = `${tfSec}:${method}`;
    let sv = this.singleCache.get(key);
    if (!sv) {
      const { d } = this.getOhlc(tfSec);
      sv = toSingleValueCached(d, method);
      this.singleCache.set(key, sv);
      
      // 检查缓存大小
      this.checkCacheSize();
    }
    return sv;
  }

  /**
   * 获取收盘价数据
   */
  getCloseData(tfSec: TimeframeSec): SingleValueData[] {
    return this.getSingle(tfSec, 'close');
  }

  /**
   * 获取开盘价数据
   */
  getOpenData(tfSec: TimeframeSec): SingleValueData[] {
    return this.getSingle(tfSec, 'open');
  }

  /**
   * 获取最高价数据
   */
  getHighData(tfSec: TimeframeSec): SingleValueData[] {
    return this.getSingle(tfSec, 'high');
  }

  /**
   * 获取最低价数据
   */
  getLowData(tfSec: TimeframeSec): SingleValueData[] {
    return this.getSingle(tfSec, 'low');
  }

  // ============================================================================
  // 缓存管理
  // ============================================================================

  /**
   * 清空所有缓存
   */
  clearAllCaches(): void {
    this.ohlcCache.clear();
    this.singleCache.clear();
  }

  /**
   * 清空指定时间框架的缓存
   */
  clearTimeframeCache(tfSec: TimeframeSec): void {
    this.ohlcCache.delete(tfSec);
    this.invalidateSingleCacheForTimeframe(tfSec);
  }

  /**
   * 使指定时间框架的单值缓存失效
   */
  private invalidateSingleCacheForTimeframe(tfSec: TimeframeSec): void {
    const keysToDelete: string[] = [];
    for (const key of this.singleCache.keys()) {
      if (key.startsWith(`${tfSec}:`)) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.singleCache.delete(key);
    }
  }

  /**
   * 检查缓存大小并清理
   */
  private checkCacheSize(): void {
    const totalCacheSize = this.ohlcCache.size + this.singleCache.size;
    if (totalCacheSize > this.options.maxCacheSize) {
      this.performCleanup();
    }
  }

  /**
   * 执行缓存清理
   */
  private performCleanup(): void {
    // 简单的LRU策略：清理一半的缓存
    const ohlcEntries = Array.from(this.ohlcCache.entries());
    const singleEntries = Array.from(this.singleCache.entries());
    
    // 清理OHLC缓存的一半
    const ohlcToRemove = Math.floor(ohlcEntries.length / 2);
    for (let i = 0; i < ohlcToRemove; i++) {
      this.ohlcCache.delete(ohlcEntries[i][0]);
    }
    
    // 清理单值缓存的一半
    const singleToRemove = Math.floor(singleEntries.length / 2);
    for (let i = 0; i < singleToRemove; i++) {
      this.singleCache.delete(singleEntries[i][0]);
    }
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.options.cleanupInterval);
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  // ============================================================================
  // 统计信息
  // ============================================================================

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    ohlcCacheSize: number;
    singleCacheSize: number;
    totalCacheSize: number;
    baseBarsCount: number;
  } {
    return {
      ohlcCacheSize: this.ohlcCache.size,
      singleCacheSize: this.singleCache.size,
      totalCacheSize: this.ohlcCache.size + this.singleCache.size,
      baseBarsCount: this.base.length
    };
  }

  /**
   * 获取已缓存的时间框架列表
   */
  getCachedTimeframes(): TimeframeSec[] {
    return Array.from(this.ohlcCache.keys()) as TimeframeSec[];
  }

  /**
   * 检查指定时间框架是否已缓存
   */
  isTimeframeCached(tfSec: TimeframeSec): boolean {
    return this.ohlcCache.has(tfSec);
  }

  // ============================================================================
  // 销毁
  // ============================================================================

  /**
   * 销毁数据管理器，清理所有资源
   */
  destroy(): void {
    this.stopAutoCleanup();
    this.clearAllCaches();
    this.base = [];
  }
}