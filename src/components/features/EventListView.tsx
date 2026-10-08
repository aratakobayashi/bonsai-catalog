'use client'

import { useMemo } from 'react'
import { Event } from '@/types'
import { cn } from '@/lib/utils'
import { EventCard } from './EventCard'
import { getEventStatus, parseEventDate, startOfToday } from './EventShared'

interface EventListViewProps {
  events: Event[]
  className?: string
  selectedId?: string | null
  onSelect?: (event: Event) => void
}

interface EventGroup {
  key: string
  title: string
  events: Event[]
}

// 開催中 → 月ごと（開催日順）にまとめたリスト。並び順は親から渡された順を保つ
export function EventListView({ events, className, selectedId, onSelect }: EventListViewProps) {
  const groups = useMemo(() => {
    const today = startOfToday()
    const result: EventGroup[] = []
    const byKey = new Map<string, EventGroup>()

    events.forEach(event => {
      const status = getEventStatus(event, today)
      let key: string
      let title: string
      if (status === 'ongoing') {
        key = 'ongoing'
        title = '開催中'
      } else {
        const start = parseEventDate(event.start_date)
        key = `${status === 'past' ? 'past-' : ''}${start.getFullYear()}-${start.getMonth()}`
        title = `${start.getFullYear()}年${start.getMonth() + 1}月${status === 'past' ? '（終了）' : ''}`
      }
      let group = byKey.get(key)
      if (!group) {
        group = { key, title, events: [] }
        byKey.set(key, group)
        result.push(group)
      }
      group.events.push(event)
    })

    return result
  }, [events])

  if (events.length === 0) {
    return (
      <div className={cn('rounded-[14px] border border-line bg-white px-6 py-12 text-center', className)}>
        <p className="font-bold text-ink">条件に合うイベントが見つかりませんでした</p>
        <p className="mt-2 text-sm text-ink-soft">地域や期間の絞り込みを外してお試しください。</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      {groups.map((group, i) => (
        <section key={group.key} className={cn('flex flex-col gap-2.5', i > 0 && 'mt-2.5')}>
          <h2 className="text-[13px] font-bold text-ink-soft">{group.title}</h2>
          {group.events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              active={selectedId === event.id}
              onHover={onSelect}
            />
          ))}
        </section>
      ))}
    </div>
  )
}
