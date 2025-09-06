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