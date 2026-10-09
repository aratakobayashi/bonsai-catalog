'use client'

import { useMemo, useState } from 'react'
import { Event } from '@/types'
import { cn } from '@/lib/utils'
import { isTentativeEvent } from '@/lib/event-display'
import { EventCard } from './EventCard'
import { getEventStatus, parseEventDate, startOfToday } from './EventShared'

interface EventListViewProps {
  events: Event[]
  className?: string
  selectedId?: string | null
  onSelect?: (event: Event) => void
  // 最初に出す件数（「もっと見る」で同じ件数ずつ増やす）。0 なら全件
  pageSize?: number
  // 何も見つからないときの説明
  emptyText?: string
}

interface EventGroup {
  key: string
  title: string
  sub?: string
  events: Event[]
}

const DEFAULT_PAGE_SIZE = 24

// 開催中 → 月ごと（開催日順）にまとめたリスト。月の見出しはスクロールしても上に残す。
// 日程未発表のイベントは日付のある一覧に混ぜず、最後の「例年の開催時期」にまとめる（閉じた状態）
export function EventListView({ events, className, selectedId, onSelect, pageSize = DEFAULT_PAGE_SIZE, emptyText }: EventListViewProps) {
  const [visible, setVisible] = useState(pageSize || Infinity)

  const { dated, tentative } = useMemo(() => {
    const dated: Event[] = []
    const tentative: Event[] = []
    events.forEach(e => (isTentativeEvent(e) ? tentative : dated).push(e))
    return { dated, tentative }
  }, [events])

  const groups = useMemo(() => {
    const today = startOfToday()
    const result: EventGroup[] = []
    const byKey = new Map<string, EventGroup>()

    dated.slice(0, visible).forEach(event => {
      const status = getEventStatus(event, today)
      let key: string
      let title: string
      let sub: string | undefined
      if (status === 'ongoing') {
        key = 'ongoing'
        title = '開催中'
        sub = '終了の近い順'
      } else {
        const start = parseEventDate(event.start_date)
        key = `${status === 'past' ? 'past-' : ''}${start.getFullYear()}-${start.getMonth()}`
        title = `${start.getMonth() + 1}月`
        sub = `${start.getFullYear()}年${status === 'past' ? '・終了' : ''}`
      }
      let group = byKey.get(key)
      if (!group) {
        group = { key, title, sub, events: [] }
        byKey.set(key, group)
        result.push(group)
      }
      group.events.push(event)
    })

    return result
  }, [dated, visible])

  // 見出しの件数は「もっと見る」で隠れている分も含めた件数
  const groupTotals = useMemo(() => {
    const today = startOfToday()
    const totals = new Map<string, number>()
    dated.forEach(event => {
      const status = getEventStatus(event, today)
      const start = parseEventDate(event.start_date)
      const key = status === 'ongoing' ? 'ongoing' : `${status === 'past' ? 'past-' : ''}${start.getFullYear()}-${start.getMonth()}`
      totals.set(key, (totals.get(key) ?? 0) + 1)
    })
    return totals
  }, [dated])

  if (events.length === 0) {
    return (
      <div className={cn('border-b border-t border-line px-6 py-12 text-center', className)}>
        <p className="font-mincho font-bold text-ink">条件に合うイベントが見つかりませんでした</p>
        <p className="mt-2 text-sm text-ink-soft">{emptyText || '地域や期間の絞り込みを外してお試しください。'}</p>
      </div>
    )
  }

  const rest = dated.length - Math.min(visible, dated.length)

  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      {dated.length === 0 && (
        <p className="border-b border-t border-line py-6 text-center text-[13px] text-ink-soft">
          日程が発表されているイベントはありません。例年の開催時期をご覧ください。
        </p>
      )}
      {groups.map((group, i) => (
        <section key={group.key} className={cn('flex flex-col', i > 0 && 'mt-6 lg:mt-8')} aria-label={`${group.sub ?? ''}${group.title}`}>
          <h2 className="sticky top-14 z-10 -mx-4 flex items-baseline gap-2 border-b border-ink bg-paper/95 px-4 pb-2 pt-3 backdrop-blur lg:mx-0 lg:px-0">
            <span className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[21px]">{group.title}</span>
            {group.sub && <span className="text-[12px] text-ink-muted">{group.sub}</span>}
            <span className="ml-auto text-[12px] text-ink-muted">{groupTotals.get(group.key) ?? group.events.length}件</span>
          </h2>
          {group.events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              active={selectedId === event.id}
              onHover={onSelect}
              showMonth={group.key === 'ongoing'}
            />
          ))}
        </section>
      ))}

      {rest > 0 && (
        <button
          type="button"
          onClick={() => setVisible(v => v + (pageSize || rest))}
          className="mt-6 flex h-12 w-full items-center justify-center border border-ink bg-white text-[13.5px] text-ink hover:bg-paper-deep"
        >
          もっと見る（あと{rest}件）
        </button>
      )}

      {tentative.length > 0 && (
        <details className="group/tent mt-10 border-t border-ink" open={dated.length === 0 || undefined}>
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 py-3 [&::-webkit-details-marker]:hidden">
            <span className="font-mincho text-[16px] font-bold tracking-[0.04em] text-ink lg:text-[17px]">例年の開催時期（日程未発表）</span>
            <span className="text-[12px] text-ink-muted">{tentative.length}件</span>
            <span className="ml-auto text-[12px] text-ink-soft">
              <span className="group-open/tent:hidden">開く ▾</span>
              <span className="hidden group-open/tent:inline">閉じる ▴</span>
            </span>
          </summary>
          <p className="pb-2 text-[12px] leading-relaxed text-ink-muted">
            今回の日程がまだ発表されていない恒例のイベントです。例年の時期をもとに掲載しています。日程は公式発表をご確認ください。
          </p>
          <div className="flex flex-col border-t border-line">
            {tentative.map(event => (
              <EventCard key={event.id} event={event} active={selectedId === event.id} onHover={onSelect} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
