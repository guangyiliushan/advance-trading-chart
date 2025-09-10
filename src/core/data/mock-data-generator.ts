/**
 * 模拟数据生成器
 * 为Storybook和开发环境提供模拟的交易数据
 */

import type { Time } from 'lightweight-charts';
import type { ChartData, SimpleChartData } from '../types';
import { toUnixSeconds } from '../utils';

/**
 * 数据生成配置
 */
export interface MockDataConfig {
  /** 数据点数量 */
  count: number;
  /** 基础价格 */
  basePrice: number;
  /** 价格波动范围（百分比） */
  volatility?: number;
  /** 时间间隔（秒） */
  intervalSec: number;
  /** 起始时间（Unix时间戳，可选） */
  startTime?: number;
  /** 趋势方向 (-1: 下跌, 0: 震荡, 1: 上涨) */
  trend?: number;
  /** 成交量基数 */
  baseVolume?: number;
}

/**
 * 生成模拟OHLC数据
 */
export function generateMockData(config: MockDataConfig): ChartData[] {
  const {
    count,
    basePrice,
    volatility = 0.02, // 默认2%波动
    intervalSec,
    startTime = Date.now() / 1000 - count * intervalSec,
    trend = 0,
    baseVolume = 1000
  } = config;

  const data: ChartData[] = [];
  let currentPrice = basePrice;
  let currentTime = startTime;

  for (let i = 0; i < count; i++) {
    // 计算趋势影响
    const trendFactor = trend * 0.001; // 每根K线0.1%的趋势影响
    
    // 生成随机波动
    const randomChange = (Math.random() - 0.5) * volatility * 2;
    const priceChange = (trendFactor + randomChange) * currentPrice;
    
    // 计算新价格
    const newPrice = Math.max(currentPrice + priceChange, 0.01); // 确保价格为正
    
    // 生成OHLC
    const open = currentPrice;
    const close = newPrice;
    
    // 生成高低价（确保逻辑正确）
    const volatilityRange = Math.abs(close - open) * (1 + Math.random());
    const high = Math.max(open, close) + volatilityRange * Math.random();
    const low = Math.min(open, close) - volatilityRange * Math.random();
    
    // 生成成交量（与价格波动相关）
    const priceVolatility = Math.abs(close - open) / open;
    const volumeMultiplier = 0.5 + priceVolatility * 10 + Math.random();
    const volume = Math.floor(baseVolume * volumeMultiplier);
    
    data.push({
      time: currentTime as Time,
      open,
      high,
      low,
      close,
      volume
    });
    
    currentPrice = newPrice;
    currentTime += intervalSec;
  }
  
  return data;
}

/**
 * 生成简单数据（用于线图、面积图等）
 */
export function generateSimpleData(config: Omit<MockDataConfig, 'baseVolume'>): SimpleChartData[] {
  const ohlcData = generateMockData({ ...config, baseVolume: 1000 });
  
  return ohlcData.map(item => ({
    time: item.time,
    value: item.close,
    volume: item.volume,
    up: item.close >= item.open
  }));
}

/**
 * 预定义的交易对配置
 */
export const SYMBOL_CONFIGS: Record<string, Partial<MockDataConfig>> = {
  'BTC/USD': {
    basePrice: 45000,
    volatility: 0.03,
    baseVolume: 1500
  },
  'ETH/USD': {
    basePrice: 3000,
    volatility: 0.04,
    baseVolume: 2000
  },
  'BNB/USD': {
    basePrice: 300,
    volatility: 0.035,
    baseVolume: 1200
  },
  'ADA/USD': {
    basePrice: 0.5,
    volatility: 0.05,
    baseVolume: 5000
  },
  'SOL/USD': {
    basePrice: 100,
    volatility: 0.06,
    baseVolume: 1800
  }
};

/**
 * 时间框架到秒数的映射
 */
export const TIMEFRAME_TO_SECONDS: Record<string, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '4h': 14400,
  '1d': 86400,
  '1w': 604800
};

/**
 * 根据交易对和时间框架生成模拟数据
 */
export function generateDataForSymbol(
  symbol: string,
  timeframe: string,
  count: number = 1000,
  trend: number = 0
): ChartData[] {
  const symbolConfig = SYMBOL_CONFIGS[symbol] || SYMBOL_CONFIGS['BTC/USD'];
  const intervalSec = TIMEFRAME_TO_SECONDS[timeframe] || 3600;
  
  return generateMockData({
    count,
    intervalSec,
    trend,
    ...symbolConfig
  } as MockDataConfig);
}

/**
 * 生成实时数据更新
 */
export function generateRealtimeUpdate(lastBar: ChartData, intervalSec: number): ChartData {
  const volatility = 0.02;
  const change = (Math.random() - 0.5) * volatility;
  const newPrice = lastBar.close * (1 + change);
  
  const high = Math.max(lastBar.close, newPrice, newPrice * (1 + Math.random() * 0.01));
  const low = Math.min(lastBar.close, newPrice, newPrice * (1 - Math.random() * 0.01));
  const volume = (lastBar.volume || 1000) * (0.8 + Math.random() * 0.4);
  
  const lastTime = typeof lastBar.time === 'number' ? lastBar.time : toUnixSeconds(lastBar.time);
  
  if (lastTime === null) {
    throw new Error('Invalid time value in lastBar');
  }
  
  return {
    time: (lastTime + intervalSec) as Time,
    open: lastBar.close,
    high,
    low,
    close: newPrice,
    volume
  };
}

/**
 * 兼容性函数：生成数据（匹配原有API）
 * @param count 数据点数量
 * @param basePrice 基础价格
 * @param _unused 未使用参数（保持兼容性）
 * @param intervalSec 时间间隔（秒）
 */
export function generateData(
  count: number,
  basePrice: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _unused?: any,
  intervalSec: number = 3600
): ChartData[] {
  return generateMockData({
    count,
    basePrice,
    intervalSec,
    volatility: 0.02,
    trend: 0
  });
}