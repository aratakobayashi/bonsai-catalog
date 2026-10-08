'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Search, X, Filter } from 'lucide-react'
import type { ArticleCategory, ArticleTag, ArticleFilters } from '@/types'

const THEME_GROUPS = [
  { label: 'お手入れ', terms: ['水やり', '剪定', '植え替え', '肥料', '針金', '病害虫', '冬越し', '枯れ'] },
  { label: '樹種', terms: ['松', '真柏', 'もみじ', '桜', '梅', 'さつき', '南天', 'ガジュマル'] },
  { label: '目的・シーン', terms: ['初心者', '室内', '100均', 'ギフト', '正月', '母の日', '敬老の日'] },
]

interface ArticleFiltersProps {
  categories: ArticleCategory[]
  tags: ArticleTag[]
  currentFilters: ArticleFilters
  totalCount: number
}

export function ArticleFilters({ 
  categories, 
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

        {/* よく探されるテーマ（記事のタグは種類が多く使われ方もばらばらなため、キーワード検索の入口にする） */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">よく探されるテーマ</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {THEME_GROUPS.map(group => (
              <div key={group.label}>
                <h4 className="text-xs font-semibold text-gray-500 tracking-wider mb-2">{group.label}</h4>
                <div className="flex flex-wrap gap-1">
                  {group.terms.map(term => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term)
                        updateFilters({ search: currentFilters.search === term ? undefined : term })
                      }}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        currentFilters.search === term
                          ? 'bg-accent-100 text-accent-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}