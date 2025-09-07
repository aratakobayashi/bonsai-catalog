'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { BookOpen, Calendar, Clock } from 'lucide-react'
import type { Article } from '@/types'

interface RelatedArticlesProps {
  articles: Article[]
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric'
    })
  }

  return (
    <section>
      <div className="flex items-center mb-6">
        <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">関連記事</h2>
      </div>
      
      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="group overflow-hidden hover:shadow-md transition-all duration-300">
            <Link href={`/guides/${article.slug}`}>
              <CardContent className="p-0">
                <div className="flex">
                  {/* サムネイル画像 */}
                  <div className="w-32 h-24 relative bg-gray-100 flex-shrink-0">
                    {article.featuredImage ? (
                      <Image
                        src={article.featuredImage.url}
                        alt={article.featuredImage.alt || article.title}
                        fill
                        sizes="128px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl text-gray-400">🌲</span>
                      </div>
                    )}
                  </div>

                  {/* 記事情報 */}
                  <div className="flex-1 p-4">
                    {/* カテゴリとタグ */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${article.category.color || 'bg-gray-100 text-gray-600'}`}
                      >
                        <span className="mr-1">{article.category.icon}</span>
                        {article.category.name}
                      </Badge>
                      
                      {article.tags && article.tags.slice(0, 2).map((tag) => (
                        <Badge 
                          key={tag.id}
                          variant="outline" 
                          className={`text-xs ${tag.color || 'border-gray-300 text-gray-500'}`}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    {/* タイトル */}
                    <h3 className="font-semibold text-base mb-2 text-gray-900 hover:text-accent-600 transition-colors line-clamp-2 group-hover:text-accent-600">
                      {article.title}
                    </h3>

                    {/* 抜粋 */}
                    {article.excerpt && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}

                    {/* メタ情報 */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(article.publishedAt)}
                      </div>
                      {article.readingTime && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.readingTime}分
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* 全記事を見るリンク */}
      <div className="text-center mt-8">
        <Link href="/guides">
          <Button variant="outline" size="lg">
            すべての記事を見る
          </Button>
        </Link>
      </div>
    </section>
  )
}