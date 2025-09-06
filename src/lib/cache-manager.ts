// A lightweight cache and data pipeline manager built on top of DataManager
// Single-source (base timeframe) + cached aggregations + incremental updates

import { DataManager } from '@/lib/data-manager'
import type { ChartData, TimeframeSec } from '@/core/types'
import type { HistogramData, OhlcData } from 'lightweight-charts'

// Helpers: timeframe string <-> seconds
export const TF_STR_TO_SEC: Record<string, TimeframeSec> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '3h': 10800,
  '4h': 14400,
  '6h': 21600,
  '12h': 43200,
  '1d': 86400,
  '1w': 604800,
  '1M': 2592000,
  '1y': 31536000,
}

export const TF_SEC_TO_STR = (sec: TimeframeSec): string => {
  const entry = Object.entries(TF_STR_TO_SEC).find(([, v]) => v === sec)
  return entry ? entry[0] : `${sec}s`
}

// Merge OHLC (no volume) with volume histogram to ChartData shape
function mergeOhlcWithVolumes(ohlc: OhlcData[], vols: HistogramData[]): ChartData[] {
  const out: ChartData[] = new Array(Math.min(ohlc.length, vols.length))
  for (let i = 0; i < out.length; i++) {
    const d = ohlc[i]
    const v = vols[i]
    out[i] = {
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: typeof v?.value === 'number' ? Number(v.value) : undefined,
    }
  }
  // If volumes array is shorter or missing, still return OHLC mapped data
  if (!vols || vols.length < ohlc.length) {
    for (let i = (vols?.length ?? 0); i < ohlc.length; i++) {
      const d = ohlc[i]
      out[i] = {
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }
    }
  }
  return out
}

// Compute a recommended warm-up list given base tf seconds
export function getWarmupList(baseTfSec: TimeframeSec): TimeframeSec[] {
  // Only aggregate to larger/equal timeframes
  const all = [60, 300, 900, 1800, 3600, 10800, 14400, 21600, 43200, 86400, 604800, 2592000, 31536000]
  return all.filter((tf) => tf >= baseTfSec)
}

// Per-symbol data context
type SymbolCtx = {
  dm: DataManager
  baseTfSec: TimeframeSec
}

export class CacheManager {
  private symbolMap = new Map<string, SymbolCtx>()
  private warmTimer: any = null
  private warmupTfs: TimeframeSec[] = []
  private currentSymbol: string | null = null


  constructor(_opts?: { useWorker?: boolean }) {
    // useWorker option is reserved for future implementation
  }

  // Initialize or replace base dataset for a symbol
  setBase(symbol: string, bars: ChartData[], baseTfSec: TimeframeSec) {
    let ctx = this.symbolMap.get(symbol)
    if (!ctx) {
      ctx = { dm: new DataManager(), baseTfSec }
      this.symbolMap.set(symbol, ctx)
    }
    if (ctx.baseTfSec !== baseTfSec) {
      ctx.dm = new DataManager()
      ctx.baseTfSec = baseTfSec
    }
    ctx.dm.setBaseBars(bars)
    this.currentSymbol = symbol
  }

  // Incremental base bar apply; returns current timeframe aggregated data if requested
  applyBaseBar(symbol: string, bar: ChartData): void {
    const ctx = this.symbolMap.get(symbol)
    if (!ctx) return
    ctx.dm.applyBaseBar(bar)
  }

  // Get aggregated data for a timeframe in seconds; if tf === base -> returns base
  getForTimeframe(symbol: string, tfSec: TimeframeSec): ChartData[] {
    const ctx = this.symbolMap.get(symbol)
    if (!ctx) return []
    if (tfSec <= ctx.baseTfSec) {
      // If requested tf is smaller/equal than base, we only can serve base to keep consistency
      // Downscaling is not supported, return base as-is
      const { d, v } = ctx.dm.getOhlc(ctx.baseTfSec)
      return mergeOhlcWithVolumes(d, v)
    }
    const { d, v } = ctx.dm.getOhlc(tfSec)
    return mergeOhlcWithVolumes(d, v)
  }

  // Warm caches for a list of timeframes (sec)
  warmup(symbol: string, list: TimeframeSec[]): void {
    const ctx = this.symbolMap.get(symbol)
    if (!ctx) return
    const uniq = Array.from(new Set(list)).sort((a, b) => a - b)
    for (const tf of uniq) {
      if (tf < ctx.baseTfSec) continue
      ctx.dm.getOhlc(tf)
    }
  }

  startWarmup(symbol: string, list: TimeframeSec[], intervalMs = 60000) {
    this.stopWarmup()
    this.currentSymbol = symbol
    this.warmupTfs = list.slice()
    // First immediate warmup
    this.warmup(symbol, this.warmupTfs)
    // Then schedule periodic warmup (useful if base bars incrementally update elsewhere)
    this.warmTimer = setInterval(() => {
      if (!this.currentSymbol) return
      this.warmup(this.currentSymbol, this.warmupTfs)
    }, Math.max(10000, intervalMs))
  }

  stopWarmup() {
    if (this.warmTimer) {
      clearInterval(this.warmTimer)
      this.warmTimer = null
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager({ useWorker: false })