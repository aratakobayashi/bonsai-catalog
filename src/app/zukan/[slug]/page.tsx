import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleCardGrid, type ArticleCardItem } from '@/components/article/RelatedArticleRows'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { CareIcon } from '@/components/catalog/CareIcon'
import { byCuratedThenReviews } from '@/components/home/curated'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { Breadcrumbs, CONTAINER, ChipLink, SectionTitle, chipClass } from '@/components/ui/design'
import { getArticleOverride, thumbnailPath } from '@/lib/article-overrides'
import { getCatalogProducts } from '@/lib/catalog'
import type { CatalogProduct } from '@/lib/catalog-model'
import { isArticleListable } from '@/lib/content-policy'
import { getShopCategory } from '@/lib/shop-categories'
import { SITE_URL } from '@/lib/site'
import { ZUKAN_ENTRIES, getZukanEntry, matchZukanProducts, zukanDescription, zukanImage, zukanProductsHref, type ZukanEntry } from '@/lib/zukan'

interface ZukanPageProps {
  params: { slug: string }
}

// 商品は1時間ごとに作り直す（商品の取得に失敗したときは、商品の欄だけ空で出す）
export const revalidate = 3600

const PRODUCT_LIMIT = 8

// ビルド時にまとめて商品を取ると失敗しやすいため、初回アクセス時に作る（存在しない slug・月は notFound）
export function generateStaticParams() {
  return []
}

const KIND_LABEL: Record<ZukanEntry['kind'], string> = { jukei: '樹形', meisho: '品種・名前' }

export function generateMetadata({ params }: ZukanPageProps): Metadata {
  const entry = getZukanEntry(params.slug)
  if (!entry) return {}
  const kind = entry.kind === 'jukei' ? '樹形' : '名前'
  return {
    title: `${entry.name}（${entry.reading}）とは｜盆栽の${kind}の見分け方と育てるときの注意 - 盆栽コレクション`,
    description: zukanDescription(entry),
    alternates: { canonical: `/zukan/${entry.slug}` },
  }
}

function articleItems(slugs: string[]): ArticleCardItem[] {
  return slugs
    .filter(slug => isArticleListable(slug))
    .map(slug => ({ slug, title: getArticleOverride(slug)?.title }))
    .filter((a): a is { slug: string; title: string } => Boolean(a.title))
    .map(a => ({ href: `/guides/${a.slug}`, title: a.title, image: thumbnailPath(a.slug) ?? null }))
}

export default async function ZukanEntryPage({ params }: ZukanPageProps) {
  const entry = getZukanEntry(params.slug)
  if (!entry) notFound()

  const allProducts = await getCatalogProducts().catch(() => [] as CatalogProduct[])
  const matched = matchZukanProducts(entry, allProducts).sort(byCuratedThenReviews)
  const products = matched.slice(0, PRODUCT_LIMIT)
  const articles = articleItems(entry.articles)
  const image = zukanImage(entry)
  const others = ZUKAN_ENTRIES.filter(other => other.kind === entry.kind && other.slug !== entry.slug)
  const pageUrl = `${SITE_URL}/zukan/${entry.slug}`
  const listHref = zukanProductsHref(entry)
  const speciesHeading = entry.kind === 'jukei' ? '向いている樹種' : 'この名前が付く樹種'

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽の名前・樹形図鑑', url: `${SITE_URL}/zukan`, position: 2 },
          { name: entry.name, url: pageUrl, position: 3 },
        ]}
      />
      <article className={`${CONTAINER} pb-14 lg:pb-24`}>
        <Breadcrumbs
          items={[{ label: 'ホーム', href: '/' }, { label: '名前・樹形図鑑', href: '/zukan' }, { label: entry.name }]}
          className="pt-4 lg:pt-8"
        />

        {/* 見出し：樹形はシルエットを大きく、名前は文字だけ */}
        <header className={`mt-4 lg:mt-6 ${image ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12' : ''}`}>
          {image && (
            <div className="border border-line bg-white px-3 py-4 lg:order-2 lg:px-6 lg:py-6">
              <Image src={image} alt={`${entry.name}の樹形のシルエット`} width={400} height={300} priority className="mx-auto h-auto w-full max-w-[480px]" unoptimized />
            </div>
          )}
          <div className={`min-w-0 ${image ? 'mt-5 lg:mt-0' : ''}`}>
            <p className="flex items-center gap-3 text-[11px] tracking-[0.2em] text-gold-dark lg:text-xs">
              {KIND_LABEL[entry.kind]}{entry.group ? `・${entry.group}` : ''}
              <span className="h-px w-10 bg-gold" aria-hidden="true" />
            </p>
            <h1 className="mt-2 font-mincho text-[28px] font-bold leading-snug tracking-[0.06em] text-ink lg:text-[38px]">
              {entry.name}
              <span className="ml-3 align-middle font-sans text-[13px] font-normal tracking-normal text-ink-muted lg:text-sm">{entry.reading}</span>
            </h1>
            <p className="mt-3 text-[14.5px] leading-[1.95] text-ink lg:text-base">{entry.summary}</p>
            <PrDisclosure compact className="mt-3" />
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:mt-14 lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:gap-10">
          {/* 見分け方 */}
          <section aria-labelledby="zukan-points" className="min-w-0">
            <h2 id="zukan-points" className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[22px]">見分け方</h2>
            <ol className="mt-3 border-t border-line">
              {entry.points.map((point, i) => (
                <li key={point} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 border-b border-line py-3">
                  <span className="font-mincho text-lg font-bold leading-[1.5] text-gold-dark">{i + 1}</span>
                  <span className="text-[14px] leading-[1.8] text-ink">{point}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 樹種 */}
          <section aria-labelledby="zukan-species" className="min-w-0">
            <h2 id="zukan-species" className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[22px]">{speciesHeading}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.species.map(species => {
                const category = species.category ? getShopCategory(species.category) : undefined
                return category ? (
                  <ChipLink key={species.label} href={`/products/category/${category.slug}`}>
                    <span className="inline-flex min-h-8 items-center">{species.label}の盆栽 ›</span>
                  </ChipLink>
                ) : (
                  <span key={species.label} className={chipClass()}>
                    <span className="inline-flex min-h-8 items-center">{species.label}</span>
                  </span>
                )
              })}
            </div>
            {entry.kind === 'jukei' && (
              <p className="mt-3 text-xs leading-relaxed text-ink-muted">ここに挙げた樹種のほかにも、仕立て方しだいでいろいろな樹がこの形になります。</p>
            )}
          </section>

          {/* 育てるときの注意 */}
          <section aria-labelledby="zukan-care" className="min-w-0">
            <h2 id="zukan-care" className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[22px]">育てるときの注意</h2>
            <ul className="mt-3 border-t border-line">
              {entry.care.map(text => (
                <li key={text} className="flex gap-2.5 border-b border-line py-3 text-[14px] leading-[1.8] text-ink">
                  <CareIcon name="care" className="mt-[3px] h-[18px] w-[18px] text-gold-dark" />
                  <span className="min-w-0">{text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 名前の付いた商品 */}
        <section aria-labelledby="zukan-products" className="pt-12 lg:pt-20">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <h2 id="zukan-products" className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[26px]">商品名に「{entry.name}」と入った盆栽</h2>
            {matched.length > 0 && <span className="text-xs text-ink-muted">{matched.length}件</span>}
          </div>
          {products.length > 0 ? (
            <>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">販売店が商品名に書いている言葉で選んでいます。樹形や品種は、写真と販売ページの説明でもお確かめください。</p>
              <div className="mt-4 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-3.5 gap-y-6 md:grid-cols-[repeat(3,minmax(0,1fr))] lg:mt-6 lg:grid-cols-[repeat(4,minmax(0,1fr))] lg:gap-6">
                {products.map((product, index) => (
                  <CatalogProductCard key={product.id} product={product} priority={index < 2 && !image} />
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-muted">価格は取得時点の情報です。最新の価格・在庫・発送時期はリンク先でご確認ください。</p>
            </>
          ) : (
            <p className="mt-4 border-y border-line py-8 text-center text-sm leading-relaxed text-ink-muted">いま掲載している商品には、商品名に「{entry.name}」と入ったものがありません。</p>
          )}
          <Link href={listHref} className="mt-4 inline-flex min-h-11 items-center text-[13.5px] text-ink hover:text-gold-dark">
            <span className="border-b border-ink pb-0.5">「{entry.query}」で商品一覧を探す ›</span>
          </Link>
        </section>

        {/* 関連記事 */}
        {articles.length > 0 && (
          <section aria-labelledby="zukan-articles" className="mt-12 border-t border-ink pt-8 lg:mt-20 lg:pt-10">
            <h2 id="zukan-articles" className="font-mincho text-[21px] font-bold tracking-[0.06em] text-ink lg:text-2xl">関連する記事</h2>
            <div className="mt-6 lg:max-w-[820px]">
              <ArticleCardGrid items={articles} />
            </div>
          </section>
        )}

        {/* ほかの樹形・名前 */}
        <section aria-labelledby="zukan-others" className="mt-12 lg:mt-20">
          <SectionTitle
            action={
              <Link href="/zukan" className="-my-2 inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
                <span className="border-b border-ink pb-0.5">図鑑の一覧へ</span>
              </Link>
            }
          >
            <span id="zukan-others">{entry.kind === 'jukei' ? 'ほかの樹形' : 'ほかの品種・名前'}</span>
          </SectionTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map(other => (
              <ChipLink key={other.slug} href={`/zukan/${other.slug}`}>
                <span className="inline-flex min-h-8 items-center">{other.name}</span>
              </ChipLink>
            ))}
          </div>
        </section>
      </article>
    </>
  )
}
