'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Event, EventType } from '@/types'
import { cn } from '@/lib/utils'
import { Calendar, MapPin, DollarSign, Users, Clock, ChevronRight, Star } from 'lucide-react'

const eventTypeConfig = {
  exhibition: { color: 'text-green-600 bg-green-50 border-green-200', icon: '🌳', label: '展示' },
  sale: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '🛒', label: '即売' },
  workshop: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '✂️', label: '体験' },
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
  // スマートグループ化（年月別＋ステータス別）
  const eventGroups = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const monthEnd = new Date(currentYear, currentMonth + 1, 0) // 今月末
    const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0) // 来月末

    const getEventStatus = (event: Event) => {
      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)

      if (startDate <= today && endDate >= today) return 'ongoing'
      if (startDate >= today) return 'upcoming'  // >= に修正
      return 'past'
    }

    // 年月の表示形式を生成
    const formatMonthYear = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      return `${year}年${month}月`
    }

    const groups: EventGroup[] = [
      {
        title: '🔥 開催中',
        description: '現在開催中のイベント',
        events: [],
        priority: 1,
        icon: <Star className="h-5 w-5" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      {
        title: '📅 まもなく開催（7日以内）',
        description: '今週中に開催予定',
        events: [],
        priority: 2,
        icon: <Clock className="h-5 w-5" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      {
        title: `${formatMonthYear(now)}のイベント`,
        description: '今月開催予定',
        events: [],
        priority: 3,
        icon: <Calendar className="h-5 w-5" />,
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      {
        title: `${formatMonthYear(new Date(currentYear, currentMonth + 1, 1))}のイベント`,
        description: '来月開催予定',
        events: [],
        priority: 4,
        icon: <Calendar className="h-5 w-5" />,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      {
        title: '今後の開催予定',
        description: `${formatMonthYear(new Date(currentYear, currentMonth + 2, 1))}以降`,
        events: [],
        priority: 5,
        icon: <Calendar className="h-5 w-5" />,
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
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
        groups[0].events.push(event) // 開催中
      } else if (status === 'upcoming') {
        if (startDateOnly <= weekEnd) {
          groups[1].events.push(event) // 7日以内
        } else if (startDateOnly <= monthEnd) {
          groups[2].events.push(event) // 今月
        } else if (startDateOnly <= nextMonthEnd) {
          groups[3].events.push(event) // 来月
        } else {
          groups[4].events.push(event) // それ以降
        }
      } else {
        groups[5].events.push(event) // 終了
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
    const currentYear = today.getFullYear()

    if (date.toDateString() === today.toDateString()) {
      return '今日'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明日'
    } else {
      // 年が異なる場合は年も表示
      const includeYear = date.getFullYear() !== currentYear
      return date.toLocaleDateString('ja-JP', {
        year: includeYear ? 'numeric' : undefined,
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
    today.setHours(0, 0, 0, 0)  // 時間を正規化
    const startDate = new Date(event.start_date)
    startDate.setHours(0, 0, 0, 0)
    return startDate > today  // 今日より後
  }

  const isPast = (event: Event) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)  // 時間を正規化
    const endDate = new Date(event.end_date)
    endDate.setHours(23, 59, 59, 999)  // 終了日の終わりまで
    return endDate < today  // 今日より前に終了
  }

  const isOngoing = (event: Event) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)  // 時間を正規化
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
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

  return (
    <div className={cn("space-y-8", className)}>
      {/* サマリーカード */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">イベント概要</h2>
            <p className="text-sm text-gray-600 mt-1">
              全{events.length}件のイベント
            </p>
          </div>
          <div className="flex gap-3">
            {events.filter(e => isOngoing(e)).length > 0 && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                🔥 {events.filter(e => isOngoing(e)).length}件開催中
              </div>
            )}
            {events.filter(e => isUpcoming(e)).length > 0 && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                📅 {events.filter(e => isUpcoming(e)).length}件開催予定
              </div>
            )}
          </div>
        </div>
      </div>

      {eventGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          {/* グループヘッダー */}
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl border-2 shadow-sm",
            group.bgColor,
            group.borderColor,
            group.priority === 1 && "ring-2 ring-green-400 ring-offset-2"
          )}>
            <div className="text-2xl">
              {group.priority === 1 ? '🔥' :
               group.priority === 2 ? '⏰' :
               group.priority === 3 ? '📅' :
               group.priority === 4 ? '📆' :
               group.priority === 5 ? '🗓️' : '✅'}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-gray-900">{group.title}</h2>
              <p className="text-sm text-gray-600">{group.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-700">{group.events.length}</span>
              <span className="text-sm text-gray-500">件</span>
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
                  className="block hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset group"
                >
                  {/* デスクトップレイアウト */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 items-center">
                    {/* 日付 */}
                    <div className="col-span-1">
                      <div className={cn(
                        "text-center p-2 rounded-xl text-sm font-bold shadow-sm",
                        isOngoing(event) ? "bg-gradient-to-br from-green-100 to-green-200 text-green-800 ring-2 ring-green-300" :
                        isUpcoming(event) ? "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        <div className="text-lg leading-none">{new Date(event.start_date).getDate()}</div>
                        <div className="text-xs mt-1">{new Date(event.start_date).toLocaleDateString('ja-JP', { month: 'short' })}</div>
                        {new Date(event.start_date).getFullYear() !== new Date().getFullYear() && (
                          <div className="text-xs opacity-75">{new Date(event.start_date).getFullYear()}</div>
                        )}
                      </div>
                    </div>

                    {/* イベント名 */}
                    <div className="col-span-4">
                      <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors leading-tight text-base" title={event.title}>
                        {isOngoing(event) && (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        )}
                        {truncateTitle(event.title, 50)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span className="font-medium">{getDateRange(event)}</span>
                        {event.organizer_name && (
                          <span className="text-gray-500">• {event.organizer_name}</span>
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

                  {/* モバイルレイアウト（カード形式） */}
                  <div className="lg:hidden p-4">
                    <div className="flex gap-3">
                      {/* 日付バッジ */}
                      <div className={cn(
                        "text-center px-3 py-2 rounded-xl text-sm font-bold shadow-sm flex-shrink-0",
                        isOngoing(event) ? "bg-gradient-to-br from-green-100 to-green-200 text-green-800 ring-2 ring-green-300" :
                        isUpcoming(event) ? "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        <div className="text-lg leading-none">{new Date(event.start_date).getDate()}</div>
                        <div className="text-xs mt-1">{new Date(event.start_date).toLocaleDateString('ja-JP', { month: 'short' })}</div>
                        {new Date(event.start_date).getFullYear() !== new Date().getFullYear() && (
                          <div className="text-xs opacity-75">{new Date(event.start_date).getFullYear()}</div>
                        )}
                      </div>

                      {/* コンテンツ */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-bold text-gray-900 leading-tight group-hover:text-green-600 transition-colors" title={event.title}>
                            {isOngoing(event) && (
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            )}
                            {truncateTitle(event.title, 35)}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            {getDateRange(event)}
                          </div>
                        </div>

                        {/* タグ */}
                        <div className="flex gap-1 flex-wrap">
                          {event.types.slice(0, 3).map((type) => (
                            <span
                              key={type}
                              className={cn(
                                'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border',
                                eventTypeConfig[type].color
                              )}
                            >
                              <span className="mr-1 text-xs">{eventTypeConfig[type].icon}</span>
                              {eventTypeConfig[type].label}
                            </span>
                          ))}
                        </div>

                        {/* 場所と料金 */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs">{event.prefecture}</span>
                          </div>
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs font-bold",
                            event.price_type === 'free'
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          )}>
                            {event.price_type === 'free' ? '🎫 無料' : '💴 有料'}
                          </div>
                        </div>
                      </div>

                      {/* 矢印 */}
                      <div className="flex items-center">
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
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