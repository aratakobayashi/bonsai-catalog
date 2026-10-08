import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SELECTIONS, getSelection, pickSelectionProducts } from '@/lib/selections'
import { formatPrice, getSizeCategoryLabel } from '@/lib/utils'
import type { CatalogProduct } from '@/lib/catalog-model'
import { LEVEL_OPTIONS, SPECIES_OPTIONS, getCatalogProducts } from '@/lib/catalog'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import { SITE_URL } from '@/lib/site'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { Breadcrumbs, CONTAINER, Card, ChipLink, NavyPanel, Placeholder, SectionTitle, chipClass } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import type { Product } from '@/types'
import { SelectionThumb } from '@/components/selection/SelectionThumb'
import { SelectionCard } from '@/components/selection/SelectionCard'

interface SelectionPageProps {
  params: { slug: string }
}

// ビルド時に全特集の商品データを同時に取得すると接続が不安定になるため、初回アクセス時に生成する（ISR）
export const revalidate = 3600

export function generateStaticParams() {
  return []
}

export function generateMetadata({ params }: SelectionPageProps): Metadata {
  const selection = getSelection(params.slug)
  if (!selection) return {}
  return {
    title: selection.title,
    description: selection.description,
    alternates: { canonical: `/selection/${selection.slug}` },
    openGraph: {
      title: selection.h1,
      description: selection.description,
      type: 'article',
      url: `/selection/${selection.slug}`,
    },
  }
}

// 樹種カードから商品一覧へのリンク（特集ごと・項目名ごと）
const POINT_LINKS: Record<string, Record<string, { species: string; href: string }>> = {
  'new-year-bonsai': {
    松: { species: 'goyomatsu', href: '/products/category/goyomatsu' },
    梅: { species: 'ume', href: '/products/category/ume' },
    南天: { species: 'nanten', href: '/products/category/nanten' },
  },
  'bonsai-gift': {
    花を楽しんでほしい: { species: 'cat-hana', href: '/products?type=tree&species=cat-hana' },
    長く緑を楽しんでほしい: { species: 'cat-shohaku', href: '/products?type=tree&species=cat-shohaku' },
    季節の移ろいを楽しんでほしい: { species: 'cat-zouki', href: '/products?type=tree&species=cat-zouki' },
  },
}

// 「松（五葉松・黒松）：説明」の形の箇条書きを、名前・補足・説明に分ける
function parsePoint(point: string) {
  const i = point.indexOf('：')
  const label = i >= 0 ? point.slice(0, i) : ''
  const text = i >= 0 ? point.slice(i + 1) : point
  const m = label.match(/^(.+?)（(.+)）$/)
  return { name: m ? m[1] : label, sub: m ? m[2] : '', text }
}

function priceRangeBySize(products: CatalogProduct[]) {
  const bySize = new Map<string, number[]>()
  products.forEach(p => {
    const prices = bySize.get(p.sizeCategory) || []
    prices.push(p.price)
    bySize.set(p.sizeCategory, prices)
  })
  return Array.from(bySize.entries()).map(([size, prices]) => ({
    size,
    min: Math.min(...prices),
    max: Math.max(...prices),
    count: prices.length,
  }))
}

export default async function SelectionPage({ params }: SelectionPageProps) {
  const selection = getSelection(params.slug)
  if (!selection) notFound()

  const products = pickSelectionProducts(selection, await getCatalogProducts())
  const priceRanges = priceRangeBySize(products)
  const pageUrl = `${SITE_URL}/selection/${selection.slug}`
  const cards = products

  const pointLinks = POINT_LINKS[selection.slug] ?? {}
  const catalogLinks = selection.catalog
  const imageFor = (species: string): CatalogProduct | undefined => {
    const match = SPECIES_OPTIONS.find(o => o.value === species)?.match
    if (!match) return undefined
    return cards.find(p => p.imageUrl && match(p))
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: selection.listHeading,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/products/${product.id}`,
      name: product.name,
    })),
  }

  const [firstSection, ...restSections] = selection.sections

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: selection.h1, url: pageUrl, position: 2 },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <article>
        {/* 見出し（SP は写真が先） */}
        <header className="lg:mx-auto lg:w-full lg:max-w-[1280px] lg:px-10">
          <div className="flex flex-col-reverse gap-0 lg:grid lg:grid-cols-[1fr_520px] lg:items-center lg:gap-12 lg:pt-10">
            <div className="px-4 pt-4 lg:px-0 lg:pt-0">
              <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '特集', href: '/selection' }, { label: selection.shortTitle }]} className="hidden lg:block" />
              <div className="mt-0 flex items-center gap-2 text-xs tracking-[0.1em] text-gold-dark lg:mt-3">
                <span className="h-0.5 w-4 bg-gold" aria-hidden="true" />
                {selection.eyebrow}
              </div>
              <h1 className="mt-1.5 font-mincho text-[24px] font-bold leading-snug text-navy lg:mt-2 lg:text-[38px]">{selection.h1}</h1>
              <p className="mt-3 text-sm leading-[1.9] text-ink-soft lg:max-w-[560px] lg:text-[15px]">{selection.lead}</p>
              <PrDisclosure className="mt-4 border border-line bg-white lg:max-w-[560px]" />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden bg-[#f1eee8] lg:aspect-auto lg:h-[340px] lg:rounded-[14px]">
              <SelectionThumb selection={selection} priority className="absolute inset-0 h-full w-full" />
            </div>
          </div>
        </header>

        <div className={CONTAINER}>
          {/* 1つ目の節：樹種・選び方の要点をカードで */}
          {firstSection && (
            <section className="mt-8 lg:mt-12">
              <SectionTitle>{firstSection.heading}</SectionTitle>
              <div className="mt-2 space-y-2 lg:max-w-[820px]">
                {firstSection.paragraphs.map(paragraph => (
                  <p key={paragraph} className="text-sm leading-[1.9] text-ink-soft">{paragraph}</p>
                ))}
              </div>
              {firstSection.points && (
                <div className="mt-4 grid gap-3 lg:grid-cols-3 lg:gap-4">
                  {firstSection.points.map(point => {
                    const { name, sub, text } = parsePoint(point)
                    const link = pointLinks[name]
                    const image = link ? imageFor(link.species) : undefined
                    return (
                      <Card key={point} className="overflow-hidden">
                        {link && (
                          <div className="relative hidden h-[140px] bg-[#f1eee8] lg:block">
                            {image ? (
                              <ProductThumb src={image.imageUrl} alt={name} sizes="33vw" />
                            ) : (
                              <Placeholder className="absolute inset-0" />
                            )}
                          </div>
                        )}
                        <div className="flex gap-4 p-4 lg:block lg:px-[18px]">
                          {name && (
                            <div className="flex-none lg:flex lg:items-baseline lg:gap-2">
                              <span className={`font-mincho font-bold text-navy ${name.length <= 3 ? 'text-xl lg:text-[22px]' : 'text-[15px] lg:text-base'}`}>{name}</span>
                              {sub && <span className="hidden text-xs text-ink-muted lg:inline">{sub}</span>}
                            </div>
                          )}
                          <div className="min-w-0 lg:mt-1.5">
                            {sub && <div className="text-xs text-ink-muted lg:hidden">{sub}</div>}
                            <p className="text-[13px] leading-[1.7] text-ink">{text}</p>
                            {link && (
                              <Link href={link.href} className="mt-1.5 inline-block text-[13px] font-bold text-navy underline underline-offset-2 hover:text-gold-dark">
                                {name.length <= 3 ? `${name}の盆栽を見る →` : '商品を見る →'}
                              </Link>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* 残りの節：本文＋紺の案内 */}
          {restSections.map(section => (
            <section key={section.heading} className="mt-8 grid gap-4 lg:mt-12 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-10">
              <div>
                <SectionTitle>{section.heading}</SectionTitle>
                <div className="mt-2 space-y-2">
                  {section.paragraphs.map(paragraph => (
                    <p key={paragraph} className="text-sm leading-[1.9] text-ink-soft lg:text-[14.5px]">{paragraph}</p>
                  ))}
                </div>
                {section.points && (
                  <ul className="ml-5 mt-3 list-disc space-y-1.5 text-sm leading-relaxed text-ink-soft">
                    {section.points.map(point => <li key={point}>{point}</li>)}
                  </ul>
                )}
              </div>
              {section.aside && (
                <NavyPanel eyebrow={section.aside.eyebrow} title={section.aside.title} className="lg:px-[22px] lg:py-5">
                  <p className="mt-2 text-[13px] leading-[1.8] text-white/80">{section.aside.text}</p>
                </NavyPanel>
              )}
            </section>
          ))}

          {/* 掲載商品 */}
          <section className="mt-10 lg:mt-12">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h2 className="font-mincho text-lg font-bold text-navy lg:text-2xl">{selection.listHeading}</h2>
              {catalogLinks && (
                <>
                  <div className="order-last flex w-full flex-wrap gap-1.5 lg:order-none lg:w-auto">
                    <span className={chipClass(true)} aria-current="true">すべて</span>
                    {catalogLinks.chips.map(chip => (
                      <ChipLink key={chip.label} href={chip.href}>{chip.label}</ChipLink>
                    ))}
                  </div>
                  <Link href={catalogLinks.all} className="ml-auto text-[13px] font-bold text-navy underline underline-offset-2 hover:text-gold-dark">
                    一覧で絞り込む →
                  </Link>
                </>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {products.length}件を掲載（楽天市場・Amazon）。価格は取得時点の情報です。最新の価格・在庫・発送時期はリンク先でご確認ください。
            </p>
            {priceRanges.length > 0 && (
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                サイズ別の参考価格：
                {priceRanges.map(range => (
                  <span key={range.size} className="mr-3 inline-block">
                    {getSizeCategoryLabel(range.size as Product['size_category'])}
                    {' '}{formatPrice(range.min)}〜{formatPrice(range.max)}
                  </span>
                ))}
              </p>
            )}

            {/* 商品カード */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
              {cards.map((product, index) => (
                <CatalogProductCard key={product.id} product={product} priority={index < 2} />
              ))}
            </div>

            {/* 比較表 */}
            {products.length > 0 && (
              <div className="mt-8">
                <SectionTitle>比較表</SectionTitle>
                <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#f6f2ea] text-xs text-ink-soft">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-bold">商品</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-left font-bold">分類</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-left font-bold">サイズ</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-left font-bold">難易度</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-right font-bold">参考価格</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} className="border-t border-line">
                          <td className="px-3 py-2.5">
                            <Link href={`/products/${product.id}`} className="text-navy hover:text-gold-dark hover:underline">
                              {product.name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{product.category}</td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">
                            {getSizeCategoryLabel(product.sizeCategory as Product['size_category'])}
                            {product.heightCm ? `（高さ約${product.heightCm}cm）` : ''}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{LEVEL_OPTIONS.find(o => o.value === product.level)?.label ?? '—'}</td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right font-bold text-ink">{formatPrice(product.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <p className="mt-4 text-xs text-ink-muted">
              楽天市場の商品情報は{' '}
              <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
            </p>
          </section>

          {/* あわせて読みたい */}
          <section className="mt-10 lg:mt-12">
            <SectionTitle action={<Link href="/selection" className="font-bold text-navy underline">特集をすべて見る →</Link>}>ほかの特集</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {SELECTIONS.filter(other => other.slug !== selection.slug).slice(0, 10).map(other => (
                <SelectionCard key={other.slug} selection={other} compact />
              ))}
            </div>
            <Card className="mt-4 overflow-hidden">
              <ul className="divide-y divide-[#efeae0] text-sm">
                <li><Link href="/guides" className="block px-4 py-3 font-mincho font-bold text-ink hover:text-navy">盆栽の育て方ガイド一覧 →</Link></li>
                <li><Link href="/products" className="block px-4 py-3 font-mincho font-bold text-ink hover:text-navy">盆栽の商品カタログ →</Link></li>
              </ul>
            </Card>
          </section>
        </div>
      </article>
    </>
  )
}
