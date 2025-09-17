import { Settings } from "lucide-react"
import { forwardRef, useImperativeHandle, useRef } from "react"
import type { TradingChartHandle } from "./chart/trading-chart"
import { MainChart } from "./chart/main-chart"
import { SettingPanel } from "./setting/setting-panel"
import type { ChartData, ChartTypeStr } from "@/core/types"
import type { HeatMapData } from "./chart/series/heatmap/data"

export interface MainProps {
  data: ChartData[]
  dark?: boolean
  symbol?: string
  chartType?: ChartTypeStr
  autoMode?: boolean
  className?: string
  predictionData?: HeatMapData[]
  // 新增：十字光标提示开关
  enableCrosshairTooltip?: boolean
  // 新增：颜色覆盖
  colorConfig?: Partial<Record<string, string>>
}

export const Main = forwardRef<TradingChartHandle, MainProps>(
  (
    {
      data,
      dark,
      symbol,
      chartType,
      autoMode,
      className,
      predictionData,
      enableCrosshairTooltip,
      colorConfig,
    },
    ref
  ) => {
    // 使用内部 ref 持有 TradingChart 实例，并代理暴露方法
    const innerRef = useRef<TradingChartHandle | null>(null)

    useImperativeHandle(ref, () => ({
      fitContent: () => innerRef.current?.fitContent?.(),
      goLive: () => innerRef.current?.goLive?.(),
      setVisibleRange: (span: string) => innerRef.current?.setVisibleRange?.(span),
      enterFullscreen: () => innerRef.current?.enterFullscreen?.(),
    }))

    return (
      <div className={className}>
        <MainChart
          ref={innerRef}
          data={data}
          dark={dark}
          symbol={symbol}
          chartType={chartType}
          autoMode={autoMode}
          predictionData={predictionData}
          enableCrosshairTooltip={enableCrosshairTooltip}
          colorConfig={colorConfig}
        />
        <SettingPanel>
          <button
            className="absolute bottom-0 right-0 w-[70px] h-[28px] bg-muted text-foreground z-30 flex items-center justify-center"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </SettingPanel>
      </div>
    )
  }
)

Main.displayName = "Main"

