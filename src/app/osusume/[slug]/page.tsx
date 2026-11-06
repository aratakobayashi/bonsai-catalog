import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCatalogProducts } from '@/lib/catalog-data'
import { OSUSUME_THEMES, getOsusumeTheme, rankOsusume } from '@/lib/osusume'
import { priceStats } from '@/components/catalog/CategoryPriceGuide'
import { SITE_URL } from '@/lib/site'
import { OsusumeRow } from '@/components/osusume/OsusumeRow'
import { OsusumeMethod, OsusumeTabs } from '@/components/osusume/OsusumeParts'
import { AmazonSearchLink } from '@/components/catalog/AmazonSearchLink'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { Breadcrumbs, CONTAINER } from '@/components/ui/design'

// おすすめの特集ごとのページ（/osusume/beginner など）。上位20点を順位つきで並べる
interface Props { params: { slug: string } }

export const dynamicParams = false
export function generateStaticParams() {
  return OSUSUME_THEMES.map(t => ({ slug: t.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const theme = getOsusumeTheme(params.slug)
  if (!theme) return {}
  return { title: theme.metaTitle, description: theme.description, alternates: { canonical: `/osusume/${theme.slug}` } }
}

const AMAZON_KEYWORD: Record<string, string> = {
  beginner: '盆栽 初心者',
  indoor: '盆栽 室内',
  'under-3000': 'ミニ盆栽',
  '3000-5000': '盆栽 苔付き',
  gift: '盆栽 ギフト',
}

export default async function OsusumeThemePage({ params }: Props) {
  const theme = getOsusumeTheme(params.slug)
  if (!theme) notFound()
  const all = await getCatalogProducts()
  const items = rankOsusume(all, theme, 20)
  const updated = priceStats(all)?.asOf ?? null
  const pageUrl = `${SITE_URL}/osusume/${theme.slug}`

  return (
    <div className={`${CONTAINER} pb-16 lg:pb-24`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽のおすすめ', url: `${SITE_URL}/osusume`, position: 2 },
          { name: theme.title, url: pageUrl, position: 3 },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: theme.title,
            itemListOrder: 'https://schema.org/ItemListOrderDescending',
            itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/products/${it.product.id}`, name: it.product.name })),
          }),
        }}
      />
      <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '盆栽のおすすめ', href: '/osusume' }, { label: theme.label }]} className="pt-4 lg:pt-6" />
      <p className="mt-5 flex items-center gap-3 text-[11px] tracking-[0.22em] text-gold-dark lg:mt-8 lg:text-xs">データで選ぶ<span className="h-px w-10 bg-gold" aria-hidden="true" /></p>
      <h1 className="mt-2 font-mincho text-[25px] font-bold leading-snug tracking-[0.06em] text-ink lg:text-[34px]">{theme.title}</h1>
      <p className="mt-3 max-w-[760px] text-[14px] leading-[1.9] text-ink-soft lg:text-[15px]">
        {theme.lead}
        {updated && <span className="text-ink-muted">（{updated}時点のデータ）</span>}
      </p>
      <div className="mt-5"><OsusumeTabs current={theme.slug} /></div>
      <PrDisclosure className="mt-4" />

      <ol className="mt-4 border-t border-ink" data-list={`osusume_${theme.slug}`}>
        {items.map((item, i) => (
          <OsusumeRow key={item.product.id} item={item} rank={i + 1} place={`osusume_${theme.slug}`} priority={i < 2} />
        ))}
      </ol>
      {items.length === 0 && <p className="mt-6 border-y border-line py-8 text-center text-sm text-ink-muted">いま掲載している商品から、条件に合うものが見つかりませんでした。</p>}
      <p className="mt-3 text-[11px] leading-[1.7] text-ink-muted">価格・送料・在庫は取得時点の情報です。最新の情報は各ショップの商品ページでご確認ください。</p>

      <OsusumeMethod updated={updated} />

      <div className="mt-8 flex flex-wrap items-start gap-x-6 gap-y-4">
        <Link href="/nedan" className="inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">盆栽の値段・相場を見る ›</Link>
        <Link href="/shindan" className="inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">かんたん盆栽診断で絞り込む ›</Link>
        <AmazonSearchLink keyword={AMAZON_KEYWORD[theme.slug] ?? '盆栽'} label={`Amazonでも「${AMAZON_KEYWORD[theme.slug] ?? '盆栽'}」を探す`} place={`osusume_${theme.slug}_amazon`} />
      </div>
    </div>
  )
}
