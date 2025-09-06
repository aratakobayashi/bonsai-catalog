'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { X, ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductFilters, SizeCategory } from '@/types'

interface AdvancedFilterProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  availableCategories: string[]
  availableTags: string[]
  className?: string
  isMobile?: boolean
}

interface PriceRange {
  min: number
  max: number
}

const sizeOptions: { value: SizeCategory; label: string }[] = [
  { value: 'mini', label: 'ミニ (〜15cm)' },
  { value: 'small', label: '小品 (15-30cm)' },
  { value: 'medium', label: '中品 (30-60cm)' },
  { value: 'large', label: '大品 (60cm〜)' },
]

const priceRanges: PriceRange[] = [
  { min: 0, max: 5000 },
  { min: 5000, max: 15000 },
  { min: 15000, max: 30000 },
  { min: 30000, max: 50000 },
  { min: 50000, max: 100000 },
  { min: 100000, max: Infinity },
]

export function AdvancedFilter({
  filters,
  onFiltersChange,
  availableCategories,
  availableTags,
  className,
  isMobile = false
}: AdvancedFilterProps) {
  const [isExpanded, setIsExpanded] = useState(!isMobile)
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    size: true,
    price: true,
    season: true,
    location: true,
    tags: true,
  })

  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || [])
  const [customPriceRange, setCustomPriceRange] = useState({
    min: filters.price_min || 0,
    max: filters.price_max || 100000,
  })

  // 季節オプション
  const seasonOptions = [
    { value: 'spring', label: '春', icon: '🌸' },
    { value: 'summer', label: '夏', icon: '🌿' },
    { value: 'autumn', label: '秋', icon: '🍁' },
    { value: 'winter', label: '冬', icon: '❄️' },
    { value: 'all-season', label: '四季', icon: '🔄' }
  ]

  // 置き場所オプション
  const locationOptions = [
    { value: 'indoor', label: '室内', icon: '🏠' },
    { value: 'outdoor', label: '屋外', icon: '🌞' },
    { value: 'semi-shade', label: '半日陰', icon: '🌤️' }
  ]

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCategoryChange = (category: string) => {
    const newFilters = {
      ...filters,
      category: filters.category === category ? undefined : category
    }
    onFiltersChange(newFilters)
  }

  const handleSizeChange = (size: SizeCategory) => {
    const newFilters = {
      ...filters,
      size_category: filters.size_category === size ? undefined : size
    }
    onFiltersChange(newFilters)
  }

  const handleSeasonChange = (season: string) => {
    const newFilters = {
      ...filters,
      season: filters.season === season ? undefined : season
    }
    onFiltersChange(newFilters)
  }

  const handleLocationChange = (location: string) => {
    const newFilters = {
      ...filters,
      location: filters.location === location ? undefined : location
    }
    onFiltersChange(newFilters)
  }

  const handlePriceRangeChange = (range: PriceRange) => {
    const newFilters = {
      ...filters,
      price_min: range.min,
      price_max: range.max === Infinity ? undefined : range.max
    }
    onFiltersChange(newFilters)
    setCustomPriceRange({ min: range.min, max: range.max === Infinity ? 100000 : range.max })
  }

  const handleCustomPriceChange = () => {
    const newFilters = {
      ...filters,
      price_min: customPriceRange.min,
      price_max: customPriceRange.max
    }
    onFiltersChange(newFilters)
  }

  const handleTagChange = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newSelectedTags)
    
    const newFilters = {
      ...filters,
      tags: newSelectedTags.length > 0 ? newSelectedTags : undefined
    }
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    setSelectedTags([])
    setCustomPriceRange({ min: 0, max: 100000 })
    onFiltersChange({})
  }

  const hasActiveFilters = !!(
    filters.category ||
    filters.size_category ||
    filters.season ||
    filters.location ||
    filters.price_min ||
    filters.price_max ||
    (filters.tags && filters.tags.length > 0)
  )

  const FilterSection = ({ 
    title, 
    sectionKey, 
    children 
  }: { 
    title: string
    sectionKey: keyof typeof expandedSections
    children: React.ReactNode 
  }) => (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between py-4 px-1 hover:bg-neutral-50 transition-colors rounded-md"
      >
        <span className="font-semibold text-primary-800">{title}</span>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4 text-neutral-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="pb-4 px-1">
          {children}
        </div>
      )}
    </div>
  )

  // FilterContent component definition - defined before any usage
  const FilterContent = () => (
    <>
      {/* フィルタークリアボタン */}
      {hasActiveFilters && (
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-neutral-600 hover:text-accent-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            すべてクリア
          </Button>
        </div>
      )}

      {/* カテゴリフィルター */}
      <FilterSection title="カテゴリ" sectionKey="category">
        <div className="space-y-2">
          {availableCategories.map((category) => (
            <label
              key={category}
              className="flex items-center space-x-3 cursor-pointer hover:bg-neutral-50 p-2 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.category === category}
                onChange={() => handleCategoryChange(category)}
                className="rounded border-neutral-300 text-accent-600 focus:ring-accent-500"
              />
              <span className="text-sm text-neutral-700">{category}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* 季節フィルター */}
      <FilterSection title="🌸 季節・見頃" sectionKey="season">
        <div className="space-y-2">
          {seasonOptions.map((season) => (
            <label
              key={season.value}
              className="flex items-center space-x-3 cursor-pointer hover:bg-neutral-50 p-2 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.season === season.value}
                onChange={() => handleSeasonChange(season.value)}
                className="rounded border-neutral-300 text-accent-600 focus:ring-accent-500"
              />
              <span className="text-lg mr-1">{season.icon}</span>
              <span className="text-sm text-neutral-700">{season.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* 置き場所フィルター */}
      <FilterSection title="🏠 置き場所" sectionKey="location">
        <div className="space-y-2">
          {locationOptions.map((location) => (
            <label
              key={location.value}
              className="flex items-center space-x-3 cursor-pointer hover:bg-neutral-50 p-2 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.location === location.value}
                onChange={() => handleLocationChange(location.value)}
                className="rounded border-neutral-300 text-accent-600 focus:ring-accent-500"
              />
              <span className="text-lg mr-1">{location.icon}</span>
              <span className="text-sm text-neutral-700">{location.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* サイズフィルター */}
      <FilterSection title="サイズ" sectionKey="size">
        <div className="space-y-2">
          {sizeOptions.map((size) => (
            <label
              key={size.value}
              className="flex items-center space-x-3 cursor-pointer hover:bg-neutral-50 p-2 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.size_category === size.value}
                onChange={() => handleSizeChange(size.value)}
                className="rounded border-neutral-300 text-accent-600 focus:ring-accent-500"
              />
              <span className="text-sm text-neutral-700">{size.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* 価格フィルター - 改善されたスライダーUI */}
      <FilterSection title="💰 価格" sectionKey="price">
        <div className="space-y-4">
          {/* プリセット価格範囲 - より見やすく */}
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 cursor-pointer hover:bg-accent-50 p-3 rounded-lg transition-colors border border-transparent hover:border-accent-200"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.price_min === range.min && 
                           (filters.price_max === range.max || (range.max === Infinity && !filters.price_max))}
                  onChange={() => handlePriceRangeChange(range)}
                  className="text-accent-600 focus:ring-accent-500"
                />
                <span className="text-sm font-medium text-neutral-700">
                  {range.max === Infinity 
                    ? `¥${range.min.toLocaleString()}以上` 
                    : `¥${range.min.toLocaleString()} - ¥${range.max.toLocaleString()}`
                  }
                </span>
              </label>
            ))}
          </div>

          {/* カスタム価格範囲 - より使いやすく */}
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              カスタム範囲
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-neutral-500 mb-1">最小価格</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={customPriceRange.min}
                    onChange={(e) => setCustomPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>
                <span className="text-neutral-500 pt-4">〜</span>
                <div className="flex-1">
                  <label className="block text-xs text-neutral-500 mb-1">最大価格</label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={customPriceRange.max}
                    onChange={(e) => setCustomPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCustomPriceChange}
                className="w-full bg-accent-50 hover:bg-accent-100 text-accent-700 border-accent-200"
              >
                この範囲で検索
              </Button>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* タグフィルター */}
      {availableTags.length > 0 && (
        <FilterSection title="🏷️ タグ" sectionKey="tags">
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {availableTags.map((tag) => (
              <label
                key={tag}
                className="flex items-center space-x-3 cursor-pointer hover:bg-neutral-50 p-2 rounded-md transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  className="rounded border-neutral-300 text-accent-600 focus:ring-accent-500"
                />
                <span className="text-sm text-neutral-700">{tag}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}
    </>
  )

  if (isMobile) {
    return (
      <div className={className}>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mb-4 justify-between"
        >
          <span className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            フィルター
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 bg-accent-500 text-white text-xs rounded-full">
                {[
                  filters.category,
                  filters.season,
                  filters.location,
                  filters.size_category,
                  filters.price_min || filters.price_max ? 'price' : null,
                  ...(filters.tags || [])
                ].filter(Boolean).length}
              </span>
            )}
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {isExpanded && (
          <Card>
            <CardContent className="p-4">
              <FilterContent />
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <Card className={cn('h-fit sticky top-24', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center">
          <Filter className="h-5 w-5 mr-2 text-accent-600" />
          フィルター
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <FilterContent />
      </CardContent>
    </Card>
  )
}