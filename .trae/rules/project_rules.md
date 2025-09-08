
# 高级交易图表组件库项目契约文档

## 项目概述

这是一个基于 React + TypeScript + Vite 构建的高级交易图表组件库，使用 lightweight-charts v5 作为图表核心，集成 Storybook 进行文档管理，最终发布到 npm 供其他项目使用。项目提供完整的交易图表解决方案，包括数据管理、缓存系统、自定义图表系列（热力图、HLC区域图）、实时数据支持和可选功能模块。

## 技术栈规范

### 核心技术
- **构建工具**: Vite 7.1.2
- **包管理器**: pnpm（推荐）
- **前端框架**: React 19.1.1
- **类型系统**: TypeScript 5.8.3（严格模式）
- **图表核心**: lightweight-charts 5.0.8
- **UI组件**: Radix UI + Tailwind CSS 4.1.12
- **文档工具**: Storybook 9.1.4 + MSW 2.11.1
- **国际化**: i18next + react-i18next

### 开发工具
- **代码规范**: ESLint + Prettier
- **主题管理**: next-themes
- **测试框架**: Vitest（推荐）
- **Mock服务**: MSW（仅用于Storybook）

## 项目架构设计

### 目录结构契约

```
src/
├── core/                           # 核心模块（主库入口）
│   ├── types/                      # 统一类型定义
│   │   ├── chart-data.types.ts     # 图表数据类型
│   │   ├── chart-type.types.ts     # 图表类型枚举
│   │   ├── color.types.ts          # 颜色系统类型
│   │   ├── component.types.ts      # 组件属性类型
│   │   ├── time.types.ts           # 时间处理类型
│   │   └── index.ts                # 类型统一导出
│   ├── utils/                      # 核心工具函数
│   │   ├── chart-data.utils.ts     # 数据处理工具
│   │   ├── color.utils.ts          # 颜色处理工具
│   │   ├── format.utils.ts         # 格式化工具
│   │   ├── time.utils.ts           # 时间转换工具
│   │   └── index.ts                # 工具统一导出
│   ├── cache/                      # 缓存管理模块
│   │   ├── cache-manager.ts        # 缓存管理器
│   │   ├── data-manager.ts         # 数据管理器
│   │   ├── timeframe.utils.ts      # 时间框架工具
│   │   └── index.ts                # 缓存模块导出
│   ├── data/                       # 数据提供者系统
│   │   ├── data-provider.types.ts  # 数据提供者接口定义
│   │   ├── data-provider-factory.ts # 数据提供者工厂
│   │   ├── mock-data-provider.ts   # 模拟数据提供者
│   │   ├── real-data-provider.ts   # 真实数据提供者
│   │   ├── mock-data-generator.ts  # 模拟数据生成器
│   │   ├── environment.utils.ts    # 环境检测工具
│   │   └── index.ts                # 数据模块导出
│   └── index.ts                    # 核心模块统一导出
├── components/                     # 组件层
│   ├── advance-chart-components/   # 图表组件群
│   │   ├── header/                 # 头部组件群
│   │   │   ├── left/               # 左侧控件组
│   │   │   │   ├── header-left.tsx         # 左侧容器
│   │   │   │   ├── symbol-select.tsx       # 交易对选择器
│   │   │   │   ├── timeframe-select.tsx    # 时间周期选择器
│   │   │   │   ├── chart-type-switcher.tsx # 图表类型切换器
│   │   │   │   └── indicator-menu.tsx      # 指标菜单
│   │   │   ├── right/              # 右侧控件组
│   │   │   │   ├── header-right.tsx        # 右侧容器
│   │   │   │   ├── language-selector.tsx   # 语言选择器
│   │   │   │   ├── image-menu.tsx          # 图片导出菜单
│   │   │   │   └── components/             # 右侧子组件
│   │   │   │       ├── action-buttons.tsx  # 操作按钮组
│   │   │   │       ├── fullscreen-button.tsx # 全屏按钮
│   │   │   │       ├── settings-button.tsx # 设置按钮
│   │   │   │       └── theme-switcher.tsx  # 主题切换器
│   │   │   └── header.tsx          # 头部容器
│   │   ├── footer/                 # 底部组件群
│   │   │   ├── left/               # 左侧控件组
│   │   │   │   ├── footer-left.tsx         # 左侧容器
│   │   │   │   └── visible-range-selector.tsx # 可见范围选择器
│   │   │   ├── right/              # 右侧控件组
│   │   │   │   ├── footer-right.tsx        # 右侧容器
│   │   │   │   ├── footer-controls.tsx     # 底部控制器
│   │   │   │   └── timezone-selector.tsx   # 时区选择器
│   │   │   └── footer.tsx          # 底部容器
│   │   ├── main/                   # 主体组件群
│   │   │   ├── chart/              # 图表核心
│   │   │   │   ├── lib/            # 图表初始化工具
│   │   │   │   │   └── chart-init.ts       # 图表初始化逻辑
│   │   │   │   ├── series/         # 自定义图表系列
│   │   │   │   │   ├── heatmap/    # 热力图系列
│   │   │   │   │   │   ├── heatmap-series.ts    # 热力图系列类
│   │   │   │   │   │   ├── renderer.ts          # 热力图渲染器
│   │   │   │   │   │   ├── data.ts              # 热力图数据类型
│   │   │   │   │   │   ├── options.ts           # 热力图配置选项
│   │   │   │   │   │   ├── color-utils.ts       # 颜色工具
│   │   │   │   │   │   ├── common.ts            # 通用工具
│   │   │   │   │   │   ├── full-width.ts        # 全宽度计算
│   │   │   │   │   │   ├── positions.ts         # 位置计算
│   │   │   │   │   │   └── probability-data.ts  # 概率数据处理
│   │   │   │   │   └── HLC/        # HLC区域图系列
│   │   │   │   │       ├── hlc-area-series.ts   # HLC区域图系列类
│   │   │   │   │       ├── renderer.ts          # HLC渲染器
│   │   │   │   │       ├── data.ts              # HLC数据类型
│   │   │   │   │       └── options.ts           # HLC配置选项
│   │   │   │   ├── trading-chart.tsx      # 纯渲染组件
│   │   │   │   ├── main-chart.tsx         # 图表包装器
│   │   │   │   ├── crosshair-tooltip.tsx  # 十字线提示
│   │   │   │   └── price-legend-overlay.tsx # 价格图例
│   │   │   ├── setting/            # 设置面板
│   │   │   │   └── setting-panel.tsx      # 设置面板组件
│   │   │   └── main.tsx            # 主体容器
│   │   └── chart-container.tsx     # 主容器组件
│   ├── ui/                         # shadcn/ui组件
│   └── advance-chart.tsx           # 演示应用
├── examples/                       # 示例代码
│   └── demo/                       # 演示应用
│       └── AdvanceChartDemo.tsx    # 演示组件
├── optional/                       # 可选功能模块
│   └── index.ts                    # 高级工具导出（按需引入）
└── lib/                           # 库层工具（兼容层）
```

### 模块分层架构

1. **核心层 (Core Layer)**: `src/core/`
   - 类型定义、工具函数、缓存管理
   - 数据提供者系统和抽象接口
   - 纯函数设计，无副作用
   - 主库入口，支持Tree Shaking

2. **组件层 (Component Layer)**: `src/components/`
   - React组件实现
   - 基于核心层构建
   - 完整的UI套件
   - 自定义图表系列（热力图、HLC区域图）

3. **可选模块层 (Optional Layer)**: `src/optional/`
   - 高级功能和工具
   - 按需引入，减少主包体积
   - 缓存管理器、数据生成器等高级工具

4. **示例层 (Examples Layer)**: `src/examples/`
   - 使用示例和演示代码
   - 最佳实践展示

5. **库层 (Library Layer)**: `src/lib/`
   - 兼容层和过渡工具
   - 逐步迁移到核心层

## 组件设计契约

### 核心组件

#### 1. TradingChart（纯渲染组件）
```typescript
interface TradingChartProps {
  data: ChartData[]
  chartType?: ChartTypeStr
  dark?: boolean
  autoMode?: boolean
  symbol?: string
  className?: string
  onChartApi?: (api: IChartApi | null) => void
  containerRef?: React.RefObject<HTMLDivElement | null>
  children?: React.ReactNode
}

interface TradingChartHandle {
  fitContent: () => void
  goLive: () => void
  setVisibleRange: (span: string) => void
  enterFullscreen: () => void
}
```

#### 2. ChartContainer（完整UI套件）
```typescript
interface ChartContainerProps {
  // 数据可以是静态数据或者通过数据提供者自动获取
  data?: ChartData[]
  dark: boolean
  symbol: string
  timeframe: string
  rangeSpan: string | null
  onRangeSpanChange: (v: string | null) => void
  onSymbolChange: (v: string) => void
  onTimeframeChange: (v: string) => void
  onFitContent?: () => void
  onGoLive?: () => void
  className?: string
  // 外部可配置的交易对选项
  symbolOptions: Array<{ value: string; label?: string }> | string[]
  // 是否启用自动数据获取
  enableAutoData?: boolean
  // 是否启用实时数据
  enableRealtime?: boolean
  // 数据加载状态回调
  onDataLoading?: (loading: boolean) => void
  // 数据错误回调
  onDataError?: (error: string) => void
}
```

#### 3. 数据提供者系统
```typescript
// 数据提供者接口
interface IDataProvider {
  readonly name: string
  readonly isMock: boolean
  getHistoricalData(request: DataRequest): Promise<DataResponse<ChartData>>
  subscribeRealtime?(symbol: string, timeframe: string, callback: RealtimeCallback): UnsubscribeFunction
  getSupportedSymbols?(): Promise<string[]>
  getSupportedTimeframes?(): string[]
  isConnected?(): boolean
  connect?(): Promise<void>
  disconnect?(): Promise<void>
}

// 数据请求参数
interface DataRequest {
  symbol: string
  timeframe: string
  from?: number
  to?: number
  limit?: number
}

// 数据响应结果
interface DataResponse<T = ChartData> {
  data: T[]
  hasMore?: boolean
  nextCursor?: string
  error?: string
}
```

#### 4. 自定义图表系列
```typescript
// 热力图数据接口
interface HeatMapData {
  time: Time
  cells: Array<{
    price: number
    volume: number
    probability?: number
  }>
}

// HLC区域图数据接口
interface HLCAreaData {
  time: Time
  high: number
  low: number
  close: number
}
```

### 组件设计原则

1. **纯可控组件**: 所有状态通过props传入
2. **单一职责**: 每个组件只负责一个明确功能
3. **组合优于继承**: 通过组件组合构建复杂功能
4. **向前引用**: 使用forwardRef暴露实例方法
5. **类型安全**: 完整的TypeScript类型定义
6. **数据抽象**: 通过数据提供者系统支持多种数据源
7. **按需加载**: 可选功能模块支持按需引入

## 数据类型契约

### 核心数据类型

```typescript
// 基础图表数据
interface ChartData {
  time: Time
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

// 图表类型枚举
type ChartTypeStr = 
  | 'Line' | 'Area' | 'Baseline' | 'Histogram'  // 单值系列
  | 'Bar' | 'Candlestick'                        // OHLC系列
  | 'HLCArea'                        // 高级系列
  | 'HeatMap'                                     // 自定义系列

// 时间框架
type TimeframeSec = number
type TimeframeStr = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M'
```

### 颜色系统

```typescript
interface ChartColorConfig {
  background?: string
  grid?: string
  text?: string
  upColor?: string
  downColor?: string
  border?: string
}

type ColorTheme = 'light' | 'dark'
```

## Storybook文档契约

### 文档结构

```
.storybook/
├── main.ts                    # Storybook配置
├── preview.ts                 # 全局预览配置
├── preview.tsx                # React预览配置
├── i18next.ts                 # 国际化配置
├── vitest.setup.ts            # 测试配置
└── msw/                       # Mock服务配置
    └── handlers.ts
```

### Story命名规范

- **组件路径**: `AdvanceChart/[Section]/[Component]`
- **示例**: `AdvanceChart/Header/Left/SymbolSelect`
- **Story类型**: `Default`, `Dark`, `Interactions`, `WithData`

### Story编写规范

```typescript
const meta: Meta<typeof Component> = {
  title: 'AdvanceChart/Section/Component',
  component: Component,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // 控件配置
  },
}
```

## 构建和发布契约

### 构建配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'AdvanceTradingChart',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'lightweight-charts'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'lightweight-charts': 'LightweightCharts'
        }
      }
    }
  }
})
```

### 包导出结构

```typescript
// src/index.ts - 主库入口
export { ChartContainer } from './components/advance-chart-components/chart-container'
export { TradingChart } from './components/advance-chart-components/main/chart/trading-chart'
export type { TradingChartHandle } from './components/advance-chart-components/main/chart/trading-chart'

// 核心模块导出
export * from './core/types'
export * from './core/utils'
export * from './core/data'

// 基础缓存功能（主包）
export { TF_STR_TO_SEC, TF_SEC_TO_STR } from './core/cache'

// 可选功能模块导出（按需引入）
// import { cacheManager, DataManager, generateData } from '@your-org/advance-trading-chart/optional'
```

### 版本管理

- **语义化版本**: 遵循SemVer规范
- **向后兼容**: 保持API稳定性
- **变更日志**: 详细记录每次更新

## 开发规范契约

### 开发规范契约

### 代码规范

1. **TypeScript严格模式**: 启用所有严格检查
2. **ESLint规则**: 遵循React和TypeScript最佳实践
3. **命名规范**: 
   - 组件: PascalCase
   - 函数: camelCase
   - 常量: UPPER_SNAKE_CASE
   - 类型: PascalCase



### 文件命名规范

- **组件文件**: `component-name.tsx`
- **类型文件**: `*.types.ts`
- **工具文件**: `*.utils.ts`
- **Story文件**: `*.stories.tsx`
- **测试文件**: `*.test.ts`

### 导入导出规范

```typescript
// 相对导入使用@/别名
import { ChartData } from '@/core/types'
import { getCssVariableRgb } from '@/core/utils'

// 统一导出使用index.ts
export * from './chart-data.types'
export * from './chart-type.types'
```

## 主题和样式契约

### CSS变量规范

```css
:root {
  /* 基础颜色 */
  --background: oklch(100% 0 0);
  --foreground: oklch(15% 0 0);
  --border: oklch(89.5% 0 0);
  
  /* 图表专用颜色 */
  --chart-up: oklch(70% 0.15 145);
  --chart-down: oklch(65% 0.2 25);
  --chart-line-color: oklch(60% 0.1 240);
  --chart-area-line: oklch(60% 0.1 240);
  --chart-area-top: oklch(60% 0.1 240 / 0.3);
  --chart-area-bottom: oklch(60% 0.1 240 / 0.05);
}

[data-theme="dark"] {
  --background: oklch(15% 0 0);
  --foreground: oklch(85% 0 0);
  /* ... */
}
```

### 主题切换

- 使用`next-themes`管理主题状态
- 通过CSS变量实现主题切换
- 支持系统主题自动切换

## 国际化契约

### 语言支持

- **默认语言**: 英语 (en)
- **支持语言**: 简体中文 (zh_CN)
- **扩展性**: 支持添加更多语言

### 翻译键规范

```json
{
  "chart": {
    "header": {
      "selectPair": "Select Pair",
      "timeframe": {
        "placeholder": "Select Timeframe",
        "minutes": "Minutes",
        "hours": "Hours"
      }
    }
  }
}
```

## 测试契约

### 测试策略

1. **单元测试**: 核心工具函数 (覆盖率 ≥ 90%)
2. **组件测试**: React组件 (覆盖率 ≥ 80%)
3. **集成测试**: Storybook交互测试
4. **类型测试**: TypeScript编译检查

### 测试工具

- **测试框架**: Vitest
- **React测试**: @testing-library/react
- **Mock工具**: MSW (仅Storybook)

## 性能契约

### 性能指标

- **包体积**: 核心库 < 500KB (gzipped)
- **首次渲染**: < 100ms
- **数据处理**: 支持1000+数据点流畅渲染
- **内存使用**: 稳定，无内存泄漏

### 优化策略

1. **Tree Shaking**: 支持按需导入
2. **代码分割**: 核心库与可选模块分离
3. **缓存优化**: 智能数据缓存和聚合
4. **渲染优化**: React.memo和useMemo

## 兼容性契约

### 浏览器支持

- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+
- **移动端**: iOS Safari 14+, Chrome Mobile 90+
- **不支持**: IE系列

### 依赖兼容

- **React**: 18+ (推荐19+)
- **TypeScript**: 5.0+
- **Node.js**: 18+ (开发环境)

## 错误处理契约

### 错误分类

```typescript
enum ChartErrorType {
  DATA_FETCH_ERROR = 'DATA_FETCH_ERROR',
  DATA_PARSE_ERROR = 'DATA_PARSE_ERROR',
  CHART_RENDER_ERROR = 'CHART_RENDER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}
```

### 错误处理策略

1. **优雅降级**: 提供默认数据和状态
2. **错误边界**: React Error Boundary
3. **用户反馈**: 清晰的错误提示
4. **日志记录**: 开发环境详细日志

## 使用指南

### 基础使用

```typescript
import { ChartContainer } from '@your-org/advance-trading-chart'
import type { ChartData } from '@your-org/advance-trading-chart'

function MyApp() {
  const [data, setData] = useState<ChartData[]>([])
  const [dark, setDark] = useState(false)
  const [rangeSpan, setRangeSpan] = useState<string | null>(null)
  
  return (
    <ChartContainer
      data={data}
      dark={dark}
      symbol="BTC/USD"
      timeframe="1h"
      rangeSpan={rangeSpan}
      onRangeSpanChange={setRangeSpan}
      symbolOptions={['BTC/USD', 'ETH/USD', 'SOL/USD']}
      onSymbolChange={handleSymbolChange}
      onTimeframeChange={handleTimeframeChange}
      onFitContent={handleFitContent}
      onGoLive={handleGoLive}
    />
  )
}
```

### 高级使用

#### 1. 使用数据提供者系统
```typescript
import { ChartContainer } from '@your-org/advance-trading-chart'

function AutoDataChart() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  return (
    <ChartContainer
      // 不传入data，启用自动数据获取
      dark={false}
      symbol="BTC/USD"
      timeframe="1h"
      rangeSpan={null}
      onRangeSpanChange={() => {}}
      symbolOptions={['BTC/USD', 'ETH/USD']}
      onSymbolChange={() => {}}
      onTimeframeChange={() => {}}
      enableAutoData={true}
      enableRealtime={true}
      onDataLoading={setLoading}
      onDataError={setError}
    />
  )
}
```

#### 2. 使用可选功能模块
```typescript
import { TradingChart } from '@your-org/advance-trading-chart'
// 按需引入高级功能
import { generateData, cacheManager, DataManager } from '@your-org/advance-trading-chart/optional'

function AdvancedChart() {
  // 使用数据生成器
  const data = generateData(1000, 30000, undefined, 3600)
  
  // 使用缓存管理器
  React.useEffect(() => {
    cacheManager.warmup('BTC/USD', ['1m', '5m', '1h'])
  }, [])
  
  return (
    <TradingChart
      data={data}
      chartType="Candlestick"
      autoMode={true}
      dark={false}
    />
  )
}
```

#### 3. 自定义图表系列
```typescript
import { TradingChart } from '@your-org/advance-trading-chart'
import type { HeatMapData } from '@your-org/advance-trading-chart'

function HeatMapChart() {
  const heatmapData: HeatMapData[] = [
    {
      time: '2024-01-01',
      cells: [
        { price: 30000, volume: 100, probability: 0.8 },
        { price: 30100, volume: 150, probability: 0.6 }
      ]
    }
  ]
  
  return (
    <TradingChart
      data={heatmapData}
      chartType="HeatMap"
      dark={false}
    />
  )
}
```

## 维护和更新

### 版本管理策略
- 遵循语义化版本控制 (SemVer)
- 主版本: 破坏性变更
- 次版本: 新功能添加
- 修订版本: Bug修复

### 更新流程
1. 功能开发在 feature 分支
2. 代码审查和测试
3. 合并到 develop 分支
4. 发布前集成测试
5. 合并到 main 分支并发布

### 特殊维护指南

#### 数据提供者系统
- 定期检查数据源API的变更
- 监控数据获取性能和错误率
- 更新缓存策略以适应数据模式变化

#### 自定义图表系列
- 跟踪 `lightweight-charts` 库的更新
- 确保自定义渲染器与新版本兼容
- 性能优化和内存泄漏检查

#### 可选模块
- 保持向后兼容性
- 独立的测试和发布周期
- 文档同步更新

### 更新策略

1. **定期更新**: 每月检查依赖更新
2. **安全更新**: 及时修复安全漏洞
3. **功能更新**: 基于用户反馈迭代
4. **文档同步**: 保持文档与代码同步

### 社区支持

- **Issue跟踪**: GitHub Issues
- **文档站点**: Storybook部署
- **示例代码**: 完整的使用示例
- **最佳实践**: 详细的开发指南

---

**文档版本**: v1.0  
**最后更新**: 2024年1月  
**适用版本**: advance-trading-chart@1.0.0+  
**维护状态**: 活跃维护
        