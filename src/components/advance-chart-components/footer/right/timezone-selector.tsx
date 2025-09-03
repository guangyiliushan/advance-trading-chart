import React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type TimezoneSelectorProps = {
  theme?: 'light' | 'dark';
  value?: string; // IANA time zone id
  onChange?: (tz: string) => void;
  showTime?: boolean;
  showSelector?: boolean;
  className?: string;
};

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Shanghai', label: 'UTC+8 (Asia/Shanghai)' },
  { value: 'Europe/London', label: 'UTC±0 (Europe/London)' },
  { value: 'America/New_York', label: 'UTC-5 (New York)' },
  { value: 'Asia/Tokyo', label: 'UTC+9 (Tokyo)' },
] as const;

function formatTime(tz: string) {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: tz,
    });
    return formatter.format(new Date());
  } catch {
    // fallback to local time
    const d = new Date();
    return d.toTimeString().slice(0, 8);
  }
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  theme = 'light',
  value = 'UTC',
  onChange,
  showTime = true,
  showSelector = false,
  className,
}) => {
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const [tz, setTz] = React.useState<string>(value);
  const [now, setNow] = React.useState<string>(() => formatTime(tz));

  React.useEffect(() => {
    // keep time ticking every second
    const id = setInterval(() => setNow(formatTime(tz)), 1000);
    return () => clearInterval(id);
  }, [tz]);

  React.useEffect(() => {
    setTz(value);
  }, [value]);

  const handleChange = (v: string) => {
    setTz(v);
    onChange?.(v);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showTime && (
        <span className={textColor}>{now} ({tz})</span>
      )}
      {showSelector && (
        <Select value={tz} onValueChange={handleChange}>
          <SelectTrigger size="sm" aria-label="timezone selector" className="min-w-44">
            <SelectValue placeholder="Select Timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((z) => (
              <SelectItem key={z.value} value={z.value}>
                {z.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default TimezoneSelector;