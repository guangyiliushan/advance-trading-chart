import React from 'react'
import { TimeframeSelect } from './timeframe-select'

export default {
  title: 'AdvanceChart/Header/Left/TimeframeSelect',
  component: TimeframeSelect,
}

export const DefaultControlled = () => {
  const [value, setValue] = React.useState<string>('1m')
  const [lastChange, setLastChange] = React.useState<string>('1m')

  return (
    <div style={{ padding: 16, width: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TimeframeSelect
        value={value}
        onChange={(v) => {
          setValue(v)
          setLastChange(v)
        }}
      />
      <div style={{ fontSize: 12, color: 'gray' }}>
        Selected: <strong>{value || '(none)'}</strong> | Last onChange: {lastChange}
      </div>
    </div>
  )
}

export const Placeholder = () => {
  const [value, setValue] = React.useState<string>('')
  return (
    <div style={{ padding: 16, width: 280 }}>
      <TimeframeSelect value={value} onChange={setValue} />
      <div style={{ marginTop: 12, fontSize: 12, color: 'gray' }}>Try opening and selecting an item to see the placeholder change.</div>
    </div>
  )
}

export const PresetValues = () => {
  const presets = [
    '1m', '5m', '15m', '30m',
    '1h', '3h', '4h', '6h', '12h',
    '1d', '1w', '1M', '1y',
  ] as const

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {presets.map((p) => (
          <div key={p} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: 'gray' }}>Preset: {p}</div>
            <TimeframeSelect value={p} onChange={(v) => console.log('onChange', v)} />
          </div>
        ))}
      </div>
    </div>
  )
}