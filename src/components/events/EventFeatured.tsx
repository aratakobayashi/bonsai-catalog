import Link from 'next/link'
import type { Event } from '@/types'
import { EventBadge, eventPlaceText, eventPriceShort, eventRangeParts } from '@/components/features/EventShared'

// 「注目のイベント」の帯（2〜4件）。SPは横にスクロール、PCは横並び
export function EventFeatured({ events, className = '' }: { events: Event[]; className?: string }) {
  if (events.length < 2) return null
  return (
    <section aria-labelledby="events-featured" className={className}>
      <div className="flex items-baseline gap-3">
        <h2 id="events-featured" className="font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-[19px]">注目のイベント</h2>
        <span className="text-[11.5px] text-ink-muted">全国規模の主な展示など・開催の近い順</span>
      </div>
      <ul className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
        {events.map(event => {
          const range = eventRangeParts(event)
          return (
            <li key={event.id} className="w-[76%] flex-none snap-start sm:w-[44%] lg:w-auto">
              <Link
                href={`/events/${event.slug}`}
                className="group flex h-full flex-col border border-line border-t-ink bg-white p-4 hover:border-ink lg:p-5"
              >
                <div className="flex min-h-[19px] flex-wrap items-center gap-1.5">
                  <EventBadge event={event} />
                </div>
                <p className="mt-2 text-[11.5px] text-ink-muted">{range.year}{range.days && range.days > 1 ? `・${range.days}日間` : ''}</p>
                <p className="font-mincho text-[16px] font-bold leading-snug tracking-[0.02em] text-ink lg:text-[17px]">{range.main}</p>
                <h3 className="mt-2 line-clamp-2 font-mincho text-[15px] font-bold leading-snug tracking-[0.03em] text-ink group-hover:text-gold-dark">
                  {event.title}
                </h3>
                <p className="mt-auto flex items-baseline gap-2 pt-3 text-[12px] text-ink-soft">
                  <span className="min-w-0 truncate">{eventPlaceText(event)}</span>
                  <span className="ml-auto flex-none text-ink">{eventPriceShort(event)}</span>
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
