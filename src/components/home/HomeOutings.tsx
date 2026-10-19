import Link from 'next/link'
import type { Event } from '@/types'
import { EventDateBlock, eventPlaceText, eventPriceShort } from '@/components/features/EventShared'
import { isTentativeEvent } from '@/lib/event-display'
import { PREFECTURE_ORDER, REGION_ORDER } from '@/components/gardens/GardenParts'
import { getRegionFromPrefecture } from '@/lib/utils'
import { prefectureAreaHref, prefectureSlug } from '@/lib/prefectures'
import { UpcomingTrim } from './UpcomingTrim'

const VISIBLE = 4

// トップの「出かける」：近く開かれる盆栽展・イベントと、地域から探す盆栽園
// 画像や地図は使わない（トップの表示を重くしない）。終わったイベントは見ている日の日付で隠す（UpcomingTrim）
export function HomeOutings({ events, gardens, eventCount }: { events: Event[]; gardens: { prefecture?: string | null }[]; eventCount: number }) {
  const counts = new Map<string, number>()
  gardens.forEach(g => { if (g.prefecture && prefectureSlug(g.prefecture)) counts.set(g.prefecture, (counts.get(g.prefecture) ?? 0) + 1) })
  const regions = REGION_ORDER.map(region => ({
    region,
    prefectures: PREFECTURE_ORDER.filter(p => getRegionFromPrefecture(p) === region && counts.has(p)),
  })).filter(r => r.prefectures.length > 0)
  if (events.length === 0 && regions.length === 0) return null

  return (
    <section className="pt-12 lg:pt-24" aria-labelledby="home-outings">
      <p className="flex items-center gap-3 text-[11px] tracking-[0.2em] text-gold-dark">
        出かける<span className="h-px w-8 bg-gold" aria-hidden="true" />
      </p>
      <h2 id="home-outings" className="mt-1.5 font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[26px]">盆栽展と盆栽園</h2>
      <p className="mt-1.5 text-xs text-ink-muted lg:text-[12.5px]">実物を見て選ぶなら、近くの盆栽展や盆栽園へ</p>

      <div className="mt-5 grid gap-8 lg:mt-7 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        {/* 近く開かれる盆栽展・イベント */}
        {events.length > 0 && (
          <div>
            <p className="font-mincho text-[16px] font-bold text-ink lg:text-[17px]">近く開かれる盆栽展・イベント</p>
            <UpcomingTrim visible={VISIBLE} className="mt-2 border-t border-line">
              {events.map((event, i) => (
                <li
                  key={event.id}
                  data-start={event.start_date.slice(0, 10)}
                  data-end={event.end_date.slice(0, 10)}
                  data-tentative={isTentativeEvent(event) ? '1' : undefined}
                  hidden={i >= VISIBLE}
                  className="border-b border-line"
                >
                  <Link href={`/events/${event.slug}`} className="group flex gap-3.5 py-3.5 lg:gap-5">
                    <EventDateBlock event={event} compact />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span data-badge hidden className="inline-flex items-center bg-sumi px-1.5 text-[11px] font-bold leading-[1.7] text-white" />
                        <span className="text-[11.5px] text-ink-muted">{eventPlaceText(event)}・{eventPriceShort(event)}</span>
                      </span>
                      <span className="mt-0.5 block font-mincho text-[15px] font-bold leading-[1.5] text-ink group-hover:text-gold-dark lg:text-[16px]">{event.title}</span>
                      {event.venue_name && <span className="mt-0.5 block truncate text-[12px] text-ink-soft">{event.venue_name}</span>}
                    </span>
                    <span className="self-center font-sans text-ink-muted" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </UpcomingTrim>
            <Link href="/events" className="mt-3 inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">
              イベントをすべて見る{eventCount > 0 && `（開催予定${eventCount.toLocaleString()}件）`} ›
            </Link>
          </div>
        )}

        {/* 盆栽園を地域から探す */}
        {regions.length > 0 && (
          <div>
            <p className="font-mincho text-[16px] font-bold text-ink lg:text-[17px]">盆栽園を地域から探す</p>
            <dl className="mt-2 border-t border-line">
              {regions.map(({ region, prefectures }) => (
                <div key={region} className="flex gap-3 border-b border-line py-2.5">
                  <dt className="w-[72px] flex-none pt-1.5 text-[11.5px] tracking-[0.04em] text-ink-muted lg:w-[84px]">{region}</dt>
                  <dd className="flex min-w-0 flex-wrap gap-x-3">
                    {prefectures.map(p => (
                      <Link key={p} href={prefectureAreaHref(p)} className="inline-flex min-h-9 items-center text-[13.5px] text-ink hover:text-gold-dark hover:underline">
                        {p.replace(/[都府県]$/, '')}<span className="ml-0.5 text-[11px] text-ink-muted">{counts.get(p)}</span>
                      </Link>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
            <Link href="/gardens" className="mt-3 inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">
              全国の盆栽園（{gardens.length.toLocaleString()}件）・現在地から探す ›
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
