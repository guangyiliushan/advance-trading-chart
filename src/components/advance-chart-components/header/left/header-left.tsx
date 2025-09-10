import * as React from 'react'
import { IndicatorMenu } from './indicator-menu'
import { ChartTypeSwitcher } from './chart-type-switcher'
import type { ChartTypeStr } from '@/core/types'
import { Tooltip, TooltipContent } from '@/components/ui/tooltip'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { TimeframeSelect } from './timeframe-select'
import { SymbolSelect, type SymbolOption } from './symbol-select'

export type HeaderLeftProps = {
  symbol: string
  onSymbolChange: (v: string) => void
  symbolOptions?: Array<SymbolOption> | string[]
  timeframe: string
  onTimeframeChange: (v: string) => void
  chartType: ChartTypeStr
  onChartTypeChange: (v: ChartTypeStr) => void
}

export const HeaderLeft: React.FC<HeaderLeftProps> = ({ symbol, onSymbolChange, symbolOptions, timeframe, onTimeframeChange, chartType, onChartTypeChange }) => {
  return (
    <div className="flex items-center gap-3">
      {/* 交易对选择 */}
      <SymbolSelect value={symbol} onChange={onSymbolChange} options={symbolOptions} />

      <div className="h-5 w-px bg-white/20" />

      {/* 时间周期选择 */}
      <TimeframeSelect value={timeframe} onChange={onTimeframeChange} />

      <div className="h-5 w-px bg-white/20" />

      {/* 图表类型切换 */}
      <ChartTypeSwitcher value={chartType} onChange={onChartTypeChange} />

      {/* 指标菜单 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <IndicatorMenu />
          </span>
        </TooltipTrigger>
        <TooltipContent>Indicator</TooltipContent>
      </Tooltip>
    </div>
  )
}