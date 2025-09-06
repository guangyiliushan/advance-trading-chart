/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react"
import type { IChartApi } from "lightweight-charts"
import type { ChartData } from '@/core/types'
import { getCssVariableRgb } from "@/core/utils"

export type CrosshairTooltipProps = {
  chart: IChartApi | null
  data: ChartData[]
  containerRef: React.RefObject<HTMLDivElement | null>
  layoutColors: { up: string; down: string; text?: string }
  onHoverBarChange?: (bar: ChartData | null) => void
  locale?: string
  timeZone?: string
  pricePrecision?: number
  dark?: boolean
}

/**
 * Headless component that subscribes to chart crosshair moves and manages tooltip DOM element.
 * This component handles tooltip creation, styling, positioning, and cleanup.
 */
export const CrosshairTooltip: React.FC<CrosshairTooltipProps> = ({
  chart,
  data,
  containerRef,
  layoutColors,
  onHoverBarChange,
  locale = "zh-CN",
  timeZone = "UTC",
  pricePrecision = 2,
  dark = false,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  // Create and setup tooltip DOM element
  useEffect(() => {
    if (!containerRef.current) return

    const tooltip = document.createElement("div")
    tooltip.style.position = "absolute"
    tooltip.style.zIndex = "10"
    tooltip.style.display = "none"
    tooltip.style.pointerEvents = "none"
    tooltip.style.padding = "6px 8px"
    tooltip.style.borderRadius = "6px"
    tooltip.style.fontSize = "12px"
    tooltip.style.lineHeight = "1.2"

    containerRef.current.appendChild(tooltip)
    tooltipRef.current = tooltip

    return () => {
      if (tooltipRef.current && containerRef.current?.contains(tooltipRef.current)) {
        containerRef.current.removeChild(tooltipRef.current)
      }
      tooltipRef.current = null
    }
  }, [containerRef])

  // Update tooltip styles when theme or colors change
  useEffect(() => {
    if (!tooltipRef.current) return

    const border = getCssVariableRgb('--border')
    const popover = getCssVariableRgb('--popover')
    
    tooltipRef.current.style.border = `1px solid ${border}`
    tooltipRef.current.style.background = `rgba(${popover.slice(4, -1)}, 0.85)`
    tooltipRef.current.style.color = layoutColors.text || getCssVariableRgb('--foreground')
    tooltipRef.current.style.boxShadow = dark
      ? "0 4px 12px rgba(0,0,0,0.35)"
      : "0 4px 12px rgba(0,0,0,0.15)"
  }, [layoutColors.text, dark])

  // Subscribe to crosshair moves and handle tooltip updates
  useEffect(() => {
    if (!chart || !tooltipRef.current) return

    const handler = (param: any) => {
      const cont = containerRef.current
      const tp = tooltipRef.current
      if (!cont || !tp) return

      if (!param?.point || !param.time) {
        tp.style.display = "none"
        onHoverBarChange?.(null)
        return
      }

      // find data by time from props.data (numbers as unix seconds)
      const hovered = data.find((d) => (d.time as unknown as number) === (param.time as unknown as number))
      if (!hovered) {
        tp.style.display = "none"
        onHoverBarChange?.(null)
        return
      }

      const chg = hovered.close - hovered.open
      const chgPct = hovered.open !== 0 ? (chg / hovered.open) * 100 : 0

      // 日期本地化（可配置 locale/timeZone），基于 UTC 秒时间戳
      const ts = hovered.time as unknown as number
      const dt = new Date(ts * 1000)
      const dateStr = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone,
      }).format(dt)

      const fmt = (v: number) => v.toFixed(pricePrecision)

      tp.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div style="opacity:.8;">${dateStr}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <span><strong>O</strong>: ${fmt(hovered.open)}</span>
            <span><strong>H</strong>: ${fmt(hovered.high)}</span>
            <span><strong>L</strong>: ${fmt(hovered.low)}</span>
            <span><strong>C</strong>: ${fmt(hovered.close)}</span>
            ${typeof hovered.volume === 'number' ? `<span><strong>V</strong>: ${hovered.volume}</span>` : ''}
            <span style="color:${chg >= 0 ? layoutColors.up : layoutColors.down}">
              <strong>${chg >= 0 ? '+' : ''}${fmt(chg)}</strong> (${chgPct.toFixed(2)}%)
            </span>
          </div>
        </div>`

      // position near cursor, keep inside container
      const rect = cont.getBoundingClientRect()
      const x = param.point.x as number
      const y = param.point.y as number
      const left = Math.min(rect.width - tp.offsetWidth - 12, Math.max(8, x + 12))
      const top = Math.min(rect.height - tp.offsetHeight - 12, Math.max(8, y + 12))
      tp.style.left = `${left}px`
      tp.style.top = `${top}px`
      tp.style.display = "block"
      onHoverBarChange?.(hovered as any)
    }

    chart.subscribeCrosshairMove(handler)
    return () => {
      chart.unsubscribeCrosshairMove(handler)
    }
  }, [chart, data, containerRef, layoutColors.up, layoutColors.down, onHoverBarChange, locale, timeZone, pricePrecision])

  return null
}

export default CrosshairTooltip