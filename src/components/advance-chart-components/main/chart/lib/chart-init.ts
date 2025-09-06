/* eslint-disable @typescript-eslint/no-explicit-any */
import { CandlestickSeries, HistogramSeries, LineSeries, AreaSeries, BaselineSeries, BarSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import type { ChartTypeStr } from '@/core/types'
import { getCssVariableRgb } from '@/core/utils'

export type LayoutColors = {
  background: string
  grid: string
  text: string
  up: string
  down: string
  areaLine: string
  areaTop: string
  areaBottom: string
  baselineTopLine: string
  baselineBottomLine: string
  baselineTopFill1: string
  baselineTopFill2: string
  baselineBottomFill1: string
  baselineBottomFill2: string
  lineColor: string
}

// 由 CSS 变量生成布局与配色
export function getLayoutColors(): LayoutColors {
  return {
    background: getCssVariableRgb('--background'),
    grid: getCssVariableRgb('--border'),
    text: getCssVariableRgb('--foreground'),
    up: getCssVariableRgb('--chart-up'),
    down: getCssVariableRgb('--chart-down'),
    areaLine: getCssVariableRgb('--chart-area-line'),
    areaTop: getCssVariableRgb('--chart-area-top'),
    areaBottom: getCssVariableRgb('--chart-area-bottom'),
    baselineTopLine: getCssVariableRgb('--chart-baseline-top-line'),
    baselineBottomLine: getCssVariableRgb('--chart-baseline-bottom-line'),
    baselineTopFill1: getCssVariableRgb('--chart-baseline-top-fill1'),
    baselineTopFill2: getCssVariableRgb('--chart-baseline-top-fill2'),
    baselineBottomFill1: getCssVariableRgb('--chart-baseline-bottom-fill1'),
    baselineBottomFill2: getCssVariableRgb('--chart-baseline-bottom-fill2'),
    lineColor: getCssVariableRgb('--chart-line-color'),
  }
}

// convertChartData 的配色与样式选项
export function getConvertChartOptions(layoutColors: LayoutColors) {
  return {
    upColor: layoutColors.up,
    downColor: layoutColors.down,
    lineColor: layoutColors.lineColor,
    color: layoutColors.lineColor,
    topColor: layoutColors.areaTop,
    bottomColor: layoutColors.areaBottom,
    topLineColor: layoutColors.baselineTopLine,
    bottomLineColor: layoutColors.baselineBottomLine,
    topFillColor1: layoutColors.baselineTopFill1,
    topFillColor2: layoutColors.baselineTopFill2,
    bottomFillColor1: layoutColors.baselineBottomFill1,
    bottomFillColor2: layoutColors.baselineBottomFill2,
    wickUpColor: getCssVariableRgb('--chart-candle-wick-up'),
    wickDownColor: getCssVariableRgb('--chart-candle-wick-down'),
    borderUpColor: getCssVariableRgb('--chart-candle-border-up'),
    borderDownColor: getCssVariableRgb('--chart-candle-border-down'),
  }
}

// 创建主图序列（Candlestick/Bar/Line/Area/Baseline/Histogram）
// 注意：为保持与原实现一致，仅在 Histogram 情况下会在此处设置数据（如果提供了 initialData）
export function createMainSeries(
  chart: IChartApi,
  chartType: ChartTypeStr,
  layoutColors: LayoutColors,
  initialData?: any[],
): ISeriesApi<any> {
  switch (chartType) {
    case 'Candlestick':
      return chart.addSeries(CandlestickSeries, {
        upColor: layoutColors.up,
        downColor: layoutColors.down,
        borderVisible: false,
        wickUpColor: getCssVariableRgb('--chart-candle-wick-up'),
        wickDownColor: getCssVariableRgb('--chart-candle-wick-down'),
        priceScaleId: 'right',
        lastValueVisible: true,
        priceLineVisible: true,
      })
    case 'Bar':
      return chart.addSeries(BarSeries, {
        upColor: layoutColors.up,
        downColor: layoutColors.down,
        priceScaleId: 'right',
        lastValueVisible: true,
        priceLineVisible: true,
      })
    case 'Line':
      return chart.addSeries(LineSeries, {
        color: layoutColors.lineColor,
        priceScaleId: 'right',
        lastValueVisible: true,
        priceLineVisible: true,
      })
    case 'Area':
      return chart.addSeries(AreaSeries, {
        lineColor: layoutColors.areaLine,
        topColor: layoutColors.areaTop,
        bottomColor: layoutColors.areaBottom,
        priceScaleId: 'right',
        lastValueVisible: true,
        priceLineVisible: true,
      })
    case 'Baseline':
      return chart.addSeries(BaselineSeries, {
        topLineColor: layoutColors.baselineTopLine,
        bottomLineColor: layoutColors.baselineBottomLine,
        topFillColor1: layoutColors.baselineTopFill1,
        topFillColor2: layoutColors.baselineTopFill2,
        bottomFillColor1: layoutColors.baselineBottomFill1,
        bottomFillColor2: layoutColors.baselineBottomFill2,
        priceScaleId: 'right',
        lastValueVisible: true,
        priceLineVisible: true,
      })
    case 'Histogram': {
      const main = chart.addSeries(HistogramSeries, {
        color: layoutColors.up,
        priceScaleId: 'right',
        lastValueVisible: true,
        priceLineVisible: true,
      })
      if (initialData && Array.isArray(initialData)) {
        // 仅 Histogram 在创建时设置一次数据，以匹配原始代码片段
        main.setData(initialData as any)
      }
      return main
    }
    default:
      return chart.addSeries(CandlestickSeries, {
        upColor: layoutColors.up,
        downColor: layoutColors.down,
        borderVisible: false,
        wickUpColor: getCssVariableRgb('--chart-candle-wick-up'),
        wickDownColor: getCssVariableRgb('--chart-candle-wick-down'),
        priceScaleId: 'right',
        lastValueVisible: true,
        priceLineVisible: true,
      })
  }
}