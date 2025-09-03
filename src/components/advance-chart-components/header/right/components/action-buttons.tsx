import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export type ActionButtonsProps = {
  onFitContent?: () => void
  onGoLive?: () => void
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onFitContent, onGoLive }) => {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" onClick={onFitContent}>{t('chart.header.resetView')}</Button>
      <Button size="sm" variant="secondary" onClick={onGoLive}>{t('chart.header.goLive')}</Button>
    </div>
  )
}