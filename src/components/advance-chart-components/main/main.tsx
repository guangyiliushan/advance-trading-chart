import { Settings } from "lucide-react"
import { forwardRef, useImperativeHandle } from "react"
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
    },
    ref
  ) => {
    useImperativeHandle(ref, () => ({
      fitContent: () => { },
      goLive: () => { },
      setVisibleRange: () => { },
      enterFullscreen: () => { },
    }))

    return (
      <div className={className}>
        <MainChart
          ref={ref}
          data={data}
          dark={dark}
          symbol={symbol}
          chartType={chartType}
          autoMode={autoMode}
          predictionData={predictionData}
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

