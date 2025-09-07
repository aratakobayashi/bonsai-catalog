'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Search, X, Filter } from 'lucide-react'
import type { ArticleCategory, ArticleTag, ArticleFilters } from '@/types'

interface ArticleFiltersProps {
  categories: ArticleCategory[]
  tags: ArticleTag[]
  currentFilters: ArticleFilters
  totalCount: number
}

export function ArticleFilters({ 
  categories, 
  tags, 
  currentFilters, 
  totalCount 
}: ArticleFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '')
  const [isExpanded, setIsExpanded] = useState(false)

  // フィルター更新
  const updateFilters = (newFilters: Partial<ArticleFilters>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // 新しいフィルター値を設定
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.set(key, value.join(','))
      } else {
        params.set(key, value.toString())
      }
    })

    // ページ番号をリセット
    params.delete('page')
    
    router.push(`/guides?${params.toString()}`)
  }

  // 検索実行
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchQuery })
  }

  // カテゴリ選択
  const handleCategoryChange = (categorySlug: string) => {
    const newCategory = currentFilters.category === categorySlug ? undefined : categorySlug
    updateFilters({ category: newCategory })
  }

  // タグ選択/解除
  const handleTagToggle = (tagSlug: string) => {
    const currentTags = currentFilters.tags || []
    const newTags = currentTags.includes(tagSlug)
      ? currentTags.filter(tag => tag !== tagSlug)
      : [...currentTags, tagSlug]
    
    updateFilters({ tags: newTags })
  }

  // 全フィルタークリア
  const clearAllFilters = () => {
    setSearchQuery('')
    router.push('/guides')
  }

  // アクティブなフィルターの数
  const activeFiltersCount = [
    currentFilters.category,
    currentFilters.search,
    ...(currentFilters.tags || [])
  ].filter(Boolean).length

  return (
    <>
      {/* モバイル用フィルターボタン */}
      <div className="lg:hidden mb-6">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <span className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            フィルター
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </span>
        </Button>
      </div>

      {/* フィルターパネル */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block space-y-6`}>
        {/* 結果表示 */}
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{totalCount}</span>件の記事が見つかりました
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="mt-2 h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                すべてクリア
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 検索 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">キーワード検索</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="記事を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* カテゴリフィルター */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">カテゴリ</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={currentFilters.category === category.slug}
                    onChange={() => handleCategoryChange(category.slug)}
                    className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* タグフィルター */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">タグ</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* レベル系タグ */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  レベル
                </h4>
                <div className="flex flex-wrap gap-1">
                  {tags.filter(tag => ['beginner', 'intermediate', 'advanced'].includes(tag.slug)).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.slug)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        currentFilters.tags?.includes(tag.slug)
                          ? tag.color || 'bg-accent-100 text-accent-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 種類系タグ */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  樹種
                </h4>
                <div className="flex flex-wrap gap-1">
                  {tags.filter(tag => ['momiji', 'pine', 'sakura'].includes(tag.slug)).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.slug)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        currentFilters.tags?.includes(tag.slug)
                          ? tag.color || 'bg-accent-100 text-accent-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 季節系タグ */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  季節
                </h4>
                <div className="flex flex-wrap gap-1">
                  {tags.filter(tag => ['spring', 'summer', 'autumn', 'winter'].includes(tag.slug)).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.slug)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        currentFilters.tags?.includes(tag.slug)
                          ? tag.color || 'bg-accent-100 text-accent-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* その他のタグ */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  その他
                </h4>
                <div className="flex flex-wrap gap-1">
                  {tags.filter(tag => !['beginner', 'intermediate', 'advanced', 'momiji', 'pine', 'sakura', 'spring', 'summer', 'autumn', 'winter'].includes(tag.slug)).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.slug)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        currentFilters.tags?.includes(tag.slug)
                          ? tag.color || 'bg-accent-100 text-accent-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}