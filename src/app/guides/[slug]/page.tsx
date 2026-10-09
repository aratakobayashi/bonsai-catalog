import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
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

// ページの見出し（h1）は記事タイトルだけにするため、本文中の h1 は h2 として表示する
const demoteH1 = (html: string) => html.replace(/<h1(\s|>)/g, '<h2$1').replace(/<\/h1>/g, '</h2>')
import { normalizeProduct } from '@/lib/catalog-model'
import { SITE_URL } from '@/lib/site'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER, Breadcrumbs, SectionTitle } from '@/components/ui/design'
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
              dangerouslySetInnerHTML={{ __html: demoteH1(processMarkdown(article.content)) }}
            />

            {/* シェア */}
            <div className="mt-12 border-t border-line pt-6">
              <p className="mb-3 text-[11px] tracking-[0.1em] text-ink-muted">この記事をシェア</p>
              <ShareButtons url={articleUrl} title={article.title} size="large" />
            </div>

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
