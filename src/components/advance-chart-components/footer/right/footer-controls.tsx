import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

export type FooterControlsProps = {
  theme?: 'light' | 'dark';
  percent?: boolean;
  onPercentChange?: (v: boolean) => void;
  logScale?: boolean;
  onLogScaleChange?: (v: boolean) => void;
  autoMode?: boolean;
  onAutoModeChange?: (v: boolean) => void;
  className?: string;
};

export const FooterControls: React.FC<FooterControlsProps> = ({
  theme = 'light',
  percent = false,
  onPercentChange,
  logScale = false,
  onLogScaleChange,
  autoMode = true,
  onAutoModeChange,
  className,
}) => {
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200';
  const buttonClass = cn('px-2 py-1 text-sm', textColor, bgColor);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Toggle className={buttonClass} pressed={!!percent} onPressedChange={onPercentChange} aria-label="百分比">
        %
      </Toggle>
      <Toggle className={buttonClass} pressed={!!logScale} onPressedChange={onLogScaleChange} aria-label="对数坐标">
        log
      </Toggle>
      <Toggle className={buttonClass} pressed={!!autoMode} onPressedChange={onAutoModeChange} aria-label="自动模式">
        自动
      </Toggle>
    </div>
  );
};

export default FooterControls;