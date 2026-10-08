'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Event, EventType } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { EventCard } from './EventCard'
import { isTentativeEvent } from '@/lib/event-display'

const eventTypeConfig = {
  exhibition: { color: 'text-green-600 bg-green-50', icon: '🌳', label: '展示' },
  sale: { color: 'text-blue-600 bg-blue-50', icon: '🛒', label: '即売' },
  workshop: { color: 'text-orange-600 bg-orange-50', icon: '✂️', label: '体験' },
  lecture: { color: 'text-purple-600 bg-purple-50', icon: '📖', label: '講習' }
}

interface EventCalendarProps {
  events: Event[]
  className?: string
  viewMode?: 'calendar' | 'list' | 'map'
}

export function EventCalendar({ events, className, viewMode = 'calendar' }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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
      days.push(new Date(current.getTime()))
      // 安全な日付加算
      current.setTime(current.getTime() + 24 * 60 * 60 * 1000)
    }

    return days
  }, [currentYear, currentMonth])

  // 日付ごとのイベントをマップ
  const eventsByDate = useMemo(() => {
    const dateEvents: Record<string, Event[]> = {}

    // 日程が未発表のイベントはカレンダーに載せない
    events.filter(event => !isTentativeEvent(event)).forEach(event => {
      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)

      // イベント期間中のすべての日にちにイベントを割り当て（安全な日付計算）
      const currentDate = new Date(startDate.getTime())
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0]
        if (!dateEvents[dateKey]) {
          dateEvents[dateKey] = []
        }
        dateEvents[dateKey].push(event)

        // 9月のイベントをデバッグ
        if (dateKey.includes('2025-09')) {
          console.log('📍 September Event Mapped:', {
            dateKey,
            title: event.title,
            eventsOnThisDate: dateEvents[dateKey].length
          })
        }

        // 安全な日付加算（月境界を考慮）
        currentDate.setTime(currentDate.getTime() + 24 * 60 * 60 * 1000)
      }
    })

    console.log('🗓️ EventsByDate Result:', {
      totalDates: Object.keys(dateEvents).length,
      septemberDates: Object.keys(dateEvents).filter(date => date.includes('2025-09')).length
    })

    return dateEvents
  }, [events])

  // 選択された日のイベント
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = selectedDate.toISOString().split('T')[0]
    return eventsByDate[dateKey] || []
  }, [selectedDate, eventsByDate])

  // 月のイベントをリスト表示用にソート（開催予定 → 開催中 → 過去の順）
  const monthEvents = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // デバッグログ
    console.log('🗓️ EventCalendar Debug:', {
      currentYear,
      currentMonth: currentMonth + 1, // 表示用に+1
      firstDay: firstDay.toISOString().split('T')[0],
      lastDay: lastDay.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0],
      totalEvents: events.length
    })

    const getEventStatus = (event: Event) => {
      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)

      if (startDate > today) return 'upcoming' // 開催予定
      if (startDate <= today && endDate >= today) return 'ongoing' // 開催中
      return 'past' // 過去
    }

    const filtered = events.filter(event => {
      const eventStart = new Date(event.start_date)
      const eventEnd = new Date(event.end_date)

      // 時間をリセット
      eventStart.setHours(0, 0, 0, 0)
      eventEnd.setHours(23, 59, 59, 999)

      const isInMonth = (eventStart >= firstDay && eventStart <= lastDay) ||
                       (eventEnd >= firstDay && eventEnd <= lastDay) ||
                       (eventStart <= firstDay && eventEnd >= lastDay)

      // デバッグログ
      if (event.start_date.includes('2025-09')) {
        console.log('📅 September Event Check:', {
          title: event.title,
          start_date: event.start_date,
          eventStart: eventStart.toISOString().split('T')[0],
          eventEnd: eventEnd.toISOString().split('T')[0],
          firstDay: firstDay.toISOString().split('T')[0],
          lastDay: lastDay.toISOString().split('T')[0],
          isInMonth
        })
      }

      return isInMonth
    })

    console.log('📊 Filtered Events:', filtered.length, 'out of', events.length)

    return filtered.sort((a, b) => {
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
    return !!eventsByDate[dateKey]
  }

  const getEventCount = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    return eventsByDate[dateKey]?.length || 0
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
        <div className="flex items-center justify-end gap-2">
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

      {/* カレンダー表示 */}
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
            <div
              className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden"
              role="grid"
              aria-label={`${currentYear}年${currentMonth + 1}月のカレンダー`}
            >
              {calendarDays.map((date, index) => {
                const dateKey = date.toISOString().split('T')[0]
                const dayEvents = eventsByDate[dateKey] || []
                const isSelected = selectedDate?.toDateString() === date.toDateString()

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    aria-label={`${date.getDate()}日${hasEvents(date) ? ` - ${getEventCount(date)}件のイベントあり` : ''}`}
                    aria-pressed={isSelected}
                    role="gridcell"
                    tabIndex={isSelected ? 0 : -1}
                    className={cn(
                      "relative p-2 sm:p-2 h-20 sm:h-24 md:h-28 bg-white hover:bg-gray-50 transition-all duration-200 text-left flex flex-col touch-manipulation min-h-[44px]", // WCAG準拠のタッチターゲット
                      "active:scale-95 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1", // アクセシビリティ改善
                      !isCurrentMonth(date) && "text-gray-400 bg-gray-50",
                      isToday(date) && "bg-green-50 text-green-700 ring-2 ring-green-200",
                      isSelected && "bg-green-100 text-green-800 ring-2 ring-green-300",
                      index % 7 === 0 && isCurrentMonth(date) && "text-red-600", // 日曜日
                      index % 7 === 6 && isCurrentMonth(date) && "text-blue-600" // 土曜日
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm sm:text-base font-medium">{date.getDate()}</span>
                      {hasEvents(date) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title={`${getEventCount(date)}件のイベント`}></div>
                      )}
                    </div>

                    {/* イベント概要表示 */}
                    {(() => {
                      const eventSummary = getEventSummary(dayEvents)
                      if (!eventSummary) return null

                      return (
                        <div className="flex-1 space-y-1 overflow-hidden">
                          {eventSummary.slice(0, isMobile ? 1 : 2).map((event, eventIndex) => (
                            <Link
                              key={eventIndex}
                              href={`/events/${event.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 p-1 rounded text-xs bg-white bg-opacity-80 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors block group border border-gray-200"
                              title={`${event.fullTitle}の詳細を見る`}
                            >
                              <span className="text-xs leading-none flex-shrink-0">{event.icon}</span>
                              <span className="truncate leading-tight text-xs font-medium group-hover:underline">
                                {isMobile ? event.title.slice(0, 6) + '...' : event.title.slice(0, 12) + (event.title.length > 12 ? '...' : '')}
                              </span>
                            </Link>
                          ))}
                          {dayEvents.length > (isMobile ? 1 : 2) && (
                            <button
                              className="w-full text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 py-1 px-2 rounded cursor-pointer hover:text-gray-700 transition-colors border border-gray-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDate(date)
                              }}
                              title="すべてのイベントを表示"
                            >
                              他 {dayEvents.length - (isMobile ? 1 : 2)}件
                            </button>
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
                      {selectedDateEvents.map((event: Event) => (
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
    </div>
  )
}