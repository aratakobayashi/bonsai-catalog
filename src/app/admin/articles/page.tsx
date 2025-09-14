import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pencil, Trash2, Eye, Plus } from 'lucide-react'
import type { InternalArticle } from '@/lib/cms/article-manager'

export default async function ArticlesPage() {
  // API から記事一覧を取得
  let articles: InternalArticle[] = []
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://bonsai-catalog.vercel.app'
      : 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/articles`, {
      cache: 'no-store'
    })
    if (response.ok) {
      articles = await response.json()
    }
  } catch (error) {
    console.error('記事取得エラー:', error)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">記事管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            内製CMSで管理している記事の一覧です。
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
          {articles.map((article) => (
            <Card key={article.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="mb-2">
                    {article.category}
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
                      <Link href={`/admin/articles/${article.slug}/edit`}>
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
                  <span>{article.readingTime}分で読める</span>
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
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