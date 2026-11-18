import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'
import { heroPhoto } from '@/lib/hero-photo'
import { getGardenList } from '@/lib/gardens-list'
import { supabaseServer } from '@/lib/supabase-server'
import { eventHref } from '@/lib/event-url'
import { eventDateText } from '@/lib/event-display'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { RelatedTools } from '@/components/layout/RelatedTools'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'
import type { Event } from '@/types'

// 大宮盆栽村の日本語ガイド（/gardens/omiya-bonsai-village）。英語版（/en/omiya-bonsai-village）と同じ確認済みの情報を使う。
// 情報は2026年11月に確認（さいたま市・大宮盆栽村の公式サイト）。開館時間・休館日・料金を直したら英語版も直す
const PATH = '/gardens/omiya-bonsai-village'

export const metadata: Metadata = {
  title: '大宮盆栽村の楽しみ方｜行き方・盆栽美術館・6つの盆栽園と大盆栽まつり - 盆栽コレクション',
  description: 'さいたま市北区の大宮盆栽村の歩き方をまとめました。東京駅から約35分の行き方、大宮盆栽美術館の開館時間・休館日・料金（2027年1〜2月の臨時休館）、見学できる6つの盆栽園、5月3〜5日の大盆栽まつり、見学のマナーを紹介します。',
  alternates: {
    canonical: PATH,
    languages: { ja: PATH, en: '/en/omiya-bonsai-village' },
  },
  openGraph: { type: 'article', title: '大宮盆栽村の楽しみ方', url: `${SITE_URL}${PATH}` },
}

const GARDENS = [
  { name: '九霞園', kana: 'きゅうかえん', since: '1929年創業', note: '300種を超える樹と添え草を、自然な姿で育てています。' },
  { name: '清香園', kana: 'せいこうえん', since: '1850年代創業、1943年から大宮', note: '色鮮やかな「彩花盆栽」で知られ、盆栽教室も開いています。' },
  { name: '藤樹園', kana: 'とうじゅえん', since: '1931年創業', note: '五葉松と小品盆栽が中心。1966年から教室を続けています。' },
  { name: '芙蓉園', kana: 'ふようえん', since: '1939年創業', note: '雑木と、寄せ植え（森の景色）の盆栽が見どころです。' },
  { name: '蔓青園', kana: 'まんせいえん', since: '1925年から大宮', note: '樹齢を重ねた真柏や水石、床の間の飾りを見られます。' },
  { name: '松雪園', kana: 'しょうせつえん', since: '1977年創業', note: '教室を開いており、園主は毎年作品を展示会に出しています。' },
]

const FAQ = [
  { q: '大宮盆栽村へはどう行けばよいですか？', a: 'JR宇都宮線（上野東京ライン）の土呂駅が最寄りで、東京駅から約36分です。東口から大宮盆栽美術館まで徒歩約5分。東武アーバンパークラインの大宮公園駅からは徒歩約10分です。' },
  { q: '盆栽園の見学にお金はかかりますか？', a: '盆栽村の盆栽園は無料で見学できます。大宮盆栽美術館は有料で、一般310円です。多くの園と美術館は木曜日が休みなので、訪ねる日に注意してください。' },
  { q: '盆栽園で写真を撮ってもよいですか？', a: '盆栽園は育てている場であり、住まいでもあるため、撮影は基本的にできません。撮りたいときは必ずお店の方に確かめてください。美術館も主な展示は撮影できず、撮影できる場所が決められています。' },
]

// 大宮盆栽村の盆栽展（slug が omiya- で始まるもの）のうち、まだ終わっていないもの
async function omiyaEvents(): Promise<Event[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabaseServer.from('events').select('*').like('slug', 'omiya-%').gte('end_date', today).order('start_date', { ascending: true }).limit(12)
  if (error) throw new Error(`イベントの取得エラー: ${error.message}`)
  return (data || []) as Event[]
}

const p = 'text-[14.5px] leading-[1.95] text-ink-soft lg:text-[15px]'
const factRow = 'grid grid-cols-[minmax(0,1fr)] gap-1 border-b border-line py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4'

function Facts({ rows }: { rows: { k: string; v: React.ReactNode }[] }) {
  return (
    <dl className="mt-4 border-t border-line">
      {rows.map(r => (
        <div key={r.k} className={factRow}>
          <dt className="text-[13px] font-bold text-ink">{r.k}</dt>
          <dd className="text-[14px] leading-[1.85] text-ink-soft">{r.v}</dd>
        </div>
      ))}
    </dl>
  )
}

const External = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="border-b border-ink text-ink hover:border-gold-dark hover:text-gold-dark">{children}<span aria-hidden="true"> ↗</span></a>
)

export default async function OmiyaBonsaiVillagePage() {
  const [gardens, events] = await Promise.all([getGardenList(), omiyaEvents()])
  // 当サイトに掲載している園のページ（さいたま市の園を名前で探す）
  const ourPage = (name: string) => gardens.find(g => (g.city ?? '').includes('さいたま市') && g.name.includes(name))

  return (
    <div className={`${CONTAINER} pb-16 lg:pb-24`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽園', url: `${SITE_URL}/gardens`, position: 2 },
          { name: '埼玉県', url: `${SITE_URL}/gardens/area/saitama`, position: 3 },
          { name: '大宮盆栽村', url: `${SITE_URL}${PATH}`, position: 4 },
        ]}
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
      <PageHeading
        eyebrow="埼玉県さいたま市北区"
        photo={heroPhoto('/images/articles/photos/bonsai-exhibition-viewing-guide-1.jpg', '展示された盆栽')}
        title="大宮盆栽村の楽しみ方"
        lead="1920年代から盆栽園が集まる、さいたま市の静かな住宅地です。東京から電車で約35分。盆栽美術館と盆栽園を歩いてめぐれます。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '盆栽園', href: '/gardens' }, { label: '埼玉県', href: '/gardens/area/saitama' }, { label: '大宮盆栽村' }]}
      />

      <nav aria-label="このページの内容" className="mt-8 flex flex-wrap gap-2 lg:mt-10">
        {[['#access', '行き方'], ['#museum', '盆栽美術館'], ['#gardens', '6つの盆栽園'], ['#festival', '大盆栽まつり'], ['#events', 'これからの盆栽展'], ['#manners', '見学のマナー']].map(([href, label]) => (
          <a key={href} href={href} className="inline-flex min-h-10 items-center border border-line bg-white px-3.5 text-[13px] text-ink hover:border-ink">{label}</a>
        ))}
      </nav>

      <section aria-labelledby="access" className="mt-12 lg:mt-16">
        <SectionTitle><span id="access">行き方</span></SectionTitle>
        <p className={`mt-3 max-w-[760px] ${p}`}>東京駅から電車で約35分。美術館と盆栽園は、どれも歩いて数分の範囲にあります。</p>
        <Facts
          rows={[
            { k: '土呂駅（とろ）', v: 'JR宇都宮線（上野東京ライン）。東京駅から約36分。東口から大宮盆栽美術館まで徒歩約5分。' },
            { k: '大宮公園駅', v: '東武アーバンパークライン。大宮駅から2駅。大宮盆栽美術館まで徒歩約10分。' },
          ]}
        />
      </section>

      <section aria-labelledby="museum" className="mt-12 lg:mt-16">
        <SectionTitle><span id="museum">大宮盆栽美術館</span></SectionTitle>
        <p className={`mt-3 max-w-[760px] ${p}`}>さいたま市が運営する、世界で初めての公立の盆栽美術館です。名品の盆栽・盆器・水石を、季節ごとに入れ替えて展示しています。はじめて訪ねるなら、ここから回ると盆栽の見方がつかめます。</p>
        <Facts
          rows={[
            { k: '開館時間', v: '3〜10月 9:00〜16:30、11〜2月 9:00〜16:00（入館は閉館の30分前まで）' },
            { k: '休館日', v: '木曜日（祝日の場合は開館）、12月29日〜1月3日、展示替えの期間' },
            { k: '観覧料', v: '一般310円、高校生・大学生・65歳以上150円、小中学生100円' },
            { k: '住所', v: 'さいたま市北区土呂町2-24-3' },
            { k: '公式サイト', v: <External href="https://omiyabonsai.jp/museum">omiyabonsai.jp</External> },
          ]}
        />
        <p className="mt-4 border-l-2 border-gold bg-gold-light px-4 py-3 text-[13.5px] leading-[1.8] text-ink"><strong>臨時休館：</strong>照明工事のため、2027年1月14日〜2月7日は休館します。休館日が増える場合もあるとのことなので、冬に訪ねるときは公式サイトで確かめてください。</p>
        <p className="mt-3 text-[13.5px] leading-[1.8] text-ink-soft">主な展示は撮影できません。撮影できる場所が決められています。</p>
      </section>

      <section aria-labelledby="gardens" className="mt-12 lg:mt-16">
        <SectionTitle><span id="gardens">見学できる6つの盆栽園</span></SectionTitle>
        <p className={`mt-3 max-w-[760px] ${p}`}>大宮盆栽村の盆栽組合の6園は、無料で見学できます。多くの園は木曜日と不定期の休みがあり、開いている時間も園ごとに違います（おおむね9時ごろから夕方まで）。</p>
        <ul className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GARDENS.map(g => {
            const page = ourPage(g.name)
            return (
              <li key={g.name} className="flex flex-col border border-line bg-white px-4 py-4">
                <p className="flex items-baseline gap-2"><span className="font-mincho text-[18px] font-bold text-ink">{g.name}</span><span className="text-[11.5px] text-ink-muted">{g.kana}</span></p>
                <p className="text-[11.5px] text-gold-dark">{g.since}</p>
                <p className="mt-1.5 text-[13.5px] leading-[1.75] text-ink-soft">{g.note}</p>
                {page && <Link href={`/gardens/${page.id}`} className="mt-auto inline-flex min-h-11 items-center pt-2 text-[13px] text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">所在地・地図を見る ›</Link>}
              </li>
            )
          })}
        </ul>
        <p className="mt-4 text-[13px] text-ink-soft">各園の詳しい案内と地図：<External href="https://omiyabonsai.jp/gardens">omiyabonsai.jp/gardens</External>　・　<Link href="/gardens/area/saitama" className="border-b border-ink text-ink">埼玉県の盆栽園をすべて見る</Link></p>
      </section>

      <section aria-labelledby="festival" className="mt-12 lg:mt-16">
        <SectionTitle><span id="festival">大盆栽まつり（5月3〜5日）</span></SectionTitle>
        <p className={`mt-3 max-w-[760px] ${p}`}>毎年ゴールデンウィークに、盆栽村全体が盆栽の市になります。樹・鉢・道具が並び、市民の盆栽展も開かれます。入場無料、9時〜17時。2025年は3日間で約8万人が訪れました。2027年の日程はまだ発表されていませんが、例年5月3〜5日に開かれています。</p>
      </section>

      <section aria-labelledby="events" className="mt-12 lg:mt-16">
        <SectionTitle action={<Link href="/events" className="border-b border-ink pb-0.5 text-[13px] text-ink">盆栽展をすべて見る</Link>}><span id="events">これからの大宮の盆栽展</span></SectionTitle>
        {events.length > 0 ? (
          <ul className="mt-4 border-t border-line">
            {events.map(e => (
              <li key={e.id} className="border-b border-line">
                <Link href={eventHref(e.slug)} className="group flex min-h-[60px] items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block font-mincho text-[16px] font-bold text-ink group-hover:text-gold-dark">{e.title}</span>
                    <span className="block text-[12.5px] text-ink-muted">{eventDateText(e, true)}{e.venue_name ? `・${e.venue_name}` : ''}</span>
                  </span>
                  <span className="text-ink-muted" aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`mt-3 ${p}`}>いま予定の分かっている盆栽展はありません。<Link href="/events" className="border-b border-ink text-ink">全国の盆栽展</Link>から探せます。</p>
        )}
      </section>

      <section aria-labelledby="manners" className="mt-12 lg:mt-16">
        <SectionTitle><span id="manners">見学のマナー</span></SectionTitle>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[14.5px] leading-[1.9] text-ink-soft">
          <li>盆栽園は樹を育てる場であり、家族の住まいでもあります。お店の方にあいさつし、静かに見学します。</li>
          <li>樹・鉢・棚には触れないようにします。</li>
          <li>園の中での撮影は基本的にできません。撮りたいときは必ずたずねます。</li>
          <li>気に入った樹は買うこともできます。持ち帰ってからの世話は<Link href="/hajimete" className="border-b border-ink text-ink">はじめての1か月</Link>が参考になります。</li>
        </ul>
      </section>

      <section aria-labelledby="faq" className="mt-12 lg:mt-16">
        <SectionTitle><span id="faq">よくある質問</span></SectionTitle>
        <dl className="mt-4 border-t border-line">
          {FAQ.map(f => (
            <div key={f.q} className="border-b border-line py-4">
              <dt className="font-mincho text-[16px] font-bold text-ink">{f.q}</dt>
              <dd className={`mt-1.5 ${p}`}>{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-[12px] leading-[1.8] text-ink-muted">2026年11月に確認した情報です。開館時間・料金・日程は変わることがあるため、出かける前に公式サイトで確かめてください。出典：さいたま市、大宮盆栽村（omiyabonsai.jp）、観光庁。<Link href="/en/omiya-bonsai-village" lang="en" className="ml-1 border-b border-line">English</Link></p>
      </section>

      <RelatedTools hrefs={['/teire', '/osusume', '/hajimete']} />
    </div>
  )
}
