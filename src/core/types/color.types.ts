/**
 * RGB颜色值类型（红、绿、蓝）
 */
export type RGB = [number, number, number];

/**
 * 带透明度的RGB颜色类型
 */
export interface RGBWithA {
  /** RGB颜色值 */
  rgb: RGB;
  /** 透明度（0-1） */
  a?: number;
}

/**
 * 十六进制颜色字符串
 */
export type HexColor = string;

/**
 * 颜色主题类型
 */
export type ColorTheme = 'light' | 'dark';

/**
 * 图表颜色配置
 */
export interface ChartColorConfig {
  /** 背景色 */
  background?: string;
  /** 网格线颜色 */
  grid?: string;
  /** 文字颜色 */
  text?: string;
  /** 上涨颜色 */
  upColor?: string;
  /** 下跌颜色 */
  downColor?: string;
  /** 边框颜色 */
  border?: string;
}

/**
 * 主题颜色配置映射
 */
export interface ThemeColorMap {
  light: ChartColorConfig;
  dark: ChartColorConfig;
}