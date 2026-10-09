'use client'

import { useEffect, useState } from 'react'
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
  // 終了したイベントがあるか（ないときは「終了したイベント」を選べないようにする）
  hasPast?: boolean
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
    <label className="relative inline-flex min-h-11 flex-none items-center gap-2 text-[12.5px] lg:min-h-0">
      <span className="text-ink-muted">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="min-h-11 max-w-[10.5rem] cursor-pointer appearance-none bg-transparent pr-4 text-[12.5px] text-ink lg:min-h-0"
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
// キーワード検索（URL の ?search= と同じ。サーバー側でタイトル・説明などを検索する）
function KeywordSearch({ value, onSubmit }: { value: string; onSubmit: (value: string | undefined) => void }) {
  const [query, setQuery] = useState(value)
  useEffect(() => setQuery(value), [value])
  return (
    <form
      role="search"
      onSubmit={e => {
        e.preventDefault()
        onSubmit(query.trim() || undefined)
      }}
      className="relative mt-4 lg:mt-6 lg:max-w-[360px]"
    >
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="イベント名・会場などで検索"
        aria-label="イベントをキーワードで検索"
        enterKeyHint="search"
        className="h-11 w-full appearance-none rounded-none border-0 border-b border-ink bg-transparent pl-0 pr-11 text-[13.5px] text-ink placeholder:text-ink-muted focus:border-gold-dark focus:ring-0"
      />
      <button type="submit" aria-label="検索" className="absolute inset-y-0 right-0 flex w-11 items-center justify-end text-ink-muted hover:text-ink">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  )
}

export function EventFilters({ filters, period, onFiltersChange, onPeriodChange, prefectures = [], count, hasPast = true, className = '', trailing }: EventFiltersProps & { trailing?: React.ReactNode }) {
  const activeType = filters.types?.length === 1 ? filters.types[0] : null
  const setType = (type: EventType | null) => onFiltersChange({ ...filters, types: type ? [type] : undefined, page: 1 })

  const periodValue = filters.month || period
  const handlePeriod = (value: string) => {
    if (value === 'upcoming' || value === 'past' || value === 'all') {
      // 月の指定は onPeriodChange 側で外す（URL の更新を1回にするため）
      onPeriodChange(value)
    } else {
      onFiltersChange({ ...filters, month: value, page: 1 })
    }
  }

  return (
    <div className={className}>
    <KeywordSearch value={filters.search || ''} onSubmit={search => onFiltersChange({ ...filters, search, page: 1 })} />
    <div className="mt-2 lg:mt-4 lg:flex lg:items-end lg:gap-8">
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
      <div className="mt-1 flex flex-wrap items-center gap-x-5 lg:mt-0 lg:flex-none lg:gap-y-2 lg:pb-3">
        <TextSelect label="地域" value={filters.prefecture || ''} onChange={v => onFiltersChange({ ...filters, prefecture: v || undefined, page: 1 })}>
          <option value="">すべて</option>
          {filters.prefecture && !prefectures.includes(filters.prefecture) && <option value={filters.prefecture}>{filters.prefecture}</option>}
          {prefectures.map(p => <option key={p} value={p}>{p}</option>)}
        </TextSelect>
        <TextSelect label="期間" value={periodValue} onChange={handlePeriod}>
          <option value="upcoming">開催中・これから</option>
          {(hasPast || period === 'past') && <option value="past">終了したイベント</option>}
          <option value="all">すべて</option>
          <optgroup label="月で選ぶ">
            {filters.month && !monthOptions().some(o => o.value === filters.month) && <option value={filters.month}>{filters.month.replace('-', '年')}月</option>}
            {monthOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </optgroup>
        </TextSelect>
        {trailing}
        {typeof count === 'number' && <span className="ml-auto text-[12.5px] text-ink-muted lg:ml-0" aria-live="polite">{count}件</span>}
      </div>
    </div>
    </div>
  )
}

// 読み込み中に同じ高さで出す静的な絞り込み行（レイアウトのずれを防ぐ）
export function EventFiltersPlaceholder({ className = '', trailing }: { className?: string; trailing?: React.ReactNode }) {
  return (
    <div className={className} aria-hidden="true">
    <div className="relative mt-4 h-11 border-b border-ink lg:mt-6 lg:max-w-[360px]">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[13.5px] text-ink-muted">イベント名・会場などで検索</span>
    </div>
    <div className="mt-2 lg:mt-4 lg:flex lg:items-end lg:gap-8">
      <div className="-mx-4 overflow-hidden px-4 lg:mx-0 lg:min-w-0 lg:flex-1 lg:px-0">
        <div className="flex min-w-max gap-5 border-b border-line lg:min-w-0 lg:gap-7">
          <span className={tabClass(true)}>すべて</span>
          {EVENT_TYPES.map(type => <span key={type} className={tabClass(false)}>{EVENT_TYPE_LABEL[type]}</span>)}
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-5 text-[12.5px] lg:mt-0 lg:flex-none lg:gap-y-2 lg:pb-3">
        <span className="inline-flex min-h-11 items-center lg:min-h-0"><span className="text-ink-muted">地域</span>　すべて</span>
        <span className="inline-flex min-h-11 items-center lg:min-h-0"><span className="text-ink-muted">期間</span>　開催中・これから</span>
        {trailing}
      </div>
    </div>
    </div>
  )
}
