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
import { Breadcrumbs, CONTAINER, ChipLink, Placeholder, SectionTitle, chipClass } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import type { Product } from '@/types'
import { SelectionThumb } from '@/components/selection/SelectionThumb'
import { SelectionCard } from '@/components/selection/SelectionCard'
import { getSelectionGuideLinks, isFeaturable, selectionCounts } from '@/components/selection/selection-meta'
import { PRODUCT_TYPE_LABELS } from '@/lib/product-classify'

interface SelectionPageProps {
  params: { slug: string }
}

// ビルド時に全特集の商品データを同時に取得すると接続が不安定になるため、初回アクセス時に生成する（ISR）
// 商品データの取得が一時的に失敗したときの表示が長く残らないよう、10分ごとに作り直す
export const revalidate = 600

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

// サイズ別の参考価格（サイズ不明・価格なしの商品は除く）
function priceRangeBySize(products: CatalogProduct[]) {
  const bySize = new Map<string, number[]>()
  products.filter(p => p.price > 0 && p.sizeCategory !== 'unknown').forEach(p => {
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

  const [allProducts, guideLinks] = await Promise.all([
    getCatalogProducts().catch(() => [] as CatalogProduct[]),
    getSelectionGuideLinks(selection.slug),
  ])
  const products = pickSelectionProducts(selection, allProducts)
  const counts = selectionCounts(allProducts)
  const otherSelections = SELECTIONS.filter(other => other.slug !== selection.slug && isFeaturable(other, counts)).slice(0, 10)
  const isParts = Boolean(selection.includeParts)
  const priceRanges = isParts ? [] : priceRangeBySize(products)
  const prices = products.map(p => p.price).filter(price => price > 0)
  const priceAll = prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : null
  // 比較表：値がひとつもわからない列は出さない
  const showSize = products.some(p => p.sizeCategory !== 'unknown' || p.heightCm)
  const showLevel = products.some(p => p.level)
  const showReviews = products.some(p => p.reviewCount > 0)
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

      <article className="pb-12 lg:pb-20">
        {/* 見出し（SP は商品を早く見せるためイラストを省き、短いリードだけ） */}
        <header className="lg:mx-auto lg:max-w-[1184px] lg:px-12">
          <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '特集', href: '/selection' }, { label: selection.shortTitle }]} className="hidden pt-6 lg:block" />
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_480px] lg:items-end lg:gap-16 lg:pt-8">
            <div className="px-4 pt-5 lg:px-0 lg:pt-0">
              <p className="text-[11px] tracking-[0.18em] text-gold-dark lg:text-xs lg:tracking-[0.2em]">{selection.eyebrow.replace(/^特集・/, '特集　')}</p>
              <h1 className="mt-2 font-mincho text-[23px] font-bold leading-[1.45] tracking-[0.08em] text-ink lg:mt-3 lg:text-[40px]">{selection.h1}</h1>
              <p className="mt-2.5 text-[13px] leading-[1.9] text-ink-soft lg:mt-[18px] lg:text-[15px] lg:leading-[2]">{selection.lead}</p>
              <PrDisclosure className="mt-2.5 lg:mt-5" />
            </div>
            <div className="relative hidden aspect-[16/10] overflow-hidden bg-paper-deep lg:block">
              <SelectionThumb selection={selection} priority className="absolute inset-0 h-full w-full" />
            </div>
          </div>
        </header>

        <div className={CONTAINER}>
          {/* 掲載商品（本文より先に見せる） */}
          <section className="pt-7 lg:pt-16" aria-labelledby="selection-products">
            <div className="flex flex-wrap items-baseline gap-x-4">
              <h2 id="selection-products" className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[26px]">{selection.listHeading}</h2>
              {catalogLinks && (
                <Link href={catalogLinks.all} className="-my-2 ml-auto inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
                  <span className="border-b border-ink pb-0.5">一覧で絞り込む</span>
                </Link>
              )}
            </div>
            {catalogLinks && catalogLinks.chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className={chipClass(true)} aria-current="true">すべて</span>
                {catalogLinks.chips.map(chip => (
                  <ChipLink key={chip.label} href={chip.href}>{chip.label}</ChipLink>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">
              {products.length}件を掲載（楽天市場・Amazon）
              {priceRanges.length > 0 ? (
                <>
                  。サイズ別の参考価格：
                  {priceRanges.map(range => (
                    <span key={range.size} className="mr-3 inline-block">
                      {getSizeCategoryLabel(range.size as Product['size_category'])}
                      {' '}{formatPrice(range.min)}〜{formatPrice(range.max)}
                    </span>
                  ))}
                </>
              ) : priceAll ? (
                <>。参考価格 {formatPrice(priceAll.min)}〜{formatPrice(priceAll.max)}</>
              ) : null}
            </p>

            {/* 商品カード */}
            {cards.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6 md:grid-cols-3 lg:mt-7 lg:grid-cols-4 lg:gap-6">
                {cards.map((product, index) => (
                  <CatalogProductCard key={product.id} product={product} priority={index < 2} />
                ))}
              </div>
            ) : (
              <p className="mt-4 border-y border-line py-8 text-center text-sm text-ink-muted">掲載できる商品を準備中です。</p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-ink-muted">価格は取得時点の情報です。最新の価格・在庫・発送時期はリンク先でご確認ください。</p>
          </section>

          {/* 1つ目の節：樹種・選び方の要点（PC は写真つきの3列、SP は線で区切った行） */}
          {firstSection && (
            <section className="pt-12 lg:pt-24">
              <SectionTitle>{firstSection.heading}</SectionTitle>
              <div className="mt-3 space-y-2 lg:max-w-[820px]">
                {firstSection.paragraphs.map(paragraph => (
                  <p key={paragraph} className="text-[13.5px] leading-[1.9] text-ink-soft lg:text-sm">{paragraph}</p>
                ))}
              </div>
              {firstSection.points && (
                <ul className="mt-4 border-t border-line lg:mt-8 lg:grid lg:grid-cols-3 lg:gap-10 lg:border-0">
                  {firstSection.points.map(point => {
                    const { name, sub, text } = parsePoint(point)
                    const link = pointLinks[name]
                    const image = link ? imageFor(link.species) : undefined
                    const short = name.length <= 3
                    return (
                      <li key={point} className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 border-b border-line py-4 lg:block lg:border-0 lg:py-0">
                        {link && (
                          <div className="relative hidden aspect-[4/3] overflow-hidden bg-paper-deep lg:mb-[18px] lg:block">
                            {image ? (
                              <ProductThumb src={image.imageUrl} alt={name} sizes="(max-width: 1023px) 100vw, 360px" size={400} />
                            ) : (
                              <Placeholder className="absolute inset-0" />
                            )}
                          </div>
                        )}
                        {name ? (
                          <div className={`lg:flex lg:items-baseline lg:gap-3 ${short ? '' : 'col-span-2'}`}>
                            <span className={`font-mincho font-bold text-ink ${short ? 'text-2xl lg:text-[28px]' : 'text-base lg:text-lg'}`}>{name}</span>
                            {sub && <span className="hidden text-xs text-ink-muted lg:inline">{sub}</span>}
                          </div>
                        ) : null}
                        <div className={`min-w-0 ${!name || !short ? 'col-span-2' : ''}`}>
                          {sub && <div className="text-[11px] text-ink-muted lg:hidden">{sub}</div>}
                          <p className="mt-0.5 text-[13px] leading-[1.8] text-ink lg:mt-2 lg:text-sm lg:leading-[1.9] lg:text-ink-soft">{text}</p>
                          {link && (
                            <Link href={link.href} className="mt-1 inline-flex min-h-11 items-center text-[13px] text-ink lg:mt-3 lg:min-h-0">
                              <span className="border-b border-ink pb-0.5">{short ? `${name}の盆栽を見る` : '商品を見る'}</span>
                            </Link>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )}

          {/* 残りの節：左に見出し、右に本文（案内は線で区切った行に） */}
          {restSections.map(section => (
            <section key={section.heading} className="pt-12 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16 lg:pt-24">
              <h2 className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[22px]">{section.heading}</h2>
              <div className="mt-3 lg:mt-0">
                <div className="space-y-2">
                  {section.paragraphs.map(paragraph => (
                    <p key={paragraph} className="text-[13.5px] leading-[1.9] text-ink-soft lg:text-sm">{paragraph}</p>
                  ))}
                </div>
                {(section.points || section.aside) && (
                  <dl className="mt-4 border-t border-line">
                    {section.points?.map(point => {
                      const { name, text } = parsePoint(point)
                      return (
                        <div key={point} className="border-b border-paper-deep py-3 text-sm leading-[1.7] lg:grid lg:grid-cols-[120px_minmax(0,1fr)] lg:gap-3.5">
                          {name && <dt className="text-[12.5px] text-ink-muted lg:text-sm">{name}</dt>}
                          <dd className={name ? '' : 'lg:col-span-2'}>{text}</dd>
                        </div>
                      )
                    })}
                    {section.aside && (
                      <div className="border-b border-paper-deep py-3 text-sm leading-[1.7] lg:grid lg:grid-cols-[120px_minmax(0,1fr)] lg:gap-3.5">
                        <dt className="text-[12.5px] text-ink-muted lg:text-sm">{section.aside.eyebrow}</dt>
                        <dd>
                          <span className="font-bold">{section.aside.title}</span>
                          <span className="mt-0.5 block text-ink-soft">{section.aside.text}</span>
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            </section>
          ))}

          {/* 比較表（鉢・土・道具の特集は種類・ショップ・レビューで比べる。わからない値は空欄） */}
          {products.length > 0 && (
            <section className="pt-12 lg:pt-24">
              <h2 className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[22px]">比較表</h2>
              <div className="mt-3 overflow-x-auto border-t border-ink">
                <table className="min-w-full text-sm">
                  <thead className="text-xs text-ink-muted">
                    <tr className="border-b border-line">
                      <th className="py-2.5 pr-3 text-left font-normal">商品</th>
                      <th className="whitespace-nowrap px-3 py-2.5 text-left font-normal">{isParts ? '種類' : '分類'}</th>
                      {!isParts && showSize && <th className="whitespace-nowrap px-3 py-2.5 text-left font-normal">サイズ</th>}
                      {!isParts && showLevel && <th className="whitespace-nowrap px-3 py-2.5 text-left font-normal">難易度</th>}
                      <th className="whitespace-nowrap px-3 py-2.5 text-right font-normal">参考価格</th>
                      {isParts && <th className="whitespace-nowrap px-3 py-2.5 text-left font-normal">ショップ</th>}
                      {isParts && showReviews && <th className="whitespace-nowrap py-2.5 pl-3 text-right font-normal">レビュー</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-line">
                        <td className="py-2.5 pr-3">
                          <Link href={`/products/${product.id}`} className="text-ink hover:text-gold-dark hover:underline">
                            {product.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">
                          {isParts ? PRODUCT_TYPE_LABELS[product.productType] : product.category}
                        </td>
                        {!isParts && showSize && (
                          <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">
                            {product.sizeCategory !== 'unknown' && getSizeCategoryLabel(product.sizeCategory as Product['size_category'])}
                            {product.heightCm ? `（高さ約${product.heightCm}cm）` : ''}
                          </td>
                        )}
                        {!isParts && showLevel && (
                          <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{LEVEL_OPTIONS.find(o => o.value === product.level)?.label ?? ''}</td>
                        )}
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-ink">{product.price > 0 ? formatPrice(product.price) : ''}</td>
                        {isParts && (
                          <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">
                            {product.source === 'amazon' ? 'Amazon' : '楽天市場'}
                            {product.shopName && product.shopName !== 'Amazon' && product.shopName !== '楽天市場' && (
                              <span className="block text-[11px] text-ink-muted">{product.shopName}</span>
                            )}
                          </td>
                        )}
                        {isParts && showReviews && (
                          <td className="whitespace-nowrap py-2.5 pl-3 text-right text-ink-soft">
                            {product.reviewCount > 0 ? `★${product.reviewAverage.toFixed(1)}（${product.reviewCount.toLocaleString()}件）` : ''}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-ink-muted">
                楽天市場の商品情報は{' '}
                <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
              </p>
            </section>
          )}

          {/* 次に読む・迷ったとき */}
          <section className="pt-12 lg:pt-24">
            <h2 className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[22px]">選ぶ前に・育てる前に</h2>
            <ul className="mt-3 border-t border-line text-sm">
              <li className="border-b border-line">
                <Link href="/shindan" className="group flex min-h-11 items-baseline gap-3 py-3.5">
                  <span className="w-[72px] flex-none text-[11px] text-gold-dark">診断</span>
                  <span className="flex-1 font-mincho font-bold text-ink group-hover:text-gold-dark">迷ったら かんたん盆栽診断（4つの質問）</span>
                  <span className="text-ink-muted" aria-hidden="true">›</span>
                </Link>
              </li>
              {guideLinks.map(guide => (
                <li key={guide.slug} className="border-b border-line">
                  <Link href={`/guides/${guide.slug}`} className="group flex min-h-11 items-baseline gap-3 py-3.5">
                    <span className="w-[72px] flex-none text-[11px] text-gold-dark">{guide.category ?? '育て方'}</span>
                    <span className="flex-1 font-mincho font-bold leading-[1.6] text-ink group-hover:text-gold-dark">{guide.title}</span>
                    <span className="text-ink-muted" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
              <li className="border-b border-line">
                <Link href="/guides" className="group flex min-h-11 items-baseline gap-3 py-3.5">
                  <span className="w-[72px] flex-none text-[11px] text-gold-dark">育て方</span>
                  <span className="flex-1 font-mincho font-bold text-ink group-hover:text-gold-dark">盆栽の育て方ガイド一覧</span>
                  <span className="text-ink-muted" aria-hidden="true">›</span>
                </Link>
              </li>
            </ul>
          </section>

          {/* ほかの特集 */}
          {otherSelections.length > 0 && (
            <section className="pt-12 lg:pt-24">
              <div className="flex items-baseline">
                <h2 className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[22px]">ほかの特集</h2>
                <Link href="/selection" className="-my-3 ml-auto inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
                  <span className="border-b border-ink pb-0.5">特集をすべて見る</span>
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6 md:grid-cols-3 lg:mt-6 lg:grid-cols-5 lg:gap-6">
                {otherSelections.map(other => (
                  <SelectionCard key={other.slug} selection={other} compact />
                ))}
              </div>
              <ul className="mt-8 border-t border-line text-sm">
                <li className="border-b border-line"><Link href="/products" className="flex min-h-11 items-baseline py-3.5 font-mincho font-bold text-ink hover:text-gold-dark">盆栽の商品カタログ<span className="ml-auto font-sans font-normal text-ink-muted" aria-hidden="true">›</span></Link></li>
              </ul>
            </section>
          )}
        </div>
      </article>
    </>
  )
}
