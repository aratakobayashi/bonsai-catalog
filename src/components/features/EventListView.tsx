'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Event, EventType } from '@/types'
import { cn } from '@/lib/utils'
import { Calendar, MapPin, DollarSign, Users, Clock, ChevronRight, Star } from 'lucide-react'

const eventTypeConfig = {
  exhibition: { color: 'text-green-600 bg-green-50 border-green-200', icon: '🌳', label: '展示' },
  sale: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '🛒', label: '即売' },
  workshop: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '✂️', label: 'WS' },
  lecture: { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: '📖', label: '講習' }
}

interface EventListViewProps {
  events: Event[]
  className?: string
}

interface EventGroup {
  title: string
  description: string
  events: Event[]
  priority: number
  icon: React.ReactNode
  bgColor: string
  borderColor: string
}

export function EventListView({ events, className }: EventListViewProps) {
  // スマートグループ化
  const eventGroups = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const monthEnd = new Date(today)
    monthEnd.setMonth(monthEnd.getMonth() + 1)

    const getEventStatus = (event: Event) => {
      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)

      if (startDate <= today && endDate >= today) return 'ongoing'
      if (startDate > today) return 'upcoming'
      return 'past'
    }

    const groups: EventGroup[] = [
      {
        title: '開催中のイベント',
        description: '今すぐ参加できます',
        events: [],
        priority: 1,
        icon: <Star className="h-5 w-5" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      {
        title: '明日開催',
        description: '明日から開始予定',
        events: [],
        priority: 2,
        icon: <Clock className="h-5 w-5" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      {
        title: '今週のイベント',
        description: '今週中に開催予定',
        events: [],
        priority: 3,
        icon: <Calendar className="h-5 w-5" />,
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      {
        title: '今月のイベント',
        description: '今月中に開催予定',
        events: [],
        priority: 4,
        icon: <Calendar className="h-5 w-5" />,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      {
        title: '今後のイベント',
        description: '来月以降の開催予定',
        events: [],
        priority: 5,
        icon: <Calendar className="h-5 w-5" />,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      },
      {
        title: '終了したイベント',
        description: '過去に開催されたイベント',
        events: [],
        priority: 6,
        icon: <Calendar className="h-5 w-5" />,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      }
    ]

    // イベントをグループに分類
    events.forEach(event => {
      const startDate = new Date(event.start_date)
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const status = getEventStatus(event)

      if (status === 'ongoing') {
        groups[0].events.push(event)
      } else if (status === 'upcoming') {
        if (startDateOnly.getTime() === tomorrow.getTime()) {
          groups[1].events.push(event)
        } else if (startDateOnly < weekEnd) {
          groups[2].events.push(event)
        } else if (startDateOnly < monthEnd) {
          groups[3].events.push(event)
        } else {
          groups[4].events.push(event)
        }
      } else {
        groups[5].events.push(event)
      }
    })

    // 各グループ内でソート
    groups.forEach(group => {
      group.events.sort((a, b) => {
        const aDate = new Date(a.start_date).getTime()
        const bDate = new Date(b.start_date).getTime()
        return group.priority === 6 ? bDate - aDate : aDate - bDate // 終了したイベントは新しい順
      })
    })

    // イベントがあるグループのみ返す
    return groups.filter(group => group.events.length > 0)
  }, [events])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return '今日'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明日'
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      })
    }
  }

  const getDateRange = (event: Event) => {
    if (event.start_date === event.end_date) {
      return formatDate(event.start_date)
    }
    return `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`
  }

  const isUpcoming = (event: Event) => {
    const today = new Date()
    const startDate = new Date(event.start_date)
    return startDate >= today
  }

  const isPast = (event: Event) => {
    const today = new Date()
    const endDate = new Date(event.end_date)
    return endDate < today
  }

  const isOngoing = (event: Event) => {
    const today = new Date()
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)
    return startDate <= today && endDate >= today
  }

  const truncateTitle = (title: string, maxLength: number = 50) => {
    if (title.length <= maxLength) return title
    return title.slice(0, maxLength) + '...'
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          イベントが見つかりませんでした
        </h3>
        <p className="text-gray-600 mb-4">
          検索条件を変更して再度お試しください
        </p>
        <div className="text-sm text-gray-500">
          💡 ヒント: 月や都道府県のフィルターを外してみてください
        </div>
      </div>
    )
  }

  // 全てのイベントが終了している場合の特別な表示
  const allPastEvents = events.every(event => isPast(event))
  if (allPastEvents && events.length > 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            全て終了したイベントです
          </h3>
          <p className="text-gray-600">
            新しいイベントをお探しの場合は、フィルターを調整してください
          </p>
        </div>
        {/* 終了したイベントも表示 */}
        <div className="space-y-8">
          {eventGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4 opacity-75">
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-lg border",
                group.bgColor,
                group.borderColor
              )}>
                <div className="text-gray-600">
                  {group.icon}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{group.title}</h2>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                  {group.events.length}件
                </div>
              </div>
              {/* 省略: 以下同じテーブル表示 */}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-8", className)}>
      {eventGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          {/* グループヘッダー */}
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-lg border",
            group.bgColor,
            group.borderColor
          )}>
            <div className="text-gray-600">
              {group.icon}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">{group.title}</h2>
              <p className="text-sm text-gray-600">{group.description}</p>
            </div>
            <div className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
              {group.events.length}件
            </div>
          </div>

          {/* イベントテーブル */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* テーブルヘッダー（デスクトップのみ） */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600" role="row">
              <div className="col-span-1" role="columnheader">日付</div>
              <div className="col-span-4" role="columnheader">イベント名</div>
              <div className="col-span-2" role="columnheader">タイプ</div>
              <div className="col-span-2" role="columnheader">場所</div>
              <div className="col-span-2" role="columnheader">料金</div>
              <div className="col-span-1" role="columnheader">詳細</div>
            </div>

            {/* イベント行 */}
            <div className="divide-y divide-gray-200">
              {group.events.map((event, eventIndex) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset"
                >
                  {/* デスクトップレイアウト */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 items-center">
                    {/* 日付 */}
                    <div className="col-span-1">
                      <div className={cn(
                        "text-center p-2 rounded-lg text-sm font-medium",
                        isOngoing(event) ? "bg-green-100 text-green-800" :
                        isUpcoming(event) ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        <div className="text-xs">{new Date(event.start_date).getDate()}</div>
                        <div className="text-xs">{new Date(event.start_date).toLocaleDateString('ja-JP', { month: 'short' })}</div>
                      </div>
                    </div>

                    {/* イベント名 */}
                    <div className="col-span-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors leading-tight" title={event.title}>
                        {truncateTitle(event.title, 60)}
                      </h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {getDateRange(event)}
                        {event.organizer_name && (
                          <span className="ml-2">• {event.organizer_name}</span>
                        )}
                      </div>
                    </div>

                    {/* タイプ */}
                    <div className="col-span-2">
                      <div className="flex gap-1 flex-wrap">
                        {event.types.slice(0, 2).map((type) => (
                          <span
                            key={type}
                            className={cn(
                              'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border',
                              eventTypeConfig[type].color
                            )}
                          >
                            <span className="mr-1">{eventTypeConfig[type].icon}</span>
                            {eventTypeConfig[type].label}
                          </span>
                        ))}
                        {event.types.length > 2 && (
                          <span className="text-xs text-gray-500">+{event.types.length - 2}</span>
                        )}
                      </div>
                    </div>

                    {/* 場所 */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{event.prefecture}</span>
                      </div>
                      {event.venue_name && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {event.venue_name}
                        </div>
                      )}
                    </div>

                    {/* 料金 */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4" />
                        <span className={cn(
                          "font-medium",
                          event.price_type === 'free' ? "text-green-600" : "text-gray-900"
                        )}>
                          {event.price_type === 'free' ? '無料' : '有料'}
                        </span>
                      </div>
                      {event.price_note && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {event.price_note}
                        </div>
                      )}
                    </div>

                    {/* 詳細ボタン */}
                    <div className="col-span-1 text-right">
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                  </div>

                  {/* モバイルレイアウト */}
                  <div className="lg:hidden p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 leading-tight" title={event.title}>
                          {truncateTitle(event.title, 40)}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1">
                          {getDateRange(event)}
                        </div>
                      </div>
                      <div className={cn(
                        "ml-3 px-2 py-1 rounded-full text-xs font-medium",
                        isOngoing(event) ? "bg-green-100 text-green-800" :
                        isUpcoming(event) ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        {isOngoing(event) ? '開催中' :
                         isUpcoming(event) ? '開催予定' : '終了'}
                      </div>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      {event.types.map((type) => (
                        <span
                          key={type}
                          className={cn(
                            'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border',
                            eventTypeConfig[type].color
                          )}
                        >
                          <span className="mr-1">{eventTypeConfig[type].icon}</span>
                          {eventTypeConfig[type].label}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.prefecture}</span>
                        {event.venue_name && (
                          <span>• {event.venue_name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className={cn(
                          "font-medium",
                          event.price_type === 'free' ? "text-green-600" : "text-gray-900"
                        )}>
                          {event.price_type === 'free' ? '無料' : '有料'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}