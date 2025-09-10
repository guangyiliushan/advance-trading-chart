import * as React from 'react'
import { Maximize } from 'lucide-react'
import { Tooltip, TooltipContent } from '@/components/ui/tooltip'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export type FullscreenButtonProps = {
  onToggleFullscreen?: () => void
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({ onToggleFullscreen }) => {
  const { t } = useTranslation()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={onToggleFullscreen} title={t('chart.header.fullscreen')}>
          <Maximize className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('chart.header.fullscreen')}</TooltipContent>
    </Tooltip>
  )
}