import * as React from "react"
import type { TradingChartHandle } from "./main/chart/trading-chart"
import type { ChartData , ChartTypeStr } from '@/core/types'
import type { IDataProvider, DataRequest, RealtimeCallback, UnsubscribeFunction } from '@/core/data/data-provider.types'
import { createDataProvider } from '@/core/data/data-provider-factory'
import { Header } from "./header/header"
import { cn } from "@/lib/utils"
import { Footer } from "./footer/footer"
import { Main } from "./main/main"
// 新增：热力图类型
import type { HeatMapData } from "./main/chart/series/heatmap/data"

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
  // 数据可以是静态数据或者通过数据提供者自动获取
  data?: ChartData[]
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
  // 新增：是否启用自动数据获取
  enableAutoData?: boolean
  // 新增：是否启用实时数据
  enableRealtime?: boolean
  // 新增：数据加载状态回调
  onDataLoading?: (loading: boolean) => void
  // 新增：数据错误回调
  onDataError?: (error: string) => void
  // 新增：预测热力图数据
  predictionHeatmap?: HeatMapData[]
}

export const ChartContainer = React.forwardRef<TradingChartHandle, ChartContainerProps>(
  ({ 
    data: staticData, 
    dark, 
    symbol, 
    timeframe, 
    onSymbolChange, 
    onTimeframeChange, 
    rangeSpan, 
    onRangeSpanChange, 
    onFitContent, 
    onGoLive, 
    className, 
    symbolOptions,
    enableAutoData = false,
    enableRealtime = false,
    onDataLoading,
    onDataError,
    predictionHeatmap,
  }, ref) => {

    // 本地图表实例引用，既供 Footer 调用，也向外转发
    const chartRef = React.useRef<TradingChartHandle | null>(null)
    
    // 数据提供者和状态管理
    const dataProviderRef = React.useRef<IDataProvider | null>(null)
    const realtimeUnsubscribeRef = React.useRef<UnsubscribeFunction | null>(null)
 // 数据状态管理
  const [chartData, setChartData] = React.useState<ChartData[]>(staticData || [])
  const [isLoading, setIsLoading] = React.useState(false)
  const [dataError, setDataError] = React.useState<string | null>(null)

  // 通知父组件加载状态变化
  React.useEffect(() => {
    onDataLoading?.(isLoading)
  }, [isLoading, onDataLoading])

  // 通知父组件错误状态变化
  React.useEffect(() => {
    if (onDataError) {
      onDataError(dataError || '')
    }
  }, [dataError, onDataError])
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

    // 切换自动模式：简化逻辑，主要的范围管理交给trading-chart.tsx处理
    const handleAutoModeChange = React.useCallback((v: boolean) => {
      setAutoMode(v)
      // 移除原有的范围重置逻辑，让trading-chart.tsx内部处理
      // 只在有明确rangeSpan且开启自动模式时才应用特定范围
      if (v && rangeSpan) {
        chartRef.current?.setVisibleRange(rangeSpan)
      }
      // 关闭自动：不做额外处理，保持当前可视范围，允许自由移动
    }, [rangeSpan])

    // 新增：图表类型本地状态
    const [chartType, setChartType] = React.useState<ChartTypeStr>("Candlestick")
    
    // 初始化数据提供者
    React.useEffect(() => {
      if (enableAutoData) {
        dataProviderRef.current = createDataProvider()
      }
      return () => {
        // 清理实时订阅
        if (realtimeUnsubscribeRef.current) {
          realtimeUnsubscribeRef.current()
          realtimeUnsubscribeRef.current = null
        }
      }
    }, [enableAutoData])
    
    // 获取历史数据
    const fetchHistoricalData = React.useCallback(async (sym: string, tf: string) => {
      if (!dataProviderRef.current || !enableAutoData) return
      
      setIsLoading(true)
      setDataError(null)
      onDataLoading?.(true)
      
      try {
        const request: DataRequest = {
          symbol: sym,
          timeframe: tf,
          limit: 1000 // 默认获取1000个数据点
        }
        
        const response = await dataProviderRef.current.getHistoricalData(request)
        
        if (response.error) {
          throw new Error(response.error)
        }
        
        setChartData(response.data)
        setDataError(null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data'
        setDataError(errorMessage)
        onDataError?.(errorMessage)
      } finally {
        setIsLoading(false)
        onDataLoading?.(false)
      }
    }, [enableAutoData, onDataLoading, onDataError])
    
    // 订阅实时数据
    const subscribeRealtimeData = React.useCallback((sym: string, tf: string) => {
      if (!dataProviderRef.current || !enableRealtime || !dataProviderRef.current.subscribeRealtime) {
        return
      }
      
      // 取消之前的订阅
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current()
      }
      
      const callback: RealtimeCallback = (newData: ChartData) => {
        setChartData(prevData => {
          // 更新或添加新数据点
          const existingIndex = prevData.findIndex(item => item.time === newData.time)
          if (existingIndex >= 0) {
            // 更新现有数据点
            const updatedData = [...prevData]
            updatedData[existingIndex] = newData
            return updatedData
          } else {
            // 添加新数据点
            return [...prevData, newData].sort((a, b) => Number(a.time) - Number(b.time))
          }
        })
      }
      
      realtimeUnsubscribeRef.current = dataProviderRef.current.subscribeRealtime(sym, tf, callback)
    }, [enableRealtime])
    
    // 当symbol或timeframe变化时，重新获取数据
    React.useEffect(() => {
      if (enableAutoData) {
        fetchHistoricalData(symbol, timeframe)
      }
      if (enableRealtime) {
        subscribeRealtimeData(symbol, timeframe)
      }
    }, [symbol, timeframe, fetchHistoricalData, subscribeRealtimeData, enableAutoData, enableRealtime])
    
    // 当静态数据变化时，更新图表数据
    React.useEffect(() => {
      if (!enableAutoData && staticData) {
        setChartData(staticData)
      }
    }, [staticData, enableAutoData])
    
    // 确定最终使用的数据
    const finalData = enableAutoData ? chartData : (staticData || [])

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
          <Main
            ref={(inst) => {
              chartRef.current = inst
              if (typeof ref === 'function') {
                ref(inst as TradingChartHandle)
              } else if (ref) {
                (ref as { current: TradingChartHandle | null }).current = inst
              }
            }}
            data={finalData}
            dark={dark}
            symbol={symbol}
            chartType={chartType}
            autoMode={autoMode}
            className="flex-1 w-full"
            predictionHeatmap={predictionHeatmap}
          />
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