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
import { ChartCandlestick, ChartArea, ChartBar, ChartLine, ChartColumn, Baseline } from "lucide-react"
import type { ChartTypeStr } from '@/core/types'
import { useTranslation } from "react-i18next"

type Props = {
    value: ChartTypeStr
    onChange: (v: ChartTypeStr) => void
}

const TYPES: ChartTypeStr[] = ["Area", "Bar", "Baseline", "Candlestick", "Histogram", "Line"]

export const ChartTypeSwitcher: React.FC<Props> = ({ value, onChange }) => {
    // 引入 i18n
    const { t } = useTranslation()

    // 基于类型构造翻译键，显示翻译后的类型名称
    const typeLabelKey = React.useCallback((tp: ChartTypeStr) => `chart.header.chartType.options.${tp}`, [])
    const getTypeLabel = React.useCallback((tp: ChartTypeStr) => t(typeLabelKey(tp)), [t, typeLabelKey])

    // 根据当前类型动态选择图标
    const ICONS: Partial<Record<ChartTypeStr, React.ComponentType<{ className?: string }>>> = {
        Area: ChartArea,
        Bar: ChartBar,
        Baseline: Baseline,
        Candlestick: ChartCandlestick,
        Histogram: ChartColumn,
        Line: ChartLine,
    }
    // 从 ICONS 映射中获取对应的图标组件，如果没有找到则使用 ChartCandlestick 作为默认值
    const Icon = Object.entries(ICONS).find(([key]) => key === value)?.[1] || ChartCandlestick

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    title={t('chart.header.chartType.ariaLabel', { type: getTypeLabel(value) })}
                >
                    <Icon className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel>{t('chart.header.chartType.title')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as ChartTypeStr)}>
                    {TYPES.map((tType) => (
                        <DropdownMenuRadioItem key={tType} value={tType}>
                            <span className="flex items-center gap-2">
                                <span className="flex-1">{getTypeLabel(tType)}</span>
                            </span>
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}