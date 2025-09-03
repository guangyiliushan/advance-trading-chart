import React from 'react';
import { cn } from '@/lib/utils';
import VisibleRangeSelector, { VisibleRangeSelectorProps } from './visible-range-selector';

export type FooterLeftProps = {
  className?: string;
  rangeSpan: VisibleRangeSelectorProps['value'];
  onRangeSpanChange: VisibleRangeSelectorProps['onChange'];
};

const FooterLeft: React.FC<FooterLeftProps> = ({ className, rangeSpan, onRangeSpanChange }) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <VisibleRangeSelector value={rangeSpan} onChange={onRangeSpanChange} />
    </div>
  );
};

export default FooterLeft;