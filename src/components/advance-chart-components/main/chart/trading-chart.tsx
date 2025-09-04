/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useImperativeHandle, useState } from "react"
import { createChart, ColorType, CrosshairMode, HistogramSeries } from "lightweight-charts"
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts"
import { parseSpanSec, toUnixSeconds } from "@/lib/chart-tools"
import type { ChartData, ChartTypeStr } from '@/lib/types'
import { convertChartData } from '@/lib/chart-data'
import { getCssVariableRgb } from "@/lib/chart-color-tools"
import { PriceLegendOverlay } from "./price-legend-overlay"
import { cn } from '@/lib/utils'
import { CrosshairTooltip } from './crosshair-tooltip'
import { getLayoutColors, getConvertChartOptions, createMainSeries } from "./lib/chart-init"

export type TradingChartProps = {
  data: ChartData[]
  dark?: boolean
  className?: string
  symbol?: string
  chartType?: ChartTypeStr
  autoMode?: boolean
  enableCrosshairTooltip?: boolean
}

// 对外暴露的实例方法
export type TradingChartHandle = {
  fitContent: () => void
  goLive: () => void
  setVisibleRange: (span: string) => void
  enterFullscreen: () => void
}


export const TradingChart = React.forwardRef(
  ({ data, dark, className, symbol, chartType = 'Candlestick', autoMode = true, enableCrosshairTooltip = false }: TradingChartProps, ref: React.Ref<TradingChartHandle>) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const [chartApi, setChartApi] = useState<IChartApi | null>(null)
    const mainSeriesRef = useRef<ISeriesApi<any> | null>(null)
    const volSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
    const [hoveredBar, setHoveredBar] = useState<ChartData | null>(null)
    // Track programmatic changes to visible range to avoid auto-fit overriding user choice
    const programmaticRangeUpdate = useRef(false)
    // Queue a pending range span to apply AFTER latest data replacement
    const pendingSpanRef = useRef<string | null>(null)
    // Track data/memo changes to guard fallback scheduling
    const dataVersionRef = useRef(0)

    const layoutColors = useMemo(() => getLayoutColors(), [dark])

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
        chart.remove()
        chartRef.current = null
        setChartApi(null)
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

    // 根据 autoMode 切换“自由上下移动”能力：
    // - autoMode = true：启用价格轴自动缩放；不允许通过拖拽价格轴自由移动（默认行为）
    // - autoMode = false：关闭价格轴自动缩放；允许通过按住价格轴拖拽来自由上下移动
    useEffect(() => {
      if (!chartRef.current || !mainSeriesRef.current) return

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

      // 当重新切回自动模式时，立即对齐内容（避免仍然停留在用户拖拽后的视图）
      if (autoMode) {
        programmaticRangeUpdate.current = true
        chartRef.current.timeScale().fitContent()
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
        {data.length > 0 && (
          <PriceLegendOverlay
            symbol={symbol}
            bar={(hoveredBar ?? (data[data.length - 1] as any))}
            last={(data[data.length - 1] as any)}
            layoutColors={{ text: layoutColors.text, up: layoutColors.up, down: layoutColors.down }}
          />
        )}

        {/* Headless component for crosshair tooltip subscription */}
        {enableCrosshairTooltip && (
          <CrosshairTooltip
            chart={chartApi}
            data={data}
            containerRef={containerRef}
            layoutColors={{ up: layoutColors.up, down: layoutColors.down, text: layoutColors.text }}
            onHoverBarChange={setHoveredBar}
            locale="zh-CN"
            timeZone="UTC"
            pricePrecision={2}
            dark={dark}
          />
        )}
      </div>
    )
  }
);

TradingChart.displayName = "TradingChart"