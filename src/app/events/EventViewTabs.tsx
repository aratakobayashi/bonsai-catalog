'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export type EventView = 'list' | 'month' | 'map'

const TABS: { view: EventView; label: string; short: string }[] = [
  { view: 'list', label: 'リスト', short: 'リスト' },
  { view: 'month', label: 'カレンダー', short: '暦' },
  { view: 'map', label: '地図', short: '地図' },
]

// URL の view パラメータ（calendar は month の別名）。既定はリスト
export function parseEventView(value: string | null): EventView {
  if (value === 'month' || value === 'calendar') return 'month'
  if (value === 'map') return 'map'
  return 'list'
}

export function EventViewTabsView({ active, onSelect }: { active: EventView; onSelect?: (view: EventView) => void }) {
  return (
    <div className="inline-flex rounded-[10px] bg-[#ece6da] p-[3px]" role="tablist" aria-label="表示の切り替え">
      {TABS.map(tab => (
        <button
          key={tab.view}
          type="button"
          role="tab"
          aria-selected={active === tab.view}
          onClick={() => onSelect?.(tab.view)}
          className={`rounded-lg px-3.5 py-1.5 text-[13px] lg:px-[18px] lg:py-2 ${active === tab.view ? 'bg-white font-bold text-navy' : 'text-ink-soft hover:text-navy'}`}
        >
          <span className="lg:hidden">{tab.short}</span>
          <span className="hidden lg:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

// 見出し横のタブ。表示状態は URL で EventsPageClient と共有する
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
