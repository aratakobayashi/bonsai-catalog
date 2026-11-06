import type { Metadata } from 'next'
import Link from 'next/link'
import { getCatalogProducts } from '@/lib/catalog-data'
import { categoryFilters, filterProducts, parseFilters } from '@/lib/catalog'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { BAND_MIN_ITEMS, PRICE_BANDS, bandProducts } from '@/lib/price-bands'
import { SITE_URL } from '@/lib/site'
import { formatPrice } from '@/lib/utils'
import { heroPhoto } from '@/lib/hero-photo'
import { priceStats } from '@/components/catalog/CategoryPriceGuide'
import { AmazonSearchLink } from '@/components/catalog/AmazonSearchLink'
import { PriceRangeChart, type PriceRangeRow } from '@/components/nedan/PriceRangeChart'
import { TREE_GROUP_BY_SLUG } from '@/app/products/category/[slug]/CategoryView'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { RelatedTools } from '@/components/layout/RelatedTools'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'

// 盆栽の値段のまとめ（/nedan）。「盆栽 値段」「盆栽 相場」で探す人に、樹種ごとの価格帯と、予算・大きさでの考え方を答える
// 数字はビルドした時点の掲載商品（楽天市場）から計算する。商品が少ない樹種（8件未満）は図に出さない

export const metadata: Metadata = {
  title: '盆栽の値段・相場｜樹種ごとの価格帯と、大きさ・予算で選ぶときの目安 - 盆栽コレクション',
  description: '盆栽の値段はいくらくらい？掲載中の約2,000件の盆栽から、黒松・真柏・もみじ・桜など樹種ごとの価格の中央値とよくある価格帯、ミニ・小品・中品の大きさ別の価格、3,000円以下・1万円以上など予算ごとに選べる樹種をまとめました。値段が変わる理由と、はじめての一鉢・贈り物の予算の考え方も紹介します。',
  alternates: { canonical: '/nedan' },
}

// 値段が変わる理由（一般的な傾向）
const FACTORS = [
  { title: '大きさ', body: '樹高と鉢が大きくなるほど高くなります。ミニ（〜15cmほど）は数千円から、中品（〜45cmほど）は数万円になることもあります。' },
  { title: '樹齢・幹の太さ', body: '同じ大きさでも、幹が太く年数を重ねた樹ほど高くなります。太い幹は、育てるのに長い年月がかかるためです。' },
  { title: '樹形の仕上がり', body: '枝の配置や幹の流れが整い、すぐ飾れる「仕上がった」樹は高く、これから形を作る「素材」は手ごろです。' },
  { title: '鉢と付属品', body: '作家ものや焼き物の鉢、化粧箱・ラッピング付きのものは、そのぶん価格が上がります。' },
  { title: '花・実のつき', body: '花もの・実ものは、花芽や実がついた時期に価格が上がりやすく、見頃を過ぎると手ごろになることがあります。' },
]

const FAQ = (overallMedian: string, low: string, high: string, cheapest: string) => [
  { q: '盆栽の値段の相場はいくらですか？', a: `このサイトに掲載中の盆栽では、中央値が${overallMedian}、半分ほどが${low}〜${high}の間に入ります。樹種・大きさ・樹齢・鉢で大きく変わり、数千円のミニ盆栽から、数十万円の名品まであります。` },
  { q: 'はじめての盆栽は、いくらくらいのものがよいですか？', a: `3,000〜5,000円ほどのミニ・小品の盆栽が始めやすい価格です。${cheapest}などは、比較的手ごろな価格で選べます。最初は高価な樹より、育てやすい樹種で水やりの感覚をつかむのがおすすめです。` },
  { q: '贈り物の盆栽は、いくらくらいが多いですか？', a: '気軽な贈り物なら3,000〜5,000円、改まったお祝いや目上の方へは5,000〜10,000円ほどがよく選ばれます。鉢付き・苔付きで、ラッピングや説明書の付いたものを選ぶと安心です。' },
  { q: '通販で盆栽を買うとき、価格以外に何を確かめればよいですか？', a: '送料込みかどうか、写真の樹が届く「現品」か、樹高や鉢の大きさ、届く時期を確かめます。送料で実際の支払い額が大きく変わることがあります。' },
]

export default async function NedanPage() {
  const all = await getCatalogProducts()
  // 樹種のカテゴリだけ（ミニ盆栽・実もの盆栽は樹種ではなく、ほかの樹種と重なるため除く）
  const speciesCategories = SHOP_CATEGORIES.filter(c => c.group === 'tree' && c.slug !== 'mini' && c.slug !== 'mimono')
  const rows: PriceRangeRow[] = speciesCategories
    .flatMap((c): PriceRangeRow[] => {
      const stats = priceStats(filterProducts(all, categoryFilters(c.slug)))
      if (!stats) return []
      return [{
        slug: c.slug,
        name: c.name,
        group: TREE_GROUP_BY_SLUG[c.slug] ?? (c.slug === 'kokedama' ? '苔玉' : null),
        count: stats.count,
        median: stats.median,
        low: stats.low,
        high: stats.high,
        href: `/products/category/${c.slug}`,
      }]
    })
    .sort((a, b) => a.median - b.median)

  const overall = priceStats(filterProducts(all, parseFilters({ type: 'tree' })))
  const asOf = overall?.asOf ? `${overall.asOf}時点` : '取得時点'
  const cheapest = rows.slice(0, 3).map(r => r.name)

  // 予算ごとに、商品の多い樹種（固定の一覧ページがあるものだけ）
  const bands = PRICE_BANDS.map(band => {
    const species = speciesCategories
      .map(c => ({ slug: c.slug, name: c.name, count: bandProducts(all, c.slug, band).length }))
      .filter(s => s.count >= BAND_MIN_ITEMS)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
    const total = filterProducts(all, parseFilters({ type: 'tree', ...(band.min ? { min: String(band.min) } : {}), ...(band.max ? { max: String(band.max) } : {}) })).length
    return { band, species, total }
  })

  const faq = overall ? FAQ(formatPrice(overall.median), formatPrice(overall.low), formatPrice(overall.high), cheapest.join('・')) : []
  const pageUrl = `${SITE_URL}/nedan`

  return (
    <div className={`${CONTAINER} pb-16 lg:pb-24`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽の値段・相場', url: pageUrl, position: 2 },
        ]}
      />
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            }),
          }}
        />
      )}
      <PageHeading
        eyebrow="値段を知る"
        photo={heroPhoto('/images/selections/photos/bonsai-under-3000.jpg', '小さな鉢に植えられた盆栽')}
        title="盆栽の値段・相場"
        lead="盆栽はいくらくらいで買える？掲載中の盆栽から、樹種ごとの価格帯と、大きさ・予算で選ぶときの目安をまとめました。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '盆栽の値段・相場' }]}
      />

      {/* 全体の数字 */}
      {overall && (
        <section aria-labelledby="overall" className="mt-8 lg:mt-10">
          <h2 id="overall" className="sr-only">盆栽全体の価格</h2>
          <dl className="grid grid-cols-2 border-l border-t border-line bg-white lg:grid-cols-4">
            {[
              { k: '盆栽の値段の中央値', v: formatPrice(overall.median), note: `掲載中の${overall.count.toLocaleString()}件` },
              { k: 'よくある価格帯', v: `${formatPrice(overall.low)}〜${formatPrice(overall.high)}`, note: '中央の半分が入る範囲' },
              { k: 'いちばん手ごろな樹種', v: rows[0]?.name ?? '—', note: rows[0] ? `中央値 ${formatPrice(rows[0].median)}` : '' },
              { k: '送料込みの商品', v: `約${overall.freeShippingShare}%`, note: '支払い額は送料で変わる' },
            ].map(item => (
              <div key={item.k} className="border-b border-r border-line px-4 py-4 lg:px-5">
                <dt className="text-[11.5px] text-ink-muted">{item.k}</dt>
                <dd className="mt-1 font-mincho text-[20px] font-bold leading-tight text-ink lg:text-[24px]">{item.v}</dd>
                <dd className="mt-1 text-[11px] text-ink-muted">{item.note}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[11px] text-ink-muted">楽天市場の掲載商品から計算した目安です（{asOf}）。価格は変わることがあります。</p>
        </section>
      )}

      {/* 樹種ごとの価格帯 */}
      {rows.length > 0 && (
        <section aria-labelledby="by-species" className="pt-12 lg:pt-16">
          <SectionTitle><span id="by-species">樹種ごとの価格帯</span></SectionTitle>
          <p className="mt-2 max-w-[760px] text-[13.5px] leading-[1.9] text-ink-soft">
            中央値の安い順に並べています。帯が短い樹種は値段がそろっていて、長い樹種は大きさや仕上がりで値段の幅が大きい樹種です。樹種を押すと、その樹種の商品と大きさ別の価格を見られます。
          </p>
          <div className="mt-5">
            <PriceRangeChart rows={rows} />
          </div>
        </section>
      )}

      {/* 大きさ別 */}
      {overall && overall.bySize.length >= 2 && (
        <section aria-labelledby="by-size" className="pt-12 lg:pt-16">
          <SectionTitle><span id="by-size">大きさ別の値段</span></SectionTitle>
          <p className="mt-2 max-w-[760px] text-[13.5px] leading-[1.9] text-ink-soft">同じ樹種でも、大きさで値段は大きく変わります。置き場所と予算に合わせて、まず大きさを決めると選びやすくなります。</p>
          <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {overall.bySize.map(s => (
              <li key={s.label} className="border border-line bg-white px-4 py-4">
                <p className="text-[13px] font-bold text-ink">{s.label}</p>
                <p className="mt-2 font-mincho text-[22px] font-bold text-ink">{formatPrice(s.median)}</p>
                <p className="text-[11px] text-ink-muted">中央値・{s.count.toLocaleString()}件</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 予算から選ぶ */}
      <section aria-labelledby="by-budget" className="pt-12 lg:pt-16">
        <SectionTitle><span id="by-budget">予算から選ぶ</span></SectionTitle>
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          {bands.map(({ band, species, total }) => (
            <div key={band.slug} className="border border-line bg-white px-4 py-5 lg:px-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-mincho text-[18px] font-bold text-ink">{band.label}</h3>
                <span className="text-[11.5px] text-ink-muted">{total.toLocaleString()}件</span>
              </div>
              <p className="mt-2 text-[13px] leading-[1.85] text-ink-soft">{band.note}</p>
              {species.length > 0 && (
                <>
                  <p className="mt-3 text-[11.5px] text-ink-muted">この価格帯で選びやすい樹種</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {species.map(s => (
                      <Link key={s.slug} href={`/products/category/${s.slug}/${band.slug}`} className="inline-flex min-h-10 items-center border border-line bg-paper px-3 text-[13px] text-ink hover:border-ink">
                        {s.name}<span className="ml-1.5 text-[11px] text-ink-muted">{s.count}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 値段が変わる理由 */}
      <section aria-labelledby="factors" className="pt-12 lg:pt-16">
        <SectionTitle><span id="factors">値段が変わる5つの理由</span></SectionTitle>
        <ol className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {FACTORS.map((f, i) => (
            <li key={f.title} className="border-t-2 border-sumi bg-white px-4 pb-4 pt-3">
              <p className="font-mincho text-[13px] text-gold-dark">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-1 font-mincho text-[16px] font-bold text-ink">{f.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-[1.85] text-ink-soft">{f.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* よくある質問 */}
      {faq.length > 0 && (
        <section aria-labelledby="faq" className="pt-12 lg:pt-16">
          <SectionTitle><span id="faq">よくある質問</span></SectionTitle>
          <dl className="mt-3 border-t border-line">
            {faq.map(f => (
              <div key={f.q} className="border-b border-line py-4">
                <dt className="text-[14.5px] font-bold text-ink">{f.q}</dt>
                <dd className="mt-1.5 text-[13.5px] leading-[1.9] text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* 次に */}
      <section aria-labelledby="next" className="pt-12 lg:pt-16">
        <SectionTitle><span id="next">値段が分かったら</span></SectionTitle>
        <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] border-t border-line sm:grid-cols-2 sm:gap-x-8">
          {[
            { href: '/products?type=tree&sort=price_asc', label: '盆栽を安い順に見る', note: '掲載中の盆栽を、価格の安い順に' },
            { href: '/shindan', label: 'かんたん盆栽診断', note: '置き場所と予算から、合う盆栽を3つに絞る' },
            { href: '/okurimono', label: '贈り物ナビ', note: '相手・場面・予算から選ぶ' },
            { href: '/selection/bonsai-under-3000', label: '3,000円以下の盆栽', note: '手ごろに始められる一鉢の特集' },
          ].map(l => (
            <li key={l.href} className="border-b border-line">
              <Link href={l.href} className="group flex min-h-[56px] items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-mincho text-[15px] font-bold text-ink group-hover:text-gold-dark">{l.label}</span>
                  <span className="block text-[12px] text-ink-muted">{l.note}</span>
                </span>
                <span className="text-ink-muted" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
        <AmazonSearchLink keyword="盆栽" label="Amazonでも盆栽の価格を見る" place="nedan_amazon" className="mt-6" />
      </section>

      <RelatedTools hrefs={['/shindan', '/okurimono', '/hajimete']} />
    </div>
  )
}
