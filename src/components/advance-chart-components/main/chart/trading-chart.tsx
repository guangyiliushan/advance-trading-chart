/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useImperativeHandle, useState } from "react"
import { createChart, ColorType, CrosshairMode, HistogramSeries } from "lightweight-charts"
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts"
import { parseSpanSec, toUnixSeconds } from "@/core/utils"
import type { ChartData, ChartTypeStr } from '@/core/types'
import { convertChartData } from '@/core/utils'
import { getCssVariableRgb } from "@/core/utils"
import { cn } from '@/lib/utils'
import { getLayoutColors, getConvertChartOptions, createMainSeries } from "./lib/chart-init"
// 新增：热力图相关导入
import type { HeatMapData } from './series/heatmap/data'
import { HeatMapSeries } from './series/heatmap/heatmap-series'
import { defaultOptions as defaultHeatMapOptions } from './series/heatmap/options'

export type TradingChartProps = {
  data: ChartData[]
  dark?: boolean
  className?: string
  symbol?: string
  chartType?: ChartTypeStr
  autoMode?: boolean
  enableCrosshairTooltip?: boolean
  // 对外暴露 chartApi（供外层装配组件使用）
  onChartApi?: (api: IChartApi | null) => void
  // 允许外部传入容器 ref，以便在同一容器中渲染覆盖层
  containerRef?: React.RefObject<HTMLDivElement | null>
  // 允许外层将覆盖层作为 children 注入到相同容器中
  children?: React.ReactNode
  // 新增：预测热力图数据（可选）
  predictionData?: HeatMapData[]
  // 新增：颜色配置覆盖（可选）
  colorConfig?: Partial<Record<string, string>>
}

// 对外暴露的实例方法
export type TradingChartHandle = {
  fitContent: () => void
  goLive: () => void
  setVisibleRange: (span: string) => void
  enterFullscreen: () => void
}


export const TradingChart = React.forwardRef(
  ({ data, dark, className, symbol, chartType = 'Candlestick', autoMode = true, onChartApi, containerRef: containerRefProp, children, predictionData, colorConfig }: TradingChartProps, ref: React.Ref<TradingChartHandle>) => {
    const internalContainerRef = useRef<HTMLDivElement | null>(null)
    const containerRef = containerRefProp ?? internalContainerRef
    const chartRef = useRef<IChartApi | null>(null)
    const [_chartApi, setChartApi] = useState<IChartApi | null>(null)
    const mainSeriesRef = useRef<ISeriesApi<any> | null>(null)
    const volSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
    // 新增：热力图序列引用
    const heatmapSeriesRef = useRef<ISeriesApi<'Custom'> | null>(null)
    const programmaticRangeUpdate = useRef(false)
    const pendingSpanRef = useRef<string | null>(null)
    const dataVersionRef = useRef(0)
    // 新增：保存当前可视范围的ref
    const currentVisibleRangeRef = useRef<{ from: Time; to: Time } | null>(null)
    // 新增：标记是否是首次autoMode切换
    const isInitialAutoModeRef = useRef(true)
    const layoutColors = useMemo(() => {
      const base = getLayoutColors()
      return { ...base, ...(colorConfig || {}) }
    }, [dark, colorConfig])

    // Memoize transformed series data for performance and single-source-of-truth
    const memoData = useMemo(() => {
      const { chartData, volumes } = convertChartData(data, chartType, getConvertChartOptions(layoutColors))
      return { chartData, volumes }
    }, [data, chartType, layoutColors])

    // 计算并应用 Histogram 的动态 base（可视区最小值-100，最低不小于0）
    const updateHistogramBase = React.useCallback(() => {
      if (!chartRef.current || !mainSeriesRef.current) return
      let dynamicBase = 0
      const vr = chartRef.current.timeScale().getVisibleRange?.()
      if (vr) {
        const fromTs = toUnixSeconds(vr.from as any)
        const toTs = toUnixSeconds(vr.to as any)
        if (fromTs != null && toTs != null && Array.isArray(memoData.chartData)) {
          let minVal = Infinity
          for (const pt of memoData.chartData as any[]) {
            const ts = toUnixSeconds(pt.time)
            if (ts != null && ts >= fromTs && ts <= toTs) {
              const v = (pt as any).value
              if (typeof v === 'number' && v < minVal) minVal = v
            }
          }
          if (minVal !== Infinity) {
            dynamicBase = Math.max(0, minVal - 100)
          }
        }
      }
      // 固定 top，动态 base
      mainSeriesRef.current.applyOptions({ top: 0.2, base: dynamicBase })
    }, [memoData])

    useEffect(() => {
      if (!containerRef.current) return

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: layoutColors.background },
          textColor: layoutColors.text,
        },
        grid: {
          horzLines: { color: layoutColors.grid },
          vertLines: { color: layoutColors.grid },
        },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false },
        localization: { locale: "zh-CN" },
        crosshair: { mode: CrosshairMode.Normal },
      })
      chartRef.current = chart
      setChartApi(chart)
      onChartApi?.(chart)

      // Create main series based on chart type
      const mainSeries = createMainSeries(chart, chartType, layoutColors, memoData.chartData)

      mainSeriesRef.current = mainSeries

      const volSeries = chart.addSeries(HistogramSeries, {
        color: getCssVariableRgb('--muted-foreground'),
        priceFormat: { type: "volume" },
        priceScaleId: 'volume',
        base: 0,
      })
      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.85,
          bottom: 0,
        },
        borderVisible: false,
      });
      volSeriesRef.current = volSeries

      // Set initial series data
      mainSeries.setData(memoData.chartData)
      if (memoData.volumes.length) volSeries.setData(memoData.volumes)

      // 新增：如果有热力图数据，创建并设置自定义系列
      if (predictionData && predictionData.length > 0) {
        try {
          const hmSeries = chart.addCustomSeries(new HeatMapSeries(), {
            ...defaultHeatMapOptions,
            priceScaleId: 'right',
          } as any)
          heatmapSeriesRef.current = hmSeries as any
          hmSeries.setData(predictionData as any)
        } catch {
          // noop
        }
      }

      // Keep all data visible initially
      chart.timeScale().fitContent()

      const resizeObserver = new ResizeObserver(() => {
        if (!containerRef.current || !chart) return
        const { width, height } = containerRef.current.getBoundingClientRect()
        chart.applyOptions({ width: Math.floor(width), height: Math.floor(height) })
      })

      resizeObserver.observe(containerRef.current)
      // initial size
      const { width, height } = containerRef.current.getBoundingClientRect()
      chart.applyOptions({ width: Math.floor(width), height: Math.floor(height || 400) })

      return () => {
        resizeObserver.disconnect()
        // 清理热力图引用（chart.remove() 会移除所有 series）
        heatmapSeriesRef.current = null
        chart.remove()
        chartRef.current = null
        setChartApi(null)
        onChartApi?.(null)
        mainSeriesRef.current = null
        volSeriesRef.current = null
      }
      // we only initialize once; palette changes handled separately
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef, chartType]);

    useEffect(() => {
      if (!chartRef.current) return

      chartRef.current.applyOptions({
        layout: {
          textColor: layoutColors.text,
          background: { type: ColorType.Solid, color: layoutColors.background },
        },
        grid: {
          horzLines: { color: layoutColors.grid },
          vertLines: { color: layoutColors.grid },
        },
        localization: { locale: "zh-CN" },
      })

      // Update series palettes on theme change
      if (mainSeriesRef.current && (chartType === 'Candlestick' || chartType === 'Bar')) {
        mainSeriesRef.current.applyOptions({
          upColor: layoutColors.up,
          downColor: layoutColors.down,
          wickUpColor: getCssVariableRgb('--chart-candle-wick-up'),
          wickDownColor: getCssVariableRgb('--chart-candle-wick-down'),
          borderVisible: false,
          lastValueVisible: true,
          priceLineVisible: true,
        })
      } else if (mainSeriesRef.current && chartType === 'Line') {
        mainSeriesRef.current.applyOptions({ color: layoutColors.lineColor })
      } else if (mainSeriesRef.current && chartType === 'Area') {
        mainSeriesRef.current.applyOptions({
          lineColor: layoutColors.areaLine,
          topColor: layoutColors.areaTop,
          bottomColor: layoutColors.areaBottom,
        })
      } else if (mainSeriesRef.current && chartType === 'Baseline') {
        mainSeriesRef.current.applyOptions({
          topLineColor: layoutColors.baselineTopLine,
          bottomLineColor: layoutColors.baselineBottomLine,
          topFillColor1: layoutColors.baselineTopFill1,
          topFillColor2: layoutColors.baselineTopFill2,
          bottomFillColor1: layoutColors.baselineBottomFill1,
          bottomFillColor2: layoutColors.baselineBottomFill2,
        })
      } else if (mainSeriesRef.current && chartType === 'Histogram') {
        // 使用专用函数计算并设置动态 base
        updateHistogramBase()
      }

      // bump data version on any update path that will also setData below
      dataVersionRef.current += 1

      // Update data; only fit content if not coming from a programmatic visible-range change
      mainSeriesRef.current?.setData(memoData.chartData)
      volSeriesRef.current?.setData(memoData.volumes)

      // If a range change was requested, apply it AFTER data replacement and anchor to the latest bar time
      if (pendingSpanRef.current) {
        const span = pendingSpanRef.current
        const seconds = parseSpanSec(span)
        const last = memoData.chartData[memoData.chartData.length - 1]
        const toTs = last ? toUnixSeconds((last as any).time) : null
        if (seconds && toTs != null) {
          const fromTs = toTs - seconds
          programmaticRangeUpdate.current = true
          chartRef.current.timeScale().setVisibleRange({ from: fromTs as Time, to: toTs as Time })
        }
        // clear pending regardless of success to avoid repeated tries
        pendingSpanRef.current = null
      } else if (programmaticRangeUpdate.current) {
        // reset the flag so future updates can auto-fit if needed
        programmaticRangeUpdate.current = false
      } else {
        if (autoMode) {
          chartRef.current.timeScale().fitContent()
        }
      }
    }, [layoutColors, memoData, data, dark, symbol, updateHistogramBase, autoMode])

    // 新增：监听 predictionData 变化，创建或更新热力图序列
    useEffect(() => {
      if (!chartRef.current) return
      const chart = chartRef.current
      // 无数据时移除已有热力图（避免残留）
      if (!predictionData || predictionData.length === 0) {
        if (heatmapSeriesRef.current) {
          try { chart.removeSeries(heatmapSeriesRef.current as any) } catch { /* noop */ }
          heatmapSeriesRef.current = null
        }
        return
      }
      // 有数据：若不存在则创建，存在则更新
      if (!heatmapSeriesRef.current) {
        try {
          const hmSeries = chart.addCustomSeries(new HeatMapSeries(), {
            ...defaultHeatMapOptions,
            priceScaleId: 'right',
          } as any)
          heatmapSeriesRef.current = hmSeries as any
          hmSeries.setData(predictionData as any)
        } catch { /* noop */ }
      } else {
        try { (heatmapSeriesRef.current as any).setData(predictionData as any) } catch { /* noop */ }
      }
    }, [predictionData])

    // 根据 autoMode 切换"自由上下移动"能力：
    // - autoMode = true：启用价格轴自动缩放；不允许通过拖拽价格轴自由移动（默认行为）
    // - autoMode = false：关闭价格轴自动缩放；允许通过按住价格轴拖拽来自由上下移动
    useEffect(() => {
      if (!chartRef.current || !mainSeriesRef.current) return

      // 在切换autoMode之前，保存当前的可视范围
      if (!autoMode && chartRef.current.timeScale().getVisibleRange) {
        const currentRange = chartRef.current.timeScale().getVisibleRange()
        if (currentRange) {
          currentVisibleRangeRef.current = currentRange
        }
      }

      // 切换价格轴自动缩放（主 series 对应的价格轴 + 右侧价格轴）
      try {
        mainSeriesRef.current.priceScale().applyOptions({ autoScale: !!autoMode } as any)
        chartRef.current.priceScale('right').applyOptions({ autoScale: !!autoMode } as any)
      } catch { /* noop */ }

      // 切换交互：当进入自由模式时允许按住价格轴拖拽（纵向）
      try {
        chartRef.current.applyOptions({
          handleScale: {
            axisPressedMouseMove: { time: true, price: !autoMode },
            pinch: true,
            mouseWheel: true,
          },
          handleScroll: {
            mouseWheel: true,
            pressedMouseMove: true,
            horzTouchDrag: true,
            vertTouchDrag: !autoMode,
          },
        } as any)
      } catch { /* noop */ }

      // 修改：当重新切回自动模式时，尝试恢复之前的可视范围
      if (autoMode) {
        // 如果不是首次切换且有保存的可视范围，则恢复该范围
        if (!isInitialAutoModeRef.current && currentVisibleRangeRef.current) {
          programmaticRangeUpdate.current = true
          chartRef.current.timeScale().setVisibleRange(currentVisibleRangeRef.current)
        } else if (isInitialAutoModeRef.current) {
          // 首次初始化时才调用fitContent
          programmaticRangeUpdate.current = true
          chartRef.current.timeScale().fitContent()
          isInitialAutoModeRef.current = false
        }
      } else {
        // 切换到手动模式时，标记不再是首次
        isInitialAutoModeRef.current = false
      }
    }, [autoMode])

    // 在 Histogram 模式下订阅可见范围变化，持续更新 base
    useEffect(() => {
      if (!chartRef.current || !mainSeriesRef.current) return
      if (chartType !== 'Histogram') return
      // 初次执行一次
      updateHistogramBase()
      const ts = chartRef.current.timeScale()
      const handler = () => updateHistogramBase()
      ts.subscribeVisibleTimeRangeChange(handler)
      return () => {
        if (!chartRef.current) return
        chartRef.current.timeScale().unsubscribeVisibleTimeRangeChange(handler)
      }
    }, [chartType, updateHistogramBase])

    // 共享的可见范围设置函数
    const applyVisibleRangeBySpan = (span: string) => {
      const chart = chartRef.current
      if (!chart) return

      // record request and try to apply asynchronously so that any concurrent data replacement can happen first
      pendingSpanRef.current = span
      const versionAtRequest = dataVersionRef.current

      // Fallback: if data does not change, apply on next tick, anchoring to the latest bar time
      setTimeout(() => {
        // if chart unmounted or a newer data version arrived, let the data effect handle it
        if (!chartRef.current) return
        if (dataVersionRef.current !== versionAtRequest) return
        if (pendingSpanRef.current !== span) return

        const seconds = parseSpanSec(span)
        if (!seconds) { pendingSpanRef.current = null; return }
        const last = memoData.chartData[memoData.chartData.length - 1]
        const toTs = last ? toUnixSeconds((last as any).time) : null
        if (toTs == null) return

        const fromTs = toTs - seconds
        // consume the pending span and apply range
        pendingSpanRef.current = null
        programmaticRangeUpdate.current = true
        chartRef.current.timeScale().setVisibleRange({ from: fromTs as Time, to: toTs as Time })
      }, 0)
    }

    // 对外暴露的实例方法
    useImperativeHandle(ref, () => ({
      fitContent: () => {
        if (!chartRef.current) return
        programmaticRangeUpdate.current = true
        chartRef.current.timeScale().fitContent()
      },
      goLive: () => {
        if (!chartRef.current) return
        chartRef.current.timeScale().scrollToRealTime()
      },
      setVisibleRange: applyVisibleRangeBySpan,
      enterFullscreen: () => {
        const el = containerRef.current as any
        if (!el) return
        if (el.requestFullscreen) {
          el.requestFullscreen()
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen()
        } else if (el.msRequestFullscreen) {
          el.msRequestFullscreen()
        }
      },
    }))

    useEffect(() => {
      if (!chartRef.current || !mainSeriesRef.current) return
      if (chartType !== 'Baseline') return

      const updateBaseline = () => {
        const vr = chartRef.current!.timeScale().getVisibleRange?.()
        if (!vr) return

        const fromTs = toUnixSeconds((vr.from as any))
        const toTs = toUnixSeconds((vr.to as any))
        if (fromTs == null || toTs == null) return

        // 过滤当前可见区间的数据（memoData 来自组件内的 memo 化数据）
        const visible = memoData.chartData.filter((d: any) => {
          const t = toUnixSeconds(d.time)
          return t != null && t >= fromTs && t <= toTs
        })
        if (!visible.length) return

        // 对 Baseline 通常使用单值 series 的 value 字段；如果是 OHLC，改为使用 high/low/close 等
        const values = visible.map((d: any) => ('value' in d ? d.value : (d.close ?? d.high ?? d.low ?? d.value)))
        const max = Math.max(...values)
        const min = Math.min(...values)
        const base = (max + min) / 2

        // 将基线设置为可见区间 max/min 之和的一半
        mainSeriesRef.current!.applyOptions({ baseValue: { type: 'price', price: base } } as any)
      }

      // 初次执行一次
      updateBaseline()

      // 订阅可见时间范围变化（轻量图表提供的事件）
      chartRef.current!.timeScale().subscribeVisibleTimeRangeChange(updateBaseline)

      return () => {
        if (!chartRef.current || !chartRef.current!.timeScale()) return
        chartRef.current!.timeScale()!.unsubscribeVisibleTimeRangeChange(updateBaseline)
      }
    }, [chartRef, mainSeriesRef, memoData, chartType])

    return (
      <div
        ref={containerRef}
        className={cn("h-full w-full", className)}
        style={{ position: "relative" }}
      >
        {children}
      </div>
    )
  }
);

TradingChart.displayName = "TradingChart"