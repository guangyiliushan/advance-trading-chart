import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeaderRight, type HeaderRightProps } from './header-right'
import { ThemeProvider } from '@/theme-provider'

const meta: Meta<typeof HeaderRight> = {
  title: 'AdvanceChart/Header/Right/HeaderRight',
  component: HeaderRight,
}
export default meta

export const Basic: StoryObj<typeof HeaderRight> = {
  render: (args: HeaderRightProps) => (
    <ThemeProvider>
      <div className="p-4 bg-background text-foreground">
        <HeaderRight {...args} />
      </div>
    </ThemeProvider>
  ),
  args: {
    onFitContent: () => console.log('Fit content'),
    onGoLive: () => console.log('Go live'),
    onToggleFullscreen: () => console.log('Toggle fullscreen'),
  },
}

export const DarkTheme: StoryObj<typeof HeaderRight> = {
  render: (args: HeaderRightProps) => (
    <ThemeProvider forcedTheme="dark">
      <div className="p-4 bg-background text-foreground">
        <HeaderRight {...args} />
      </div>
    </ThemeProvider>
  ),
  args: {
    onFitContent: () => console.log('Fit content'),
    onGoLive: () => console.log('Go live'),
    onToggleFullscreen: () => console.log('Toggle fullscreen'),
  },
}

export const Interactions: StoryObj<typeof HeaderRight> = {
  render: (args: HeaderRightProps) => (
    <ThemeProvider>
      <div className="p-4 bg-background text-foreground">
        <HeaderRight {...args} />
      </div>
    </ThemeProvider>
  ),
  args: {
    onFitContent: () => alert('Fit content'),
    onGoLive: () => alert('Go live'),
    onToggleFullscreen: () => alert('Toggle fullscreen'),
  },
}