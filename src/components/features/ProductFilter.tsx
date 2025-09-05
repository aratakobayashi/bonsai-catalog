'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { getSizeCategoryLabel } from '@/lib/utils'
import type { ProductFilters, SizeCategory } from '@/types'
import { X, Filter } from 'lucide-react'

interface ProductFilterProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  availableCategories: string[]
  availableTags: string[]
}

const SIZE_CATEGORIES: SizeCategory[] = ['mini', 'small', 'medium', 'large', 'unknown']

export function ProductFilter({ 
  filters, 
  onFiltersChange, 
  availableCategories, 
  availableTags 
}: ProductFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilters = (updates: Partial<ProductFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof ProductFilters]
    return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  })

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || []
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    updateFilters({ tags: updatedTags.length > 0 ? updatedTags : undefined })
  }

  return (
    <>
      {/* モバイル用フィルターボタン */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            フィルター
            {hasActiveFilters && (
              <span className="bg-bonsai-green-600 text-white text-xs px-2 py-1 rounded-full">
                ON
              </span>
            )}
          </div>
        </Button>
      </div>

      {/* フィルターパネル */}
      <Card className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">フィルター</CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                クリア
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* カテゴリフィルター */}
          <div>
            <h3 className="font-medium mb-3">カテゴリ</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  checked={!filters.category}
                  onChange={() => updateFilters({ category: undefined })}
                  className="mr-2"
                />
                すべて
              </label>
              {availableCategories.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category}
                    onChange={() => updateFilters({ category })}
                    className="mr-2"
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>

          {/* サイズフィルター */}
          <div>
            <h3 className="font-medium mb-3">サイズ</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="size"
                  checked={!filters.size_category}
                  onChange={() => updateFilters({ size_category: undefined })}
                  className="mr-2"
                />
                すべて
              </label>
              {SIZE_CATEGORIES.map(size => (
                <label key={size} className="flex items-center">
                  <input
                    type="radio"
                    name="size"
                    checked={filters.size_category === size}
                    onChange={() => updateFilters({ size_category: size })}
                    className="mr-2"
                  />
                  {getSizeCategoryLabel(size)}
                </label>
              ))}
            </div>
          </div>

          {/* 価格帯フィルター */}
          <div>
            <h3 className="font-medium mb-3">価格帯</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">最低価格</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.price_min || ''}
                  onChange={(e) => updateFilters({ 
                    price_min: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">最高価格</label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={filters.price_max || ''}
                  onChange={(e) => updateFilters({ 
                    price_max: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* タグフィルター */}
          {availableTags.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">特徴タグ</h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 12).map(tag => {
                  const isSelected = filters.tags?.includes(tag) || false
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-bonsai-green-600 text-white border-bonsai-green-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-bonsai-green-600'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}