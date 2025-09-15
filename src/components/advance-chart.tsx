import * as React from 'react'
import { Card } from '@/components/ui/card'
import { ChartContainer } from '@/components/advance-chart-components/chart-container'
import type { TradingChartHandle } from '@/components/advance-chart-components/main/chart/trading-chart'
import { generateData } from '@/core/utils'
import type { ChartData, UnifiedDataSource } from '@/core/types'
import type { HeatMapData } from '@/components/advance-chart-components/main/chart/series/heatmap/data'
import { cacheManager, TF_STR_TO_SEC, getWarmupList } from '@/core/cache'

// 基于交易对推断一个初始基准价格（仅用于本地 mock 数据）
function getBaseForSymbol(symbol: string) {
  return symbol.startsWith('BTC') ? 30000 : symbol.startsWith('ETH') ? 1500 : 80
}

// 常用周期预热配置（支持按需调整）
const COMMON_TF_STRS = ['5m', '15m', '1h', '4h', '1d'] as const

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
  const [data, setData] = React.useState<ChartData[]>(() => {
    const initIntervalSec = timeframe === '1m' ? 60 : timeframe === '5m' ? 300 : timeframe === '1h' ? 3600 : 60
    return generateData(30000, 30000, undefined, initIntervalSec)
  })
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

  // 初始化/切换符号时：构建 base 数据并进行缓存与预热（当未提供 mainDataSource 时启用）
  React.useEffect(() => {
    if (mainDataSource) return // 外部数据源接管，跳过本地 mock

    const baseTfSec = TF_STR_TO_SEC['1m']
    const basePrice = getBaseForSymbol(symbol)
    const baseBars = generateData(30000, basePrice, undefined, baseTfSec)

    // 设置单源数据
    cacheManager.setBase(symbol, baseBars, baseTfSec)

    // 按当前 timeframe 拉取聚合数据
    const tfSec = TF_STR_TO_SEC[timeframe] ?? baseTfSec
    setData(cacheManager.getForTimeframe(symbol, tfSec))

    // 预热：合并推荐周期与自定义常用周期（仅生成缓存，不触发 UI 变化）
    const recommended = getWarmupList(baseTfSec)
    const customList = COMMON_TF_STRS
      .map((s) => TF_STR_TO_SEC[s])
      .filter((sec) => typeof sec === 'number' && sec >= baseTfSec) as number[]
    const warmList = Array.from(new Set<number>([...recommended, ...customList]))

    cacheManager.startWarmup(symbol, warmList, 60_000)
    return () => {
      // 停止上一个 symbol 的预热定时器
      cacheManager.stopWarmup()
    }
  }, [symbol, timeframe, mainDataSource])

  // 切换 timeframe 时，仅从缓存/聚合层取数据（未提供 mainDataSource 时）
  React.useEffect(() => {
    if (mainDataSource) return
    const baseTfSec = TF_STR_TO_SEC['1m']
    const tfSec = TF_STR_TO_SEC[timeframe] ?? baseTfSec
    setData(cacheManager.getForTimeframe(symbol, tfSec))
  }, [symbol, timeframe, mainDataSource])

  return (
    <div className={"min-h-dvh p-4 md:p-6 bg-background " + (className ?? '')}>
      <Card className="h-[70vh] p-0">
        <ChartContainer 
          ref={chartRef}
          data={data}
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