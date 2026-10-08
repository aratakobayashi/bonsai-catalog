'use client'

import { EventType, EventSearchParams } from '@/types'
import { chipClass } from '@/components/ui/design'
import { EVENT_TYPES, EVENT_TYPE_LABEL } from './EventShared'

export type EventPeriod = 'upcoming' | 'past' | 'all'

interface EventFiltersProps {
  filters: EventSearchParams
  period: EventPeriod
  onFiltersChange: (filters: EventSearchParams) => void
  onPeriodChange: (period: EventPeriod) => void
  prefectures?: string[]
  count?: number
  className?: string
}

function monthOptions() {
  const now = new Date()
  return Array.from({ length: 13 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: `${date.getFullYear()}年${date.getMonth() + 1}月`,
    }
  })
}

// チップ風のセレクト（地域・期間）
function ChipSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="relative inline-flex flex-none items-center rounded-full border border-line bg-white py-1.5 pl-3.5 pr-7 text-[13px] text-ink hover:border-gold focus-within:border-gold">
      <span className="text-ink-soft">{label}：</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-[13px] text-ink focus:outline-none"
        aria-label={label}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px] text-ink-soft" aria-hidden="true">▾</span>
    </label>
  )
}

// 種別（単一選択のチップ）・地域・期間の絞り込み
export function EventFilters({ filters, period, onFiltersChange, onPeriodChange, prefectures = [], count, className = '' }: EventFiltersProps) {
  const activeType = filters.types?.length === 1 ? filters.types[0] : null
  const setType = (type: EventType | null) => onFiltersChange({ ...filters, types: type ? [type] : undefined, page: 1 })

  const periodValue = filters.month || period
  const handlePeriod = (value: string) => {
    if (value === 'upcoming' || value === 'past' || value === 'all') {
      onFiltersChange({ ...filters, month: undefined, page: 1 })
      onPeriodChange(value)
    } else {
      onFiltersChange({ ...filters, month: value, page: 1 })
    }
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="-mx-4 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
        <button type="button" onClick={() => setType(null)} className={`${chipClass(!filters.types?.length)} flex-none`} aria-pressed={!filters.types?.length}>
          すべて
        </button>
        {EVENT_TYPES.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setType(activeType === type ? null : type)}
            className={`${chipClass(activeType === type || (filters.types?.length !== 1 && !!filters.types?.includes(type)))} flex-none`}
            aria-pressed={activeType === type}
          >
            {EVENT_TYPE_LABEL[type]}
          </button>
        ))}
        <span className="mx-1.5 h-[22px] w-px flex-none bg-line" aria-hidden="true" />
        <ChipSelect label="地域" value={filters.prefecture || ''} onChange={v => onFiltersChange({ ...filters, prefecture: v || undefined, page: 1 })}>
          <option value="">すべて</option>
          {filters.prefecture && !prefectures.includes(filters.prefecture) && <option value={filters.prefecture}>{filters.prefecture}</option>}
          {prefectures.map(p => <option key={p} value={p}>{p}</option>)}
        </ChipSelect>
        <ChipSelect label="期間" value={periodValue} onChange={handlePeriod}>
          <option value="upcoming">開催中・これから</option>
          <option value="past">終了したイベント</option>
          <option value="all">すべて</option>
          <optgroup label="月で選ぶ">
            {filters.month && !monthOptions().some(o => o.value === filters.month) && <option value={filters.month}>{filters.month.replace('-', '年')}月</option>}
            {monthOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </optgroup>
        </ChipSelect>
      </div>
      {typeof count === 'number' && <span className="hidden flex-none text-[13px] text-ink-soft lg:ml-auto lg:inline">{count}件</span>}
    </div>
  )
}
