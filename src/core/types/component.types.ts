import type { ReactNode } from 'react';
import type { ChartData, SimpleChartData } from './chart-data.types';
import type { ChartTypeStr, ChartOptions } from './chart-type.types';
import type { ColorTheme } from './color.types';
import type { TimeframeStr } from './time.types';

/**
 * 图表容器属性接口
 */
export interface ChartContainerProps {
  /** 图表数据 */
  data: ChartData[] | SimpleChartData[];
  /** 图表类型 */
  chartType?: ChartTypeStr;
  /** 主题 */
  theme?: ColorTheme;
  /** 交易对符号 */
  symbol?: string;
  /** 时间周期 */
  timeframe?: TimeframeStr;
  /** 是否显示头部 */
  showHeader?: boolean;
  /** 是否显示底部 */
  showFooter?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 图表配置选项 */
  options?: ChartOptions;
  /** 数据变化回调 */
  onDataChange?: (data: ChartData[] | SimpleChartData[]) => void;
  /** 符号变化回调 */
  onSymbolChange?: (symbol: string) => void;
  /** 时间周期变化回调 */
  onTimeframeChange?: (timeframe: TimeframeStr) => void;
  /** 图表类型变化回调 */
  onChartTypeChange?: (chartType: ChartTypeStr) => void;
}

/**
 * 交易图表属性接口
 */
export interface TradingChartProps {
  /** 图表数据 */
  data: ChartData[] | SimpleChartData[];
  /** 图表类型 */
  chartType?: ChartTypeStr;
  /** 主题 */
  theme?: ColorTheme;
  /** 是否自动模式 */
  autoMode?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 图表配置选项 */
  options?: ChartOptions;
}

/**
 * 图表句柄接口（用于外部控制）
 */
export interface TradingChartHandle {
  /** 适应内容 */
  fitContent: () => void;
  /** 跳转到实时 */
  goLive: () => void;
  /** 获取可见范围 */
  getVisibleRange: () => { from: number; to: number } | null;
  /** 设置可见范围 */
  setVisibleRange: (from: number, to: number) => void;
  /** 截图 */
  takeScreenshot: () => string | null;
}

/**
 * 头部组件属性接口
 */
export interface HeaderProps {
  /** 交易对符号 */
  symbol?: string;
  /** 时间周期 */
  timeframe?: TimeframeStr;
  /** 图表类型 */
  chartType?: ChartTypeStr;
  /** 主题 */
  theme?: ColorTheme;
  /** 符号变化回调 */
  onSymbolChange?: (symbol: string) => void;
  /** 时间周期变化回调 */
  onTimeframeChange?: (timeframe: TimeframeStr) => void;
  /** 图表类型变化回调 */
  onChartTypeChange?: (chartType: ChartTypeStr) => void;
  /** 自定义内容 */
  children?: ReactNode;
}

/**
 * 底部组件属性接口
 */
export interface FooterProps {
  /** 主题 */
  theme?: ColorTheme;
  /** 时区 */
  timezone?: string;
  /** 时区变化回调 */
  onTimezoneChange?: (timezone: string) => void;
  /** 自定义内容 */
  children?: ReactNode;
}