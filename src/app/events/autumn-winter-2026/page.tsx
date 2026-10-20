import { Metadata } from 'next'
import Link from 'next/link'
import type { Event } from '@/types'
import { supabaseServer } from '@/lib/supabase-server'
import { isTentativeEvent } from '@/lib/event-display'
import { EventCard } from '@/components/features/EventCard'
import { eventPlaceText, eventPriceShort, eventRangeParts, getEventStatus, parseEventDate } from '@/components/features/EventShared'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { SITE_URL } from '@/lib/site'
import { heroPhoto } from '@/lib/hero-photo'

// 秋冬（11月〜2月）の盆栽展カレンダー。「盆栽展 2026」「大観展 日程」などで探す人向けのまとめ
// 掲載中のイベント（DB）から期間で抜き出し、月ごとに並べる。主な展示（大観展・雅風展・国風展・盆梅展）は先に案内する
const FROM = '2026-11-01'
const TO = '2027-02-28'
const PATH = '/events/autumn-winter-2026'
const TITLE = '2026年 秋冬の盆栽展カレンダー｜11月〜2月の主な展示会と日程'
const DESCRIPTION = '2026年11月から2027年2月に開かれる盆栽展を、月ごとにまとめました。京都の日本盆栽大観展（11月）、雅風展（1月）、東京・上野の国風盆栽展（2月）、各地の盆梅展と、全国の秋季盆栽展・小品盆栽展の日程・会場・入場料を確認できます。'

export const metadata: Metadata = {
  alternates: { canonical: PATH },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', url: `${SITE_URL}${PATH}` },
}

export const revalidate = 3600

// 先に案内する主な展示（slug は掲載中のイベント。見つからないものは出さない）
const HIGHLIGHTS: { slug: string; note: string }[] = [
  { slug: 'taikan-ten-2026', note: '京都・みやこめっせで開かれる、秋のいちばん大きな盆栽展。名品の展示と、盆栽・鉢・道具の即売が並びます。' },
  { slug: 'gafu-ten-2027', note: '小品盆栽（手のひらほどの小さな盆栽）の全国展。飾り棚に組んだ「席飾り」が見どころです。' },
  { slug: 'kokufu-bonsai-ten-2027', note: '東京・上野の東京都美術館で開かれる、100年以上続く盆栽展。前期と後期で展示が入れ替わります。' },
  { slug: 'nagahama-bonbai-ten-2027', note: '樹齢の古い梅の盆栽（盆梅）を、咲く時期に合わせて見せる展示。長浜のほか、各地で盆梅展が開かれます。' },
]

const MONTHS = [
  { key: '2026-11', label: '11月', lead: '各地で秋季盆栽展が開かれ、紅葉した雑木や実ものが見頃です。下旬には京都で日本盆栽大観展があります。' },
  { key: '2026-12', label: '12月', lead: '展示は少なめになり、九州・北陸の小品盆栽展や、銘品を集めた展示が中心です。' },
  { key: '2027-01', label: '1月', lead: '京都の雅風展で、新しい年の小品盆栽を見られます。下旬からは盆梅展が始まります。' },
  { key: '2027-02', label: '2月', lead: '上野の国風盆栽展と、各地の盆梅展が重なる時期です。' },
]

const FAQ = [
  { q: '盆栽展は、盆栽を知らなくても楽しめますか？', a: 'はい。多くの盆栽展は、樹の名前や樹形の説明を添えて展示しています。気になった樹の前で、幹の流れ・枝の広がり・鉢との組み合わせを見比べるだけでも楽しめます。会場の係の方や出品者に質問できることもあります。' },
  { q: '入場料はかかりますか？', a: '地域の盆栽会の展示は無料のことが多く、大きな展示会は数百円〜1,500円ほどです。各イベントのページに、確認できた入場料を載せています。' },
  { q: '盆栽を買うことはできますか？', a: '即売会を併設している展示会では、盆栽・鉢・道具を買えます。大観展や雅風展などの大きな展示会は、即売の店が多く並びます。持ち帰り用の袋や箱があると便利です。' },
  { q: '写真は撮ってもよいですか？', a: '展示会によって決まりが違います。撮影禁止の作品や会場もあるので、入口の案内や係の方の指示に従ってください。' },
]

async function getSeasonEvents(): Promise<Event[]> {
  const { data, error } = await supabaseServer
    .from('events')
    .select('*')
    .lte('start_date', TO)
    .gte('end_date', FROM)
    .order('start_date', { ascending: true })
  if (error) throw error
  return (data || []) as Event[]
}

// 開始日の月で分ける（前の月から続くものは、その期間の最初の月に入れる）
const monthKey = (event: Event) => (event.start_date.slice(0, 7) < FROM.slice(0, 7) ? FROM.slice(0, 7) : event.start_date.slice(0, 7))

export default async function AutumnWinterEventsPage() {
  const events = await getSeasonEvents().catch(() => [] as Event[])
  const bySlug = new Map(events.map(e => [e.slug, e]))
  const highlights = HIGHLIGHTS.map(h => ({ ...h, event: bySlug.get(h.slug) })).filter((h): h is typeof h & { event: Event } => Boolean(h.event))
  const groups = MONTHS.map(m => ({ ...m, events: events.filter(e => monthKey(e) === m.key) })).filter(m => m.events.length > 0)
  const pageUrl = `${SITE_URL}${PATH}`

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽イベント', url: `${SITE_URL}/events`, position: 2 },
          { name: '秋冬の盆栽展カレンダー', url: pageUrl, position: 3 },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: '2026年 秋冬の盆栽展',
            url: pageUrl,
            numberOfItems: events.length,
            itemListElement: events.map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/events/${e.slug}`, name: e.title })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }),
        }}
      />

      <div className={`${CONTAINER} pb-16 lg:pb-24`}>
        <PageHeading
          eyebrow="出かける"
          photo={heroPhoto('/images/articles/photos/bonsai-club-beginner-guide-2.jpg', '盆栽展の会場で作品を見る人')}
          crumbs={[{ label: 'ホーム', href: '/' }, { label: 'イベント', href: '/events' }, { label: '秋冬の盆栽展カレンダー' }]}
          title="2026年 秋冬の盆栽展カレンダー"
          lead={`2026年11月〜2027年2月に開かれる盆栽展${events.length > 0 ? ` ${events.length}件` : ''}を、月ごとにまとめました。`}
        />

        <p className="mt-6 max-w-[760px] text-[14px] leading-[2] text-ink-soft lg:text-[15px]">
          秋から冬は、紅葉した雑木や赤い実の盆栽、松柏の名品を見られる季節です。11月は各地で秋季盆栽展が重なり、下旬には京都で日本盆栽大観展が開かれます。年が明けると京都の雅風展、2月には東京・上野の国風盆栽展と、各地の盆梅展が続きます。
        </p>
        <nav aria-label="月" className="mt-5 flex flex-wrap gap-2">
          {groups.map(g => (
            <a key={g.key} href={`#m-${g.key}`} className="inline-flex min-h-11 items-center border border-line bg-white px-4 text-[13.5px] text-ink hover:border-ink">
              {g.label}（{g.events.length}件）
            </a>
          ))}
        </nav>

        {/* 主な展示 */}
        {highlights.length > 0 && (
          <section aria-labelledby="highlights" className="-mx-4 mt-10 bg-sumi px-4 py-7 text-white lg:mx-0 lg:mt-14 lg:px-8 lg:py-9">
            <h2 id="highlights" className="font-mincho text-[19px] font-bold tracking-[0.06em] lg:text-[23px]">この冬の主な盆栽展</h2>
            <ul className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
              {highlights.map(({ event, note }) => {
                const range = eventRangeParts(event)
                return (
                  <li key={event.slug}>
                    <Link href={`/events/${event.slug}`} className="group block h-full bg-paper p-4 text-ink hover:bg-white lg:p-5">
                      <span className="block text-[12px] tracking-[0.04em] text-gold-dark">
                        {isTentativeEvent(event) ? `例年${parseEventDate(event.start_date).getMonth() + 1}月ごろ（日程は未発表）` : `${range.year}${range.main}`}
                      </span>
                      <span className="mt-1 block font-mincho text-[17px] font-bold leading-[1.5] group-hover:text-gold-dark lg:text-[18px]">{event.title}</span>
                      <span className="mt-1 block text-[12px] text-ink-muted">{[event.venue_name, eventPlaceText(event), eventPriceShort(event)].filter(Boolean).join('・')}</span>
                      <span className="mt-2 block text-[13px] leading-[1.8] text-ink-soft">{note}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* 月ごとの一覧 */}
        {groups.map(g => {
          const ended = g.events.filter(e => getEventStatus(e) === 'past').length
          return (
            <section key={g.key} id={`m-${g.key}`} aria-labelledby={`h-${g.key}`} className="scroll-mt-20 pt-12 lg:pt-16">
              <SectionTitle>
                <span id={`h-${g.key}`}>{g.key.slice(0, 4)}年{g.label}の盆栽展</span>
              </SectionTitle>
              <p className="mt-2 text-[13.5px] leading-[1.9] text-ink-soft">
                {g.lead}
                {ended > 0 && <span className="text-ink-muted">（終了した{ended}件を含みます）</span>}
              </p>
              <div className="mt-4 border-t border-line">
                {g.events.map(event => (
                  <EventCard key={event.id} event={event} layout="list" />
                ))}
              </div>
            </section>
          )
        })}

        {events.length === 0 && (
          <p className="mt-10 border-y border-line py-8 text-center text-sm text-ink-muted">掲載中の盆栽展を読み込めませんでした。<Link href="/events" className="border-b border-ink">イベントの一覧</Link>をご覧ください。</p>
        )}

        {/* よくある質問 */}
        <section aria-labelledby="faq" className="mt-14 border-t border-ink pt-8 lg:mt-20">
          <h2 id="faq" className="font-mincho text-[19px] font-bold tracking-[0.05em] text-ink lg:text-[22px]">盆栽展に行く前に</h2>
          <dl className="mt-3 border-t border-line">
            {FAQ.map(f => (
              <div key={f.q} className="border-b border-line py-4">
                <dt className="text-[14.5px] font-bold text-ink">{f.q}</dt>
                <dd className="mt-1.5 text-[13.5px] leading-[1.9] text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-[13px] leading-[1.9] text-ink-soft">
            日程・会場・入場料は、主催者の発表などをもとに掲載しています。変更されることがあるため、お出かけ前に各イベントの公式情報もご確認ください。
            近くの盆栽園は<Link href="/gardens" className="mx-1 border-b border-ink text-ink">盆栽園を探す</Link>から、開催中のイベントは<Link href="/events" className="mx-1 border-b border-ink text-ink">盆栽イベントの一覧</Link>から探せます。
          </p>
        </section>
      </div>
    </>
  )
}
