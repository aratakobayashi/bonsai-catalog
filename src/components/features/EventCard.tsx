import Link from 'next/link'
import { Event } from '@/types'
import { cn } from '@/lib/utils'
import { isTentativeEvent } from '@/lib/event-display'
import {
  EventBadge,
  EventDateBlock,
  EventTypeChip,
  eventPeriodText,
  eventPlaceText,
  eventPriceShort,
  getEventStatus,
} from './EventShared'

interface EventCardProps {
  event: Event
  className?: string
  // compact：関連イベントなどの短い一覧（種別を省き、タイトルは1行）
  layout?: 'card' | 'list' | 'compact'
  active?: boolean
  onHover?: (event: Event) => void
  // 月の見出しの下に並べるときは false（日付の上の「◯月」を省く）
  showMonth?: boolean
}

// イベントの1行：左に大きな日付、右に状態・種別、明朝のタイトル、会場・地域と料金
export function EventCard({ event, className, layout = 'list', active = false, onHover, showMonth = true }: EventCardProps) {
  const past = getEventStatus(event) === 'past'
  const tentative = isTentativeEvent(event)
  const compact = layout === 'compact'
  const place = [event.venue_name, eventPlaceText(event)].filter(Boolean).join('・')

  return (
    <Link
      href={`/events/${event.slug}`}
      onMouseEnter={onHover ? () => onHover(event) : undefined}
      onFocus={onHover ? () => onHover(event) : undefined}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'group relative flex gap-3.5 border-b border-line lg:gap-5',
        compact ? 'py-3.5' : 'py-4 lg:py-[18px]',
        active && 'lg:before:absolute lg:before:inset-y-3 lg:before:-left-3 lg:before:w-0.5 lg:before:bg-ink',
        className
      )}
    >
      <EventDateBlock event={event} muted={past} showMonth={showMonth} compact={compact} />
      <div className="min-w-0 flex-1">
        {!compact && (
          <div className="flex flex-wrap items-center gap-1.5">
            <EventBadge event={event} />
            {event.types.slice(0, 3).map(type => <EventTypeChip key={type} type={type} />)}
          </div>
        )}
        <h3
          className={cn(
            'font-mincho font-bold leading-snug tracking-[0.03em] group-hover:text-gold-dark',
            compact ? 'line-clamp-1 text-[14.5px]' : 'mt-1.5 line-clamp-2 text-[15.5px] lg:text-[17px]',
            active ? 'text-gold-dark' : past ? 'text-ink-soft' : 'text-ink'
          )}
        >
          {event.title}
        </h3>
        {tentative && <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{eventPeriodText(event)}</p>}
        <p className="mt-1 flex items-baseline gap-3 text-[12.5px] leading-snug">
          <span className="min-w-0 truncate text-ink-soft">{place || event.prefecture}</span>
          <span className="ml-auto flex-none text-ink">{eventPriceShort(event)}</span>
        </p>
      </div>
    </Link>
  )
}
