'use client'

import { EventType, EventSearchParams } from '@/types'
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

// 文字だけのセレクト（「地域 すべて ▾」）
function TextSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="relative inline-flex flex-none items-center gap-2 text-[12.5px]">
      <span className="text-ink-muted">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="max-w-[10.5rem] cursor-pointer appearance-none bg-transparent pr-4 text-[12.5px] text-ink focus:outline-none"
        aria-label={label}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-0 text-[9px] text-ink-muted" aria-hidden="true">▾</span>
    </label>
  )
}

const tabClass = (active: boolean) =>
  `flex-none py-3 font-mincho text-[14px] font-bold lg:text-[15px] ${active ? 'text-ink shadow-[inset_0_-1.5px_0_#22201c]' : 'text-ink-muted hover:text-ink'}`

// 種別（単一選択の下線タブ）・地域・期間の絞り込み。trailing には表示の切り替えを入れる
export function EventFilters({ filters, period, onFiltersChange, onPeriodChange, prefectures = [], count, className = '', trailing }: EventFiltersProps & { trailing?: React.ReactNode }) {
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
    <div className={`lg:flex lg:items-end lg:gap-8 ${className}`}>
      <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:min-w-0 lg:flex-1 lg:overflow-visible lg:px-0">
        <div className="flex min-w-max gap-5 border-b border-line lg:min-w-0 lg:flex-wrap lg:gap-7">
          <button type="button" onClick={() => setType(null)} className={tabClass(!filters.types?.length)} aria-pressed={!filters.types?.length}>
            すべて
          </button>
          {EVENT_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setType(activeType === type ? null : type)}
              className={tabClass(activeType === type || (filters.types?.length !== 1 && !!filters.types?.includes(type)))}
              aria-pressed={activeType === type}
            >
              {EVENT_TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 lg:mt-0 lg:flex-none lg:pb-3">
        <TextSelect label="地域" value={filters.prefecture || ''} onChange={v => onFiltersChange({ ...filters, prefecture: v || undefined, page: 1 })}>
          <option value="">すべて</option>
          {filters.prefecture && !prefectures.includes(filters.prefecture) && <option value={filters.prefecture}>{filters.prefecture}</option>}
          {prefectures.map(p => <option key={p} value={p}>{p}</option>)}
        </TextSelect>
        <TextSelect label="期間" value={periodValue} onChange={handlePeriod}>
          <option value="upcoming">開催中・これから</option>
          <option value="past">終了したイベント</option>
          <option value="all">すべて</option>
          <optgroup label="月で選ぶ">
            {filters.month && !monthOptions().some(o => o.value === filters.month) && <option value={filters.month}>{filters.month.replace('-', '年')}月</option>}
            {monthOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </optgroup>
        </TextSelect>
        {trailing}
        {typeof count === 'number' && <span className="ml-auto text-[12.5px] text-ink-muted lg:ml-0">{count}件</span>}
      </div>
    </div>
  )
}

// 読み込み中に同じ高さで出す静的な絞り込み行（レイアウトのずれを防ぐ）
export function EventFiltersPlaceholder({ className = '', trailing }: { className?: string; trailing?: React.ReactNode }) {
  return (
    <div className={`lg:flex lg:items-end lg:gap-8 ${className}`} aria-hidden="true">
      <div className="-mx-4 overflow-hidden px-4 lg:mx-0 lg:min-w-0 lg:flex-1 lg:px-0">
        <div className="flex min-w-max gap-5 border-b border-line lg:min-w-0 lg:gap-7">
          <span className={tabClass(true)}>すべて</span>
          {EVENT_TYPES.map(type => <span key={type} className={tabClass(false)}>{EVENT_TYPE_LABEL[type]}</span>)}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] lg:mt-0 lg:flex-none lg:pb-3">
        <span><span className="text-ink-muted">地域</span>　すべて</span>
        <span><span className="text-ink-muted">期間</span>　開催中・これから</span>
        {trailing}
      </div>
    </div>
  )
}
