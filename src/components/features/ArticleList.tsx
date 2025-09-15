'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ChevronLeft, ChevronRight, Clock, ShoppingBag, Calendar } from 'lucide-react'
import type { ArticleListResponse, ArticleFilters } from '@/types'

interface ArticleListProps {
  articlesData: ArticleListResponse
  currentFilters: ArticleFilters
}

export function ArticleList({ articlesData, currentFilters }: ArticleListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'publishedAt')

  // ソート変更
  const handleSortChange = (newSort: string) => {
    const validSort = newSort as 'publishedAt' | 'updatedAt' | 'readingTime' | 'title'
    setSortBy(validSort)
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', newSort)
    params.delete('page')
    router.push(`/guides?${params.toString()}`)
  }

  // ページ変更
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/guides?${params.toString()}`)
  }

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const { articles, totalCount, currentPage, totalPages, hasNext, hasPrev } = articlesData

  return (
    <div className="space-y-6">
      {/* ヘッダー - 結果数とソート */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalCount}</span>件の記事
          {currentFilters.search && (
            <>
              「<span className="font-semibold text-gray-900">{currentFilters.search}</span>」の検索結果
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">並び順:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          >
            <option value="publishedAt">公開日（新しい順）</option>
            <option value="updatedAt">更新日（新しい順）</option>
            <option value="readingTime">読了時間（短い順）</option>
            <option value="title">タイトル（あいうえお順）</option>
          </select>
        </div>
      </div>

      {/* 記事一覧 */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {/* アイキャッチ画像 */}
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {article.featuredImage ? (
                  <Image
                    src={`${article.featuredImage.url}?v=${Date.now()}&r=${Math.random().toString(36)}`}
                    alt={article.featuredImage.alt || article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                    <span className="text-4xl">🌲</span>
                  </div>
                )}
                
                {/* カテゴリバッジ */}
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-medium bg-white/90 backdrop-blur-sm shadow-sm ${article.category.color || 'text-gray-700'}`}
                  >
                    <span className="mr-1">{article.category.icon}</span>
                    {article.category.name}
                  </Badge>
                </div>

                {/* 関連商品数バッジ */}
                {article.relatedProducts && article.relatedProducts.length > 0 && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-xs font-medium bg-orange-500/90 text-white backdrop-blur-sm shadow-sm">
                      <ShoppingBag className="h-3 w-3 mr-1" />
                      {article.relatedProducts.length}商品
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                {/* タグ */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          tag.color || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs text-gray-500 self-center">
                        +{article.tags.length - 3}個
                      </span>
                    )}
                  </div>
                )}

                {/* タイトル */}
                <Link href={`/guides/${article.slug}`}>
                  <h2 className="font-bold text-lg mb-3 text-gray-900 hover:text-accent-600 transition-colors duration-200 line-clamp-2 leading-tight group-hover:text-accent-600">
                    {article.title}
                  </h2>
                </Link>

                {/* 抜粋 */}
                {article.excerpt && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}

                {/* メタ情報 */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(article.publishedAt)}
                    </div>
                    {article.readingTime && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {article.readingTime}分で読める
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // 記事が見つからない場合
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">記事が見つかりませんでした</h3>
          <p className="text-gray-600 mb-6">
            検索条件を変更するか、フィルターをクリアしてお試しください。
          </p>
          <Button variant="outline" onClick={() => router.push('/guides')}>
            すべての記事を見る
          </Button>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrev}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            前へ
          </Button>

          <div className="flex items-center space-x-1">
            {(() => {
              const visiblePages = []
              const maxVisible = 5
              let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
              let endPage = Math.min(totalPages, startPage + maxVisible - 1)

              // 末尾の調整
              if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1)
              }

              for (let i = startPage; i <= endPage; i++) {
                visiblePages.push(
                  <Button
                    key={i}
                    variant={currentPage === i ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(i)}
                    className="min-w-[2.5rem]"
                  >
                    {i}
                  </Button>
                )
              }

              return visiblePages
            })()}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNext}
            className="flex items-center"
          >
            次へ
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}