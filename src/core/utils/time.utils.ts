/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TimeframeSec, TimeframeStr } from '../types/time.types';

/**
 * 解析时间跨度字符串为秒数
 * @param span 时间跨度字符串 (e.g. '3y' | '1y' | '3m' | '1m' | '7d' | '3d' | '1d' | '6h' | '1h')
 * @returns 秒数，解析失败返回null
 */
export function parseSpanSec(span: string): number | null {
  const m = span.trim().toLowerCase().match(/^(\d+)([ymdh])$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const unit = m[2];
  const secPerHour = 60 * 60;
  const secPerDay = 24 * secPerHour;
  switch (unit) {
    case 'h':
      return n * secPerHour;
    case 'd':
      return n * secPerDay;
    case 'm': // month
      return n * 30 * secPerDay; // approximate month length as 30 days
    case 'y':
      return n * 365 * secPerDay; // approximate year length as 365 days
    default:
      return null;
  }
}

/**
 * 将 Time(BusinessDay | UTCTimestamp) 统一转换为 Unix 秒数
 * @param time lightweight-charts的Time类型
 * @returns Unix秒数，转换失败返回null
 */
export function toUnixSeconds(time: any): number | null {
  if (typeof time === 'number' && Number.isFinite(time)) {
    // UTCTimestamp 已经是秒
    return time as number;
  }
  if (time && typeof time === 'object' && 'year' in time && 'month' in time && 'day' in time) {
    const { year, month, day } = time as { year: number; month: number; day: number };
    return Math.floor(Date.UTC(year, (month as number) - 1, day, 0, 0, 0) / 1000);
  }
  return null;
}

/**
 * 时间周期字符串到秒数的映射
 */
export const TF_STR_TO_SEC: Record<TimeframeStr, TimeframeSec> = {
  '1s': 1,
  '5s': 5,
  '15s': 15,
  '30s': 30,
  '1m': 60,
  '3m': 180,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '2h': 7200,
  '4h': 14400,
  '6h': 21600,
  '8h': 28800,
  '12h': 43200,
  '1d': 86400,
  '3d': 259200,
  '1w': 604800,
  '1M': 2592000, // 30 days
};

/**
 * 秒数到时间周期字符串的映射
 */
export const TF_SEC_TO_STR: Record<TimeframeSec, TimeframeStr> = Object.fromEntries(
  Object.entries(TF_STR_TO_SEC).map(([str, sec]) => [sec, str as TimeframeStr])
) as Record<TimeframeSec, TimeframeStr>;

/**
 * 获取当前Unix时间戳（秒）
 */
export function getCurrentUnixTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * 将Unix时间戳转换为Date对象
 */
export function unixToDate(unixTime: number): Date {
  return new Date(unixTime * 1000);
}

/**
 * 将Date对象转换为Unix时间戳（秒）
 */
export function dateToUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * 格式化时间戳为可读字符串
 */
export function formatTime(unixTime: number, format: 'date' | 'datetime' | 'time' = 'datetime'): string {
  const date = unixToDate(unixTime);
  
  switch (format) {
    case 'date':
      return date.toLocaleDateString();
    case 'time':
      return date.toLocaleTimeString();
    case 'datetime':
    default:
      return date.toLocaleString();
  }
}