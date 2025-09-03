import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChartCandlestick, ChartArea, ChartBar, ChartLine, ChartColumn, ChartColumnBig, Baseline } from "lucide-react"
import type { ChartTypeStr } from '@/lib/types'

type Props = {
    value: ChartTypeStr
    onChange: (v: ChartTypeStr) => void
}

const TYPES: ChartTypeStr[] = ["Area", "Bar", "Baseline", "Candlestick", "Histogram", "Line"]

export const ChartTypeSwitcher: React.FC<Props> = ({ value, onChange }) => {
    // 根据当前类型动态选择图标
    const ICONS: Partial<Record<ChartTypeStr, React.ComponentType<{ className?: string }>>> = {
        Area: ChartArea,
        Bar: ChartBar,
        Baseline: Baseline,
        Candlestick: ChartCandlestick,
        Histogram: ChartColumn,
        HighLow: ChartColumnBig,
        Line: ChartLine,
    }
    // 从 ICONS 映射中获取对应的图标组件，如果没有找到则使用 ChartCandlestick 作为默认值
    const Icon = Object.entries(ICONS).find(([key]) => key === value)?.[1] || ChartCandlestick

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title={`Chart Type: ${value}`}>
                    <Icon className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel>Chart Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as ChartTypeStr)}>
                    {TYPES.map((t) => (
                        <DropdownMenuRadioItem key={t} value={t}>
                            <span className="flex items-center gap-2">
                                <span className="flex-1">{t}</span>
                            </span>
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}