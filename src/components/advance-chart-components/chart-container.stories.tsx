import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChartContainer } from "./chart-container";
import { generateDataForSymbol } from '@/core/data/mock-data-generator';
import { useState } from 'react';

const meta: Meta<typeof ChartContainer> = {
  title: "AdvanceChart/ChartContainer",
  component: ChartContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    dark: {
      control: 'boolean',
      description: '是否使用暗色主题'
    },
    symbol: {
      control: 'select',
      options: ['BTC/USD', 'ETH/USD', 'BNB/USD', 'ADA/USD', 'SOL/USD'],
      description: '交易对符号'
    },
    timeframe: {
      control: 'select',
      options: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'],
      description: '时间框架'
    },
    enableAutoData: {
      control: 'boolean',
      description: '启用自动数据获取'
    },
    enableRealtime: {
      control: 'boolean',
      description: '启用实时数据更新'
    }
  },
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

// 交互式Story组件
interface StoryArgs {
  dark: boolean
  symbol: string
  timeframe: string
  enableAutoData?: boolean
  enableRealtime?: boolean
}

const InteractiveChartContainer = (args: StoryArgs) => {
  const [symbol, setSymbol] = useState(args.symbol || 'BTC/USD');
  const [timeframe, setTimeframe] = useState(args.timeframe || '1h');
  const [rangeSpan, setRangeSpan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 生成静态数据（当不使用自动数据时）
  const staticData = !args.enableAutoData ? generateDataForSymbol(symbol, timeframe, 500) : undefined;
  
  return (
    <div className="h-screen w-full relative">
      {/* 加载状态指示器 */}
      {isLoading && (
        <div className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-3 py-1 rounded text-sm">
          Loading data...
        </div>
      )}
      
      {/* 错误状态指示器 */}
      {error && (
        <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded text-sm max-w-xs">
          Error: {error}
        </div>
      )}
      
      <ChartContainer
        {...args}
        data={staticData}
        symbol={symbol}
        timeframe={timeframe}
        rangeSpan={rangeSpan}
        onSymbolChange={setSymbol}
        onTimeframeChange={setTimeframe}
        onRangeSpanChange={setRangeSpan}
        onDataLoading={setIsLoading}
        onDataError={setError}
        symbolOptions={['BTC/USD', 'ETH/USD', 'BNB/USD', 'ADA/USD', 'SOL/USD']}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args: StoryArgs) => <InteractiveChartContainer {...args} />,
  args: {
    dark: false,
    symbol: 'BTC/USD',
    timeframe: '1h',
  },
};

export const Dark: Story = {
  render: (args: StoryArgs) => <InteractiveChartContainer {...args} />,
  args: {
    dark: true,
    symbol: 'BTC/USD',
    timeframe: '1h',
  },
};

export const MultipleSymbols: Story = {
  render: (args: StoryArgs) => <InteractiveChartContainer {...args} />,
  args: {
    dark: false,
    symbol: 'ETH/USD',
    timeframe: '4h',
  },
};

export const DifferentTimeframes: Story = {
  render: (args: StoryArgs) => <InteractiveChartContainer {...args} />,
  args: {
    dark: false,
    symbol: 'BTC/USD',
    timeframe: '1m',
  },
};

export const LongTimeframe: Story = {
  render: (args: StoryArgs) => <InteractiveChartContainer {...args} />,
  args: {
    dark: false,
    symbol: 'BTC/USD',
    timeframe: '1d',
  },
};

export const WithAutoData: Story = {
  render: (args: StoryArgs) => <InteractiveChartContainer {...args} />,
  args: {
    dark: false,
    symbol: 'BTC/USD',
    timeframe: '1h',
    enableAutoData: true,
    enableRealtime: false,
  },
};

export const WithRealtime: Story = {
  render: (args: StoryArgs) => <InteractiveChartContainer {...args} />,
  args: {
    dark: false,
    symbol: 'BTC/USD',
    timeframe: '1h',
    enableAutoData: true,
    enableRealtime: true,
  },
};

export const DarkWithRealtime: Story = {
  render: (args: StoryArgs) => <InteractiveChartContainer {...args} />,
  args: {
    dark: true,
    symbol: 'ETH/USD',
    timeframe: '5m',
    enableAutoData: true,
    enableRealtime: true,
  },
};
