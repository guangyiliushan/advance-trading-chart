import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import FooterControls from './footer-controls';
import type { FooterControlsProps } from './footer-controls';

const meta = {
  title: 'AdvanceChart/Footer/Right/FooterControls',
  component: FooterControls,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    theme: 'light',
    percent: false,
    logScale: false,
    autoMode: true,
  },
  argTypes: {
    theme: { control: { type: 'radio' }, options: ['light', 'dark'] },
  },
} satisfies Meta<typeof FooterControls>;

export default meta;

type Story = StoryObj<typeof meta>;

export const UncontrolledPreview: Story = {
  render: (args) => {
    const [percent, setPercent] = useState(args.percent);
    const [logScale, setLogScale] = useState(args.logScale);
    const [autoMode, setAutoMode] = useState(args.autoMode);
    return (
      <FooterControls
        {...args}
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