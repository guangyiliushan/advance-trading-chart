import type {
  CandlestickData,
  HistogramData,
  LineData,
  AreaData,
  BaselineData,
  BarData,
} from 'lightweight-charts';

/**
 * 值类型图表数据（线图、面积图等）
 */
export type VChartType = LineData | AreaData | BaselineData | HistogramData;

/**
 * 值类型图表字符串标识
 */
export type VChartTypeStr = 'Line' | 'Area' | 'Baseline' | 'Histogram';

/**
 * OHLC类型图表数据（K线图、柱状图）
 */
export type OHLCChartType = BarData | CandlestickData;

/**
 * OHLC类型图表字符串标识
 */
export type OHLCChartTypeStr = 'Bar' | 'Candlestick';

/**
 * 高级图表类型字符串标识（自定义变体）
 */
export type AdvancedChartTypeStr = 'HLCArea' | 'HighLow';

/**
 * 支持的所有图表类型字符串标识
 */
export type ChartTypeStr = VChartTypeStr | OHLCChartTypeStr | AdvancedChartTypeStr;

/**
 * 支持的所有图表类型数据
 */
export type ChartType = VChartType | OHLCChartType;

/**
 * 图表配置选项
 */
export interface ChartOptions {
  /** 图表类型 */
  type: ChartTypeStr;
  /** 是否自动模式 */
  autoMode?: boolean;
  /** 主题模式 */
  theme?: 'light' | 'dark';
  /** 自定义样式 */
  customStyles?: Record<string, any>;
}