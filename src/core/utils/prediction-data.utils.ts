/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Time } from 'lightweight-charts';
import type { PredictionData, HeatMapPredictionData, PredictionPoint } from '../types/chart-data.types';
import type { HeatMapData } from '../../components/advance-chart-components/main/chart/series/heatmap/data';

/**
 * 预测数据转换工具类
 * 提供预测数据格式转换和处理功能
 */
export class PredictionDataConverter {
  /**
   * 将预测数据转换为热力图数据格式
   * @param predictionData 原始预测数据
   * @param options 转换选项
   * @returns 热力图数据数组
   */
  static toHeatMapData(
    predictionData: PredictionData[],
    options: {
      /** 价格区间大小 */
      priceStep?: number;
      /** 最小概率阈值 */
      minProbability?: number;
      /** 最大价格偏差百分比 */
      maxPriceDeviation?: number;
    } = {}
  ): HeatMapData[] {
    const { priceStep = 10, minProbability = 0.01, maxPriceDeviation = 0.1 } = options;
    
    return predictionData.map(data => {
      // 计算价格范围
      const basePrice = data.basePrice;
      const maxDeviation = basePrice * maxPriceDeviation;
      const minPrice = basePrice - maxDeviation;
      const maxPrice = basePrice + maxDeviation;
      
      // 创建价格网格
      const cells = [];
      for (let price = minPrice; price <= maxPrice; price += priceStep) {
        const cellHigh = price + priceStep;
        
        // 查找该价格区间的预测概率
        const matchingPredictions = data.predictions.filter(pred => 
          pred.priceFrom <= cellHigh && pred.priceTo >= price
        );
        
        if (matchingPredictions.length > 0) {
          // 计算加权平均概率
          const totalProbability = matchingPredictions.reduce((sum, pred) => {
            const overlap = Math.min(cellHigh, pred.priceTo) - Math.max(price, pred.priceFrom);
            const weight = overlap / (pred.priceTo - pred.priceFrom);
            return sum + pred.probability * weight;
          }, 0);
          
          if (totalProbability >= minProbability) {
            cells.push({
              low: price,
              high: cellHigh,
              amount: Math.min(totalProbability, 1) // 确保不超过1
            });
          }
        }
      }
      
      return {
        time: data.time,
        cells
      };
    });
  }
  
  /**
   * 将热力图预测数据转换为标准热力图数据
   * @param heatMapPredictionData 热力图预测数据
   * @returns 热力图数据数组
   */
  static fromHeatMapPredictionData(
    heatMapPredictionData: HeatMapPredictionData[]
  ): HeatMapData[] {
    return heatMapPredictionData.map(data => ({
      time: data.time,
      cells: data.cells.map(cell => ({
        low: cell.low,
        high: cell.high,
        amount: cell.amount
      }))
    }));
  }
  
  /**
   * 标准化预测概率值
   * @param predictions 预测数据数组
   * @param method 标准化方法
   * @returns 标准化后的预测数据
   */
  static normalizeProbabilities(
    predictions: PredictionPoint[],
    method: 'minmax' | 'zscore' | 'softmax' = 'minmax'
  ): PredictionPoint[] {
    if (predictions.length === 0) return predictions;
    
    const probabilities = predictions.map(p => p.probability);
    
    switch (method) {
      case 'minmax': {
        const min = Math.min(...probabilities);
        const max = Math.max(...probabilities);
        const range = max - min;
        
        if (range === 0) return predictions;
        
        return predictions.map(pred => ({
          ...pred,
          probability: (pred.probability - min) / range
        }));
      }
      
      case 'softmax': {
        const expSum = probabilities.reduce((sum, p) => sum + Math.exp(p), 0);
        return predictions.map(pred => ({
          ...pred,
          probability: Math.exp(pred.probability) / expSum
        }));
      }
      
      case 'zscore': {
        const mean = probabilities.reduce((sum, p) => sum + p, 0) / probabilities.length;
        const variance = probabilities.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / probabilities.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev === 0) return predictions;
        
        return predictions.map(pred => ({
          ...pred,
          probability: Math.max(0, Math.min(1, (pred.probability - mean) / stdDev * 0.2 + 0.5))
        }));
      }
      
      default:
        return predictions;
    }
  }
  
  /**
   * 验证预测数据格式
   * @param data 要验证的数据
   * @returns 验证结果
   */
  static validatePredictionData(data: any): data is PredictionData {
    return (
      data &&
      typeof data.time !== 'undefined' &&
      typeof data.basePrice === 'number' &&
      typeof data.predictionHorizon === 'number' &&
      Array.isArray(data.predictions) &&
      data.predictions.every((pred: any) => 
        typeof pred.priceFrom === 'number' &&
        typeof pred.priceTo === 'number' &&
        typeof pred.probability === 'number' &&
        pred.probability >= 0 && pred.probability <= 1
      )
    );
  }
}

/**
 * 预测数据工具函数
 */

/**
 * 创建预测数据的快捷函数
 * @param time 时间戳
 * @param basePrice 基准价格
 * @param predictions 预测点数组
 * @param options 可选参数
 * @returns 预测数据对象
 */
export function createPredictionData(
  time: Time,
  basePrice: number,
  predictions: PredictionPoint[],
  options: {
    predictionHorizon?: number;
    modelId?: string;
    metadata?: Record<string, any>;
  } = {}
): PredictionData {
  return {
    time,
    basePrice,
    predictionHorizon: options.predictionHorizon || 3600, // 默认1小时
    predictions,
    modelId: options.modelId,
    generatedAt: Date.now(),
    metadata: options.metadata
  };
}

/**
 * 创建预测点的快捷函数
 * @param priceFrom 价格下边界
 * @param priceTo 价格上边界
 * @param probability 概率
 * @param options 可选参数
 * @returns 预测点对象
 */
export function createPredictionPoint(
  priceFrom: number,
  priceTo: number,
  probability: number,
  options: {
    confidence?: number;
    type?: 'bullish' | 'bearish' | 'neutral';
    strength?: number;
  } = {}
): PredictionPoint {
  return {
    priceFrom,
    priceTo,
    probability: Math.max(0, Math.min(1, probability)), // 确保在0-1范围内
    ...options
  };
}