import type { Time, OhlcData, SingleValueData, CandlestickData, HistogramData, LineData, AreaData, BaselineData, BarData } from 'lightweight-charts';
import { toUnixSeconds } from './chart-tools'
import { getCssVariableRgb } from './chart-color-tools'
import type {
  ChartData,
  SimpleChartData,
  VChartTypeStr,
  OHLCChartTypeStr,
  ChartTypeStr,
  ChartType,
} from './types'

// helper: convert rgb/rgba to rgba with specified alpha
function withAlpha(color: string, alpha: number): string {
  const m = color.match(/^rgba?\((\s*\d+\s*),(\s*\d+\s*),(\s*\d+\s*)(?:,\s*([0-9.]+)\s*)?\)$/i)
  if (m) {
    const r = m[1].trim()
    const g = m[2].trim()
    const b = m[3].trim()
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
  }
  return color
}

// 判断是否为基础图表数据
export function isSimpleChartData(data: ChartData | SimpleChartData): data is SimpleChartData {
  return 'value' in data;
}

// 判断是否为OHLC图表数据
export function isChartData(data: ChartData | SimpleChartData): data is ChartData {
  return 'open' in data && 'high' in data && 'low' in data && 'close' in data;
}

export function isOHLCChartType(chartType: ChartTypeStr): chartType is OHLCChartTypeStr {
  return chartType === 'Bar' || chartType === 'Candlestick';
}

export function isVChartType(chartType: ChartTypeStr): chartType is VChartTypeStr {
  return chartType === 'Line' || chartType === 'Area' || chartType === 'Baseline' || chartType === 'Histogram';
}

export function isChartType(chartType: string): chartType is ChartTypeStr {
  const validChartTypes: ChartTypeStr[] = [
    'Line', 'Area', 'Baseline', 'Histogram', // VChartTypeStr
    'Bar', 'Candlestick', // OHLCChartTypeStr
    'HLCArea', 'HighLow' // AdvancedChartTypeStr
  ];
  return validChartTypes.includes(chartType as ChartTypeStr);
}


export function convertChartData(data: ChartData[] | SimpleChartData[],
  chartType: ChartTypeStr,
  options?: {
    // 线条颜色相关
    lineColor?: string;
    color?: string;
    // 面积图颜色
    topColor?: string;
    bottomColor?: string;
    // 基准线图颜色
    topLineColor?: string;
    bottomLineColor?: string;
    topFillColor1?: string;
    topFillColor2?: string;
    bottomFillColor1?: string;
    bottomFillColor2?: string;
    // K线图和柱状图颜色
    upColor?: string;
    downColor?: string;
    // K线图特有颜色
    wickUpColor?: string;
    wickDownColor?: string;
    borderUpColor?: string;
    borderDownColor?: string;
  }
) {
  const PreData = []
  const MiddleData = []
  const ResData: ChartType[] = []
  const volumes: HistogramData[] = []
  if (!data || !chartType || !isChartType(chartType)) {
    return { chartData: [], volumes: [] };
  }
  if (Array.isArray(data) && data.length > 0 && isChartData(data[0])) {
    const { data: ohlc, volumes: ohlcVolumes } = convertToOhlcData(data as ChartData[]);
    PreData.push(...ohlc);
    volumes.push(...ohlcVolumes);
  }
  else if (Array.isArray(data) && data.length > 0 && isSimpleChartData(data[0])) {
    const { data: sv, volumes: svVolumes } = convertSimpleToSingleValue(data as SimpleChartData[]);
    PreData.push(...sv);
    volumes.push(...svVolumes);
  }
  else {
    return { chartData: [], volumes: [] };
  }
  if (isSimpleChartData(data[0]) && !isVChartType(chartType)) {
    return { chartData: [], volumes: [] };
  }
  if (isChartData(data[0]) && isVChartType(chartType)) {
    MiddleData.push(...convertOhlcToSingleValue(PreData as OhlcData[], 'close'));
  }
  else {
    MiddleData.push(...PreData);
  }
  switch (chartType) {
    case 'Area':
      return {
        chartData: MiddleData.map(data => ({
          ...data,
          lineColor: options?.lineColor || getCssVariableRgb('--chart-area-line'),
          topColor: options?.topColor || getCssVariableRgb('--chart-area-top'),
          bottomColor: options?.bottomColor || getCssVariableRgb('--chart-area-bottom')
        })) as AreaData[],
        volumes
      };
    case 'Line':
      return {
        chartData: MiddleData.map(data => ({
          ...data,
          color: options?.color || getCssVariableRgb('--chart-line-color')
        })) as LineData[],
        volumes
      };
    case 'Baseline':
      return {
        chartData: MiddleData.map(data => ({
          ...data,
          topLineColor: options?.topLineColor || getCssVariableRgb('--chart-baseline-top-line'),
          bottomLineColor: options?.bottomLineColor || getCssVariableRgb('--chart-baseline-bottom-line'),
          topFillColor1: options?.topFillColor1 || getCssVariableRgb('--chart-baseline-top-fill1'),
          topFillColor2: options?.topFillColor2 || getCssVariableRgb('--chart-baseline-top-fill2'),
          bottomFillColor1: options?.bottomFillColor1 || getCssVariableRgb('--chart-baseline-bottom-fill1'),
          bottomFillColor2: options?.bottomFillColor2 || getCssVariableRgb('--chart-baseline-bottom-fill2')
        })) as BaselineData[],
        volumes
      };
    case 'Histogram':
      return {
        chartData: MiddleData.map(d => {
          const v = volumes.find(vv => vv.time === d.time)
          const base = v?.color ?? getCssVariableRgb('--chart-up')
          return {
            ...d,
            color: withAlpha(base, 0.5),
          }
        }) as HistogramData[],
        volumes
      };
    case 'Bar':
      return {
        chartData: MiddleData.map(data => ({
          ...data,
          upColor: options?.upColor || getCssVariableRgb('--chart-up'),
          downColor: options?.downColor || getCssVariableRgb('--chart-down')
        })) as BarData[],
        volumes
      };
    case 'Candlestick':
      return {
        chartData: MiddleData.map(data => ({
          ...data,
          wickUpColor: options?.wickUpColor || getCssVariableRgb('--chart-candle-wick-up'),
          wickDownColor: options?.wickDownColor || getCssVariableRgb('--chart-candle-wick-down'),
          borderUpColor: options?.borderUpColor || getCssVariableRgb('--chart-candle-border-up'),
          borderDownColor: options?.borderDownColor || getCssVariableRgb('--chart-candle-border-down'),
          upColor: options?.upColor || getCssVariableRgb('--chart-up'),
          downColor: options?.downColor || getCssVariableRgb('--chart-down')
        })) as CandlestickData[],
        volumes
      };
  }
  return { chartData: ResData, volumes }
}

// OHLC数据转换为单值数据
export function convertOhlcToSingleValue(data: OhlcData[], method: 'close' | 'open' | 'high' | 'low' | 'hl2' | 'hlc3' | 'ohlc4' = 'close'): SingleValueData[] {
  return data.map(d => {
    let value: number;
    switch (method) {
      case 'open':
        value = d.open;
        break;
      case 'high':
        value = d.high;
        break;
      case 'low':
        value = d.low;
        break;
      case 'hl2':
        value = (d.high + d.low) / 2;
        break;
      case 'hlc3':
        value = (d.high + d.low + d.close) / 3;
        break;
      case 'ohlc4':
        value = (d.open + d.high + d.low + d.close) / 4;
        break;
      case 'close':
      default:
        value = d.close;
    }
    return {
      time: d.time,
      value: value
    };
  });
}

// ChartData转换为OhlcData
export function convertToOhlcData(data: ChartData[]): { data: OhlcData[], volumes: HistogramData[] } {
  return (() => {
    const ohlc: OhlcData[] = [];
    const volumes: HistogramData[] = [];

    for (const d of data) {
      ohlc.push({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close });
      if (typeof d.volume === 'number') {
        const upColor = getCssVariableRgb('--chart-up')
        const downColor = getCssVariableRgb('--chart-down')
        volumes.push({ time: d.time, value: d.volume, color: d.close >= d.open ? upColor : downColor });
      }
    }
    return { data: ohlc, volumes };
  })();
}

// SimpleChartData转换为SingleValueData
export function convertSimpleToSingleValue(data: SimpleChartData[]): { data: SingleValueData[], volumes: HistogramData[] } {
  return (() => {
    const sv: SingleValueData[] = [];
    const volumes: HistogramData[] = [];
    for (const d of data) {
      sv.push({ time: d.time, value: d.value });
      if (typeof d.volume === 'number' && d.up !== undefined) {
        const upColor = getCssVariableRgb('--chart-up')
        const downColor = getCssVariableRgb('--chart-down')
        volumes.push({ time: d.time, value: d.volume, color: d.up ? upColor : downColor });
      }
    }
    return { data: sv, volumes };
  })();
}

export type TimeframeSec = number

function bucketStartSec(time: Time, tfSec: TimeframeSec): number {
  const t = toUnixSeconds(time)
  if (t == null) throw new Error('Invalid Time to bucket')
  return Math.floor(t / tfSec) * tfSec
}

// 从基准周期 ChartData（含 volume）聚合到目标周期
export function aggregateToTimeframe(
  base: ChartData[],
  tfSec: TimeframeSec
): { data: OhlcData[]; volumes: HistogramData[] } {
  const out: OhlcData[] = []
  const vols: HistogramData[] = []
  let curBucket = -1
  let agg: { time: number; open: number; high: number; low: number; close: number; vol: number } | null = null

  const upColor = getCssVariableRgb('--chart-up')
  const downColor = getCssVariableRgb('--chart-down')

  for (const b of base) {
    const bucket = bucketStartSec(b.time, tfSec)
    if (bucket !== curBucket) {
      if (agg) {
        out.push({ time: agg.time as Time, open: agg.open, high: agg.high, low: agg.low, close: agg.close })
        vols.push({
          time: agg.time as Time,
          value: agg.vol,
          color: agg.close >= agg.open ? upColor : downColor,
        })
      }
      agg = { time: bucket, open: b.open, high: b.high, low: b.low, close: b.close, vol: b.volume ?? 0 }
      curBucket = bucket
    } else if (agg) {
      agg.high = Math.max(agg.high, b.high)
      agg.low = Math.min(agg.low, b.low)
      agg.close = b.close
      agg.vol += b.volume ?? 0
    }
  }
  if (agg) {
    out.push({ time: agg.time as Time, open: agg.open, high: agg.high, low: agg.low, close: agg.close })
    vols.push({
      time: agg.time as Time,
      value: agg.vol,
      color: agg.close >= agg.open ? upColor : downColor,
    })
  }
  return { data: out, volumes: vols }
}

// 将“基准周期”的一根新K（或对最后一根的修正）增量地合并进“目标周期聚合结果”
export function aggregateIncrementalFromBaseBar(
  dstOhlc: OhlcData[],
  dstVols: HistogramData[],
  baseBar: ChartData,
  tfSec: TimeframeSec
): void {
  const bucket = bucketStartSec(baseBar.time, tfSec)
  const last = dstOhlc[dstOhlc.length - 1]
  const upColor = getCssVariableRgb('--chart-up')
  const downColor = getCssVariableRgb('--chart-down')
  if (last && (last.time as number) === bucket) {
    // 同一桶：更新最后一根
    last.high = Math.max(last.high, baseBar.high)
    last.low = Math.min(last.low, baseBar.low)
    last.close = baseBar.close
    const vol = dstVols[dstVols.length - 1]
    if (vol) {
      vol.value += baseBar.volume ?? 0
      vol.color = last.close >= (last.open) ? upColor : downColor
    }
  } else {
    // 新桶：追加
    dstOhlc.push({
      time: bucket as Time,
      open: baseBar.open,
      high: baseBar.high,
      low: baseBar.low,
      close: baseBar.close,
    })
    dstVols.push({
      time: bucket as Time,
      value: baseBar.volume ?? 0,
      color: baseBar.close >= baseBar.open ? upColor : downColor,
    })
  }
}

// 将 OHLC 转换为 SingleValue 并可缓存不同方法（close/hl2/hlc3/ohlc4）
export function toSingleValueCached(
  ohlc: OhlcData[],
  method: 'close' | 'open' | 'high' | 'low' | 'hl2' | 'hlc3' | 'ohlc4' = 'close'
): SingleValueData[] {
  return ohlc.map(d => {
    let value: number;
    switch (method) {
      case 'open':
        value = d.open;
        break;
      case 'high':
        value = d.high;
        break;
      case 'low':
        value = d.low;
        break;
      case 'hl2':
        value = (d.high + d.low) / 2;
        break;
      case 'hlc3':
        value = (d.high + d.low + d.close) / 3;
        break;
      case 'ohlc4':
        value = (d.open + d.high + d.low + d.close) / 4;
        break;
      case 'close':
      default:
        value = d.close;
    }
    return {
      time: d.time,
      value: value
    };
  });
}
