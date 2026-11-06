import type { Metadata } from 'next'
import Link from 'next/link'
import { getCatalogProducts } from '@/lib/catalog-data'
import { OSUSUME_THEMES, rankOsusume } from '@/lib/osusume'
import { priceStats } from '@/components/catalog/CategoryPriceGuide'
import { SITE_URL } from '@/lib/site'
import { formatPrice } from '@/lib/utils'
import { heroPhoto } from '@/lib/hero-photo'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import { OsusumeMethod } from '@/components/osusume/OsusumeParts'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { RelatedTools } from '@/components/layout/RelatedTools'
import { CONTAINER, PageHeading } from '@/components/ui/design'

// 盆栽のおすすめ（/osusume）。特集ごとの上位3点と、各特集のページへの入口
export const metadata: Metadata = {
  title: '盆栽のおすすめ｜初心者・室内・予算・贈り物別に、レビューで選んだ一鉢 - 盆栽コレクション',
  description: '盆栽のおすすめを、初心者向け・室内向け・3,000円以下・5,000円前後・贈り物向けに分けて紹介します。掲載中の盆栽を、レビューの評価と件数、樹種の育てやすさなどで点数にして選んでいます。点数の付け方も公開しています。',
  alternates: { canonical: '/osusume' },
}

export default async function OsusumeIndexPage() {
  const all = await getCatalogProducts()
  const themes = OSUSUME_THEMES.map(theme => ({ theme, top: rankOsusume(all, theme, 3) }))
  const updated = priceStats(all)?.asOf ?? null

  return (
    <div className={`${CONTAINER} pb-16 lg:pb-24`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽のおすすめ', url: `${SITE_URL}/osusume`, position: 2 },
        ]}
      />
      <PageHeading
        eyebrow="データで選ぶ"
        photo={heroPhoto('/images/selections/photos/beginner-mini-bonsai.jpg', '小さな鉢の盆栽')}
        title="盆栽のおすすめ"
        lead="掲載中の盆栽を、レビューの評価と件数、樹種の育てやすさなどで点数にして選びました。目的に合う特集から選んでください。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '盆栽のおすすめ' }]}
      />
      <PrDisclosure className="mt-5" />

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 lg:mt-8 lg:grid-cols-2 lg:gap-6">
        {themes.map(({ theme, top }) => (
          <section key={theme.slug} aria-labelledby={`t-${theme.slug}`} className="border border-line bg-white">
            <div className="px-4 pb-3 pt-4 lg:px-6 lg:pt-5">
              <h2 id={`t-${theme.slug}`} className="font-mincho text-[19px] font-bold tracking-[0.04em] text-ink lg:text-[21px]">{theme.title}</h2>
              <p className="mt-1.5 text-[12.5px] leading-[1.8] text-ink-soft">{theme.lead}</p>
            </div>
            <ol className="grid grid-cols-3 gap-2.5 px-4 lg:gap-3 lg:px-6" data-list={`osusume_hub_${theme.slug}`}>
              {top.map((item, i) => (
                <li key={item.product.id} data-card={item.product.id}>
                  <Link href={`/products/${item.product.id}`} prefetch={false} className="group block">
                    <span className="relative block aspect-square overflow-hidden bg-paper-deep">
                      <ProductThumb src={item.product.imageUrl} alt={item.product.displayName || item.product.name} sizes="(max-width: 1023px) 30vw, 170px" size={340} />
                      <span className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center font-mincho text-[14px] font-bold text-white ${i === 0 ? 'bg-gold-dark' : 'bg-sumi/85'}`}>{i + 1}</span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-[12px] leading-[1.5] text-ink group-hover:text-gold-dark">{item.product.displayName || item.product.name}</span>
                    <span className="block text-[12px] font-bold text-ink">{formatPrice(item.product.price)}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link href={`/osusume/${theme.slug}`} className="mt-4 flex min-h-[52px] items-center justify-between border-t border-line px-4 text-[13.5px] text-ink hover:text-gold-dark lg:px-6">
              {theme.label}のおすすめ20選を見る<span aria-hidden="true">›</span>
            </Link>
          </section>
        ))}
      </div>

      <OsusumeMethod updated={updated} />
      <RelatedTools hrefs={['/nedan', '/shindan', '/okurimono']} />
    </div>
  )
}
