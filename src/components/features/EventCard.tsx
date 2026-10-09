import Link from 'next/link'
import { Event } from '@/types'
import { cn } from '@/lib/utils'
import { eventPriceText } from '@/lib/event-display'
import {
  EventDateBlock,
  EventPlaceTag,
  EventTypeTag,
  eventPlaceText,
  eventShortDateText,
  getEventStatus,
} from './EventShared'

interface EventCardProps {
  event: Event
  className?: string
  // 互換のため残している（見た目は共通）
  layout?: 'card' | 'list' | 'compact'
  active?: boolean
  onHover?: (event: Event) => void
}

// イベントの1行（大きな日付＋種別・場所＋明朝のタイトル＋日程・料金）。線で区切って並べる
export function EventCard({ event, className, active = false, onHover }: EventCardProps) {
  const past = getEventStatus(event) === 'past'

  return (
    <Link
      href={`/events/${event.slug}`}
      onMouseEnter={onHover ? () => onHover(event) : undefined}
      onFocus={onHover ? () => onHover(event) : undefined}
      aria-current={active ? 'true' : undefined}
      className={cn('group flex gap-4 border-b border-line py-5 lg:gap-6 lg:py-[22px]', past && 'opacity-75', className)}
    >
      <EventDateBlock event={event} muted={past} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {event.types.slice(0, 2).map(type => <EventTypeTag key={type} type={type} />)}
          <EventPlaceTag>{eventPlaceText(event)}</EventPlaceTag>
          {past && <span className="text-[11px] text-ink-muted">開催終了</span>}
        </div>
        <h3 className={cn('mt-1 line-clamp-2 font-mincho text-base font-bold leading-snug tracking-[0.04em] group-hover:text-gold-dark lg:text-lg', active ? 'text-gold-dark' : 'text-ink')}>
          {event.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
          {eventShortDateText(event)}・{eventPriceText(event)}
        </p>
      </div>
    </Link>
  )
}
