import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SymbolSelect } from './symbol-select'

const meta: Meta<typeof SymbolSelect> = {
  title: 'AdvanceChart/Header/Left/SymbolSelect',
  component: SymbolSelect,
}
export default meta

export const Basic: StoryObj<typeof SymbolSelect> = {
  render: () => {
    const [symbol, setSymbol] = useState('BTC/USD')
    const options = ['BTC/USD', 'ETH/USD', 'SOL/USD', { value: 'BNB/USDT', label: 'BNB/USDT' }]
    return (
      <div className="p-4">
        <SymbolSelect 
          value={symbol} 
          onChange={setSymbol} 
          options={options.map(opt => 
            typeof opt === 'string' 
              ? { value: opt, label: opt }
              : opt
          )} 
        />
      </div>
    )
  },
}