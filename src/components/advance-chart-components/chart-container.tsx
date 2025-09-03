import * as React from "react"
import { TradingChart, type TradingChartHandle } from "./chart/trading-chart"
import type { ChartData , ChartTypeStr } from '@/lib/types'
import { Header } from "./header/header"
import { SettingPanel } from "./chart/setting-panel"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Footer } from "./footer/footer"

// Add: utility for exiting fullscreen
const exitFullscreen = () => {
  const d = document as any
  if (document.fullscreenElement) {
    if (document.exitFullscreen) return document.exitFullscreen()
    if (d.webkitExitFullscreen) return d.webkitExitFullscreen()
    if (d.msExitFullscreen) return d.msExitFullscreen()
  }
}

type ChartContainerProps = {
  data: ChartData[]
  dark: boolean
  symbol: string
  timeframe: string
  rangeSpan: string | null
  onRangeSpanChange: (v: string | null) => void
  onSymbolChange: (v: string) => void
  onTimeframeChange: (v: string) => void
  onFitContent?: () => void
  onGoLive?: () => void
  className?: string
  // 新增：外部可配置的交易对选项
  symbolOptions: Array<{ value: string; label?: string }> | string[]
}

export const ChartContainer = React.forwardRef<TradingChartHandle, ChartContainerProps>(
  ({ data, dark, symbol, timeframe, onSymbolChange, onTimeframeChange, rangeSpan, onRangeSpanChange, onFitContent, onGoLive, className, symbolOptions }, ref) => {

    // 本地图表实例引用，既供 Footer 调用，也向外转发
    const chartRef = React.useRef<TradingChartHandle | null>(null)
    const fitContent = React.useCallback(() => {
      chartRef.current?.fitContent()
      onFitContent?.()
    }, [onFitContent])
    const goLive = React.useCallback(() => {
      chartRef.current?.goLive()
      onGoLive?.()
    }, [onGoLive])

    // Fullscreen controls
    const enterFullscreen = React.useCallback(() => {
      chartRef.current?.enterFullscreen()
    }, [])

    React.useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          exitFullscreen()
        }
      }
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }, [])

    // 自动模式（自动缩放/跟随最新）开关
    const [autoMode, setAutoMode] = React.useState<boolean>(true)

    // Header 选择间隔：认为用户开始手动管理图表时间宽度，清空 Footer 的范围选择
    const handleHeaderTimeframeChange = React.useCallback((v: string) => {
      onTimeframeChange(v)
      onRangeSpanChange(null)
    }, [onTimeframeChange, onRangeSpanChange])

    // Footer 选择范围：应用到图表可见范围，并在能对应到时间间隔时同步 Header
    const handleFooterRangeChange = React.useCallback((span: string) => {
      onRangeSpanChange(span)
      // 将范围应用到图表
      chartRef.current?.setVisibleRange(span)
      // 如果当前为自动模式，确保跟随到最新
      if (autoMode) {
        chartRef.current?.goLive()
      }
      // 根据范围选择一个合理的单根K线时间宽度以同步 Header
      const spanToTimeframe: Record<string, string> = {
        '1h': '1m',
        '6h': '5m',
        '1d': '15m',
        '3d': '30m',
        '7d': '1h',
        '1m': '6h',
        '3m': '12h',
        '1y': '1d',
        '3y': '1w',
      }
      const tf = spanToTimeframe[span]
      if (tf) {
        onTimeframeChange(tf)
      }
    }, [onRangeSpanChange, onTimeframeChange, autoMode])

    // 切换自动模式：开启时不清空固定范围；若存在用户指定的范围，则用该范围锚定到最新；否则回退为 goLive + fitContent
    const handleAutoModeChange = React.useCallback((v: boolean) => {
      setAutoMode(v)
      if (v) {
        if (rangeSpan) {
          chartRef.current?.setVisibleRange(rangeSpan)
          chartRef.current?.goLive()
        } else {
          chartRef.current?.goLive()
          chartRef.current?.fitContent()
        }
      }
      // 关闭自动：不做额外处理，保持当前可见范围，允许自由移动
    }, [rangeSpan])

    // 新增：图表类型本地状态
    const [chartType, setChartType] = React.useState<ChartTypeStr>("Candlestick")

    return (
      <div className={cn("grid grid-cols-[auto,1fr,auto] grid-rows-[auto,1fr] h-full bg-background", className)}>
        {/* Header */}
        <div className="col-span-3 row-span-1">
          <Header 
            symbol={symbol}
            onSymbolChange={onSymbolChange}
            timeframe={timeframe}
            onTimeframeChange={handleHeaderTimeframeChange}
            onFitContent={fitContent}
            onGoLive={goLive}
            onToggleFullscreen={enterFullscreen}
            symbolOptions={symbolOptions}
            chartType={chartType}
            onChartTypeChange={setChartType}
          />
        </div>
        {/* Chart 容器 */}
        <div className="row-span-1 row-start-2 col-start-2 relative flex flex-col">
          <TradingChart 
            ref={(inst) => {
              chartRef.current = inst
              if (typeof ref === 'function') {
                ref(inst as TradingChartHandle)
              } else if (ref) {
                (ref as { current: TradingChartHandle | null }).current = inst
              }
            }} 
            data={data} 
            dark={dark} 
            symbol={symbol}
            chartType={chartType}
            autoMode={autoMode}
            className="flex-1 w-full" 
          />
          {/* Settings Dropdown Trigger Button */}
          <SettingPanel>
            <button 
              className="absolute bottom-0 right-0 w-[70px] h-[28px] bg-muted text-foreground z-30 flex items-center justify-center"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </SettingPanel>
        </div>
        {/* Footer */}
        <div className="col-span-3 row-span-1 row-start-3">
          <Footer
            theme={dark ? 'dark' : 'light'}
            rangeSpan={rangeSpan}
            onRangeSpanChange={handleFooterRangeChange}
            autoMode={autoMode}
            onAutoModeChange={handleAutoModeChange}
          />
        </div>
      </div>
    )
  }
)

ChartContainer.displayName = "ChartContainer"