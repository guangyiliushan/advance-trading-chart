/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 真实数据提供者
 * 连接真实的交易数据API
 */

import type { 
  IDataProvider, 
  DataRequest, 
  DataResponse, 
  RealtimeCallback, 
  UnsubscribeFunction,
  DataProviderConfig 
} from './data-provider.types';
import type { ChartData } from '../types';
import { devLog, errorLog } from './environment.utils';

/**
 * API响应数据格式（需要根据实际API调整）
 */
interface ApiKlineData {
  timestamp: number;
  open: string | number;
  high: string | number;
  low: string | number;
  close: string | number;
  volume: string | number;
}

/**
 * WebSocket消息格式
 */
interface WebSocketMessage {
  type: 'kline' | 'error' | 'ping' | 'pong';
  symbol?: string;
  timeframe?: string;
  data?: ApiKlineData;
  error?: string;
}

/**
 * 真实数据提供者实现
 */
export class RealDataProvider implements IDataProvider {
  readonly name = 'RealDataProvider';
  readonly isMock = false;
  
  private config: Required<DataProviderConfig>;
  private wsConnection: WebSocket | null = null;
  private realtimeSubscriptions = new Map<string, RealtimeCallback>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  constructor(config: DataProviderConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || process.env.VITE_API_BASE_URL || 'https://api.example.com',
      apiKey: config.apiKey || process.env.VITE_API_KEY || '',
      timeout: config.timeout || 10000,
      retryCount: config.retryCount || 3,
      enableCache: config.enableCache ?? true,
      cacheExpiry: config.cacheExpiry || 300000 // 5分钟
    };
  }
  
  /**
   * 获取历史数据
   */
  async getHistoricalData(request: DataRequest): Promise<DataResponse<ChartData>> {
    devLog('获取历史数据', request);
    
    const { symbol, timeframe, from, to, limit = 1000 } = request;
    
    try {
      // 构建API请求URL
      const url = new URL(`${this.config.baseUrl}/api/v1/klines`);
      url.searchParams.set('symbol', symbol.replace('/', ''));
      url.searchParams.set('interval', this.mapTimeframeToApi(timeframe));
      url.searchParams.set('limit', limit.toString());
      
      if (from) {
        url.searchParams.set('startTime', (from * 1000).toString());
      }
      if (to) {
        url.searchParams.set('endTime', (to * 1000).toString());
      }
      
      // 发送HTTP请求
      const response = await this.fetchWithRetry(url.toString());
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const apiData: ApiKlineData[] = await response.json();
      
      // 转换API数据格式
      const chartData: ChartData[] = apiData.map(item => ({
        time: (item.timestamp / 1000) as any, // 转换为秒级时间戳
        open: parseFloat(item.open.toString()),
        high: parseFloat(item.high.toString()),
        low: parseFloat(item.low.toString()),
        close: parseFloat(item.close.toString()),
        volume: parseFloat(item.volume.toString())
      }));
      
      devLog(`获取到 ${chartData.length} 条历史数据`, { symbol, timeframe });
      
      return {
        data: chartData,
        hasMore: chartData.length === limit
      };
      
    } catch (error) {
      errorLog('获取历史数据失败', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : '未知错误'
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
    
    // 保存回调函数
    this.realtimeSubscriptions.set(key, callback);
    
    // 确保WebSocket连接
    this.ensureWebSocketConnection();
    
    // 发送订阅消息
    this.sendWebSocketMessage({
      type: 'kline',
      symbol: symbol.replace('/', ''),
      timeframe: this.mapTimeframeToApi(timeframe)
    });
    
    // 返回取消订阅函数
    return () => {
      this.realtimeSubscriptions.delete(key);
      // 如果没有其他订阅，可以考虑关闭WebSocket连接
      if (this.realtimeSubscriptions.size === 0) {
        this.closeWebSocketConnection();
      }
    };
  }
  
  /**
   * 获取支持的交易对列表
   */
  async getSupportedSymbols(): Promise<string[]> {
    try {
      const response = await this.fetchWithRetry(`${this.config.baseUrl}/api/v1/exchangeInfo`);
      const data = await response.json();
      
      // 根据实际API响应格式调整
      return data.symbols?.map((s: any) => `${s.baseAsset}/${s.quoteAsset}`) || [];
    } catch (error) {
      errorLog('获取支持的交易对失败', error);
      return [];
    }
  }
  
  /**
   * 获取支持的时间框架列表
   */
  getSupportedTimeframes(): string[] {
    return ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
  }
  
  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.wsConnection?.readyState === WebSocket.OPEN;
  }
  
  /**
   * 连接到数据源
   */
  async connect(): Promise<void> {
    devLog('连接到真实数据源');
    await this.ensureWebSocketConnection();
  }
  
  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    devLog('断开真实数据源连接');
    this.realtimeSubscriptions.clear();
    this.closeWebSocketConnection();
  }
  
  /**
   * 带重试的HTTP请求
   */
  private async fetchWithRetry(url: string, retryCount = 0): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(url, {
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      if (retryCount < this.config.retryCount) {
        devLog(`请求失败，重试 ${retryCount + 1}/${this.config.retryCount}`, url);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.fetchWithRetry(url, retryCount + 1);
      }
      throw error;
    }
  }
  
  /**
   * 确保WebSocket连接
   */
  private async ensureWebSocketConnection(): Promise<void> {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.config.baseUrl.replace('http', 'ws') + '/ws';
        this.wsConnection = new WebSocket(wsUrl);
        
        this.wsConnection.onopen = () => {
          devLog('WebSocket连接已建立');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.wsConnection.onmessage = (event) => {
          this.handleWebSocketMessage(event.data);
        };
        
        this.wsConnection.onclose = () => {
          devLog('WebSocket连接已关闭');
          this.handleWebSocketReconnect();
        };
        
        this.wsConnection.onerror = (error) => {
          errorLog('WebSocket连接错误', error);
          reject(error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * 关闭WebSocket连接
   */
  private closeWebSocketConnection(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
  
  /**
   * 处理WebSocket重连
   */
  private handleWebSocketReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.realtimeSubscriptions.size > 0) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      devLog(`WebSocket重连中... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.ensureWebSocketConnection().catch(error => {
          errorLog('WebSocket重连失败', error);
        });
      }, delay);
    }
  }
  
  /**
   * 发送WebSocket消息
   */
  private sendWebSocketMessage(message: any): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message));
    }
  }
  
  /**
   * 处理WebSocket消息
   */
  private handleWebSocketMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      if (message.type === 'kline' && message.data && message.symbol && message.timeframe) {
        const key = `${message.symbol.replace('', '/')}:${this.mapApiToTimeframe(message.timeframe)}`;
        const callback = this.realtimeSubscriptions.get(key);
        
        if (callback) {
          const chartData: ChartData = {
            time: (message.data.timestamp / 1000) as any,
            open: parseFloat(message.data.open.toString()),
            high: parseFloat(message.data.high.toString()),
            low: parseFloat(message.data.low.toString()),
            close: parseFloat(message.data.close.toString()),
            volume: parseFloat(message.data.volume.toString())
          };
          
          callback(chartData);
        }
      }
      
    } catch (error) {
      errorLog('处理WebSocket消息失败', error);
    }
  }
  
  /**
   * 将时间框架映射到API格式
   */
  private mapTimeframeToApi(timeframe: string): string {
    const mapping: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w'
    };
    return mapping[timeframe] || timeframe;
  }
  
  /**
   * 将API时间框架映射回标准格式
   */
  private mapApiToTimeframe(apiTimeframe: string): string {
    const mapping: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w'
    };
    return mapping[apiTimeframe] || apiTimeframe;
  }
}

/**
 * 创建真实数据提供者实例
 */
export function createRealDataProvider(config?: DataProviderConfig): IDataProvider {
  return new RealDataProvider(config);
}