import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

export type SymbolOption = { value: string; label?: string }

export type SymbolSelectProps = {
  value: string
  onChange: (v: string) => void
  options?: Array<SymbolOption> | string[]
  className?: string
  triggerClassName?: string
  placeholder?: string
}

export const SymbolSelect: React.FC<SymbolSelectProps> = ({ value, onChange, options, className, triggerClassName, placeholder }) => {
  const { t } = useTranslation()

  const normalizedOptions = React.useMemo<Array<SymbolOption>>(() => {
    const list = options ?? ['BTC/USD', 'ETH/USD', 'SOL/USD']
    return list.map((o) => (typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label ?? o.value }))
  }, [options])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName ?? 'w-40'}>
        <SelectValue placeholder={placeholder ?? t('chart.header.selectPair')} />
      </SelectTrigger>
      <SelectContent className={className}>
        {normalizedOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}