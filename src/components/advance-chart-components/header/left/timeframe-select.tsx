import * as React from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

export type TimeframeSelectProps = {
  value: string
  onChange: (v: string) => void
}

export const TimeframeSelect: React.FC<TimeframeSelectProps> = ({ value, onChange }) => {
  const { t } = useTranslation()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={t('chart.header.timeframe.placeholder')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t('chart.header.timeframe.minutes')}</SelectLabel>
          <SelectItem value="1m">1m</SelectItem>
          <SelectItem value="5m">5m</SelectItem>
          <SelectItem value="15m">15m</SelectItem>
          <SelectItem value="30m">30m</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>{t('chart.header.timeframe.hours')}</SelectLabel>
          <SelectItem value="1h">1h</SelectItem>
          <SelectItem value="3h">3h</SelectItem>
          <SelectItem value="4h">4h</SelectItem>
          <SelectItem value="6h">6h</SelectItem>
          <SelectItem value="12h">12h</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>{t('chart.header.timeframe.days')}</SelectLabel>
          <SelectItem value="1d">{t('chart.header.timeframe._1d')}</SelectItem>
          <SelectItem value="1w">{t('chart.header.timeframe._1w')}</SelectItem>
          <SelectItem value="1M">{t('chart.header.timeframe._1M')}</SelectItem>
          <SelectItem value="1y">{t('chart.header.timeframe._1y')}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}