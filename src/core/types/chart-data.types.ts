/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Time } from 'lightweight-charts';

/**
 * 基础图表数据类型
 */
export interface ChartData {
  /** 时间戳 */
  time: Time;
  /** 开盘价 */
  open: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 收盘价 */
  close: number;
  /** 成交量（可选） */
  volume?: number;
}

/**
 * 简单图表数据类型（用于线图、面积图等）
 */
export interface SimpleChartData {
  /** 时间戳 */
  time: Time;
  /** 数值 */
  value: number;
  /** 成交量（可选） */
  volume?: number;
  /** 是否上涨（可选，用于颜色区分） */
  up?: boolean;
}

/**
 * API数据类型联合
 */
export type ApiDataType = ChartData | SimpleChartData;

/**
 * 数据源接口
 */
export interface DataSource {
  /** 获取历史数据 */
  getHistoricalData(symbol: string, timeframe: string, from?: number, to?: number): Promise<ChartData[]>;
  /** 订阅实时数据 */
  subscribeRealtime?(symbol: string, timeframe: string, callback: (data: ChartData) => void): () => void;
}

/**
 * 预测数据点接口
 * 表示某个价格区间的预测信息
 */
export interface PredictionPoint {
  /** 价格区间下边界 */
  priceFrom: number;
  /** 价格区间上边界 */
  priceTo: number;
  /** 预测概率 (0-1) */
  probability: number;
  /** 预测置信度 (0-1，可选) */
  confidence?: number;
  /** 预测类型标识（可选） */
  type?: 'bullish' | 'bearish' | 'neutral';
  /** 预测强度 (0-1，可选) */
  strength?: number;
}

/**
 * 预测数据接口
 * 包含某个时间点的完整预测信息
 */
export interface PredictionData {
  /** 时间戳 */
  time: Time;
  /** 预测的基准价格（当前价格） */
  basePrice: number;
  /** 预测时间范围（秒） */
  predictionHorizon: number;
  /** 预测数据点数组 */
  predictions: PredictionPoint[];
  /** 预测模型标识（可选） */
  modelId?: string;
  /** 预测生成时间（可选） */
  generatedAt?: number;
  /** 预测元数据（可选） */
  metadata?: Record<string, any>;
}

/**
 * 热力图预测数据接口
 * 专门用于热力图展示的预测数据格式
 */
export interface HeatMapPredictionData {
  /** 时间戳 */
  time: Time;
  /** 预测单元格数组 */
  cells: Array<{
    /** 价格区间下边界 */
    low: number;
    /** 价格区间上边界 */
    high: number;
    /** 预测概率/强度值 (0-1) */
    amount: number;
    /** 预测类型（可选） */
    predictionType?: 'bullish' | 'bearish' | 'neutral';
    /** 置信度（可选） */
    confidence?: number;
  }>;
  /** 预测元数据（可选） */
  metadata?: {
    modelId?: string;
    basePrice?: number;
    predictionHorizon?: number;
    generatedAt?: number;
  };
}

/**
 * 扩展的API数据类型联合
 */
export type ExtendedApiDataType = ApiDataType | PredictionData | HeatMapPredictionData;

/**
 * 预测数据源接口
 * 扩展基础数据源，支持预测数据获取
 */
export interface PredictionDataSource extends DataSource {
  /** 获取预测数据 */
  getPredictionData(symbol: string, timeframe: string, horizon?: number): Promise<PredictionData[]>;
  /** 获取热力图预测数据 */
  getHeatMapPredictionData(symbol: string, timeframe: string, horizon?: number): Promise<HeatMapPredictionData[]>;
  /** 订阅实时预测数据 */
  subscribePredictionRealtime?(symbol: string, timeframe: string, callback: (data: PredictionData) => void): () => void;
}