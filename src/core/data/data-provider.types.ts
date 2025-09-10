/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 数据提供者类型定义
 * 定义统一的数据接口抽象层，支持模拟数据和真实数据源
 */

import type { ChartData } from '../types';
import type { PredictionData, HeatMapPredictionData } from '../types/chart-data.types';

/**
 * 数据请求参数
 */
export interface DataRequest {
  /** 交易对符号 */
  symbol: string;
  /** 时间框架 */
  timeframe: string;
  /** 开始时间（Unix时间戳） */
  from?: number;
  /** 结束时间（Unix时间戳） */
  to?: number;
  /** 数据点数量限制 */
  limit?: number;
}

/**
 * 数据响应结果
 */
export interface DataResponse<T = ChartData> {
  /** 数据数组 */
  data: T[];
  /** 是否还有更多数据 */
  hasMore?: boolean;
  /** 下一页标识 */
  nextCursor?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 实时数据回调函数
 */
export type RealtimeCallback = (data: ChartData) => void;

/**
 * 实时数据订阅取消函数
 */
export type UnsubscribeFunction = () => void;

/**
 * 数据提供者接口
 */
export interface IDataProvider {
  /** 提供者名称 */
  readonly name: string;
  
  /** 是否为模拟数据 */
  readonly isMock: boolean;
  
  /**
   * 获取历史数据
   */
  getHistoricalData(request: DataRequest): Promise<DataResponse<ChartData>>;
  
  /**
   * 订阅实时数据
   */
  subscribeRealtime?(symbol: string, timeframe: string, callback: RealtimeCallback): UnsubscribeFunction;
  
  /**
   * 获取支持的交易对列表
   */
  getSupportedSymbols?(): Promise<string[]>;
  
  /**
   * 获取支持的时间框架列表
   */
  getSupportedTimeframes?(): string[];
  
  /**
   * 检查连接状态
   */
  isConnected?(): boolean;
  
  /**
   * 连接到数据源
   */
  connect?(): Promise<void>;
  
  /**
   * 断开连接
   */
  disconnect?(): Promise<void>;
}

/**
 * 数据提供者工厂接口
 */
export interface IDataProviderFactory {
  /**
   * 创建数据提供者实例
   */
  createProvider(config?: any): IDataProvider;
  
  /**
   * 获取提供者类型
   */
  getProviderType(): 'mock' | 'real';
}

/**
 * 环境检测结果
 */
export interface EnvironmentInfo {
  /** 是否为Storybook环境 */
  isStorybook: boolean;
  /** 是否为开发环境 */
  isDevelopment: boolean;
  /** 是否为生产环境 */
  isProduction: boolean;
  /** 是否为测试环境 */
  isTest: boolean;
}

/**
 * 数据提供者配置
 */
export interface DataProviderConfig {
  /** API基础URL */
  baseUrl?: string;
  /** API密钥 */
  apiKey?: string;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 重试次数 */
  retryCount?: number;
  /** 是否启用缓存 */
  enableCache?: boolean;
  /** 缓存过期时间（毫秒） */
  cacheExpiry?: number;
}

/**
 * 扩展的数据提供者接口
 * 支持预测数据的获取和处理
 */
export interface IPredictionDataProvider extends IDataProvider {
  /** 获取预测数据 */
  getPredictionData(request: PredictionDataRequest): Promise<DataResponse<PredictionData>>;
  /** 获取热力图预测数据 */
  getHeatMapPredictionData(request: PredictionDataRequest): Promise<DataResponse<HeatMapPredictionData>>;
  /** 订阅实时预测数据 */
  subscribePredictionRealtime?(symbol: string, timeframe: string, callback: PredictionRealtimeCallback): UnsubscribeFunction;
  /** 获取支持的预测模型 */
  getSupportedModels?(): Promise<string[]>;
}

/**
 * 预测数据请求参数
 */
export interface PredictionDataRequest extends DataRequest {
  /** 预测时间范围（秒） */
  predictionHorizon?: number;
  /** 预测模型ID */
  modelId?: string;
  /** 置信度阈值 */
  confidenceThreshold?: number;
}

/**
 * 预测数据实时回调函数类型
 */
export type PredictionRealtimeCallback = (data: PredictionData) => void;