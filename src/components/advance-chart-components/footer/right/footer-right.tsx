import React from 'react';
import { cn } from '@/lib/utils';
import TimezoneSelector from './timezone-selector';
import FooterControls from './footer-controls';

export type FooterRightProps = {
  theme?: 'light' | 'dark';
  timezone?: string;
  onTimezoneChange?: (tz: string) => void;
  showTimezoneSelector?: boolean; // 是否展示下拉选择
  percent?: boolean;
  onPercentChange?: (v: boolean) => void;
  logScale?: boolean;
  onLogScaleChange?: (v: boolean) => void;
  autoMode?: boolean;
  onAutoModeChange?: (v: boolean) => void;
  className?: string;
};

export const FooterRight: React.FC<FooterRightProps> = ({
  theme = 'light',
  timezone = 'UTC',
  onTimezoneChange,
  showTimezoneSelector = false,
  percent = false,
  onPercentChange,
  logScale = false,
  onLogScaleChange,
  autoMode = true,
  onAutoModeChange,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TimezoneSelector theme={theme} value={timezone} onChange={onTimezoneChange} showTime showSelector={showTimezoneSelector} />
      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>|</span>
      <FooterControls
        theme={theme}
        percent={percent}
        onPercentChange={onPercentChange}
        logScale={logScale}
        onLogScaleChange={onLogScaleChange}
        autoMode={autoMode}
        onAutoModeChange={onAutoModeChange}
      />
    </div>
  );
};

export default FooterRight;