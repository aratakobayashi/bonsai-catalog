import Link from 'next/link'
import type { Event } from '@/types'
import { EventBadge, eventPlaceText, eventPriceShort, eventRangeParts, parseEventDate } from '@/components/features/EventShared'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// 「注目のイベント」の帯（2〜4件）。トップの「出かける」と同じ、墨色の帯に暦の札のようなカード
// SPは横にスクロール、PCは横並び
export function EventFeatured({ events, className = '' }: { events: Event[]; className?: string }) {
  if (events.length < 2) return null
  const thisYear = new Date().getFullYear()
  // PCは件数に合わせて列を決める（3件なら3列で横幅いっぱいに）
  const cols = events.length >= 4 ? 'lg:grid-cols-4' : events.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
  return (
    <section aria-labelledby="events-featured" className={`-mx-4 bg-sumi px-4 pb-6 pt-6 text-white lg:mx-0 lg:px-8 lg:pb-8 lg:pt-7 ${className}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="events-featured" className="font-mincho text-[18px] font-bold tracking-[0.08em] lg:text-[21px]">注目のイベント</h2>
        <span className="text-[11.5px] text-white/60">全国規模の主な展示など・開催の近い順</span>
      </div>
      <ul className={`-mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid ${cols} lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0`}>
        {events.map(event => {
          const range = eventRangeParts(event)
          const start = parseEventDate(event.start_date)
          const end = parseEventDate(event.end_date)
          const multi = event.start_date.slice(0, 10) !== event.end_date.slice(0, 10)
          return (
            <li key={event.id} className="w-[80%] flex-none snap-start sm:w-[46%] lg:w-auto">
              <Link href={`/events/${event.slug}`} className="group flex h-full bg-paper text-ink transition-colors hover:bg-white">
                {/* 左：日付（暦のように大きく） */}
                <span className="flex w-[72px] flex-none flex-col items-center justify-center border-r border-dashed border-line px-1 py-4 text-center">
                  <span className="text-[11px] tracking-[0.06em] text-gold-dark">
                    {start.getFullYear() !== thisYear && <span className="block text-[10px]">{start.getFullYear()}年</span>}
                    {start.getMonth() + 1}月
                  </span>
                  <span className="font-mincho text-[34px] font-bold leading-none">{start.getDate()}</span>
                  <span className="mt-1 text-[11px] text-ink-soft">（{WEEKDAYS[start.getDay()]}）</span>
                  {multi && (
                    <span className="text-[11px] text-ink-soft">〜{end.getMonth() === start.getMonth() ? end.getDate() : `${end.getMonth() + 1}/${end.getDate()}`}</span>
                  )}
                </span>
                {/* 右：催し名・場所・料金 */}
                <span className="flex min-w-0 flex-1 flex-col px-3.5 py-3.5">
                  <span className="flex min-h-[19px] flex-wrap items-center gap-1.5">
                    <EventBadge event={event} />
                    {range.days && range.days > 1 && <span className="text-[11px] text-ink-muted">{range.days}日間</span>}
                  </span>
                  <h3 className="mt-1.5 line-clamp-2 font-mincho text-[15px] font-bold leading-[1.5] [overflow-wrap:anywhere] [word-break:normal] group-hover:text-gold-dark lg:text-[16px]">
                    {event.title}
                  </h3>
                  <span className="mt-auto pt-3 text-[11.5px] leading-[1.6] text-ink-soft">
                    <span className="block truncate">{eventPlaceText(event)}</span>
                    <span className="block text-ink">{eventPriceShort(event)}</span>
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
