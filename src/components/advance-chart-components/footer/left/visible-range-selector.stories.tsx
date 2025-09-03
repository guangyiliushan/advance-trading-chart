import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import VisibleRangeSelector from './visible-range-selector';
import type {VisibleRangeSelectorProps} from './visible-range-selector';
import { ThemeProvider } from '@/theme-provider';

const meta: Meta<typeof VisibleRangeSelector> = {
  title: 'AdvanceChart/Footer/Left/VisibleRangeSelector',
  component: VisibleRangeSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;

export const Basic: StoryObj<typeof VisibleRangeSelector> = {
  render: () => {
    const [value, setValue] = useState<string | null>('1d');
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <VisibleRangeSelector value={value} onChange={setValue} />
      </ThemeProvider>
    );
  },
};