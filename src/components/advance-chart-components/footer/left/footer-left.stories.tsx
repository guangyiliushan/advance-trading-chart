import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import FooterLeft from './footer-left';
import { ThemeProvider } from '@/theme-provider';

const meta: Meta<typeof FooterLeft> = {
  title: 'AdvanceChart/Footer/FooterLeft',
  component: FooterLeft,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;

export const Basic: StoryObj<typeof FooterLeft> = {
  render: () => {
    const [value, setValue] = useState<string | null>('1d');
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <FooterLeft rangeSpan={value} onRangeSpanChange={setValue} />
      </ThemeProvider>
    );
  },
};