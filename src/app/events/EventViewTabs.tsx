'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export type EventView = 'list' | 'month' | 'map'

const TABS: { view: EventView; label: string }[] = [
  { view: 'list', label: 'リスト' },
  { view: 'month', label: 'カレンダー' },
  { view: 'map', label: '地図' },
]

// URL の view パラメータ（calendar は month の別名）。既定はリスト
export function parseEventView(value: string | null): EventView {
  if (value === 'month' || value === 'calendar') return 'month'
  if (value === 'map') return 'map'
  return 'list'
}

// 「表示 リスト／カレンダー／地図」の文字の切り替え
export function EventViewTabsView({ active, onSelect }: { active: EventView; onSelect?: (view: EventView) => void }) {
  return (
    <div className="inline-flex flex-none items-center gap-2 text-[12.5px]" role="tablist" aria-label="表示の切り替え">
      <span className="text-ink-muted" aria-hidden="true">表示</span>
      {TABS.map((tab, i) => (
        <span key={tab.view} className="inline-flex items-center">
          {i > 0 && <span className="mx-0.5 text-ink-muted" aria-hidden="true">／</span>}
          <button
            type="button"
            role="tab"
            aria-selected={active === tab.view}
            onClick={() => onSelect?.(tab.view)}
            className={active === tab.view ? 'border-b border-ink font-bold text-ink' : 'text-ink-soft hover:text-ink'}
          >
            {tab.label}
          </button>
        </span>
      ))}
    </div>
  )
}

// 絞り込み行の右端に置く切り替え。表示状態は URL で EventsPageClient と共有する
export default function EventViewTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = parseEventView(searchParams.get('view'))

  const select = (view: EventView) => {
    const params = new URLSearchParams(searchParams.toString())
    if (view === 'list') params.delete('view')
    else params.set('view', view)
    const qs = params.toString()
    router.push(qs ? `/events?${qs}` : '/events', { scroll: false })
  }

  return <EventViewTabsView active={active} onSelect={select} />
}
