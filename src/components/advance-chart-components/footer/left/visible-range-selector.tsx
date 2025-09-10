import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type RangeOption = {
  value: string;
  label: string;
  tip?: string;
};

const DEFAULT_RANGE_OPTIONS: readonly RangeOption[] = [
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

export type VisibleRangeSelectorProps = {
  value: string | null;
  onChange: (value: string) => void;
  options?: readonly RangeOption[];
};

const VisibleRangeSelector: React.FC<VisibleRangeSelectorProps> = ({ value, onChange, options = DEFAULT_RANGE_OPTIONS }) => {
  return (
    <ToggleGroup
      type="single"
      value={value ?? ''}
      onValueChange={(v) => v && onChange(v)}
    >
      {options.map(({ value, label, tip }) => (
        <Tooltip key={value}>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={value} className="aria-[checked=true]:bg-primary aria-[checked=true]:text-primary-foreground">{label}</ToggleGroupItem>
          </TooltipTrigger>
          {tip ? (
            <TooltipContent side="top" sideOffset={6}>
              <p>{tip}</p>
            </TooltipContent>
          ) : null}
        </Tooltip>
      ))}
    </ToggleGroup>
  );
};

export default VisibleRangeSelector;