import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import TimezoneSelector from './timezone-selector';
import type { TimezoneSelectorProps } from './timezone-selector';

const meta = {
  title: 'AdvanceChart/Footer/Right/TimezoneSelector',
  component: TimezoneSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    theme: 'light',
    value: 'UTC',
    showTime: true,
    showSelector: true,
  },
  argTypes: {
    theme: { control: { type: 'radio' }, options: ['light', 'dark'] },
  },
} satisfies Meta<typeof TimezoneSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dark: Story = {
  args: { theme: 'dark' },
};