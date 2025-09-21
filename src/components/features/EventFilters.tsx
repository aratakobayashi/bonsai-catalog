'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, MapPin, Calendar, Tag, Building } from 'lucide-react'
import { EventType, EventSearchParams } from '@/types'
import { cn } from '@/lib/utils'

const eventTypeConfig = {
  exhibition: { label: '展示', icon: '🌳', color: 'text-green-600 bg-green-50' },
  sale: { label: '即売', icon: '🛒', color: 'text-blue-600 bg-blue-50' },
  workshop: { label: 'ワークショップ', icon: '✂️', color: 'text-orange-600 bg-orange-50' },
  lecture: { label: '講習', icon: '📖', color: 'text-purple-600 bg-purple-50' }
}

interface EventFiltersProps {
  filters: EventSearchParams
  onFiltersChange: (filters: EventSearchParams) => void
  prefectures?: string[]
  gardens?: Array<{ id: string; name: string }>
  className?: string
}

export function EventFilters({
  filters,
  onFiltersChange,
  prefectures = [],
  gardens = [],
  className
}: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  // フィルターが変更されたときにローカル状態を更新
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleSearchChange = (search: string) => {
    const updatedFilters = { ...localFilters, search, page: 1 }
    setLocalFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const handleFilterChange = (key: keyof EventSearchParams, value: any) => {
    const updatedFilters = { ...localFilters, [key]: value, page: 1 }
    setLocalFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const handleTypeToggle = (type: EventType) => {
    const currentTypes = localFilters.types || []
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]

    handleFilterChange('types', updatedTypes)
  }

  const clearFilters = () => {
    const clearedFilters: EventSearchParams = {
      page: 1,
      limit: localFilters.limit
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return !!(
      localFilters.prefecture ||
      localFilters.types?.length ||
      localFilters.garden_id ||
      localFilters.month ||
      localFilters.search
    )
  }

  const generateMonthOptions = () => {
    const options = []
    const currentDate = new Date()

    // 過去3ヶ月から未来12ヶ月
    for (let i = -3; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      const label = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
      options.push({ value, label })
    }

    return options
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="イベント名、会場名、主催者で検索..."
          value={localFilters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* フィルター展開ボタン */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>詳細フィルター</span>
          {hasActiveFilters() && (
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </button>

        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
            クリア
          </button>
        )}
      </div>

      {/* 詳細フィルター */}
      {isExpanded && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 地域フィルター */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4" />
                地域
              </label>
              <select
                value={localFilters.prefecture || ''}
                onChange={(e) => handleFilterChange('prefecture', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">すべての地域</option>
                {prefectures.map((prefecture) => (
                  <option key={prefecture} value={prefecture}>
                    {prefecture}
                  </option>
                ))}
              </select>
            </div>

            {/* 月フィルター */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4" />
                開催月
              </label>
              <select
                value={localFilters.month || ''}
                onChange={(e) => handleFilterChange('month', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">すべての月</option>
                {generateMonthOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 盆栽園フィルター */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4" />
                関連盆栽園
              </label>
              <select
                value={localFilters.garden_id || ''}
                onChange={(e) => handleFilterChange('garden_id', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">すべての園</option>
                {gardens.map((garden) => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* イベント種別フィルター */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Tag className="h-4 w-4" />
              イベント種別
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(eventTypeConfig).map(([type, config]) => {
                const isSelected = localFilters.types?.includes(type as EventType)
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type as EventType)}
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full border transition-all',
                      isSelected
                        ? config.color + ' border-current'
                        : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* アクティブフィルターの表示 */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {localFilters.prefecture && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              📍 {localFilters.prefecture}
              <button
                onClick={() => handleFilterChange('prefecture', undefined)}
                className="ml-1 hover:text-green-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {localFilters.types?.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {eventTypeConfig[type].icon} {eventTypeConfig[type].label}
              <button
                onClick={() => handleTypeToggle(type)}
                className="ml-1 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {localFilters.month && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              📅 {new Date(localFilters.month + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
              <button
                onClick={() => handleFilterChange('month', undefined)}
                className="ml-1 hover:text-purple-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}