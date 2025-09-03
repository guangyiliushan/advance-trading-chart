// Header 组件: 顶部导入区域
import * as React from "react"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Settings, Maximize } from "lucide-react"
import { IndicatorMenu } from "./indicator-menu"
import { ImageMenu } from "./image-menu"
import { Tooltip, TooltipContent } from "../../ui/tooltip"
import { TooltipTrigger } from "@radix-ui/react-tooltip"
import type { ChartTypeStr } from '@/lib/types'
import { ChartTypeSwitcher } from "./chart-type-switcher"

export type HeaderProps = {
  symbol: string
  onSymbolChange: (v: string) => void
  timeframe: string
  onTimeframeChange: (v: string) => void
  onFitContent?: () => void
  onGoLive?: () => void
  // 外部传入的交易对选项
  symbolOptions?: Array<{ value: string; label?: string }> | string[]
  // 新增：全屏切换
  onToggleFullscreen?: () => void
  // 新增：图表类型切换
  chartType: ChartTypeStr
  onChartTypeChange: (v: ChartTypeStr) => void
}

export const Header: React.FC<HeaderProps> = ({ symbol, onSymbolChange, timeframe, onTimeframeChange, onFitContent, onGoLive, symbolOptions, onToggleFullscreen, chartType, onChartTypeChange }) => {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

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
        {/* 交易对选择 */}
        <Select value={symbol} onValueChange={onSymbolChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="选择交易对" />
          </SelectTrigger>
          <SelectContent>
            {normalizedSymbolOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* 时间周期选择 */}
        <Select value={timeframe} onValueChange={onTimeframeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>MINUTES</SelectLabel>
              <SelectItem value="1m">1m</SelectItem>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="30m">30m</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>HOURS</SelectLabel>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="3h">3h</SelectItem>
              <SelectItem value="4h">4h</SelectItem>
              <SelectItem value="6h">6h</SelectItem>
              <SelectItem value="12h">12h</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>DAYS</SelectLabel>
              <SelectItem value="1d">1 day</SelectItem>
              <SelectItem value="1w">1 week</SelectItem>
              <SelectItem value="1M">1 month</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="h-5 w-px bg-white/20" />

        {/* 替换原先的单个按钮为图表类型切换组件 */}
        <ChartTypeSwitcher value={chartType} onChange={onChartTypeChange} />

        {/* 指标菜单 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <IndicatorMenu />
            </span>
          </TooltipTrigger>
          <TooltipContent>指标</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="theme">Dark</Label>
        <Switch id="theme" checked={isDark} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
        <div className="mx-3 h-5 w-px bg-border" />
        <Button size="sm" variant="secondary" onClick={onFitContent}>重置视图</Button>
        <Button size="sm" variant="secondary" onClick={onGoLive}>回到最新</Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>设置</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onToggleFullscreen} title="全屏">
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>全屏</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <ImageMenu />
            </span>
          </TooltipTrigger>
          <TooltipContent>导出图片</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}