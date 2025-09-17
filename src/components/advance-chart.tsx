import * as React from 'react'
import { Card } from '@/components/ui/card'
import { ChartContainer } from '@/components/advance-chart-components/chart-container'
import type { TradingChartHandle } from '@/components/advance-chart-components/main/chart/trading-chart'
import type { ChartData, UnifiedDataSource } from '@/core/types'
import type { HeatMapData } from '@/components/advance-chart-components/main/chart/series/heatmap/data'

// 新增：AdvanceChart 受控/非受控 Props 定义
interface AdvanceChartProps {
  // 受控：交易对与时间周期
  symbol?: string
  timeframe?: string
  onSymbolChange?: (v: string) => void
  onTimeframeChange?: (v: string) => void
  // 可选：范围选择（保持内部非受控，后续可扩展为受控）
  rangeSpan?: string | null
  onRangeSpanChange?: (v: string | null) => void
  // 统一数据源（若提供则跳过本地 mock 预热与数据生成）
  mainDataSource?: UnifiedDataSource<ChartData>
  predictionDataSource?: UnifiedDataSource<HeatMapData>
  // 静态预测数据（可选）
  predictionData?: HeatMapData[]
  // 外部传入的主图数据（静态）
  data?: ChartData[]
  // UI/颜色配置
  uiConfig?: {
    autoModeDefault?: boolean
    enableCrosshairTooltip?: boolean
  }
  colorConfig?: Partial<Record<string, string>>
  // 容器样式
  className?: string
}

function AdvanceChart(props: AdvanceChartProps) {
  const {
    symbol: symbolProp,
    timeframe: timeframeProp,
    onSymbolChange,
    onTimeframeChange,
    rangeSpan: rangeSpanProp,
    onRangeSpanChange,
    mainDataSource,
    predictionDataSource,
    predictionData,
    // 新增：外部传入的主图数据
    data: dataProp,
    uiConfig,
    colorConfig,
    className,
  } = props

  // 非受控本地状态（当对应受控 props 未提供时生效）
  const [internalSymbol, setInternalSymbol] = React.useState('BTC/USD')
  const [internalTimeframe, setInternalTimeframe] = React.useState('1m')
  const [internalRangeSpan, setInternalRangeSpan] = React.useState<string | null>(null)

  const symbol = symbolProp ?? internalSymbol
  const timeframe = timeframeProp ?? internalTimeframe
  const rangeSpan = rangeSpanProp ?? internalRangeSpan

  const setSymbol = React.useCallback((v: string) => {
    onSymbolChange?.(v)
    if (symbolProp === undefined) setInternalSymbol(v)
  }, [onSymbolChange, symbolProp])

  const setTimeframe = React.useCallback((v: string) => {
    onTimeframeChange?.(v)
    if (timeframeProp === undefined) setInternalTimeframe(v)
  }, [onTimeframeChange, timeframeProp])

  const setRangeSpan = React.useCallback((v: string | null) => {
    onRangeSpanChange?.(v)
    if (rangeSpanProp === undefined) setInternalRangeSpan(v)
  }, [onRangeSpanChange, rangeSpanProp])

  const [dark, setDark] = React.useState(false)
  const chartRef = React.useRef<TradingChartHandle | null>(null)

  const symbolOptions = React.useMemo(() => [
    'BTC/USD',
    'ETH/USD',
    'SOL/USD',
  ], [])

  // sync dark with theme change via root class
  React.useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setDark(root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    setDark(root.classList.contains('dark'))
    return () => observer.disconnect()
  }, [])

  return (
    <div className={"min-h-dvh p-4 md:p-6 bg-background " + (className ?? '')}>
      <Card className="h-[70vh] p-0">
        <ChartContainer 
          ref={chartRef}
          data={dataProp}
          dark={dark}
          symbol={symbol}
          timeframe={timeframe}
          rangeSpan={rangeSpan}
          onRangeSpanChange={setRangeSpan}
          onSymbolChange={setSymbol}
          onTimeframeChange={setTimeframe}
          onFitContent={() => chartRef.current?.fitContent()}
          onGoLive={() => chartRef.current?.goLive()}
          className="h-full w-full"
          symbolOptions={symbolOptions}
          // 新增：UI 与颜色配置透传
          uiConfig={uiConfig}
          colorConfig={colorConfig}
          // 新增：统一数据源透传
          mainDataSource={mainDataSource}
          predictionDataSource={predictionDataSource}
          // 静态预测数据（可选，若无数据源时可用于演示）
          predictionData={predictionData}
        />
      </Card>
    </div>
  )
}

export default AdvanceChart