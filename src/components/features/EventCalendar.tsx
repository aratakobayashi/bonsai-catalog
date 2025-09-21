'use client'

import { useState, useMemo } from 'react'
import { Event } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { EventCard } from './EventCard'

interface EventCalendarProps {
  events: Event[]
  className?: string
}

export function EventCalendar({ events, className }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  return (
    <div className={cn("space-y-6", className)}>
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {currentYear}年{currentMonth + 1}月
        </h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* カレンダーグリッド */}
        <div className="lg:col-span-2">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div
                key={day}
                className={cn(
                  "p-2 text-sm font-medium text-center",
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
                    "relative p-2 h-20 bg-white hover:bg-gray-50 transition-colors text-left",
                    !isCurrentMonth(date) && "text-gray-400 bg-gray-50",
                    isToday(date) && "bg-green-50 text-green-700",
                    isSelected && "bg-green-100 text-green-800",
                    index % 7 === 0 && isCurrentMonth(date) && "text-red-600", // 日曜日
                    index % 7 === 6 && isCurrentMonth(date) && "text-blue-600" // 土曜日
                  )}
                >
                  <span className="text-sm font-medium">{date.getDate()}</span>

                  {/* イベントドット */}
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="flex gap-1">
                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="w-1.5 h-1.5 rounded-full bg-green-500"
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-gray-500">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
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
                        layout="list"
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