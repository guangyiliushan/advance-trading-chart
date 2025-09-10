/**
 * 模拟数据提供者
 * 为Storybook和开发环境提供模拟数据服务
 */

import type { 
  IDataProvider, 
  DataRequest, 
  DataResponse, 
  RealtimeCallback, 
  UnsubscribeFunction 
} from './data-provider.types';
import type { ChartData } from '../types';
import { 
  generateDataForSymbol, 
  generateRealtimeUpdate, 
  SYMBOL_CONFIGS, 
  TIMEFRAME_TO_SECONDS 
} from './mock-data-generator';
import { devLog } from './environment.utils';
import { toUnixSeconds } from '../utils';

/**
 * 模拟数据提供者实现
 */
export class MockDataProvider implements IDataProvider {
  readonly name = 'MockDataProvider';
  readonly isMock = true;
  
  private realtimeSubscriptions = new Map<string, {
    callback: RealtimeCallback;
    intervalId: NodeJS.Timeout;
    lastBar: ChartData;
  }>();
  
  constructor() {
    // 无需参数的构造函数
  }
  
  /**
   * 获取历史数据
   */
  async getHistoricalData(request: DataRequest): Promise<DataResponse<ChartData>> {
    devLog('获取历史数据', request);
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      
      const { symbol, timeframe, limit = 1000 } = request;
      
      // 生成模拟数据
      const data = generateDataForSymbol(symbol, timeframe, limit);
      
      // 如果指定了时间范围，进行过滤
      let filteredData = data;
      if (request.from || request.to) {
          filteredData = data.filter(item => {
            const time = typeof item.time === 'number' ? item.time : toUnixSeconds(item.time);
            const fromTime = request.from ? (typeof request.from === 'number' ? request.from : toUnixSeconds(request.from)) : null;
            const toTime = request.to ? (typeof request.to === 'number' ? request.to : toUnixSeconds(request.to)) : null;
            
            if (fromTime && time !== null && time < fromTime) return false;
            if (toTime && time !== null && time > toTime) return false;
            return true;
          });
      }
      
      devLog(`生成了 ${filteredData.length} 条数据`, { symbol, timeframe });
      
      return {
        data: filteredData,
        hasMore: false // 模拟数据不需要分页
      };
    } catch (error) {
      console.error('模拟数据获取失败:', error);
      return {
        data: [],
        error: '模拟数据生成失败'
      };
    }
  }
  
  /**
   * 订阅实时数据
   */
  subscribeRealtime(
    symbol: string, 
    timeframe: string, 
    callback: RealtimeCallback
  ): UnsubscribeFunction {
    const key = `${symbol}:${timeframe}`;
    devLog('订阅实时数据', { symbol, timeframe });
    
    // 如果已经有订阅，先取消
    if (this.realtimeSubscriptions.has(key)) {
      this.unsubscribeRealtime(key);
    }
    
    // 生成初始数据作为最后一根K线
    const initialData = generateDataForSymbol(symbol, timeframe, 1);
    const lastBar = initialData[0];
    
    // 设置定时器模拟实时数据
    const intervalSec = TIMEFRAME_TO_SECONDS[timeframe] || 3600;
    const updateInterval = Math.min(intervalSec * 1000, 5000); // 最多5秒更新一次
    
    const intervalId = setInterval(() => {
      const subscription = this.realtimeSubscriptions.get(key);
      if (subscription) {
        const newBar = generateRealtimeUpdate(subscription.lastBar, intervalSec);
        subscription.lastBar = newBar;
        subscription.callback(newBar);
      }
    }, updateInterval);
    
    // 保存订阅信息
    this.realtimeSubscriptions.set(key, {
      callback,
      intervalId,
      lastBar
    });
    
    // 返回取消订阅函数
    return () => this.unsubscribeRealtime(key);
  }
  
  /**
   * 取消实时数据订阅
   */
  private unsubscribeRealtime(key: string): void {
    const subscription = this.realtimeSubscriptions.get(key);
    if (subscription) {
      clearInterval(subscription.intervalId);
      this.realtimeSubscriptions.delete(key);
      devLog('取消实时数据订阅', key);
    }
  }
  
  /**
   * 获取支持的交易对列表
   */
  async getSupportedSymbols(): Promise<string[]> {
    return Object.keys(SYMBOL_CONFIGS);
  }
  
  /**
   * 获取支持的时间框架列表
   */
  getSupportedTimeframes(): string[] {
    return Object.keys(TIMEFRAME_TO_SECONDS);
  }
  
  /**
   * 检查连接状态（模拟数据始终连接）
   */
  isConnected(): boolean {
    return true;
  }
  
  /**
   * 连接到数据源（模拟数据无需连接）
   */
  async connect(): Promise<void> {
    devLog('模拟数据提供者已连接');
  }
  
  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    // 清理所有实时订阅
    for (const [key] of this.realtimeSubscriptions) {
      this.unsubscribeRealtime(key);
    }
    devLog('模拟数据提供者已断开连接');
  }
}

/**
 * 创建模拟数据提供者实例
 */
export function createMockDataProvider(): IDataProvider {
  return new MockDataProvider();
}