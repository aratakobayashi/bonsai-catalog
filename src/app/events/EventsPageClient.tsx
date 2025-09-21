'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Event, EventSearchParams, EventsResponse } from '@/types'
import { EventCard } from '@/components/features/EventCard'
import { EventCalendar } from '@/components/features/EventCalendar'
import { EventFilters } from '@/components/features/EventFilters'
import { EventMap } from '@/components/features/EventMap'
import { EventListView } from '@/components/features/EventListView'
import { cn } from '@/lib/utils'
import { Calendar, List, Map, ChevronLeft, ChevronRight } from 'lucide-react'

type ViewType = 'month' | 'list' | 'map'

export default function EventsPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [view, setView] = useState<ViewType>('month')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventsResponse, setEventsResponse] = useState<EventsResponse | null>(null)

  // URLパラメータから初期フィルターを設定
  const getInitialFilters = (): EventSearchParams => {
    const filters: EventSearchParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: 20
    }

    if (searchParams.get('prefecture')) filters.prefecture = searchParams.get('prefecture')!
    if (searchParams.get('types')) filters.types = searchParams.get('types')!.split(',') as any
    if (searchParams.get('garden_id')) filters.garden_id = searchParams.get('garden_id')!
    if (searchParams.get('month')) filters.month = searchParams.get('month')!
    if (searchParams.get('search')) filters.search = searchParams.get('search')!
    if (searchParams.get('view')) setView(searchParams.get('view') as ViewType)

    return filters
  }

  const [filters, setFilters] = useState<EventSearchParams>(getInitialFilters)

  // イベントデータを取得
  const fetchEvents = async (currentFilters: EventSearchParams) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            params.set(key, value.join(','))
          } else {
            params.set(key, value.toString())
          }
        }
      })

      const response = await fetch(`/api/events?${params}`)
      if (!response.ok) {
        throw new Error('イベントデータの取得に失敗しました')
      }

      const data: EventsResponse = await response.json()
      setEvents(data.events)
      setEventsResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // フィルターまたはビューが変更されたときにURLを更新
  const updateURL = (newFilters: EventSearchParams, newView?: ViewType) => {
    const params = new URLSearchParams()

    // フィルターをURLパラメータに追加
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','))
        } else if (!Array.isArray(value)) {
          params.set(key, value.toString())
        }
      }
    })

    // ビューを追加
    if (newView && newView !== 'month') {
      params.set('view', newView)
    }

    const newURL = params.toString() ? `/events?${params}` : '/events'
    router.push(newURL, { scroll: false })
  }

  // フィルター変更ハンドラー
  const handleFiltersChange = (newFilters: EventSearchParams) => {
    setFilters(newFilters)
    updateURL(newFilters, view)
  }

  // ビュー変更ハンドラー
  const handleViewChange = (newView: ViewType) => {
    setView(newView)
    updateURL(filters, newView)
  }

  // ページネーション
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    handleFiltersChange(newFilters)
  }

  // 初回データ取得
  useEffect(() => {
    fetchEvents(filters)
  }, [])

  // フィルター変更時にデータを再取得
  useEffect(() => {
    fetchEvents(filters)
  }, [filters])

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => fetchEvents(filters)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          再試行
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* フィルターセクション */}
      <EventFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        prefectures={eventsResponse?.prefectures || []}
        gardens={[]} // TODO: 盆栽園データを取得
      />

      {/* ビュー切り替えタブ */}
      <div className="flex items-center justify-between">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleViewChange('month')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              view === 'month'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Calendar className="h-4 w-4" />
            カレンダー
          </button>
          <button
            onClick={() => handleViewChange('list')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              view === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <List className="h-4 w-4" />
            リスト
          </button>
          <button
            onClick={() => handleViewChange('map')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              view === 'map'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Map className="h-4 w-4" />
            マップ
          </button>
        </div>

        {/* 結果数表示 */}
        {eventsResponse && (
          <div className="text-sm text-gray-600">
            {eventsResponse.total}件のイベント
            {filters.search && ` 「${filters.search}」の検索結果`}
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      {view === 'month' ? (
        <EventCalendar events={events} />
      ) : view === 'list' ? (
        <div className="space-y-6">
          {/* 新しいリストビュー */}
          <EventListView events={events} />

          {/* ページネーション */}
          {eventsResponse && eventsResponse.total > eventsResponse.limit && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(Math.max(1, filters.page! - 1))}
                disabled={filters.page === 1}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-4 py-2 text-sm text-gray-600">
                {filters.page} / {Math.ceil(eventsResponse.total / eventsResponse.limit)}
              </span>

              <button
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={filters.page! >= Math.ceil(eventsResponse.total / eventsResponse.limit)}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : view === 'map' ? (
        <EventMap events={events} />
      ) : null}
    </div>
  )
}