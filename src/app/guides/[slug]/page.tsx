import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getArticleBySlug, getArticles } from '@/lib/database/articles'
import { supabaseServer } from '@/lib/supabase-server'
import { ShareButtons } from '@/components/features/ShareButtons'
import { TableOfContents, MobileTableOfContents } from '@/components/features/TableOfContents'
import { ArticleSidebarProducts } from '@/components/article/ArticleSidebarProducts'
import { GuideArticleCard } from '@/components/article/GuideArticleCard'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ArticleStructuredData, HowToStructuredData, BreadcrumbStructuredData, FAQStructuredData } from '@/components/seo/StructuredData'
import { generateArticleSEO, generateHowToStructuredData } from '@/lib/seo-utils'
import { generateArticleBreadcrumbs } from '@/lib/breadcrumb-utils'
import { getRelatedFAQs } from '@/lib/faq-data'
import { formatDate } from '@/lib/date-utils'
import { processMarkdown, generateTableOfContents } from '@/lib/markdown'
import { normalizeProduct } from '@/lib/catalog-model'
import { SITE_URL } from '@/lib/site'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER, Breadcrumbs, SectionTitle, Tag } from '@/components/ui/design'
import { isArticleIndexable } from '@/lib/content-policy'
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
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .in('id', productIds)
      .limit(4)

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
      images: article.featuredImage ? [{ url: typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage.url }] : [],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ['盆栽コレクション'],
    },
    twitter: {
      ...seo.twitter,
      images: article.featuredImage ? [typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage.url] : [],
    },
    alternates: {
      canonical: `https://www.bonsai-collection.com/guides/${params.slug}`,
    },
    ...(!isArticleIndexable(params.slug) && { robots: { index: false, follow: true } }),
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  // 並行してデータを取得
  const [relatedProducts, relatedArticlesData] = await Promise.all([
    getRelatedProducts(article.relatedProducts, article),
    getArticles({ 
      category: article.category.slug, 
      limit: 3 
    })
  ])

  // 現在の記事を除外
  const relatedArticles = relatedArticlesData.articles.filter(a => a.id !== article.id)

  // 日付フォーマット（hydrationエラー対策済み）

  // 目次を生成（大見出しだけを並べる。大見出しがない記事はすべての見出し）
  const allHeadings = generateTableOfContents(article.content)
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

  // How-to構造化データを自動生成
  const howToData = generateHowToStructuredData(article)

  // パンくずリスト構造化データを生成
  const breadcrumbs = generateArticleBreadcrumbs(article)

  // 記事に関連するFAQを自動生成
  const relatedFAQs = getRelatedFAQs(article.title, article.content, 5)

  return (
    <>
      <ArticleStructuredData
        article={article}
        baseUrl="https://www.bonsai-collection.com"
      />
      {/* How-to記事の場合は自動的にHowTo構造化データを追加 */}
      {howToData && (
        <HowToStructuredData
          {...howToData}
          baseUrl="https://www.bonsai-collection.com"
          articleSlug={article.slug}
        />
      )}
      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />
      {relatedFAQs.length > 0 && (
        <FAQStructuredData
          faqs={relatedFAQs}
          baseUrl="https://www.bonsai-collection.com"
        />
      )}

      <div className={`${CONTAINER} pb-12 pt-4 lg:pt-8`}>
        <div className="mx-auto lg:grid lg:max-w-[1040px] lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
          <article className="min-w-0">
            {/* 記事ヘッダー */}
            <header>
              <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, ...crumbs]} className="hidden lg:block" />
              <Breadcrumbs items={crumbs} className="lg:hidden" />
              <div className="mt-3 hidden flex-wrap gap-1.5 lg:flex">
                <Tag>{article.category.name}</Tag>
                {article.tags?.slice(0, 3).map(tag => (
                  <span key={tag.id} className="inline-block rounded bg-[#eef2f7] px-1.5 py-0.5 text-[11px] font-bold text-navy">{tag.name}</span>
                ))}
              </div>
              <h1 className="mt-2 font-mincho text-[23px] font-bold leading-[1.5] text-navy lg:mt-3 lg:text-[32px] lg:leading-[1.45]">
                {article.title}
              </h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-ink-muted lg:mt-3 lg:text-xs">
                <span className="hidden lg:inline">公開 {formatDate(article.publishedAt)}</span>
                {article.updatedAt !== article.publishedAt && <span>更新 {formatDate(article.updatedAt)}</span>}
                {article.readingTime && <span>{article.readingTime}分で読めます</span>}
                <span className="hidden lg:inline">盆栽コレクション</span>
              </div>
            </header>

            {/* アイキャッチ画像 */}
            {featuredImageUrl && (
              <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-xl bg-[#f1eee8] lg:mt-5">
                <Image
                  src={featuredImageUrl}
                  alt={featuredImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 720px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <PrDisclosure compact className="mt-3" />

            {/* SP：目次 */}
            {tableOfContents.length > 0 && (
              <div className="mt-4 lg:hidden">
                <MobileTableOfContents items={tableOfContents} />
              </div>
            )}

            {/* 記事本文 */}
            <div
              id="article-body"
              className="article-body mt-6 lg:mt-8"
              dangerouslySetInnerHTML={{ __html: processMarkdown(article.content) }}
            />

            {/* シェア */}
            <div className="mt-10 border-t border-line pt-6">
              <p className="mb-3 text-[13px] font-bold text-navy">この記事をシェア</p>
              <ShareButtons url={articleUrl} title={article.title} size="large" />
            </div>

            {/* 関連商品（PCはサイドバーに表示） */}
            {catalogProducts.length > 0 && (
              <section id="related-products" className="mt-10 lg:hidden">
                <SectionTitle>この記事に関連する商品</SectionTitle>
                <p className="mt-1 text-[11px] text-ink-muted">PR・価格は取得時点の情報です</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {catalogProducts.map(product => (
                    <CatalogProductCard key={product.id} product={product} />
                  ))}
                </div>
                {hasRakuten && (
                  <p className="mt-2 text-[11px] text-ink-muted">
                    楽天市場の商品情報は{' '}
                    <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>
                  </p>
                )}
              </section>
            )}

            {/* 関連記事 */}
            {relatedArticles.length > 0 && (
              <section className="mt-10">
                <SectionTitle>関連記事</SectionTitle>
                <div className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white lg:grid lg:grid-cols-2 lg:gap-5 lg:divide-y-0 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent">
                  {relatedArticles.map(related => (
                    <GuideArticleCard key={related.id} article={related} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* PC：サイドバー（目次・関連商品） */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              {tableOfContents.length > 0 && <TableOfContents items={tableOfContents} />}
              <ArticleSidebarProducts products={catalogProducts} />
              {hasRakuten && (
                <p className="px-1 text-[11px] text-ink-muted">
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
