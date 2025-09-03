// Header 组件: 顶部导入区域
import * as React from "react"
import type { ChartTypeStr } from '@/lib/types'
import { HeaderLeft } from './left/header-left'
import { HeaderRight } from './right/header-right'

export type HeaderProps = {
  symbol: string
  onSymbolChange: (v: string) => void
  timeframe: string
  onTimeframeChange: (v: string) => void
  onFitContent?: () => void
  onGoLive?: () => void
  symbolOptions?: Array<{ value: string; label?: string }> | string[]
  onToggleFullscreen?: () => void
  chartType: ChartTypeStr
  onChartTypeChange: (v: ChartTypeStr) => void
}

export const Header: React.FC<HeaderProps> = ({ symbol, onSymbolChange, timeframe, onTimeframeChange, onFitContent, onGoLive, symbolOptions, onToggleFullscreen, chartType, onChartTypeChange }) => {
  // 规范化外部传入的选项（支持 string[] 或对象数组）
  const normalizedSymbolOptions = React.useMemo(() => {
    const list = symbolOptions ?? ["BTC/USD", "ETH/USD", "SOL/USD"]
    return list.map((o) =>
      typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label ?? o.value }
    )
  }, [symbolOptions])

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-background text-foreground p-2">
      <div className="flex items-center gap-3">
        {/* 左侧封装组件：包含交易对选择、时间周期、类型切换、指标菜单 */}
        <HeaderLeft
          symbol={symbol}
          onSymbolChange={onSymbolChange}
          symbolOptions={normalizedSymbolOptions}
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
          chartType={chartType}
          onChartTypeChange={onChartTypeChange}
        />
      </div>
      {/* 右侧封装组件：主题切换、语言、操作按钮、导出图片 */}
      <HeaderRight
        onFitContent={onFitContent}
        onGoLive={onGoLive}
        onToggleFullscreen={onToggleFullscreen}
      />
    </div>
  )
}