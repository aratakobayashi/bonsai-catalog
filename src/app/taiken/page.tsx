import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'
import { heroPhoto } from '@/lib/hero-photo'
import { getGardenList } from '@/lib/gardens-list'
import { supabaseServer } from '@/lib/supabase-server'
import { eventHref } from '@/lib/event-url'
import { eventDateText } from '@/lib/event-display'
import { TAIKEN_KINDS, TAIKEN_REGIONS, buildTaikenPlaces } from '@/lib/taiken'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { RelatedTools } from '@/components/layout/RelatedTools'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'
import type { Event } from '@/types'
import { TaikenList } from './TaikenList'

// 盆栽体験・盆栽教室を探す（/taiken）。「盆栽 体験 東京」「盆栽教室 京都」などで探す人に、全国の体験・教室のある盆栽園を地域と内容でまとめて返す
const PATH = '/taiken'

const FAQ = [
  { q: '盆栽体験はどのくらいの時間がかかりますか？', a: 'ミニ盆栽の植え付けや苔玉づくりは、1〜2時間ほどで終わるものが多く、観光の合間にも参加しやすい内容です。手入れを教わる体験や続けて通う教室は、樹の状態を見ながら進めるため、少人数のことがよくあります。' },
  { q: '初めてでも参加できますか？', a: '初心者向けの体験や教室を開いている園が多くあります。初めてなら、植えた一鉢を持ち帰れて、道具と材料が料金に含まれている体験を選ぶと、そのまま家で育て始められます。' },
  { q: '服装や持ち物は？', a: '土で汚れてもよい服装で参加します。エプロンや手袋が要るか、持ち帰り用の袋があるかは、申し込むときに確かめてください。' },
  { q: '体験に向いた季節はありますか？', a: '植え付けの体験は一年中開かれていることが多いものの、樹への負担が少ないのは気温の穏やかな春と秋です。真夏は持ち帰りの途中で弱りやすいので、車内の暑さに気をつけます。' },
]

// これからの体験・講座のイベント（ワークショップ・講演）。種類での絞り込みは取得したあとに行う（列の形式に左右されないように）
// 取れなかったときは、この欄を出さないだけにする（ページ全体は作る）
async function upcomingWorkshops(): Promise<Event[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabaseServer.from('events').select('*').gte('end_date', today).order('start_date', { ascending: true }).limit(500)
  if (error) {
    console.warn(`体験・講座のイベントを取得できませんでした: ${error.message}`)
    return []
  }
  const isWorkshop = (e: Event) => Array.isArray(e.types) && e.types.some(t => t === 'workshop' || t === 'lecture')
  return ((data || []) as Event[]).filter(isWorkshop).slice(0, 10)
}

export async function generateMetadata(): Promise<Metadata> {
  const places = buildTaikenPlaces(await getGardenList())
  return {
    title: `盆栽体験・盆栽教室を探す｜東京・京都・大阪など全国${places.length}か所の盆栽園 - 盆栽コレクション`,
    description: `ミニ盆栽づくりや苔玉、続けて通う盆栽教室を開いている盆栽園を、東京・関東、京都・大阪・関西など地域ごとに全国${places.length}か所まとめました。1回で参加できる体験・予約制・英語対応などの内容で絞り込め、所要時間や服装、持ち帰ったあとの世話も紹介します。`,
    alternates: { canonical: PATH },
  }
}

export default async function TaikenPage() {
  const [gardens, workshops] = await Promise.all([getGardenList(), upcomingWorkshops()])
  const places = buildTaikenPlaces(gardens)
  const count = (key: string) => places.filter(p => p.kinds.includes(key as never)).length
  const regionCounts = TAIKEN_REGIONS.map(r => ({ ...r, count: places.filter(p => r.prefectures.includes(p.prefecture)).length })).filter(r => r.count > 0)

  return (
    <div className={`${CONTAINER} pb-16 lg:pb-24`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽園', url: `${SITE_URL}/gardens`, position: 2 },
          { name: '盆栽体験・盆栽教室', url: `${SITE_URL}${PATH}`, position: 3 },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: '盆栽体験・盆栽教室のある盆栽園',
              numberOfItems: places.length,
              itemListElement: places.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/gardens/${p.id}`, name: p.name })),
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            },
          ]),
        }}
      />
      <PageHeading
        eyebrow="出かける・習う"
        photo={heroPhoto('/images/articles/photos/bonsai-experience-programs-complete-guide-1.jpg', '盆栽の体験教室')}
        title="盆栽体験・盆栽教室を探す"
        lead={`ミニ盆栽づくりや苔玉、続けて通う教室まで。体験・教室のある盆栽園を、全国${places.length}か所まとめました。`}
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '盆栽園', href: '/gardens' }, { label: '盆栽体験・盆栽教室' }]}
      />

      {/* 数字と地域の入口 */}
      <div className="mt-8 grid grid-cols-3 border-y border-line lg:mt-10">
        {[
          { n: places.length, label: '体験・教室のある園' },
          { n: count('oneday'), label: '1回の体験' },
          { n: count('class'), label: '通う教室' },
        ].map(s => (
          <div key={s.label} className="border-r border-line px-2 py-4 text-center last:border-r-0">
            <p className="font-mincho text-[26px] font-bold leading-none text-ink lg:text-[34px]">{s.n}<span className="ml-0.5 text-[13px]">{s.label === '体験・教室のある園' ? 'か所' : '園'}</span></p>
            <p className="mt-1.5 text-[11.5px] leading-snug text-ink-muted lg:text-[12.5px]">{s.label}</p>
          </div>
        ))}
      </div>

      <nav aria-label="地域から探す" className="mt-6">
        <p className="text-[12px] text-ink-muted">地域から探す</p>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {regionCounts.map(r => (
            <li key={r.key}>
              <a href={`#${r.key}`} className="flex min-h-[52px] items-center justify-between gap-2 border border-line bg-white px-3 py-2 hover:border-ink">
                <span className="font-mincho text-[15px] font-bold text-ink">{r.label}</span>
                <span className="text-[12px] text-ink-muted">{r.count}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 東京から行きやすい：大宮盆栽村 */}
      <Link href="/gardens/omiya-bonsai-village" className="mt-6 flex min-h-[64px] items-center gap-3 border border-ink bg-white px-4 py-3 text-ink hover:border-gold-dark hover:text-gold-dark">
        <span className="min-w-0 flex-1">
          <span className="block text-[11.5px] text-gold-dark">東京駅から約35分</span>
          <span className="block font-mincho text-[16px] font-bold">大宮盆栽村で、見学と教室をあわせて楽しむ</span>
          <span className="block text-[12.5px] text-ink-muted">盆栽美術館の講座と、教室を開く盆栽園の歩き方</span>
        </span>
        <span aria-hidden="true">›</span>
      </Link>

      <div className="mt-6 lg:mt-8">
        <TaikenList places={places} />
      </div>

      {/* 日にちの決まった体験・講座 */}
      {workshops.length > 0 && (
        <section aria-labelledby="workshops" className="mt-14 lg:mt-20">
          <SectionTitle action={<Link href="/events" className="border-b border-ink pb-0.5 text-[13px] text-ink">イベントをすべて見る</Link>}><span id="workshops">日にちの決まったワークショップ・講座</span></SectionTitle>
          <ul className="mt-4 border-t border-line">
            {workshops.map(e => (
              <li key={e.id} className="border-b border-line">
                <Link href={eventHref(e.slug)} className="group flex min-h-[60px] items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block font-mincho text-[16px] font-bold text-ink group-hover:text-gold-dark">{e.title}</span>
                    <span className="block text-[12.5px] text-ink-muted">{eventDateText(e, true)}・{e.prefecture}{e.venue_name ? ` ${e.venue_name}` : ''}</span>
                  </span>
                  <span className="text-ink-muted" aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 選び方と当日の流れ */}
      <section aria-labelledby="howto" className="mt-14 lg:mt-20">
        <SectionTitle><span id="howto">はじめての盆栽体験の選び方</span></SectionTitle>
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: '一人で始めてみたい', d: 'ミニ盆栽の植え付けがおすすめ。持ち帰った樹で、水やりと置き場所の感覚を覚えられます。' },
            { t: '親子で参加したい', d: '苔玉や寄せ植えは、土を丸めて苔を巻く作業が多く子どもも楽しめます。刃物を使うかは事前に確認を。' },
            { t: '持っている盆栽を習いたい', d: '手入れの体験か、樹を持ち込める教室を。剪定・針金かけを自分の樹で教われます。' },
            { t: '海外からの来客と', d: '英語に対応しているかを確認。盆栽の持ち出しは検疫の制限があるので、持ち帰らない体験や見学も選べます。' },
          ].map(c => (
            <div key={c.t} className="border border-line bg-white p-4">
              <p className="font-mincho text-[16px] font-bold text-ink">{c.t}</p>
              <p className="mt-1.5 text-[13.5px] leading-[1.8] text-ink-soft">{c.d}</p>
            </div>
          ))}
        </div>
        <h3 className="mt-8 font-mincho text-[17px] font-bold text-ink">申し込む前に確かめたいこと</h3>
        <ol className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-2 text-[14px] leading-[1.8] text-ink-soft sm:grid-cols-2">
          {['所要時間と人数（少人数か、一斉か）', '作った一鉢を持ち帰れるか', '選べる樹種（松・もみじ・花ものなど）', '服装と持ち物（エプロン・手袋）', '予約の方法と、取り消しの期限', '子どもは何歳から参加できるか'].map((t, i) => (
            <li key={t} className="flex gap-2"><span className="font-mincho font-bold text-gold-dark">{i + 1}</span>{t}</li>
          ))}
        </ol>
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px]">
          <Link href="/guides/bonsai-experience-programs-complete-guide" className="border-b border-ink text-ink hover:text-gold-dark">体験教室の選び方と当日の流れ（詳しく）</Link>
          <Link href="/hajimete" className="border-b border-ink text-ink hover:text-gold-dark">持ち帰ったあとの1か月の世話</Link>
        </p>
      </section>

      <section aria-labelledby="faq" className="mt-14 lg:mt-20">
        <SectionTitle><span id="faq">よくある質問</span></SectionTitle>
        <dl className="mt-4 border-t border-line">
          {FAQ.map(f => (
            <div key={f.q} className="border-b border-line py-4">
              <dt className="font-mincho text-[16px] font-bold text-ink">{f.q}</dt>
              <dd className="mt-1.5 text-[14.5px] leading-[1.9] text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-[12px] leading-[1.8] text-ink-muted">
          「{TAIKEN_KINDS.map(k => k.short).join('・')}」は、各園の公式サイトなどで確かめた紹介文の表記をもとに分けています。日程・料金・定員は変わることがあるため、申し込む前に各園の公式サイトで最新の情報を確かめてください。
          掲載している盆栽園の方へ：<Link href="/gardens/owners" className="border-b border-line text-ink">掲載情報の追加・修正（無料）</Link>
        </p>
      </section>

      <RelatedTools hrefs={['/hajimete', '/teire', '/osusume']} />
    </div>
  )
}
