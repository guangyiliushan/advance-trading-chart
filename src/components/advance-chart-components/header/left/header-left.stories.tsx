import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeaderLeft } from './header-left'
import type { ChartTypeStr } from '@/lib/types'

const meta: Meta<typeof HeaderLeft> = {
  title: 'AdvanceChart/Header/HeaderLeft',
  component: HeaderLeft,
}
export default meta

export const Basic: StoryObj<typeof HeaderLeft> = {
  render: () => {
    const [symbol, setSymbol] = useState('BTC/USD')
    const [timeframe, setTimeframe] = useState('1h')
    const [chartType, setChartType] = useState<ChartTypeStr>('Candlestick')

    const options = ['BTC/USD', 'ETH/USD', 'SOL/USD']

    return (
      <div className="p-4 bg-background text-foreground">
        <HeaderLeft
          symbol={symbol}
          onSymbolChange={setSymbol}
          symbolOptions={options}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          chartType={chartType}
          onChartTypeChange={setChartType}
        />
      </div>
    )
  },
}