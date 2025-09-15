import * as React from 'react'
import  AdvanceChart  from '@/components/advance-chart'
// 新增：导入热力图类型与概率数据转换工具
import type { HeatMapData } from '@/components/advance-chart-components/main/chart/series/heatmap/data'
import { convertProbabilityToHeatMapData, generateSampleProbabilityData } from '@/components/advance-chart-components/main/chart/series/heatmap/probability-data'

function AdvanceChartDemo() {
  // 受控：symbol / timeframe / rangeSpan
  const [symbol, setSymbol] = React.useState('BTC/USD')
  const [timeframe, setTimeframe] = React.useState('1m')
  const [rangeSpan, setRangeSpan] = React.useState<string | null>(null)
  // 示例：预测热力图数据（演示生成与转换，透传到 AdvanceChart）
  const [predictionData, setPredictionData] = React.useState<HeatMapData[]>([])

  // 主题切换由 AdvanceChart 内部监听 html.root 的 class 实现，这里无需重复处理

  // 当交易对或周期变化时，生成示例概率数据并转换为热力图数据
  React.useEffect(() => {
    const sampleProb = generateSampleProbabilityData()
    const heatmap = convertProbabilityToHeatMapData(sampleProb)
    setPredictionData(heatmap)
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