import type {
  Time,
  CandlestickData,
  HistogramData,
  LineData,
  AreaData,
  BaselineData,
  BarData,
} from 'lightweight-charts';

// 基础数据类型
export type ChartData = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type SimpleChartData = {
  time: Time;
  value: number;
  volume?: number;
  up?: boolean;
};

export type ApiDataType = ChartData | SimpleChartData;

// 图表类型（value系）
export type VChartType = LineData | AreaData | BaselineData | HistogramData;
export type VChartTypeStr = 'Line' | 'Area' | 'Baseline' | 'Histogram';

// 图表类型（OHLC系）
export type OHLCChartType = BarData | CandlestickData;
export type OHLCChartTypeStr = 'Bar' | 'Candlestick';

// 高级图表（变体）
export type AdvancedChartTypeStr = 'HLCArea' | 'HighLow';

// 支持的图表类型（非特殊）
export type ChartTypeStr = VChartTypeStr | OHLCChartTypeStr | AdvancedChartTypeStr;
export type ChartType = VChartType | OHLCChartType;

// 时间粒度（秒）
export type TimeframeSec = number;

// 颜色工具内部使用的类型
export type RGB = [number, number, number];
export type RGBWithA = { rgb: RGB; a?: number };