import type { Time } from 'lightweight-charts'

// Utility to generate mock OHLCV data
export function generateFromData(len = 2000, startPrice = 30000, startTime?: number, intervalSec = 60): ChartData[] {
  const out: ChartData[] = []
  const interval = Math.max(60, Math.floor(intervalSec / 60) * 60)
  let last = startPrice
  // 确保起始时间戳对齐到分钟
  let t = startTime ?? Math.floor(Date.now() / 60000) * 60 - len * interval
  for (let i = 0; i < len; i++) {
    const vol = Math.round(50 + Math.random() * 1000)
    const drift = (Math.random() - 0.5) * 200
    const open = last
    const high = open + Math.abs(drift) * (0.5 + Math.random())
    const low = open - Math.abs(drift) * (0.5 + Math.random())
    const close = Math.max(low, Math.min(high, open + drift))
    out.push({ time: t as Time, open, high, low, close, volume: vol })
    last = close
    t += interval
  }
  return out
}

// Parse span string (e.g. '3y' | '1y' | '3m' | '1m' | '7d' | '3d' | '1d' | '6h' | '1h') into seconds
export function parseSpanSec(span: string): number | null {
  const m = span.trim().toLowerCase().match(/^(\d+)([ymdh])$/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  const unit = m[2]
  const secPerHour = 60 * 60
  const secPerDay = 24 * secPerHour
  switch (unit) {
    case 'h':
      return n * secPerHour
    case 'd':
      return n * secPerDay
    case 'm': // month
      return n * 30 * secPerDay // approximate month length as 30 days
    case 'y':
      return n * 365 * secPerDay // approximate year length as 365 days
    default:
      return null
  }
}

// 将 Time(BusinessDay | UTCTimestamp) 统一转换为 Unix 秒数
export function toUnixSeconds(time: any): number | null {
  if (typeof time === 'number' && Number.isFinite(time)) {
    // UTCTimestamp 已经是秒
    return time as number
  }
  if (time && typeof time === 'object' && 'year' in time && 'month' in time && 'day' in time) {
    const { year, month, day } = time as { year: number; month: number; day: number }
    return Math.floor(Date.UTC(year, (month as number) - 1, day, 0, 0, 0) / 1000)
  }
  return null
}

import type { ChartData } from './types'