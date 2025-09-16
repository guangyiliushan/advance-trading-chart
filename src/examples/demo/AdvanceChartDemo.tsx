import * as React from 'react'
import  AdvanceChart  from '@/components/advance-chart'
// 新增：导入热力图类型与概率数据转换工具
import type { HeatMapData } from '@/components/advance-chart-components/main/chart/series/heatmap/data'
import { convertProbabilityToHeatMapData, generateSampleProbabilityData } from '@/components/advance-chart-components/main/chart/series/heatmap/probability-data'
// 新增：导入主图数据类型与示例数据生成工具
import type { ChartData } from '@/core/types'
import { generateData } from '@/core/utils'
// 新增：引入缓存管理与时间框架转换
import { cacheManager, tfStrToSec } from '@/core/cache'

function AdvanceChartDemo() {
  // 受控：symbol / timeframe / rangeSpan
  const [symbol, setSymbol] = React.useState('BTC/USD')
  const [timeframe, setTimeframe] = React.useState('1m')
  const [rangeSpan, setRangeSpan] = React.useState<string | null>(null)
  // 示例：预测热力图数据（演示生成与转换，透传到 AdvanceChart）
  const [predictionData, setPredictionData] = React.useState<HeatMapData[]>([])
  // 示例：主视图数据（聚合自基准数据）
  const [data, setData] = React.useState<ChartData[]>([])

  // 简单的基准价格选择（仅用于 Demo 数据生成）
  const getBaseForSymbol = React.useCallback((sym: string) => {
    return sym.startsWith('BTC') ? 30000 : sym.startsWith('ETH') ? 1500 : 80
  }, [])

  // 当交易对或周期变化时，生成示例概率数据并转换为热力图数据
  React.useEffect(() => {
    const sampleProb = generateSampleProbabilityData()
    const heatmap = convertProbabilityToHeatMapData(sampleProb)
    setPredictionData(heatmap)
  }, [symbol, timeframe])

  // 仅在符号变化时生成一次基准数据（例如使用 1m 作为基准）并进行预热
  React.useEffect(() => {
    const base = getBaseForSymbol(symbol)
    const baseTfSec = tfStrToSec('1m')
    const baseBars = generateData(800, base, undefined, baseTfSec)

    // 设置基准数据到缓存，并启动推荐预热
    cacheManager.setBase(symbol, baseBars, baseTfSec)
    cacheManager.startRecommendedWarmup(symbol)

    // 初始化当前时间框架的聚合数据
    const currentTfSec = tfStrToSec(timeframe)
    const initial = cacheManager.getForTimeframe(symbol, currentTfSec)
    setData(initial)
  }, [symbol, getBaseForSymbol])

  // 当 timeframe 或 symbol 变更时，仅做聚合，不重新生成基准数据
  React.useEffect(() => {
    if (!cacheManager.hasSymbol(symbol)) return
    const tfSec = tfStrToSec(timeframe)
    const arr = cacheManager.getForTimeframe(symbol, tfSec)
    setData(arr)
  }, [symbol, timeframe])

  return (
    <AdvanceChart
      // 受控：交易对与时间周期
      symbol={symbol}
      timeframe={timeframe}
      onSymbolChange={setSymbol}
      onTimeframeChange={setTimeframe}
      // 受控：范围选择（可选）
      rangeSpan={rangeSpan}
      onRangeSpanChange={setRangeSpan}
      // 主视图：通过 props 传入外部生成的数据
      data={data}
      // 示例：静态预测数据（如无数据源时用于展示）
      predictionData={predictionData}
      // UI 与颜色配置示例
      uiConfig={{ autoModeDefault: true, enableCrosshairTooltip: true }}
      colorConfig={{ up: '#22c55e', down: '#ef4444' }}
      // 容器样式（外层）
      className="min-h-dvh p-4 md:p-6 bg-background"
    />
  )
}

export default AdvanceChartDemo