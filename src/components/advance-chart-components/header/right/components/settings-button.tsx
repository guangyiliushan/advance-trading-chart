import * as React from 'react'
import { Settings } from 'lucide-react'
import { Tooltip, TooltipContent } from '@/components/ui/tooltip'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export const SettingsButton: React.FC = () => {
  const { t } = useTranslation()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
      </TooltipTrigger>
      <TooltipContent>{t('chart.header.settings')}</TooltipContent>
    </Tooltip>
  )
}