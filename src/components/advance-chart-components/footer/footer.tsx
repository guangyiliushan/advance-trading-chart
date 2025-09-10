import React from 'react';
import { cn } from '@/lib/utils';
import FooterLeft from './left/footer-left';
import FooterRight from './right/footer-right';

type FooterProps = {
  theme: 'light' | 'dark';
  rangeSpan: string | null;
  onRangeSpanChange: (value: string) => void;
  onFitContent?: () => void;
  onGoLive?: () => void;
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