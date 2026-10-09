import { Metadata } from 'next'
import { cache } from 'react'
import { notFound, permanentRedirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getArticleBySlug, getArticleLinkContext, getRelatedArticles } from '@/lib/database/articles'
import { supabaseServer } from '@/lib/supabase-server'
import { AMAZON_ENABLED } from '@/lib/affiliate'
import { ShareButtons } from '@/components/features/ShareButtons'
import { TableOfContents, MobileTableOfContents } from '@/components/features/TableOfContents'
import { ArticleSummary } from '@/components/article/ArticleSummary'
import { ArticleNextSteps, type NextStepLink } from '@/components/article/ArticleNextSteps'
import { byCuratedThenReviews } from '@/components/home/curated'
import { RelatedArticleRows } from '@/components/article/RelatedArticleRows'
import { ArticleStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { generateArticleSEO } from '@/lib/seo-utils'
import { formatDate } from '@/lib/date-utils'
import { processMarkdown, extractTableOfContents } from '@/lib/markdown'
import { detectArticleSpecies, fallbackSelectionSlug, normalizeForMatch, stripLeadingTitleHeading } from '@/lib/article-content'
import { applyArticleOverride, canOptimizeImage, getArticleOverride } from '@/lib/article-overrides'
import { getSelection, selectionsForCategory } from '@/lib/selections'
import { categoryFilters, filterProducts, getCatalogProducts, normalizeProduct, type CatalogProduct } from '@/lib/catalog'
import { getShopCategory } from '@/lib/shop-categories'
import { SITE_URL, absoluteUrl } from '@/lib/site'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER, Breadcrumbs } from '@/components/ui/design'
import { isArticleHidden, isArticleIndexable, isArticleListable } from '@/lib/content-policy'
import type { Article, Product } from '@/types'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

// 関連商品を取得（樹種のわからない記事の「次にやること」で使う）
async function getRelatedProducts(productIds?: string[], article?: Article): Promise<Product[]> {
  // 手動設定の商品IDがある場合は優先
  if (productIds && productIds.length > 0) {
    let query = supabaseServer.from('products').select('*').in('id', productIds)
    // Amazon の掲載を止めている間は楽天市場の商品だけ（src/lib/affiliate.ts）
    if (!AMAZON_ENABLED) query = query.eq('source', 'rakuten')
    const { data, error } = await query.limit(4)

    if (!error && data && data.length > 0) {
      return data
    }
  }

  // 記事のタイトル・本文から推薦
  if (article) {
    try {
      const { getRecommendedProducts } = await import('@/lib/product-recommendation')
      return await getRecommendedProducts(article.title, article.content, 4)
    } catch (error) {
      console.error('商品推薦エラー:', error)
    }
  }

  return []
}

// 樹種の商品一覧（/products/category/<slug>）と同じ条件・並びの先頭3件
async function getSpeciesProducts(slug: string): Promise<CatalogProduct[]> {
  try {
    // 記事の中では、文字やバナーのない写真の商品を先に出す
    return filterProducts(await getCatalogProducts(), categoryFilters(slug)).sort(byCuratedThenReviews).slice(0, 3)
  } catch (error) {
    console.error('樹種の商品取得エラー:', error)
    return []
  }
}

// DB の記事に、リポジトリの書き直し版（src/content/articles/<slug>.md）を重ねる。メタデータと本文で1回だけ読む
const loadArticle = cache(async (slug: string) => {
  const article = await getArticleBySlug(slug)
  return article ? applyArticleOverride(article) : null
})

// 一覧・本文の説明に使える要約か（Markdown の記号や見出しが残っているものは出さない）
function cleanLead(text?: string): string | null {
  const t = text?.replace(/\s+/g, ' ').trim()
  if (!t || t.length < 20 || t.length > 200 || /[#*|<>\[\]]/.test(t)) return null
  return t
}

// 初回アクセス時に生成してキャッシュし、1時間ごとに再生成（ISR）
export const revalidate = 3600

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  // 削除扱いの記事はページ側で /guides へリダイレクトする
  if (isArticleHidden(params.slug)) {
    return { title: '育て方 | 盆栽コレクション', robots: { index: false, follow: true } }
  }

  const article = await loadArticle(params.slug)

  if (!article) {
    return {
      title: '記事が見つかりません',
      description: 'お探しの記事は見つかりませんでした。'
    }
  }

  const seo = generateArticleSEO(article)

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      ...seo.openGraph,
      images: article.featuredImage ? [{ url: absoluteUrl(typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage.url) }] : [],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ['盆栽コレクション'],
    },
    twitter: {
      ...seo.twitter,
      images: article.featuredImage ? [absoluteUrl(typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage.url)] : [],
    },
    alternates: {
      canonical: `https://www.bonsai-collection.com/guides/${params.slug}`,
    },
    ...(!isArticleIndexable(params.slug) && { robots: { index: false, follow: true } }),
  }
}


export default async function ArticlePage({ params }: ArticlePageProps) {
  // 盆栽と無関係な記事（削除扱い）は記事一覧へ恒久リダイレクト
  if (isArticleHidden(params.slug)) {
    permanentRedirect('/guides')
  }

  const article = await loadArticle(params.slug)

  if (!article) {
    notFound()
  }

  // 樹種（front matter の species。なければタイトルから判定）
  const detected = detectArticleSpecies(article.title)
  const speciesSlug = (article.speciesSlug && getShopCategory(article.speciesSlug) ? article.speciesSlug : null) ?? detected?.category ?? null
  const speciesLabel = speciesSlug ? getShopCategory(speciesSlug)?.name ?? detected?.label ?? null : null

  // 並行してデータを取得（樹種がわかる記事はその樹種の商品、わからない記事は記事に関連する商品）
  const [speciesProducts, relatedProductRows, relatedCandidates, linkContext] = await Promise.all([
    speciesSlug ? getSpeciesProducts(speciesSlug) : Promise.resolve([] as CatalogProduct[]),
    speciesSlug ? Promise.resolve([] as Product[]) : getRelatedProducts(article.relatedProducts, article),
    getRelatedArticles(article, 8),
    getArticleLinkContext().catch(() => undefined),
  ])

  // 本文（先頭の「記事タイトルと同じ見出し」は h1 と重複するので外す）
  const bodyHtml = processMarkdown(stripLeadingTitleHeading(article.content, article.title), { links: linkContext })

  // 目次を生成（大見出しだけを並べる。大見出しがない記事はすべての見出し）
  const titleKey = normalizeForMatch(article.title)
  // （記事タイトルと同じ見出しと、本文中の「目次」見出しは目次に入れない）
  const allHeadings = extractTableOfContents(bodyHtml).filter(item => {
    const key = normalizeForMatch(item.text)
    return key !== titleKey && key !== '目次'
  })
  const h2Headings = allHeadings.filter(item => item.level === 2)
  const tableOfContents = h2Headings.length > 0 ? h2Headings : allHeadings

  const products = speciesSlug ? speciesProducts : relatedProductRows.map(normalizeProduct).slice(0, 3)
  const hasRakuten = products.some(product => product.source === 'rakuten')

  // 同じ樹種の育て方の記事（育て方・手入れの記事を先に）
  const speciesGuides: NextStepLink[] = speciesSlug && linkContext
    ? linkContext.articles
        .filter(a => a.slug !== article.slug && isArticleListable(a.slug))
        .map(a => ({ slug: a.slug, title: getArticleOverride(a.slug)?.title ?? a.title }))
        .filter(a => detectArticleSpecies(a.title)?.category === speciesSlug)
        .sort((a, b) => Number(/育て方|手入れ|管理/.test(b.title)) - Number(/育て方|手入れ|管理/.test(a.title)))
        .slice(0, 3)
        .map(a => ({ href: `/guides/${a.slug}`, title: a.title }))
    : []

  // 関連記事（「次にやること」に出した記事は除く）
  const guideHrefs = new Set(speciesGuides.map(guide => guide.href))
  const relatedArticles = relatedCandidates
    .filter(related => !guideHrefs.has(`/guides/${related.slug}`))
    .slice(0, 4)
    .map(related => applyArticleOverride(related))

  // 特集（front matter の selection → 樹種向けの特集 → 話題から）
  const selection =
    (article.selectionSlug && getSelection(article.selectionSlug)) ||
    (speciesSlug && selectionsForCategory(speciesSlug)[0]) ||
    getSelection(fallbackSelectionSlug(article.title))
  const nextLinks: NextStepLink[] = [
    ...(selection ? [{ href: `/selection/${selection.slug}`, title: selection.shortTitle, note: selection.tagline }] : []),
    { href: '/shindan', title: 'かんたん盆栽診断', note: '置き場所・予算など4つの質問で、合いそうな盆栽を探す' },
  ]

  const crumbs = [
    { label: '育て方', href: '/guides' },
    { label: article.category.name, href: `/guides?category=${article.category.slug}` },
  ]
  const articleUrl = `${SITE_URL}/guides/${article.slug}`
  // 記事ページの上は文字なしの写真（書き直した記事）。なければこれまでの画像
  const featuredImageUrl = article.heroPhoto ?? article.featuredImage?.url ?? null
  const featuredImageAlt = article.featuredImage?.alt || article.title
  const lead = cleanLead(article.overridden ? article.excerpt : article.excerpt || article.seoDescription)
  const updated = article.updatedAt && formatDate(article.updatedAt) !== formatDate(article.publishedAt)

  // パンくずリスト構造化データ（画面のパンくずと同じ「ホーム › 育て方 › カテゴリ › 記事」）
  const breadcrumbs = [
    { name: 'ホーム', url: SITE_URL, position: 1 },
    { name: '育て方', url: `${SITE_URL}/guides`, position: 2 },
    { name: article.category.name, url: `${SITE_URL}/guides?category=${encodeURIComponent(article.category.slug)}`, position: 3 },
    { name: article.title, url: articleUrl, position: 4 },
  ]

  return (
    <>
      <ArticleStructuredData
        article={article}
        baseUrl="https://www.bonsai-collection.com"
      />
      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />

      <div className={`${CONTAINER} pb-16 pt-6 lg:pb-24 lg:pt-6`}>
        <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, ...crumbs]} className="hidden lg:block" />
        <div className="lg:mt-10 lg:grid lg:grid-cols-[minmax(0,640px)_220px] lg:justify-center lg:gap-16 xl:gap-24">
          <article className="min-w-0">
            {/* 記事ヘッダー：カテゴリ・タイトル・一言の要約・更新日と読む時間 */}
            <header>
              <p className="text-[12px] tracking-[0.1em] text-gold-dark">
                <Link href={`/guides?category=${article.category.slug}`} className="hover:text-ink">{article.category.name}</Link>
              </p>
              <h1 className="mt-2.5 font-mincho text-[23px] font-bold leading-[1.5] tracking-[0.05em] text-ink lg:mt-3 lg:text-[32px] lg:leading-[1.45]">
                {article.title}
              </h1>
              {lead && <p className="mt-4 text-[15px] leading-[1.9] text-ink-soft lg:mt-5 lg:text-base">{lead}</p>}
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-muted lg:mt-5">
                {updated ? (
                  <span>更新 <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time></span>
                ) : (
                  <span>公開 <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time></span>
                )}
                {article.readingTime ? <span>約{article.readingTime}分で読めます</span> : null}
              </p>
            </header>

            {/* アイキャッチ画像（SPは画面幅いっぱい） */}
            {featuredImageUrl && (
              <div className="relative -mx-4 mt-6 aspect-[16/9] overflow-hidden bg-paper-deep lg:mx-0 lg:mt-8">
                <Image
                  src={featuredImageUrl}
                  alt={featuredImageAlt}
                  fill
                  sizes="(max-width: 1023px) 100vw, 640px"
                  className="object-cover"
                  priority
                  unoptimized={!canOptimizeImage(featuredImageUrl)}
                />
              </div>
            )}
            {/* 写真の出典（CC BY などは撮影者名とライセンスを表示する） */}
            {article.heroPhoto && article.photoCredit && (
              <p className="mt-1.5 text-right text-[11px] text-ink-muted">
                写真：
                {article.photoCredit.source ? (
                  <a href={article.photoCredit.source} target="_blank" rel="noopener noreferrer" className="underline">
                    {article.photoCredit.creator || '出典'}
                  </a>
                ) : (
                  article.photoCredit.creator
                )}
                {article.photoCredit.license && ` / ${article.photoCredit.license}`}
              </p>
            )}

            <PrDisclosure compact className="mt-3" />

            <ArticleSummary items={article.summary} />

            {/* SP：目次（開閉できる） */}
            {tableOfContents.length > 0 && (
              <div className="mt-8 lg:hidden">
                <MobileTableOfContents items={tableOfContents} />
              </div>
            )}

            {/* 記事本文 */}
            <div
              id="article-body"
              className="article-body mt-10 lg:mt-12"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {/* 次にやること（商品・同じ樹種の記事・特集・診断） */}
            <ArticleNextSteps
              products={products}
              productsHeading={speciesLabel ? `${speciesLabel}の盆栽を見てみる` : undefined}
              productsMore={speciesSlug && speciesLabel ? { href: `/products/category/${speciesSlug}`, label: `${speciesLabel}の盆栽をすべて見る` } : undefined}
              guides={speciesGuides}
              guidesHeading={speciesLabel ? `${speciesLabel}の育て方をもっと読む` : undefined}
              links={nextLinks}
              hasRakuten={hasRakuten}
            />

            <RelatedArticleRows articles={relatedArticles} />

            <ShareButtons url={articleUrl} title={article.title} className="mt-10 border-t border-line pt-3" />
          </article>

          {/* PC：サイドバーの目次（スクロールしても追従） */}
          <aside className="hidden lg:block">
            {tableOfContents.length > 0 && (
              <div className="sticky top-24 pt-1">
                <TableOfContents items={tableOfContents} />
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
