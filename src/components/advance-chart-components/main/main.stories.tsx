import { useMemo, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThemeProvider } from '@/theme-provider'
import { Main } from './main'
import type { TradingChartHandle } from './chart/trading-chart'
import { generateFromData } from '@/core/utils'
import type { ChartTypeStr } from '@/core/types'

const chartTypeOptions: ChartTypeStr[] = [
  'Candlestick',
  'Bar',
  'Line',
  'Area',
  'Baseline',
  'Histogram',
]

const meta: Meta<typeof Main> = {
  title: 'AdvanceChart/Main',
  component: Main,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Main 组件是交易图表的核心容器：内部集成 TradingChart 渲染与 SettingPanel 设置入口，支持透传图表的主要参数（数据、主题、符号、图表类型、自动模式）并通过 ref 暴露图表交互方法（fitContent/goLive/enterFullscreen）。',
      },
    },
  },
  argTypes: {
    chartType: { control: { type: 'radio' }, options: chartTypeOptions },
    dark: { control: { type: 'boolean' } },
    autoMode: { control: { type: 'boolean' } },
    symbol: { control: { type: 'text' } },
    className: { control: false },
    data: { control: false },
  },
  args: {
    // 运行时在各 story 中按需生成，避免在文档页重复大体量数据
    dark: false,
    symbol: 'BTC/USD',
    chartType: 'Candlestick',
    autoMode: true,
  },
}
export default meta

type Story = StoryObj<typeof meta>

// 基本用法：默认亮色主题 + K线图。包含一个相对定位的容器以承载绝对定位的设置按钮。
export const Basic: Story = {
  render: (args) => {
    const data = useMemo(() => generateFromData(500, 30000, undefined, 60), [])
    return (
      <ThemeProvider forcedTheme={args.dark ? 'dark' : 'light'}>
        <div className="relative h-[480px] w-full bg-background">
          <Main {...args} data={data} className="absolute inset-0" />
        </div>
      </ThemeProvider>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          '基础场景：展示 Main 在标准容器中的渲染效果，设置面板入口位于容器右下角（绝对定位）。建议外层容器使用 relative，并指定高度来渲染图表。',
      },
    },
  },
}

// 暗色主题：通过 props.dark 与 ThemeProvider 强制主题配合使用以保证风格一致。
export const DarkTheme: Story = {
  args: { dark: true },
  render: (args) => {
    const data = useMemo(() => generateFromData(500, 30000, undefined, 60), [])
    return (
      <ThemeProvider forcedTheme="dark">
        <div className="relative h-[480px] w-full bg-background">
          <Main {...args} data={data} className="absolute inset-0" />
        </div>
      </ThemeProvider>
    )
  },
  parameters: {
    docs: {
      description: { story: '暗色主题示例。' },
    },
  },
}

// 不同图表类型：可通过控制面板切换 Candlestick/Line/Area/Baseline/Histogram 等。
export const ChartTypes: Story = {
  args: { chartType: 'Line' },
  render: (args) => {
    const data = useMemo(() => generateFromData(500, 30000, undefined, 60), [])
    return (
      <ThemeProvider forcedTheme={args.dark ? 'dark' : 'light'}>
        <div className="relative h-[480px] w-full bg-background">
          <Main {...args} data={data} className="absolute inset-0" />
        </div>
      </ThemeProvider>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          '通过 Storybook 控件在多种图表类型间切换，观察主图与成交量叠加的样式变化。',
      },
    },
  },
}

// 关闭自动模式：演示禁用自动模式后的表现（主要影响内部可视范围与行为）。
export const AutoModeOff: Story = {
  args: { autoMode: false },
  render: (args) => {
    const data = useMemo(() => generateFromData(500, 30000, undefined, 60), [])
    return (
      <ThemeProvider forcedTheme={args.dark ? 'dark' : 'light'}>
        <div className="relative h-[480px] w-full bg-background">
          <Main {...args} data={data} className="absolute inset-0" />
        </div>
      </ThemeProvider>
    )
  },
  parameters: {
    docs: { description: { story: '关闭自动模式（autoMode=false）以查看交互差异。' } },
  },
}

// 数据量对比：展示稀疏数据与密集数据的渲染与性能差异。
export const SparseData: Story = {
  name: 'Data: Sparse (100 bars)',
  render: (args) => {
    const data = useMemo(() => generateFromData(100, 30000, undefined, 60), [])
    return (
      <ThemeProvider forcedTheme={args.dark ? 'dark' : 'light'}>
        <div className="relative h-[480px] w-full bg-background">
          <Main {...args} data={data} className="absolute inset-0" />
        </div>
      </ThemeProvider>
    )
  },
}

export const DenseData: Story = {
  name: 'Data: Dense (2000 bars)',
  render: (args) => {
    const data = useMemo(() => generateFromData(2000, 30000, undefined, 60), [])
    return (
      <ThemeProvider forcedTheme={args.dark ? 'dark' : 'light'}>
        <div className="relative h-[480px] w-full bg-background">
          <Main {...args} data={data} className="absolute inset-0" />
        </div>
      </ThemeProvider>
    )
  },
}

// ref 交互：通过外部按钮触发 Main -> TradingChart 的实例方法
export const WithRefControls: Story = {
  render: (args) => {
    const data = useMemo(() => generateFromData(500, 30000, undefined, 60), [])
    const ref = useRef<TradingChartHandle | null>(null)
    return (
      <ThemeProvider forcedTheme={args.dark ? 'dark' : 'light'}>
        <div className="relative h-[520px] w-full bg-background">
          {/* 顶部右侧交互按钮 */}
          <div className="absolute right-2 top-2 z-40 flex gap-2">
            <button
              className="px-2 py-1 text-sm rounded bg-muted hover:bg-muted/80"
              onClick={() => ref.current?.fitContent()}
            >
              Fit Content
            </button>
            <button
              className="px-2 py-1 text-sm rounded bg-muted hover:bg-muted/80"
              onClick={() => ref.current?.goLive()}
            >
              Go Live
            </button>
            <button
              className="px-2 py-1 text-sm rounded bg-muted hover:bg-muted/80"
              onClick={() => ref.current?.enterFullscreen()}
            >
              Fullscreen
            </button>
          </div>

          <Main ref={ref} {...args} data={data} className="absolute inset-0" />
        </div>
      </ThemeProvider>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          '通过 ref 演示实例方法：Fit Content、Go Live、Fullscreen。注意 Fullscreen 需浏览器允许全屏权限。',
      },
    },
  },
}