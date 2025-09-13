import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getArticleBySlug, getArticles } from '@/lib/microcms'
import { supabaseServer } from '@/lib/supabase-server'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { RelatedProducts } from '@/components/features/RelatedProducts'
import { RelatedArticles } from '@/components/features/RelatedArticles'
import { ShareButtons } from '@/components/features/ShareButtons'
import { TableOfContents } from '@/components/features/TableOfContents'
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import type { Product } from '@/types'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

// 関連商品を取得
async function getRelatedProducts(productIds?: string[]): Promise<Product[]> {
  if (!productIds || productIds.length === 0) return []

  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .in('id', productIds)
    .limit(4)

  if (error || !data) return []
  return data
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    return {
      title: '記事が見つかりません - 盆栽コレクション'
    }
  }

  const seoTitle = article.seoTitle || article.title
  const seoDescription = article.seoDescription || article.excerpt || article.title

  return {
    title: `${seoTitle} - 盆栽コレクション`,
    description: seoDescription,
    keywords: article.tags?.map(tag => tag.name).join(', '),
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: article.featuredImage ? [{ url: article.featuredImage.url }] : [],
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ['盆栽コレクション'],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: article.featuredImage ? [article.featuredImage.url] : [],
    },
    alternates: {
      canonical: `https://your-domain.com/guides/${params.slug}`,
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
    getRelatedProducts(article.relatedProducts),
    getArticles({ 
      category: article.category.slug, 
      limit: 3 
    })
  ])

  // 現在の記事を除外
  const relatedArticles = relatedArticlesData.articles.filter(a => a.id !== article.id)

  // 日付フォーマット（hydrationエラー対策済み）

  // 目次を生成（簡易版）
  const generateTOC = (content: string) => {
    const headings = content.match(/^#{1,3}\s+(.+)$/gm) || []
    return headings.map((heading, index) => {
      const level = heading.match(/^#{1,3}/)?.[0].length || 1
      const text = heading.replace(/^#{1,3}\s+/, '')
      const id = `heading-${index}`
      return { level, text, id }
    })
  }

  const tableOfContents = generateTOC(article.content)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 戻るボタン */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/guides" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              記事一覧に戻る
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
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

            {/* アイキャッチ画像 */}
            {article.featuredImage && (
              <div className="aspect-video relative mb-8 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={article.featuredImage.url}
                  alt={article.featuredImage.alt || article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* 記事本文 */}
            <div className="prose prose-lg max-w-none mb-12">
              {/* 簡易的なMarkdown表示（実際にはMarkdownパーサーを使用） */}
              <div 
                className="prose-headings:text-gray-900 prose-a:text-accent-600 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br>') }}
              />
            </div>

            {/* 記事下SNSシェア */}
            <div className="border-t border-gray-200 pt-8 mb-12">
              <h3 className="text-lg font-semibold mb-4">この記事をシェア</h3>
              <ShareButtons 
                url={`https://your-domain.com/guides/${article.slug}`}
                title={article.title}
                size="large"
              />
            </div>

            {/* 関連商品セクション */}
            {relatedProducts.length > 0 && (
              <div className="mb-12">
                <RelatedProducts products={relatedProducts} />
              </div>
            )}

            {/* 関連記事 */}
            {relatedArticles.length > 0 && (
              <div className="mb-12">
                <RelatedArticles articles={relatedArticles} />
              </div>
            )}
          </article>

          {/* サイドバー */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* 目次 */}
              {tableOfContents.length > 0 && (
                <TableOfContents items={tableOfContents} />
              )}

              {/* 著者情報 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">盆栽コレクション</h4>
                      <p className="text-sm text-gray-600">盆栽専門メディア</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    盆栽の魅力を伝え、初心者から上級者まで楽しめる情報をお届けしています。
                  </p>
                </CardContent>
              </Card>

              {/* タグ一覧 */}
              {article.tags && article.tags.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      タグ
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/guides?tags=${tag.slug}`}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors hover:opacity-80 ${
                            tag.color || 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}