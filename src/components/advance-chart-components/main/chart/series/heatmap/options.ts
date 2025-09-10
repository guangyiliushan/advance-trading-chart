/* eslint-disable @typescript-eslint/no-explicit-any */
import { type CustomSeriesOptions, customSeriesDefaultOptions } from 'lightweight-charts';
import { defaultColorShader } from './color-utils';

/**
 * 热力图单元格着色器函数类型
 * 根据数量值返回对应的颜色字符串
 */
export type HeatMapCellShader = (amount: number) => string;

/**
 * 热力图系列选项接口
 * 继承自 lightweight-charts 的 CustomSeriesOptions
 */
export interface HeatMapSeriesOptions extends CustomSeriesOptions {
  /** 不显示最后一个值的标签 */
  lastValueVisible: false;
  /** 不显示价格线 */
  priceLineVisible: false;
  /** 单元格着色器函数，用于根据数值生成颜色 */
  cellShader: HeatMapCellShader;
  /** 单元格边框宽度 */
  cellBorderWidth: number;
  /** 单元格边框颜色 */
  cellBorderColor: string;
  /** 颜色透明度 (0-1)，值越小越透明 */
  colorOpacity: number;
}

/**
 * 热力图系列的默认选项配置
 */
export const defaultOptions: HeatMapSeriesOptions = {
  // 继承默认的自定义系列选项
  ...customSeriesDefaultOptions,
  // 隐藏最后一个值的显示
  lastValueVisible: false,
  // 隐藏价格线
  priceLineVisible: false,
  // 使用抽离出来的默认颜色着色器
  cellShader: defaultColorShader,
  // 默认边框宽度为 1 像素
  cellBorderWidth: 1,
  // 默认边框颜色为透明
  cellBorderColor: 'transparent',
  // 默认颜色透明度为 0.7
  colorOpacity: 0.7,
} as const;

/**
 * 预测热力图专用选项接口
 */
export interface predictionDataOptions extends HeatMapSeriesOptions {
  /** 预测模式配置 */
  predictionMode: {
    /** 是否启用预测模式 */
    enabled: boolean;
    /** 预测类型颜色映射 */
    typeColors?: {
      bullish?: string;
      bearish?: string;
      neutral?: string;
    };
    /** 置信度显示配置 */
    confidenceDisplay?: {
      enabled: boolean;
      /** 低置信度透明度 */
      lowConfidenceOpacity: number;
      /** 置信度阈值 */
      confidenceThreshold: number;
    };
    /** 预测强度映射 */
    strengthMapping?: {
      enabled: boolean;
      /** 强度到透明度的映射函数 */
      strengthToOpacity: (strength: number) => number;
    };
  };
  /** 交互增强配置 */
  interactionEnhancement: {
    /** 悬停时显示详细信息 */
    showDetailOnHover: boolean;
    /** 点击时的回调函数 */
    onCellClick?: (cellData: any) => void;
    /** 悬停时的回调函数 */
    onCellHover?: (cellData: any) => void;
  };
}

/**
 * 预测热力图的默认选项
 */
export const predictionDataDefaultOptions: predictionDataOptions = {
  ...defaultOptions,
  predictionMode: {
    enabled: true,
    typeColors: {
      bullish: '#22c55e', // 绿色
      bearish: '#ef4444', // 红色
      neutral: '#6b7280'  // 灰色
    },
    confidenceDisplay: {
      enabled: true,
      lowConfidenceOpacity: 0.3,
      confidenceThreshold: 0.5
    },
    strengthMapping: {
      enabled: true,
      strengthToOpacity: (strength: number) => 0.3 + strength * 0.7
    }
  },
  interactionEnhancement: {
    showDetailOnHover: true
  }
};
