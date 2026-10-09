import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getArticleBySlug, getArticleLinkContext, getRelatedArticles } from '@/lib/database/articles'
import { supabaseServer } from '@/lib/supabase-server'
import { AMAZON_ENABLED } from '@/lib/affiliate'
import { ShareButtons } from '@/components/features/ShareButtons'
import { TableOfContents, MobileTableOfContents } from '@/components/features/TableOfContents'
import { ArticleSidebarProducts } from '@/components/article/ArticleSidebarProducts'
import { GuideArticleCard } from '@/components/article/GuideArticleCard'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ArticleStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { generateArticleSEO } from '@/lib/seo-utils'
import { formatDate } from '@/lib/date-utils'
import { processMarkdown, extractTableOfContents } from '@/lib/markdown'
import { detectArticleSpecies, fallbackSelectionSlug, normalizeForMatch, stripLeadingTitleHeading } from '@/lib/article-content'
import { getSelection, selectionsForCategory } from '@/lib/selections'
import { normalizeProduct } from '@/lib/catalog-model'
import { SITE_URL, absoluteUrl } from '@/lib/site'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER, Breadcrumbs, SectionTitle } from '@/components/ui/design'
import { isArticleHidden, isArticleIndexable } from '@/lib/content-policy'
import type { Product } from '@/types'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

// 関連商品を取得
async function getRelatedProducts(productIds?: string[], article?: any): Promise<Product[]> {
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

  // 智能推薦システムを使用
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

  const article = await getArticleBySlug(params.slug)
  
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

  const article = await getArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  // 並行してデータを取得
  const [relatedProducts, relatedArticles, linkContext] = await Promise.all([
    getRelatedProducts(article.relatedProducts, article),
    getRelatedArticles(article, 4),
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

  const catalogProducts = relatedProducts.map(normalizeProduct)
  const hasRakuten = catalogProducts.some(product => product.source === 'rakuten')
  const crumbs = [
    { label: '育て方', href: '/guides' },
    { label: article.category.name, href: `/guides?category=${article.category.slug}` },
  ]
  const articleUrl = `${SITE_URL}/guides/${article.slug}`
  const featuredImageUrl = article.featuredImage
    ? typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage.url
    : null
  const featuredImageAlt = article.featuredImage && typeof article.featuredImage !== 'string'
    ? article.featuredImage.alt || article.title
    : article.title

  // パンくずリスト構造化データ（画面のパンくずと同じ「ホーム › 育て方 › カテゴリ › 記事」）
  const breadcrumbs = [
    { name: 'ホーム', url: SITE_URL, position: 1 },
    { name: '育て方', url: `${SITE_URL}/guides`, position: 2 },
    { name: article.category.name, url: `${SITE_URL}/guides?category=${encodeURIComponent(article.category.slug)}`, position: 3 },
    { name: article.title, url: articleUrl, position: 4 },
  ]

  // 記事下の案内（診断・特集・樹種別の商品一覧）
  const species = detectArticleSpecies(article.title)
  const selection = (species && selectionsForCategory(species.category)[0]) || getSelection(fallbackSelectionSlug(article.title))

  return (
    <>
      <ArticleStructuredData
        article={article}
        baseUrl="https://www.bonsai-collection.com"
      />
      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />

      <div className={`${CONTAINER} pb-16 pt-5 lg:pb-20 lg:pt-6`}>
        <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, ...crumbs]} className="hidden lg:block" />
        <div className="lg:mt-10 lg:grid lg:grid-cols-[minmax(0,680px)_280px] lg:justify-center lg:gap-16 xl:gap-24">
          <article className="min-w-0">
            {/* 記事ヘッダー */}
            <header>
              <p className="text-[11px] tracking-[0.08em] text-gold-dark lg:text-xs">
                <Link href={`/guides?category=${article.category.slug}`} className="hover:text-ink">{article.category.name}</Link>
                {article.tags?.slice(0, 2).map(tag => (
                  <span key={tag.id} className="hidden lg:inline">・{tag.name}</span>
                ))}
              </p>
              <h1 className="mt-2 font-mincho text-[22px] font-bold leading-[1.45] tracking-[0.08em] text-ink lg:mt-3 lg:text-[32px]">
                {article.title}
              </h1>
              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-ink-muted lg:mt-4 lg:text-xs">
                <span className="hidden lg:inline">公開 {formatDate(article.publishedAt)}</span>
                {article.updatedAt !== article.publishedAt && <span>更新 {formatDate(article.updatedAt)}</span>}
                {article.readingTime && <span>{article.readingTime}分で読めます</span>}
                <span className="hidden lg:inline">盆栽コレクション編集部</span>
              </div>
            </header>

            {/* アイキャッチ画像（SPは画面幅いっぱい） */}
            {featuredImageUrl && (
              <div className="relative -mx-4 mt-5 aspect-[16/9] overflow-hidden bg-paper-deep lg:mx-0 lg:mt-8 lg:aspect-[680/420]">
                <Image
                  src={featuredImageUrl}
                  alt={featuredImageAlt}
                  fill
                  sizes="(max-width: 1023px) 100vw, 680px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <PrDisclosure className="mt-4 lg:mt-5" />

            {/* SP：目次 */}
            {tableOfContents.length > 0 && (
              <div className="mt-4 lg:hidden">
                <MobileTableOfContents items={tableOfContents} />
              </div>
            )}

            {/* 記事本文 */}
            <div
              id="article-body"
              className="article-body mt-5 lg:mt-8"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {/* シェア */}
            <div className="mt-12 border-t border-line pt-6">
              <p className="mb-3 text-[11px] tracking-[0.1em] text-ink-muted">この記事をシェア</p>
              <ShareButtons url={articleUrl} title={article.title} size="large" />
            </div>

            {/* 次の一歩（診断・特集・樹種別の商品一覧） */}
            <nav aria-labelledby="article-next" className="mt-10">
              <p id="article-next" className="text-[11px] tracking-[0.1em] text-ink-muted">盆栽を選ぶなら</p>
              <ul className="mt-2 border-t border-line">
                <li className="border-b border-line">
                  <Link href="/shindan" className="group flex min-h-[56px] items-center gap-3 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block font-mincho text-[15px] font-bold text-ink group-hover:text-gold-dark">かんたん盆栽診断</span>
                      <span className="mt-0.5 block text-xs text-ink-muted">置き場所・予算・楽しみ方など4つの質問で、合いそうな盆栽を探す</span>
                    </span>
                    <span aria-hidden="true" className="text-ink-muted">›</span>
                  </Link>
                </li>
                {selection && (
                  <li className="border-b border-line">
                    <Link href={`/selection/${selection.slug}`} className="group flex min-h-[56px] items-center gap-3 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="block font-mincho text-[15px] font-bold text-ink group-hover:text-gold-dark">{selection.shortTitle}</span>
                        <span className="mt-0.5 block text-xs text-ink-muted">{selection.tagline}</span>
                      </span>
                      <span aria-hidden="true" className="text-ink-muted">›</span>
                    </Link>
                  </li>
                )}
                {species && (
                  <li className="border-b border-line">
                    <Link href={`/products/category/${species.category}`} className="group flex min-h-[56px] items-center gap-3 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="block font-mincho text-[15px] font-bold text-ink group-hover:text-gold-dark">{species.label}の盆栽を探す</span>
                        <span className="mt-0.5 block text-xs text-ink-muted">通販で買える{species.label}を価格・ショップで比較</span>
                      </span>
                      <span aria-hidden="true" className="text-ink-muted">›</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* 関連商品（PCはサイドバーに表示） */}
            {catalogProducts.length > 0 && (
              <section id="related-products" className="mt-12 lg:hidden">
                <SectionTitle>この記事に関連する商品</SectionTitle>
                <p className="mt-1 text-[11px] text-ink-muted">PR・価格は取得時点の情報です</p>
                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6">
                  {catalogProducts.map(product => (
                    <CatalogProductCard key={product.id} product={product} />
                  ))}
                </div>
                {hasRakuten && (
                  <p className="mt-3 text-[11px] text-ink-muted">
                    楽天市場の商品情報は{' '}
                    <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>
                  </p>
                )}
              </section>
            )}

            {/* 関連記事 */}
            {relatedArticles.length > 0 && (
              <section className="mt-12 lg:mt-16">
                <SectionTitle>関連記事</SectionTitle>
                <div className="mt-2 lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-10">
                  {relatedArticles.map(related => (
                    <GuideArticleCard key={related.id} article={related} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* PC：サイドバー（目次・関連商品） */}
          <aside className="hidden pt-[120px] lg:block">
            <div className="sticky top-24 space-y-10">
              {tableOfContents.length > 0 && <TableOfContents items={tableOfContents} />}
              <ArticleSidebarProducts products={catalogProducts} />
              {hasRakuten && (
                <p className="-mt-6 text-[11px] text-ink-muted">
                  楽天市場の商品情報は{' '}
                  <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
