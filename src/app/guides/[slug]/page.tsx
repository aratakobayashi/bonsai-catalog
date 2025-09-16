import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getArticleBySlug, getArticles } from '@/lib/database/articles'
import { supabaseServer } from '@/lib/supabase-server'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { RelatedProducts } from '@/components/features/RelatedProducts'
import { RelatedArticles } from '@/components/features/RelatedArticles'
import { ShareButtons } from '@/components/features/ShareButtons'
import { TableOfContents } from '@/components/features/TableOfContents'
import { ArticleProductCTA } from '@/components/features/ArticleProductCTA'
import { ArticleStructuredData, HowToStructuredData, BreadcrumbStructuredData, FAQStructuredData } from '@/components/seo/StructuredData'
import { generateArticleSEO, generateHowToStructuredData } from '@/lib/seo-utils'
import { generateArticleBreadcrumbs } from '@/lib/breadcrumb-utils'
import { getRelatedFAQs } from '@/lib/faq-data'
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import { processMarkdown, generateTableOfContents } from '@/lib/markdown'
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

// 動的レンダリング設定（静的生成は一旦無効化）
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    return {
      title: '記事が見つかりません - 盆栽コレクション'
    }
  }

  // 🚀 自動SEO最適化エンジンを使用
  const seo = generateArticleSEO(article)

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      ...seo.openGraph,
      images: article.featuredImage ? [{ url: `${typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage.url}?v=${Date.now()}&r=${Math.random().toString(36)}` }] : [],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ['盆栽コレクション'],
    },
    twitter: {
      ...seo.twitter,
      images: article.featuredImage ? [`${typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage.url}?v=${Date.now()}&r=${Math.random().toString(36)}`] : [],
    },
    alternates: {
      canonical: `https://www.bonsai-collection.com/guides/${params.slug}`,
    }
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

  // 目次を生成
  const tableOfContents = generateTableOfContents(article.content)

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 戻るボタン */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-indigo-100">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="hover:bg-indigo-50 transition-colors">
            <Link href="/guides" className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800">
              <ArrowLeft className="h-4 w-4" />
              記事一覧に戻る
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          {/* メインコンテンツ */}
          <article className="lg:col-span-8">
            {/* パンくずリスト */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-gray-700">ホーム</Link>
              <span>/</span>
              <Link href="/guides" className="hover:text-gray-700">ガイド記事</Link>
              <span>/</span>
              <Link href={`/guides/category/${article.category.slug}`} className="hover:text-gray-700">
                {article.category.name}
              </Link>
              <span>/</span>
              <span className="text-gray-900 truncate">{article.title}</span>
            </nav>

            {/* メイン記事カード */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-indigo-100/50 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
              {/* アイキャッチ画像 */}
              {article.featuredImage && (
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={`${typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage.url}?v=${Date.now()}&r=${Math.random().toString(36)}`}
                    alt={typeof article.featuredImage === 'string' ? article.title : (article.featuredImage.alt || article.title)}
                    width={1200}
                    height={675}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                    className="object-cover w-full h-full"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyejrznnvitF+wjat9Pldf0oxQCLHzqciHRWcJjDglnxkfkC+EAdV+1VFI7bKTN5bIy9LlLDAYjmQj6AHPw3pEUOiDpP//Z"
                  />
                </div>
              )}

              {/* 記事コンテンツエリア */}
              <div className="px-8 py-10">
                {/* 記事ヘッダー */}
                <header className="mb-8">
              {/* カテゴリとタグ */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge 
                  variant="secondary" 
                  className={`${article.category.color || 'bg-gray-100 text-gray-800'} font-medium`}
                >
                  <span className="mr-1">{article.category.icon}</span>
                  {article.category.name}
                </Badge>
                
                {article.tags && article.tags.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag.id}
                    variant="outline" 
                    className={`${tag.color || 'border-gray-300 text-gray-600'} text-xs`}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {/* タイトル */}
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 leading-tight">
                {article.title}
              </h1>

              {/* メタ情報 */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  公開：{formatDate(article.publishedAt)}
                </div>
                {article.updatedAt !== article.publishedAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    更新：{formatDate(article.updatedAt)}
                  </div>
                )}
                {article.readingTime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {article.readingTime}分で読める
                  </div>
                )}
              </div>

              {/* SNSシェアボタン */}
              <ShareButtons 
                url={`https://your-domain.com/guides/${article.slug}`}
                title={article.title}
              />
            </header>

                {/* 記事本文 */}
                <div className="bg-gradient-to-b from-white via-slate-50/30 to-white rounded-2xl p-4 md:p-8 mb-12 shadow-inner border border-slate-100">
                  <div className="prose prose-base md:prose-lg prose-slate max-w-none
                                prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-24
                                prose-h1:text-2xl md:prose-h1:text-4xl prose-h1:bg-gradient-to-r prose-h1:from-indigo-800 prose-h1:to-purple-700 prose-h1:bg-clip-text prose-h1:text-transparent prose-h1:mb-8
                                prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-8 md:prose-h2:mt-12 prose-h2:mb-4 md:prose-h2:mb-6 prose-h2:border-b-3 prose-h2:border-green-400 prose-h2:bg-gradient-to-r prose-h2:from-green-700 prose-h2:to-emerald-700 prose-h2:bg-clip-text prose-h2:text-transparent prose-h2:pb-3 prose-h2:font-extrabold
                                prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-6 md:prose-h3:mt-8 prose-h3:mb-3 md:prose-h3:mb-4 prose-h3:text-gray-800 prose-h3:font-bold
                                prose-p:text-gray-800 prose-p:leading-relaxed prose-p:mb-4 md:prose-p:mb-6 prose-p:text-[15px] md:prose-p:text-[16px] prose-p:font-medium
                                prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-700
                                prose-strong:text-gray-900 prose-strong:font-bold prose-strong:bg-yellow-100 prose-strong:px-1 prose-strong:py-0.5 prose-strong:rounded
                                prose-ul:my-4 md:prose-ul:my-6 prose-ul:ml-4 prose-li:my-1 md:prose-li:my-2 prose-li:text-gray-800 prose-li:leading-relaxed prose-li:font-medium
                                prose-ol:my-6 prose-ol:ml-4 prose-ol:text-gray-800
                                prose-blockquote:not-prose
                                prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-slate-800 prose-code:border prose-code:border-slate-200 prose-code:font-mono
                                prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:border prose-pre:border-slate-700
                                prose-img:rounded-xl prose-img:shadow-xl prose-img:my-8 prose-img:border prose-img:border-slate-200">
                    <div dangerouslySetInnerHTML={{ __html: processMarkdown(article.content) }} />
                  </div>
                </div>

                {/* 記事下SNSシェア */}
                <div className="border-t border-gray-200 pt-8 mb-0">
                  <h3 className="text-lg font-semibold mb-4">この記事をシェア</h3>
                  <ShareButtons
                    url={`https://your-domain.com/guides/${article.slug}`}
                    title={article.title}
                    size="large"
                  />
                </div>
              </div>
            </div>

            {/* 商品への導線CTA */}
            {relatedProducts.length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
                  <ArticleProductCTA
                    articleTitle={article.title}
                    hasRelatedProducts={relatedProducts.length > 0}
                  />
                </div>
              </div>
            )}

            {/* 関連商品セクション */}
            {relatedProducts.length > 0 && (
              <div id="related-products" className="mb-8">
                <div className="bg-white/95 backdrop-blur-sm border border-emerald-100 rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
                  <RelatedProducts products={relatedProducts} articleTitle={article.title} />
                </div>
              </div>
            )}

            {/* 関連記事 */}
            {relatedArticles.length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
                  <RelatedArticles articles={relatedArticles} />
                </div>
              </div>
            )}
          </article>

          {/* サイドバー */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* 目次 */}
              {tableOfContents.length > 0 && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                  <TableOfContents items={tableOfContents} />
                </div>
              )}

              {/* 著者情報 */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-xl p-4 md:p-6 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">盆栽コレクション</h4>
                    <p className="text-sm text-emerald-600">盆栽専門メディア</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-emerald-700">
                  盆栽の魅力を伝え、初心者から上級者まで楽しめる情報をお届けしています。
                </p>
              </div>

              {/* タグ一覧 */}
              {article.tags && article.tags.length > 0 && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl shadow-xl p-4 md:p-6 hover:shadow-2xl transition-shadow duration-300">
                  <h4 className="font-semibold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-4 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-violet-600" />
                    タグ
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/guides?tags=${tag.slug}`}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md ${
                          tag.color || 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 hover:from-violet-200 hover:to-purple-200'
                        }`}
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
    </>
  )
}