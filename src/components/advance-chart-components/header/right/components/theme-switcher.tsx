import * as React from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="theme-switcher">{t('chart.header.dark')}</Label>
      <Switch id="theme-switcher" checked={isDark} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
    </div>
  )
}