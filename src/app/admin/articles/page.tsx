import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pencil, Trash2, Eye, Plus } from 'lucide-react'
import { getArticles } from '@/lib/database/articles'

export default async function ArticlesPage() {
  // データベースから記事一覧を取得
  const articlesData = await getArticles({
    page: 1,
    limit: 100, // 管理画面では全記事を表示
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">記事管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            データベースで管理している記事の一覧です。
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button asChild>
            <Link href="/admin/articles/new" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              新規記事作成
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articlesData.articles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="mb-2">
                    {article.category.name}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/guides/${article.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm" 
                      asChild
                    >
                      <Link href={`/admin/articles/${article.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <CardTitle className="line-clamp-2 text-lg">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>更新: {new Date(article.updatedAt).toLocaleDateString('ja-JP')}</span>
                  {article.readingTime && (
                    <span>{article.readingTime}分で読める</span>
                  )}
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{article.tags.length - 3}個
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {articlesData.articles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">記事がありません</h3>
            <p className="text-gray-600 mb-6">
              最初の記事を作成してみましょう。
            </p>
            <Button asChild>
              <Link href="/admin/articles/new">
                新規記事作成
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              まだ記事がありません
            </div>
            <Button asChild>
              <Link href="/admin/articles/new">
                最初の記事を作成する
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}