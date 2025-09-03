import type { HistogramData, OhlcData, SingleValueData } from 'lightweight-charts'
import type { ChartData } from './types'
import { aggregateToTimeframe, aggregateIncrementalFromBaseBar, toSingleValueCached } from './chart-data'
export class DataManager {
  private base: ChartData[] = []                 // 基准周期（如 1m）
  private ohlcCache = new Map<number, { d: OhlcData[]; v: HistogramData[] }>() // tfSec → 聚合缓存
  private singleCache = new Map<string, SingleValueData[]>() // `${tfSec}:${method}` → 单值缓存

  setBaseBars(bars: ChartData[]) {
    this.base = bars.slice()
    this.ohlcCache.clear()
    this.singleCache.clear()
  }

  applyBaseBar(bar: ChartData) {
    // 先追加/修正 base 最后一根
    const last = this.base[this.base.length - 1]
    if (!last || (last.time as number) < (bar.time as number)) this.base.push(bar)
    else this.base[this.base.length - 1] = bar

    // 向所有已存在缓存做增量聚合
    for (const [tf, cache] of this.ohlcCache) {
      aggregateIncrementalFromBaseBar(cache.d, cache.v, bar, tf)
      // 级联失效对应的 single cache
      for (const key of this.singleCache.keys()) {
        if (key.startsWith(`${tf}:`)) this.singleCache.delete(key)
      }
    }
  }

  getOhlc(tfSec: number): { d: OhlcData[]; v: HistogramData[] } {
    let cache = this.ohlcCache.get(tfSec)
    if (!cache) {
      const { data, volumes } = aggregateToTimeframe(this.base, tfSec)
      cache = { d: data, v: volumes }
      this.ohlcCache.set(tfSec, cache)
    }
    return cache
  }

  getSingle(tfSec: number, method: 'close'|'open'|'high'|'low'|'hl2'|'hlc3'|'ohlc4') {
    const key = `${tfSec}:${method}`
    let sv = this.singleCache.get(key)
    if (!sv) {
      const { d } = this.getOhlc(tfSec)
      sv = toSingleValueCached(d, method)
      this.singleCache.set(key, sv)
    }
    return sv
  }
}