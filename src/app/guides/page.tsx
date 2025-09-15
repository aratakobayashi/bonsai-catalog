import { Metadata } from 'next'
import { Suspense } from 'react'
import { getArticles, getCategories, getTags } from '@/lib/database/articles'
import { ArticleList } from '@/components/features/ArticleList'
import { ArticleFilters } from '@/components/features/ArticleFilters'

export const metadata: Metadata = {
  title: '盆栽ガイド記事一覧 - 盆栽コレクション',
  description: '盆栽の育て方、選び方、種類別ガイドなど、盆栽に関する詳しい情報をお届けします。初心者から上級者まで役立つコンテンツを豊富にご用意しています。',
  keywords: '盆栽, 育て方, 管理, ガイド, 初心者, もみじ, 松, 桜, コツ',
  openGraph: {
    title: '盆栽ガイド記事一覧 - 盆栽コレクション',
    description: '盆栽の育て方、選び方、種類別ガイドなど、盆栽に関する詳しい情報をお届けします。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '盆栽ガイド記事一覧 - 盆栽コレクション',
    description: '盆栽の育て方、選び方、種類別ガイドなど、盆栽に関する詳しい情報をお届けします。',
  },
}

interface ArticlesPageProps {
  searchParams: {
    category?: string
    tags?: string
    search?: string
    page?: string
    sortBy?: string
  }
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  // URLパラメータからフィルター条件を構築
  const filters = {
    category: searchParams.category,
    tags: searchParams.tags ? searchParams.tags.split(',') : undefined,
    search: searchParams.search,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 12,
    sortBy: searchParams.sortBy as 'publishedAt' | 'updatedAt' | 'readingTime' | 'title' | undefined
  }

  // 並行してデータを取得
  const [articlesData, categories, tags] = await Promise.all([
    getArticles(filters),
    getCategories(),
    getTags()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダーエリア */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <a href="/" className="hover:text-gray-700">ホーム</a>
              <span>/</span>
              <span className="text-gray-900">盆栽ガイド記事</span>
            </nav>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              盆栽ガイド記事
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              盆栽の育て方から選び方まで、専門的な知識をわかりやすく解説。<br />
              初心者の方も安心して盆栽ライフを楽しめるよう、実践的なガイドをお届けします。
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー - フィルター */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-96" />}>
                <ArticleFilters
                  categories={categories}
                  tags={tags}
                  currentFilters={filters}
                  totalCount={articlesData.totalCount}
                />
              </Suspense>
            </div>
          </div>

          {/* メインコンテンツ - 記事一覧 */}
          <div className="lg:col-span-3">
            <Suspense fallback={<ArticleListSkeleton />}>
              <ArticleList
                articlesData={articlesData}
                currentFilters={filters}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

// スケルトンローディング
function ArticleListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-48 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16" />
                <div className="h-6 bg-gray-200 rounded-full w-12" />
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-full" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}