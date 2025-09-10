import React from "react"
import type { ChartData } from '@/core/types'

export type PriceLegendOverlayProps = {
  symbol?: string
  bar?: Pick<ChartData, "open" | "high" | "low" | "close" | "volume"> | null
  last?: Pick<ChartData, "open" | "close"> | null
  layoutColors: { text: string; up: string; down: string }
}

export const PriceLegendOverlay: React.FC<PriceLegendOverlayProps> = ({ symbol, bar, last, layoutColors }) => {

  const d = bar ?? null
  const chg = d ? d.close - d.open : 0
  const chgPct = d && d.open !== 0 ? (chg / d.open) * 100 : 0
  const chgColor = chg >= 0 ? layoutColors.up : layoutColors.down

  const lastChg = last ? last.close - last.open : 0
  const lastChgPct = last && last.open !== 0 ? (lastChg / last.open) * 100 : 0
  const lastChgColor = lastChg >= 0 ? layoutColors.up : layoutColors.down

  return (
    <>
    {/* (top-left) */}
      <div className="absolute left-2 top-2 z-10 flex items-center gap-2">
        {/* Price overlay */}
        <div className="pointer-events-none flex items-center gap-2"
          style={{ 
            padding: 8,
            borderRadius: 6,
            color: layoutColors.text
          }}>
          {last ? (
            <>
              {symbol ? <span className="font-semibold">{symbol}</span> : null}
              <span className="text-sm">{last.close.toFixed(2)}</span>
              <span style={{ color: lastChgColor }}>
                {lastChg >= 0 ? '+' : ''}{lastChgPct.toFixed(2)}%
              </span>
            </>
          ) : null}
        </div>
        {/* Legend overlay */}
        <div className="pointer-events-none text-xs whitespace-nowrap" 
          style={{ 
            padding: "4px 6px",
            borderRadius: 4,
            color: layoutColors.text
          }}>
          {d ? (
            <>
              <span className="font-semibold mr-1.5">O</span>{d.open.toFixed(2)}
              <span className="font-semibold mx-[10px]">H</span>{d.high.toFixed(2)}
              <span className="font-semibold mx-[10px]">L</span>{d.low.toFixed(2)}
              <span className="font-semibold mx-[10px]">C</span>{d.close.toFixed(2)}
              {typeof d.volume === 'number' && (
                <>
                  <span className="font-semibold mx-[10px]">V</span>{d.volume}
                </>
              )}
              <span className="ml-2.5" style={{ color: chgColor }}>
                {chg >= 0 ? '+' : ''}{chg.toFixed(2)} ({chgPct.toFixed(2)}%)
              </span>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default PriceLegendOverlay