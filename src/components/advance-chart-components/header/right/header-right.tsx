import * as React from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSelector from './language-selector'
import { ImageMenu } from './image-menu'
import { ThemeSwitcher } from './components/theme-switcher'
import { ActionButtons } from './components/action-buttons'
import { SettingsButton } from './components/settings-button'
import { FullscreenButton } from './components/fullscreen-button'
import { Tooltip, TooltipContent } from '@/components/ui/tooltip'
import { TooltipTrigger } from '@radix-ui/react-tooltip'

export type HeaderRightProps = {
  onFitContent?: () => void
  onGoLive?: () => void
  onToggleFullscreen?: () => void
}

export const HeaderRight: React.FC<HeaderRightProps> = ({ onFitContent, onGoLive, onToggleFullscreen }) => {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2">
      <ThemeSwitcher />
      <div className="mx-3 h-5 w-px bg-border" />
      <LanguageSelector />
      <ActionButtons onFitContent={onFitContent} onGoLive={onGoLive} />
      <SettingsButton />
      <FullscreenButton onToggleFullscreen={onToggleFullscreen} />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <ImageMenu />
          </span>
        </TooltipTrigger>
        <TooltipContent>{t('chart.header.exportImage')}</TooltipContent>
      </Tooltip>
    </div>
  )
}