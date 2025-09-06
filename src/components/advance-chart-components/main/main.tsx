import * as React from "react"
import { Settings } from "lucide-react"
import type { ChartData, ChartTypeStr } from "@/core/types"
import { SettingPanel } from "./setting/setting-panel"
import { MainChart } from "./chart/main-chart"
import type { TradingChartHandle } from "./chart/trading-chart"

export type MainProps = {
  data: ChartData[]
  dark: boolean
  symbol: string
  chartType: ChartTypeStr
  autoMode: boolean
  className?: string
}

export const Main = React.forwardRef<TradingChartHandle, MainProps>(
  ({ data, dark, symbol, chartType, autoMode, className }, ref) => {
    return (
      <>
        <MainChart
          ref={ref}
          data={data}
          dark={dark}
          symbol={symbol}
          chartType={chartType}
          autoMode={autoMode}
          className={className}
        />
        <SettingPanel>
          <button
            className="absolute bottom-0 right-0 w-[70px] h-[28px] bg-muted text-foreground z-30 flex items-center justify-center"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </SettingPanel>
      </>
    )
  }
)

Main.displayName = "Main"