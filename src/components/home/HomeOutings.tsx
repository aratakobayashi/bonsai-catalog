import Image from 'next/image'
import Link from 'next/link'
import type { Event } from '@/types'
import { eventPlaceText, eventPriceShort, parseEventDate } from '@/components/features/EventShared'
import { isTentativeEvent } from '@/lib/event-display'
import { prefectureAreaHref, prefectureSlug } from '@/lib/prefectures'
import { heroPhoto } from '@/lib/hero-photo'
import { UpcomingTrim } from './UpcomingTrim'

const VISIBLE = 4
const PHOTO = heroPhoto('/images/articles/photos/article-15-1.jpg', '')
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// 日本の都道府県のタイル地図（[列, 行]。地方の並びが分かる程度に形を単純にしたもの）
const TILES: [string, number, number][] = [
  ['北海道', 11, 0], ['青森県', 10, 1], ['秋田県', 9, 2], ['岩手県', 10, 2], ['山形県', 9, 3], ['宮城県', 10, 3],
  ['石川県', 6, 4], ['富山県', 7, 4], ['新潟県', 8, 4], ['福島県', 9, 4],
  ['福井県', 5, 5], ['岐阜県', 6, 5], ['長野県', 7, 5], ['群馬県', 8, 5], ['栃木県', 9, 5], ['茨城県', 10, 5],
  ['島根県', 2, 6], ['鳥取県', 3, 6], ['京都府', 4, 6], ['滋賀県', 5, 6], ['愛知県', 6, 6], ['山梨県', 7, 6], ['埼玉県', 8, 6], ['千葉県', 9, 6],
  ['山口県', 1, 7], ['広島県', 2, 7], ['岡山県', 3, 7], ['兵庫県', 4, 7], ['奈良県', 5, 7], ['静岡県', 6, 7], ['神奈川県', 7, 7], ['東京都', 8, 7],
  ['佐賀県', 0, 8], ['福岡県', 1, 8], ['大分県', 2, 8], ['大阪府', 4, 8], ['三重県', 5, 8],
  ['長崎県', 0, 9], ['熊本県', 1, 9], ['宮崎県', 2, 9], ['愛媛県', 3, 9], ['香川県', 4, 9], ['和歌山県', 5, 9],
  ['鹿児島県', 1, 10], ['高知県', 3, 10], ['徳島県', 4, 10],
  ['沖縄県', 0, 11],
]

// 園の数で濃さを変える（墨色の帯の上で見分けられる苔色の段階）
function tileTone(n: number): string {
  if (n >= 8) return 'bg-[#8db86a] text-[#16210f]'
  if (n >= 4) return 'bg-[#5f8a45] text-white'
  if (n >= 1) return 'bg-[#3e5a30] text-white/90'
  return 'bg-white/[0.06] text-white/35'
}

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
            </div>
          )}

          {/* 地図から盆栽園を探す（都道府県のタイル。押すと県のページへ） */}
          {counts.size > 0 && (
            <div>
              <p className="font-mincho text-[16px] font-bold tracking-[0.05em] lg:text-[18px]">地図から盆栽園を探す</p>
              <div className="mt-3 grid grid-cols-12 gap-[3px] lg:gap-1" style={{ gridTemplateRows: 'repeat(12, minmax(0, 1fr))' }}>
                {TILES.map(([pref, col, row]) => {
                  const n = counts.get(pref) ?? 0
                  const label = pref === '北海道' ? '北海道' : pref.replace(/[都府県]$/, '')
                  const style = { gridColumnStart: col + 1, gridRowStart: row + 1 }
                  const cls = `flex aspect-square items-center justify-center text-center text-[9px] leading-[1.1] tracking-[-0.02em] sm:text-[11px] lg:text-[11px] ${tileTone(n)}`
                  return n > 0 ? (
                    <Link key={pref} href={prefectureAreaHref(pref)} style={style} title={`${pref}の盆栽園（${n}件）`} className={`${cls} hover:outline hover:outline-2 hover:outline-[#d6ba84]`}>
                      {label}
                    </Link>
                  ) : (
                    <span key={pref} style={style} className={cls} aria-hidden="true">{label}</span>
                  )
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-white/70">
                <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 bg-[#3e5a30]" />1〜3園</span>
                <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 bg-[#5f8a45]" />4〜7園</span>
                <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-3 bg-[#8db86a]" />8園以上</span>
              </div>
              <Link href="/gardens" className="mt-4 inline-flex min-h-11 items-center border-b border-white/60 text-[13.5px] text-white hover:border-[#d6ba84] hover:text-[#d6ba84]">
                全国の盆栽園（{gardens.length.toLocaleString()}件）・現在地から探す ›
              </Link>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
