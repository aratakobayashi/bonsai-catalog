import Image from 'next/image'
import Link from 'next/link'
import type { Event } from '@/types'
import { eventPlaceText, eventPriceShort, parseEventDate } from '@/components/features/EventShared'
import { isTentativeEvent } from '@/lib/event-display'
import { prefectureSlug } from '@/lib/prefectures'
import { PrefectureTileMap } from '@/components/gardens/PrefectureTileMap'
import { heroPhoto } from '@/lib/hero-photo'
import { UpcomingTrim } from './UpcomingTrim'

const VISIBLE = 4
const PHOTO = heroPhoto('/images/articles/photos/article-15-1.jpg', '')
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// トップの「出かける」：墨色の帯に盆栽園の写真を敷き、暦のようなイベントのカードと、都道府県のタイル地図を並べる
// 地図はタイルそのものが各県のページへのリンク（画像やスクリプトを使わない）。写真は1枚で、画面に近づいてから読み込む
// 画面の下にあるので、近くまでスクロールするまで描画を省く（content-visibility）。終わったイベントは見ている日の日付で隠す（UpcomingTrim）
export function HomeOutings({ events, gardens, eventCount }: { events: Event[]; gardens: { prefecture?: string | null }[]; eventCount: number }) {
  const counts = new Map<string, number>()
  gardens.forEach(g => { if (g.prefecture && prefectureSlug(g.prefecture)) counts.set(g.prefecture, (counts.get(g.prefecture) ?? 0) + 1) })
  if (events.length === 0 && counts.size === 0) return null

  return (
    <section
      aria-labelledby="home-outings"
      className="relative -mx-4 mt-12 overflow-hidden bg-sumi px-4 pb-8 pt-9 text-white [contain-intrinsic-size:auto_1200px] [content-visibility:auto] lg:mx-0 lg:mt-24 lg:px-12 lg:pb-12 lg:pt-14 lg:[contain-intrinsic-size:auto_720px]"
    >
      <Image src={PHOTO.src} alt="" fill sizes="(max-width: 1023px) 100vw, 1184px" className="object-cover opacity-45" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,13,.35)_0%,rgba(18,16,13,.82)_40%,rgba(18,16,13,.92)_100%)]" aria-hidden="true" />

      <div className="relative">
        <p className="flex items-center gap-3 text-[11px] tracking-[0.24em] text-[#d6ba84]">
          出かける<span className="h-px w-10 bg-[#d6ba84]" aria-hidden="true" />
        </p>
        <h2 id="home-outings" className="mt-2 font-mincho text-[24px] font-bold tracking-[0.08em] lg:text-[34px]">盆栽展と盆栽園</h2>
        <p className="mt-2 text-[13px] leading-[1.9] text-white/75 lg:text-[14px]">実物を見て選ぶなら、近くの盆栽展や盆栽園へ。</p>

        <div className="mt-7 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
          {/* 近く開かれる盆栽展・イベント（暦の札のようなカード） */}
          {events.length > 0 && (
            <div>
              <p className="font-mincho text-[16px] font-bold tracking-[0.05em] lg:text-[18px]">近く開かれる盆栽展</p>
              <UpcomingTrim
                visible={VISIBLE}
                className="-mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
              >
                {events.map((event, i) => {
                  const tentative = isTentativeEvent(event)
                  const start = parseEventDate(event.start_date)
                  const end = parseEventDate(event.end_date)
                  const multi = event.start_date.slice(0, 10) !== event.end_date.slice(0, 10)
                  return (
                    <li
                      key={event.id}
                      data-start={event.start_date.slice(0, 10)}
                      data-end={event.end_date.slice(0, 10)}
                      data-tentative={tentative ? '1' : undefined}
                      hidden={i >= VISIBLE}
                      className="w-[80%] flex-none snap-start sm:w-[46%] lg:w-auto"
                    >
                      <Link href={`/events/${event.slug}`} className="group flex h-full bg-paper text-ink transition-colors hover:bg-white">
                        {/* 左：日付（暦のように大きく） */}
                        <span className="flex w-[74px] flex-none flex-col items-center justify-center border-r border-dashed border-line px-1 py-4 text-center">
                          <span className="text-[11px] tracking-[0.1em] text-gold-dark">{tentative ? '例年' : `${start.getMonth() + 1}月`}</span>
                          <span className="font-mincho text-[34px] font-bold leading-none">{tentative ? start.getMonth() + 1 : start.getDate()}</span>
                          <span className="mt-1 text-[11px] text-ink-soft">
                            {tentative ? '月ごろ' : `（${WEEKDAYS[start.getDay()]}）${multi ? `〜${end.getMonth() === start.getMonth() ? end.getDate() : `${end.getMonth() + 1}/${end.getDate()}`}` : ''}`}
                          </span>
                        </span>
                        {/* 右：催し名・場所 */}
                        <span className="flex min-w-0 flex-1 flex-col px-3.5 py-3.5">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span data-badge hidden className="inline-flex items-center bg-[#b4573a] px-1.5 text-[11px] font-bold leading-[1.7] text-white" />
                            <span className="text-[11.5px] text-ink-muted">{eventPlaceText(event)}</span>
                          </span>
                          <span className="mt-1 line-clamp-2 font-mincho text-[15px] font-bold leading-[1.5] [overflow-wrap:anywhere] [word-break:normal] group-hover:text-gold-dark">{event.title}</span>
                          <span className="mt-auto pt-2 text-[11.5px] text-ink-soft">
                            {tentative ? '日程は未発表' : eventPriceShort(event)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </UpcomingTrim>
              <Link href="/events" className="mt-4 inline-flex min-h-11 items-center border-b border-white/60 text-[13.5px] text-white hover:border-[#d6ba84] hover:text-[#d6ba84]">
                イベントをすべて見る{eventCount > 0 && `（開催予定${eventCount.toLocaleString()}件）`} ›
              </Link>
              <Link href="/events/autumn-winter-2026" className="ml-5 mt-4 inline-flex min-h-11 items-center border-b border-white/60 text-[13.5px] text-white hover:border-[#d6ba84] hover:text-[#d6ba84]">
                秋冬の盆栽展カレンダー ›
              </Link>
            </div>
          )}

          {/* 地図から盆栽園を探す（都道府県のタイル。押すと県のページへ） */}
          {counts.size > 0 && (
            <div>
              <p className="font-mincho text-[16px] font-bold tracking-[0.05em] lg:text-[18px]">地図から盆栽園を探す</p>
              <PrefectureTileMap counts={counts} variant="dark" className="mt-3" />
              <Link href="/gardens" className="mt-4 inline-flex min-h-11 items-center border-b border-white/60 text-[13.5px] text-white hover:border-[#d6ba84] hover:text-[#d6ba84]">
                全国の盆栽園（{gardens.length.toLocaleString()}件）・現在地から探す ›
              </Link>
            </div>
          )}
        </div>

        {PHOTO.credit && <p className="mt-6 text-right text-[10.5px] text-white/45">写真：{PHOTO.credit}</p>}
      </div>
    </section>
  )
}
