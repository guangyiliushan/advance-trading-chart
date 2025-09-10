/**
 * 时间粒度（以秒为单位）
 */
export type TimeframeSec = number;

/**
 * 时间粒度字符串标识
 */
export type TimeframeStr = 
  | '1s' | '5s' | '15s' | '30s'
  | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1h' | '2h' | '4h' | '6h' | '8h' | '12h'
  | '1d' | '3d' | '1w' | '1M';

/**
 * 时间范围接口
 */
export interface TimeRange {
  /** 开始时间（Unix时间戳） */
  from: number;
  /** 结束时间（Unix时间戳） */
  to: number;
}

/**
 * 可见时间范围接口
 */
export interface VisibleTimeRange {
  /** 开始时间 */
  from: number;
  /** 结束时间 */
  to: number;
}

/**
 * 时间工具常量
 */
export const TIME_CONSTANTS = {
  /** 秒 */
  SECOND: 1,
  /** 分钟 */
  MINUTE: 60,
  /** 小时 */
  HOUR: 3600,
  /** 天 */
  DAY: 86400,
  /** 周 */
  WEEK: 604800,
  /** 月（30天） */
  MONTH: 2592000,
} as const;