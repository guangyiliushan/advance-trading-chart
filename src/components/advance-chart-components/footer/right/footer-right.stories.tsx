import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import FooterRight from './footer-right';
import type { FooterRightProps } from './footer-right';

const meta = {
  title: 'AdvanceChart/Footer/FooterRight',
  component: FooterRight,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    theme: 'light',
    timezone: 'UTC',
    showTimezoneSelector: true,
    percent: false,
    logScale: false,
    autoMode: true,
  },
  argTypes: {
    theme: { control: { type: 'radio' }, options: ['light', 'dark'] },
  },
} satisfies Meta<typeof FooterRight>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [tz, setTz] = useState(args.timezone);
    const [percent, setPercent] = useState(args.percent);
    const [logScale, setLogScale] = useState(args.logScale);
    const [autoMode, setAutoMode] = useState(args.autoMode);

    return (
      <FooterRight
        {...args}
        timezone={tz}
        onTimezoneChange={setTz}
        percent={percent}
        onPercentChange={setPercent}
        logScale={logScale}
        onLogScaleChange={setLogScale}
        autoMode={autoMode}
        onAutoModeChange={setAutoMode}
      />
    );
  }
};

export const Dark: Story = {
  args: { theme: 'dark' },
};