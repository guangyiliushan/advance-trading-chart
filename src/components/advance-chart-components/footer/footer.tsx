import React from 'react';
import { cn } from '@/lib/utils';
import FooterLeft from './left/footer-left';
import FooterRight from './right/footer-right';

type FooterProps = {
  theme: 'light' | 'dark';
  // 独立的展示时间范围（例如 '3y' | '1y' | '3m' | '1m' | '7d' | '3d' | '1d' | '6h' | '1h'），其中 m 代表月份
  rangeSpan: string | null;
  onRangeSpanChange: (value: string) => void;
  onFitContent?: () => void;
  onGoLive?: () => void;
  // 新增：自动/自由切换
  autoMode?: boolean;
  onAutoModeChange?: (v: boolean) => void;
};

export const Footer: React.FC<FooterProps> = ({ theme, rangeSpan, onRangeSpanChange, autoMode = true, onAutoModeChange }) => {

  return (
    <div className={cn('flex items-center justify-between p-2')}> 
      <FooterLeft
        rangeSpan={rangeSpan}
        onRangeSpanChange={onRangeSpanChange}
      />
      <FooterRight
        theme={theme}
        timezone={"UTC"}
        onTimezoneChange={() => {}}
        percent={false}
        onPercentChange={() => {}}
        logScale={false}
        onLogScaleChange={() => {}}
        autoMode={!!autoMode}
        onAutoModeChange={(v) => onAutoModeChange?.(v)}
      />
    </div>
  );
};