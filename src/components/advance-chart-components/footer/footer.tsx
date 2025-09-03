import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const rangeOptions = [
  { value: '3y', label: '3y', tip: '过去 3 年' },
  { value: '1y', label: '1y', tip: '过去 1 年' },
  { value: '3m', label: '3m', tip: '过去 3 个月' },
  { value: '1m', label: '1m', tip: '过去 1 个月' },
  { value: '7d', label: '7d', tip: '过去 7 天' },
  { value: '3d', label: '3d', tip: '过去 3 天' },
  { value: '1d', label: '1d', tip: '过去 1 天' },
  { value: '6h', label: '6h', tip: '过去 6 小时' },
  { value: '1h', label: '1h', tip: '过去 1 小时' },
] as const;

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

export const Footer: React.FC<FooterProps> = ({ theme, rangeSpan, onRangeSpanChange, autoMode, onAutoModeChange }) => {
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200';
  const buttonClass = cn('px-2 py-1 text-sm', textColor, bgColor);

  return (
    <div className={cn('flex items-center justify-between p-2')}>
      <ToggleGroup
        type="single"
        value={rangeSpan ?? ''}
        onValueChange={(value) => value && onRangeSpanChange(value)}
      >
        {rangeOptions.map(({ value, label, tip }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={value} className="aria-[checked=true]:bg-primary aria-[checked=true]:text-primary-foreground">{label}</ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              <p>{tip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
      <div className="flex items-center space-x-2">
        <span className={textColor}>08:19:06 (UTC)</span>
        <span className={textColor}>|</span>
        <Toggle className={buttonClass}>%</Toggle>
        <Toggle className={buttonClass}>log</Toggle>
        {/* 自动模式切换：开启时自动跟随/自适应，关闭时自由移动 */}
        <Toggle
          className={buttonClass}
          pressed={!!autoMode}
          onPressedChange={(v) => onAutoModeChange?.(v)}
          aria-label="自动模式"
        >
          自动
        </Toggle>
      </div>
    </div>
  );
};