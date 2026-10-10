import { getArticleOverride } from '@/lib/article-overrides'
import Image from 'next/image'
import { byCuratedImage } from '@/components/home/curated'
import photoCredits from '@/data/photo-credits.json'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SELECTIONS, getSelection, pickSelectionProducts, selectionPhoto } from '@/lib/selections'
import { formatPrice, getSizeCategoryLabel } from '@/lib/utils'
import type { CatalogProduct } from '@/lib/catalog-model'
import { LEVEL_OPTIONS, SPECIES_OPTIONS, getCatalogProducts } from '@/lib/catalog'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import { SITE_URL, absoluteUrl } from '@/lib/site'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { Breadcrumbs, CONTAINER, ChipLink, Placeholder, SectionTitle, chipClass } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import type { Product } from '@/types'
import { SelectionCard } from '@/components/selection/SelectionCard'
import { getSelectionGuideLinks, isFeaturable, selectionCounts } from '@/components/selection/selection-meta'
import { PRODUCT_TYPE_LABELS } from '@/lib/product-classify'
import { CONIFER_SPECIES } from '@/lib/selections-extra'
import { RelatedTools } from '@/components/layout/RelatedTools'

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
      // SNS で共有したときの画像（写真＋特集名のサムネイル）
      images: [{ url: absoluteUrl(selection.thumbnail), width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [absoluteUrl(selection.thumbnail)] },
  }
}

// 樹種カードから商品一覧へのリンク（特集ごと・項目名ごと）
const POINT_LINKS: Record<string, Record<string, { species: string; href: string }>> = {
  // 一覧の絞り込み（正月飾り）と同じ範囲。松は五葉松・黒松などの松柏類
  'new-year-bonsai': {
    松: { species: 'cat-shohaku', href: '/products?type=tree&use=new_year&species=cat-shohaku' },
    梅: { species: 'ume', href: '/products?type=tree&use=new_year&species=ume' },
    南天: { species: 'nanten', href: '/products?type=tree&use=new_year&species=nanten' },
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

// 比較表の「分類」：樹種が分かるときは樹種から決め（販売店の登録の分類は、桜の寄せ植えが「松柏類」になるなど食い違うことがある）、
// 分からないときだけ登録の分類を使う
function groupLabel(p: CatalogProduct): string {
  if (p.productType === 'kokedama') return '苔玉'
  const key = p.speciesKey
  if (!key) return p.category
  if (key === 'gajumaru' || key === 'ficus') return '観葉・室内'
  if (CONIFER_SPECIES.includes(key)) return '松柏類'
  if (key === 'himeringo' || key === 'ringo') return '実もの'
  const first = p.enjoy[0]
  if (first === 'flower') return '花もの'
  if (first === 'fruit') return '実もの'
  if (first === 'leaf_color') return '雑木類'
  return p.category
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

// 特集ごとの「あわせて使える」（贈り物の特集は贈り物ナビ、道具の特集はそろえるリストなど）
const SELECTION_TOOLS: Record<string, string[]> = {
  'bonsai-gift': ['/okurimono', '/kumiawase', '/hajimete'],
  'celebration-bonsai': ['/okurimono', '/kumiawase', '/hajimete'],
  'new-year-bonsai': ['/okurimono', '/teire', '/hajimete'],
  'starter-tools': ['/soroeru', '/hajimete', '/teire'],
  'beginner-mini-bonsai': ['/hajimete', '/kumiawase', '/soroeru'],
  'indoor-bonsai': ['/hajimete', '/shojo', '/note'],
  'bonsai-under-3000': ['/okurimono', '/shindan', '/hajimete'],
}

export default async function SelectionPage({ params }: SelectionPageProps) {
  const selection = getSelection(params.slug)
  if (!selection) notFound()

  const [allProducts, guideRows] = await Promise.all([
    getCatalogProducts().catch(() => [] as CatalogProduct[]),
    getSelectionGuideLinks(selection.slug),
  ])
  // 書き直した記事（src/content/articles）は新しいタイトルで出す
  const guideLinks = guideRows.map(guide => ({ ...guide, title: getArticleOverride(guide.slug)?.title ?? guide.title }))
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
  // 文字やバナーのない写真の商品を先に（特集の並びはそのまま）
  const cards = [...products].sort(byCuratedImage)

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
  // 見出しの写真（文字なし）と出典
  const heroPhoto = selectionPhoto(selection)
  const heroCredit = (photoCredits as Record<string, { creator?: string; license?: string; source?: string }>)[heroPhoto]

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
        {/* 見出し：特集の写真を大きく敷き、その上に特集名。SP はリードを写真の下に出す */}
        <header>
          <div className="lg:mx-auto lg:max-w-[1184px] lg:px-12">
            <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '特集', href: '/selection' }, { label: selection.shortTitle }]} className="hidden pt-6 lg:block" />
          </div>
          <div className="relative h-[240px] overflow-hidden bg-ink sm:h-[300px] lg:mx-auto lg:mt-6 lg:h-[440px] lg:max-w-[1184px]">
            <Image src={heroPhoto} alt="" fill priority sizes="(max-width: 1183px) 100vw, 1184px" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(18,16,13,.82)_0%,rgba(18,16,13,.35)_55%,rgba(18,16,13,.1)_100%)] lg:bg-[linear-gradient(90deg,rgba(18,16,13,.85)_0%,rgba(18,16,13,.55)_45%,rgba(18,16,13,.05)_85%)]" />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-5 lg:inset-y-0 lg:left-0 lg:flex lg:max-w-[620px] lg:flex-col lg:justify-center lg:px-14 lg:pb-0">
              <p className="flex items-center gap-3 text-[11px] tracking-[0.24em] text-[#d6ba84] lg:text-xs">
                特集
                <span className="h-px w-10 bg-[#d6ba84]" aria-hidden="true" />
              </p>
              <h1 className="mt-2 font-mincho text-[23px] font-bold leading-[1.45] tracking-[0.08em] text-white lg:mt-4 lg:text-[38px]">{selection.h1}</h1>
              <p className="mt-4 hidden text-[15px] leading-[2] text-white/85 lg:block">{selection.lead}</p>
            </div>
          </div>
          {heroCredit && (
            <p className="mt-1.5 px-4 text-right text-[11px] text-ink-muted lg:mx-auto lg:max-w-[1184px]">
              写真：
              {heroCredit.source ? (
                <a href={heroCredit.source} target="_blank" rel="noopener noreferrer" className="underline">{heroCredit.creator || '出典'}</a>
              ) : (
                heroCredit.creator
              )}
              {heroCredit.license && ` / ${heroCredit.license}`}
            </p>
          )}
          <div className="px-4 lg:mx-auto lg:max-w-[1184px] lg:px-12">
            <p className="mt-3 text-[13px] leading-[1.9] text-ink-soft lg:hidden">{selection.lead}</p>
            <PrDisclosure className="mt-2.5 lg:mt-4" />
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
              {products.length}件を掲載
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
                          {isParts ? PRODUCT_TYPE_LABELS[product.productType] : groupLabel(product)}
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
          <RelatedTools hrefs={SELECTION_TOOLS[selection.slug] ?? ['/shindan', '/kumiawase', '/hajimete']} />
        </div>
      </article>
    </>
  )
}
