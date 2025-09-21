'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Event, EventType } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar, List, Grid3X3, Map } from 'lucide-react'
import { EventCard } from './EventCard'
import { EventMap } from './EventMap'

const eventTypeConfig = {
  exhibition: { color: 'text-green-600 bg-green-50', icon: '🌳', label: '展示' },
  sale: { color: 'text-blue-600 bg-blue-50', icon: '🛒', label: '即売' },
  workshop: { color: 'text-orange-600 bg-orange-50', icon: '✂️', label: 'WS' },
  lecture: { color: 'text-purple-600 bg-purple-50', icon: '📖', label: '講習' }
}

interface EventCalendarProps {
  events: Event[]
  className?: string
}

export function EventCalendar({ events, className }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'map'>('calendar')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // カレンダーのグリッドを生成
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // 日曜日から開始

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) { // 6週間分
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentYear, currentMonth])

  // 日付ごとのイベントをマップ
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>()

    events.forEach(event => {
      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)

      // イベント期間中のすべての日にちにイベントを割り当て
      const current = new Date(startDate)
      while (current <= endDate) {
        const dateKey = current.toISOString().split('T')[0]
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push(event)
        current.setDate(current.getDate() + 1)
      }
    })

    return map
  }, [events])

  // 選択された日のイベント
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = selectedDate.toISOString().split('T')[0]
    return eventsByDate.get(dateKey) || []
  }, [selectedDate, eventsByDate])

  // 月のイベントをリスト表示用にソート（開催予定 → 開催中 → 過去の順）
  const monthEvents = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const getEventStatus = (event: Event) => {
      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)

      if (startDate > today) return 'upcoming' // 開催予定
      if (startDate <= today && endDate >= today) return 'ongoing' // 開催中
      return 'past' // 過去
    }

    return events
      .filter(event => {
        const eventStart = new Date(event.start_date)
        const eventEnd = new Date(event.end_date)
        return (eventStart >= firstDay && eventStart <= lastDay) ||
               (eventEnd >= firstDay && eventEnd <= lastDay) ||
               (eventStart <= firstDay && eventEnd >= lastDay)
      })
      .sort((a, b) => {
        const statusOrder = { upcoming: 0, ongoing: 1, past: 2 }
        const aStatus = getEventStatus(a)
        const bStatus = getEventStatus(b)

        // ステータスが異なる場合は、ステータス順
        if (aStatus !== bStatus) {
          return statusOrder[aStatus] - statusOrder[bStatus]
        }

        // 同じステータス内では日付順
        const aDate = new Date(a.start_date).getTime()
        const bDate = new Date(b.start_date).getTime()

        // 開催予定・開催中は近い順、過去は新しい順
        return aStatus === 'past' ? bDate - aDate : aDate - bDate
      })
  }, [events, currentYear, currentMonth])

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth
  }

  const hasEvents = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    return eventsByDate.has(dateKey)
  }

  const getEventCount = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    return eventsByDate.get(dateKey)?.length || 0
  }

  // イベント名を省略（レスポンシブ対応）
  const truncateEventTitle = (title: string, maxLength: number = 8) => {
    if (title.length <= maxLength) return title
    return title.slice(0, maxLength) + '...'
  }

  // 日付セル内に表示するイベント概要を生成
  const getEventSummary = (events: Event[]) => {
    if (events.length === 0) return null

    // 最大2件まで表示、重要度順（展示 > 即売 > ワークショップ > 講習）
    const typeOrder: Record<EventType, number> = { exhibition: 0, sale: 1, workshop: 2, lecture: 3 }
    const sortedEvents = events
      .slice()
      .sort((a, b) => {
        const aMinType = Math.min(...a.types.map(t => typeOrder[t] ?? 999))
        const bMinType = Math.min(...b.types.map(t => typeOrder[t] ?? 999))
        return aMinType - bMinType
      })
      .slice(0, 2)

    return sortedEvents.map(event => ({
      icon: eventTypeConfig[event.types[0]]?.icon || '📅',
      title: truncateEventTitle(event.title, 6),
      slug: event.slug,
      fullTitle: event.title
    }))
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* カレンダーヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {currentYear}年{currentMonth + 1}月
        </h2>
        <div className="flex items-center justify-between gap-2">
          {/* 表示切り替えボタン（モバイル用） */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 md:hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                viewMode === 'calendar'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                viewMode === 'list'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                "px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                viewMode === 'map'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Map className="h-4 w-4" />
            </button>
          </div>

          {/* 表示切り替えボタン（デスクトップ用） */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                viewMode === 'calendar'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>カレンダー</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                viewMode === 'list'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <List className="h-4 w-4" />
              <span>リスト</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                viewMode === 'map'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Map className="h-4 w-4" />
              <span>マップ</span>
            </button>
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
            >
              今日
            </button>
            <button
              onClick={goToPrevMonth}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* リスト表示 */}
      {viewMode === 'list' && (
        <div>
          <div className="space-y-4">
            {monthEvents.length > 0 ? (
              monthEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  layout="list"
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>この月にはイベントがありません</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* マップ表示 */}
      {viewMode === 'map' && (
        <div>
          <EventMap
            events={monthEvents}
            className="w-full"
          />
        </div>
      )}

      {/* デスクトップ：カレンダー表示 */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* カレンダーグリッド */}
          <div className="lg:col-span-2">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <div
                  key={day}
                  className={cn(
                    "p-1 sm:p-2 text-xs sm:text-sm font-medium text-center",
                    index === 0 ? "text-red-600" : index === 6 ? "text-blue-600" : "text-gray-600"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日付グリッド */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {calendarDays.map((date, index) => {
                const dateKey = date.toISOString().split('T')[0]
                const dayEvents = eventsByDate.get(dateKey) || []
                const isSelected = selectedDate?.toDateString() === date.toDateString()

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "relative p-1 sm:p-1.5 h-16 sm:h-20 md:h-24 bg-white hover:bg-gray-50 transition-all duration-200 text-left flex flex-col touch-manipulation",
                      "active:scale-95 active:bg-gray-100", // タッチフィードバック
                      !isCurrentMonth(date) && "text-gray-400 bg-gray-50",
                      isToday(date) && "bg-green-50 text-green-700 ring-2 ring-green-200",
                      isSelected && "bg-green-100 text-green-800 ring-2 ring-green-300",
                      index % 7 === 0 && isCurrentMonth(date) && "text-red-600", // 日曜日
                      index % 7 === 6 && isCurrentMonth(date) && "text-blue-600" // 土曜日
                    )}
                  >
                    <span className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{date.getDate()}</span>

                    {/* イベント概要表示 */}
                    {(() => {
                      const eventSummary = getEventSummary(dayEvents)
                      if (!eventSummary) return null

                      return (
                        <div className="flex-1 space-y-0.5 overflow-hidden">
                          {eventSummary.slice(0, isMobile ? 1 : 2).map((event, eventIndex) => (
                            <Link
                              key={eventIndex}
                              href={`/events/${event.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-0.5 text-xs text-gray-700 hover:text-green-600 transition-colors block group"
                              title={`${event.fullTitle}の詳細を見る`}
                            >
                              <span className="text-xs leading-none flex-shrink-0">{event.icon}</span>
                              <span className="truncate leading-tight text-xs group-hover:underline">
                                {isMobile ? event.title.slice(0, 4) + '...' : event.title}
                              </span>
                            </Link>
                          ))}
                          {dayEvents.length > (isMobile ? 1 : 2) && (
                            <div
                              className="text-xs text-gray-500 text-center cursor-pointer hover:text-gray-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDate(date)
                              }}
                              title="すべてのイベントを表示"
                            >
                              +{dayEvents.length - (isMobile ? 1 : 2)}件
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 選択された日のイベント一覧 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                  <Calendar className="h-5 w-5" />
                  {selectedDate ? (
                    selectedDate.toLocaleDateString('ja-JP', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })
                  ) : (
                    '日付を選択'
                  )}
                </h3>

                {selectedDate ? (
                  selectedDateEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          layout="compact"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 text-center py-8">
                      この日はイベントがありません
                    </p>
                  )
                ) : (
                  <p className="text-sm text-gray-600 text-center py-8">
                    カレンダーの日付をクリックして<br />
                    その日のイベントを確認
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}