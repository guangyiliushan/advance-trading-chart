import * as React from 'react'
import { Card } from '@/components/ui/card'
import { ChartContainer } from '@/components/advance-chart-components/chart-container'
import type { TradingChartHandle } from '@/components/advance-chart-components/main/chart/trading-chart'
import { generateData } from '@/core/utils'
import type { ChartData } from '@/core/types'
import { cacheManager, TF_STR_TO_SEC, getWarmupList } from '@/core/cache'

// 基于交易对推断一个初始基准价格（仅用于本地 mock 数据）
function getBaseForSymbol(symbol: string) {
  return symbol.startsWith('BTC') ? 30000 : symbol.startsWith('ETH') ? 1500 : 80
}

// 常用周期预热配置（支持按需调整）
const COMMON_TF_STRS = ['5m', '15m', '1h', '4h', '1d'] as const

function AdvanceChartDemo() {
  const [symbol, setSymbol] = React.useState('BTC/USD')
  const [timeframe, setTimeframe] = React.useState('1m')
  const [rangeSpan, setRangeSpan] = React.useState<string | null>(null)
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

  // 初始化/切换符号时：构建 base 数据并进行缓存与预热
  React.useEffect(() => {
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
  }, [symbol])

  // 切换 timeframe 时，仅从缓存/聚合层取数据
  React.useEffect(() => {
    const baseTfSec = TF_STR_TO_SEC['1m']
    const tfSec = TF_STR_TO_SEC[timeframe] ?? baseTfSec
    setData(cacheManager.getForTimeframe(symbol, tfSec))
  }, [symbol, timeframe])

  return (
    <div className="min-h-dvh p-4 md:p-6 bg-background">
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
        />
      </Card>
    </div>
  )
}

export default AdvanceChartDemo