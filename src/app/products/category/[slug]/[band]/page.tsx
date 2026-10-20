import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCatalogProducts } from '@/lib/catalog-data'
import { getShopCategory } from '@/lib/shop-categories'
import { PRICE_BANDS, bandPages, bandProducts, getPriceBand } from '@/lib/price-bands'
import { SIZE_OPTIONS } from '@/lib/catalog'
import { SITE_URL } from '@/lib/site'
import { formatPrice } from '@/lib/utils'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { AmazonSearchLink } from '@/components/catalog/AmazonSearchLink'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { Breadcrumbs, CONTAINER } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'

// 樹種×予算の一覧（例：/products/category/kuromatsu/3000-5000）。「黒松 盆栽 5000円」などで探す人向けの固定のページ
// 商品が十分にある組み合わせだけ作る（src/lib/price-bands.ts）。並びはカテゴリの一覧と同じおすすめ順

interface Props { params: { slug: string; band: string } }

export const dynamicParams = false
const LIMIT = 40

export async function generateStaticParams() {
  return bandPages(await getCatalogProducts())
}

const subjectOf = (name: string) => (/盆栽|苔玉|もの$/.test(name) ? name : `${name}の盆栽`)

export function generateMetadata({ params }: Props): Metadata {
  const category = getShopCategory(params.slug)
  const band = getPriceBand(params.band)
  if (!category || !band) return {}
  const subject = subjectOf(category.name)
  return {
    title: `${band.label}の${subject}｜価格帯で選ぶ通販の一覧 - 盆栽コレクション`,
    description: `${band.label}で買える${subject}を、楽天市場の掲載商品からまとめました。この価格帯で選べる大きさ・鉢の傾向と、大きさ別の価格、選ぶときに確かめたい点を掲載しています。`,
    alternates: { canonical: `/products/category/${category.slug}/${band.slug}` },
  }
}

export default async function BandPage({ params }: Props) {
  const category = getShopCategory(params.slug)
  const band = getPriceBand(params.band)
  if (!category || !band) notFound()
  const all = await getCatalogProducts()
  const products = bandProducts(all, category.slug, band)
  const subject = subjectOf(category.name)
  const prices = products.map(p => p.price).sort((a, b) => a - b)
  const median = prices[Math.floor(prices.length / 2)] ?? 0
  const freeShare = products.length ? Math.round((products.filter(p => p.freeShipping).length / products.length) * 100) : 0
  const sizes = SIZE_OPTIONS.map(o => ({ label: o.label, count: products.filter(p => p.sizeCategory === o.value).length })).filter(s => s.count > 0)
  const pages = new Set(bandPages(all).filter(p => p.slug === category.slug).map(p => p.band))
  const otherBands = PRICE_BANDS.filter(b => b.slug !== band.slug && pages.has(b.slug))
  const basePath = `/products/category/${category.slug}`
  const pageUrl = `${SITE_URL}${basePath}/${band.slug}`
  const shown = products.slice(0, LIMIT)

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽・鉢・道具を探す', url: `${SITE_URL}/products`, position: 2 },
          { name: category.name, url: `${SITE_URL}${basePath}`, position: 3 },
          { name: band.label, url: pageUrl, position: 4 },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${band.label}の${subject}`,
            itemListElement: shown.slice(0, 20).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/products/${p.id}`, name: p.name })),
          }),
        }}
      />
      <div className={`${CONTAINER} pb-16 lg:pb-24`}>
        <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '盆栽を探す', href: '/products' }, { label: category.name, href: basePath }, { label: band.label }]} />
        <h1 className="mt-3 font-mincho text-[24px] font-bold leading-snug tracking-[0.06em] text-ink lg:text-[32px]">
          {band.label}の{subject}
        </h1>
        <p className="mt-3 max-w-[760px] text-[14px] leading-[2] text-ink-soft lg:text-[15px]">{band.note}</p>

        <dl className="mt-5 grid max-w-[760px] grid-cols-2 border-l border-t border-line sm:grid-cols-4">
          {[
            { k: '掲載中', v: `${products.length.toLocaleString()}件` },
            { k: '中央値', v: formatPrice(median) },
            { k: '送料込み', v: `約${freeShare}%` },
            { k: '多い大きさ', v: sizes.sort((a, b) => b.count - a.count)[0]?.label.replace(/（.*）/, '') ?? '—' },
          ].map(item => (
            <div key={item.k} className="border-b border-r border-line px-3 py-3">
              <dt className="text-[11px] text-ink-muted">{item.k}</dt>
              <dd className="mt-0.5 text-[14px] font-bold text-ink">{item.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[11px] text-ink-muted">楽天市場の掲載商品から計算した目安です。価格は取得時点の情報で、変わることがあります。</p>

        {otherBands.length > 0 && (
          <nav aria-label="ほかの価格帯" className="mt-5 flex flex-wrap gap-2">
            {otherBands.map(b => (
              <Link key={b.slug} href={`${basePath}/${b.slug}`} className="inline-flex min-h-11 items-center border border-line bg-white px-3.5 text-[13px] text-ink hover:border-ink">
                {b.label} ›
              </Link>
            ))}
            <Link href={basePath} className="inline-flex min-h-11 items-center border border-line bg-white px-3.5 text-[13px] text-ink hover:border-ink">すべての価格の{category.name} ›</Link>
          </nav>
        )}

        <section aria-labelledby="band-list" className="pt-8 lg:pt-12">
          <h2 id="band-list" className="font-mincho text-[18px] font-bold tracking-[0.05em] text-ink lg:text-[21px]">掲載中の{subject}（{band.label}）</h2>
          <PrDisclosure compact className="mt-2" />
          <div data-list="price_band" className="mt-4 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-3.5 gap-y-7 md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] lg:gap-6">
            {shown.map((product, i) => (
              <CatalogProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
          {products.length > LIMIT && (
            <Link href={`${basePath}?${band.min ? `min=${band.min}` : ''}${band.min && band.max ? '&' : ''}${band.max ? `max=${band.max}` : ''}`} className="mt-6 flex min-h-[52px] items-center justify-center border border-ink text-[14px] text-ink hover:border-gold-dark hover:text-gold-dark">
              残りの{(products.length - LIMIT).toLocaleString()}件も見る（並べ替え・絞り込み）
            </Link>
          )}
          <AmazonSearchLink keyword={`${category.name.split('・')[0]} 盆栽`} label={`Amazonでも「${category.name.split('・')[0]} 盆栽」を探す`} place="band_amazon" className="mt-6" />
        </section>

        <section aria-labelledby="band-check" className="mt-12 border-t border-ink pt-6 lg:mt-16">
          <h2 id="band-check" className="font-mincho text-[18px] font-bold tracking-[0.05em] text-ink lg:text-[21px]">選ぶときに確かめたいこと</h2>
          <ul className="mt-3 border-t border-line text-[13.5px] leading-[1.9] text-ink-soft">
            {[
              '樹の高さ（樹高）と、鉢の大きさ。写真だけでは大きさが分かりにくいので、商品説明の数字を確かめます。',
              '写真が届く樹そのものか、イメージ写真か。「現品」「一点もの」と書かれていれば、写真の樹が届きます。',
              '送料と届く時期。送料込みかどうかで、実際の支払い額が変わります。',
              '鉢・苔・受け皿・説明書が付くか。贈り物にするなら、ラッピングやのしの対応も確かめます。',
            ].map(t => (
              <li key={t} className="border-b border-line py-3">{t}</li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] leading-[1.9] text-ink-soft">
            {category.name}の育て方や見頃は<Link href={basePath} className="mx-1 border-b border-ink text-ink">{category.name}の一覧</Link>に、価格の目安とよくある質問もまとめています。
          </p>
        </section>
      </div>
    </>
  )
}
