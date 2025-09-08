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
