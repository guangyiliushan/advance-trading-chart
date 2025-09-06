/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef, useState } from "react"
import type { IChartApi } from "lightweight-charts"
import { TradingChart, type TradingChartHandle, type TradingChartProps } from "./trading-chart"
import { CrosshairTooltip } from "./crosshair-tooltip"
import { PriceLegendOverlay } from "./price-legend-overlay"
import type { ChartData } from "@/core/types"
import { getLayoutColors } from "./lib/chart-init"

export type MainChartProps = Omit<TradingChartProps, "containerRef" | "children"> & {
  // 仍然支持透传 onChartApi
  onChartApi?: (api: IChartApi | null) => void
}

export const MainChart = React.forwardRef<TradingChartHandle, MainChartProps>(
  (
    {
      data,
      dark,
      className,
      symbol,
      chartType = "Candlestick",
      autoMode = true,
      enableCrosshairTooltip = false,
      onChartApi,
      ...rest
    },
    ref
  ) => {
    // 与 TradingChart 使用同一个容器，方便在容器内部注入覆盖层
    const containerRef = useRef<HTMLDivElement | null>(null)

    // 捕获悬浮的 K 线数据以用于价格图例显示
    const [hoveredBar, setHoveredBar] = useState<ChartData | null>(null)

    // 捕获 chart 实例传给 tooltip 组件
    const [chartApi, setChartApi] = useState<IChartApi | null>(null)

    // 与 TradingChart 完全一致的颜色系统（来自 CSS 变量）
    const layoutColors = useMemo(() => getLayoutColors(), [dark])

    const last: ChartData | null = data && data.length > 0 ? (data[data.length - 1] as any) : null

    return (
      <TradingChart
        data={data}
        dark={dark}
        className={className}
        symbol={symbol}
        chartType={chartType}
        autoMode={autoMode}
        enableCrosshairTooltip={enableCrosshairTooltip}
        onChartApi={(api) => {
          setChartApi(api)
          onChartApi?.(api)
        }}
        // 将容器 ref 传入，以便覆盖层和 tooltip 在同一容器内渲染
        containerRef={containerRef}
        ref={ref}
        {...rest}
      >
        {/* 顶部左侧价格与图例覆盖层（保持与原 TradingChart 完全一致的 UI 与行为） */}
        {data.length > 0 && (
          <PriceLegendOverlay
            symbol={symbol}
            bar={(hoveredBar ?? (last as any))}
            last={last}
            layoutColors={{ text: layoutColors.text, up: layoutColors.up, down: layoutColors.down }}
          />
        )}

        {/* 十字光标提示（与原来相同的订阅与渲染逻辑） */}
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
      </TradingChart>
    )
  }
)

MainChart.displayName = "MainChart"

export default MainChart