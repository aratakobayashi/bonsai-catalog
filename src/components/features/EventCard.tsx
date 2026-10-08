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

// イベントの横長カード（日付ブロック＋種別・場所＋タイトル＋日程・料金）
export function EventCard({ event, className, active = false, onHover }: EventCardProps) {
  const past = getEventStatus(event) === 'past'

  return (
    <Link
      href={`/events/${event.slug}`}
      onMouseEnter={onHover ? () => onHover(event) : undefined}
      onFocus={onHover ? () => onHover(event) : undefined}
      className={cn(
        'flex items-center gap-3 rounded-[14px] border border-line px-4 py-3.5 transition-colors hover:border-gold lg:gap-4 lg:px-[18px] lg:py-4',
        active ? 'bg-white lg:bg-[#fffdf9] lg:shadow-[inset_3px_0_0_#b8935a]' : 'bg-white',
        past && 'opacity-70',
        className
      )}
    >
      <EventDateBlock event={event} muted={past} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-1">
          {event.types.slice(0, 2).map(type => <EventTypeTag key={type} type={type} />)}
          <EventPlaceTag>{eventPlaceText(event)}</EventPlaceTag>
          {past && <span className="rounded bg-[#f1eee8] px-1.5 py-px text-[11px] text-ink-soft">開催終了</span>}
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-ink lg:text-base">{event.title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
          {eventShortDateText(event)}・{eventPriceText(event)}
        </p>
      </div>
    </Link>
  )
}
