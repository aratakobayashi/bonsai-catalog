'use client'

import Link from 'next/link'
import { Event, EventType } from '@/types'
import { cn } from '@/lib/utils'
import { Calendar, MapPin, DollarSign, Users } from 'lucide-react'
import { eventDateText, eventPriceText, isTentativeEvent } from '@/lib/event-display'

const eventTypeConfig = {
  exhibition: { color: 'text-green-600 bg-green-50', icon: '🌳', label: '展示' },
  sale: { color: 'text-blue-600 bg-blue-50', icon: '🛒', label: '即売' },
  workshop: { color: 'text-orange-600 bg-orange-50', icon: '✂️', label: '体験' },
  lecture: { color: 'text-purple-600 bg-purple-50', icon: '📖', label: '講習' }
}

interface EventCardProps {
  event: Event
  className?: string
  layout?: 'card' | 'list' | 'compact'
}

export function EventCard({ event, className, layout = 'card' }: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getDateRange = () => eventDateText(event)

  const isUpcoming = () => {
    const today = new Date()
    const startDate = new Date(event.start_date)
    return startDate >= today
  }

  const isPast = () => {
    const today = new Date()
    const endDate = new Date(event.end_date)
    return endDate < today
  }

  if (layout === 'list') {
    return (
      <Link
        href={`/events/${event.slug}`}
        className={cn("group", className)}
        aria-label={`${event.title} - ${formatDate(event.start_date)}開催のイベント詳細を見る`}
      >
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 active:scale-[0.98] touch-manipulation",
          isPast() && "opacity-75 hover:opacity-90"
        )}>
          {/* モバイル：上部に日付とタイプ */}
          <div className="flex items-center justify-between sm:hidden">
            <div className="flex items-center gap-2">
              {/* 日付 */}
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-full">
                <Calendar className="h-4 w-4" />
                <span>{getDateRange()}</span>
              </div>

              {/* ステータス */}
              {isPast() && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  終了
                </span>
              )}
              {isUpcoming() && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  開催予定
                </span>
              )}
            </div>

            {/* イベントタイプ */}
            <div className="flex gap-1">
              {event.types.map((type) => (
                <span
                  key={type}
                  className={cn(
                    'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full',
                    eventTypeConfig[type].color
                  )}
                  title={eventTypeConfig[type].label}
                  aria-label={`イベント種別: ${eventTypeConfig[type].label}`}
                >
                  {eventTypeConfig[type].icon}
                </span>
              ))}
            </div>
          </div>

          {/* デスクトップ：左側の日付 */}
          <div className="hidden sm:flex flex-shrink-0 text-center min-w-[60px]" role="img" aria-label={`${formatDate(event.start_date)}開催`}>
            <div className="text-sm font-semibold text-gray-900">
              {isTentativeEvent(event) ? '未定' : new Date(event.start_date).getDate()}
            </div>
            <div className="text-xs text-gray-500 uppercase">
              {new Date(event.start_date).toLocaleDateString('ja-JP', { month: 'short' })}
            </div>
          </div>

          {/* メイン情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors leading-tight">
                {event.title}
              </h3>

              {/* デスクトップ：右側のタイプ */}
              <div className="hidden sm:flex gap-1 flex-shrink-0">
                {event.types.map((type) => (
                  <span
                    key={type}
                    className={cn(
                      'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full',
                      eventTypeConfig[type].color
                    )}
                    title={eventTypeConfig[type].label}
                    aria-label={`イベント種別: ${eventTypeConfig[type].label}`}
                  >
                    {eventTypeConfig[type].icon}
                  </span>
                ))}
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{event.prefecture}</span>
                {event.venue_name && (
                  <span className="truncate">• {event.venue_name}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{eventPriceText(event)}</span>
                </div>

                {/* モバイル：日付表示を補完 */}
                <div className="sm:hidden flex items-center gap-1 text-xs">
                  {event.start_date !== event.end_date && (
                    <span>〜 {formatDate(event.end_date)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 説明文（モバイル用） */}
            {event.description && (
              <p className="sm:hidden mt-2 text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
            )}

            {/* CTA（モバイル用） */}
            <div className="sm:hidden mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium group-hover:text-green-700">
                  詳細を見る →
                </span>
                <div className="text-xs text-gray-500">
                  {getDateRange()}
                </div>
              </div>
            </div>
          </div>

          {/* ステータス */}
          <div className="flex-shrink-0">
            {isPast() && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                終了
              </span>
            )}
            {isUpcoming() && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                開催予定
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  if (layout === 'compact') {
    return (
      <Link
        href={`/events/${event.slug}`}
        className={cn("group", className)}
        aria-label={`${event.title} - ${formatDate(event.start_date)}開催のイベント詳細を見る`}
      >
        <div className={cn(
          "p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all duration-200",
          isPast() && "opacity-75 hover:opacity-90"
        )}>
          {/* ヘッダー：日付とタイプ */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(event.start_date)}</span>
            </div>
            <div className="flex gap-1">
              {event.types.slice(0, 1).map((type) => (
                <span
                  key={type}
                  className={cn(
                    'inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded',
                    eventTypeConfig[type].color
                  )}
                  title={eventTypeConfig[type].label}
                >
                  {eventTypeConfig[type].icon}
                </span>
              ))}
            </div>
          </div>

          {/* タイトル */}
          <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors text-sm leading-tight mb-2 line-clamp-2">
            {event.title}
          </h4>

          {/* 場所・料金 */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.prefecture}</span>
              {event.venue_name && (
                <span className="truncate">• {event.venue_name}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <DollarSign className="h-3 w-3" />
                <span>{eventPriceText(event)}</span>
              </div>
              {isUpcoming() && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  開催予定
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn("group", className)}
      aria-label={`${event.title} - ${getDateRange()}開催のイベント詳細を見る`}
    >
      <div className={cn(
        "bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2",
        isPast() && "opacity-75 hover:opacity-90"
      )}>
        {/* ヘッダー */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors leading-tight">
              {event.title}
            </h3>
            {isUpcoming() && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full flex-shrink-0 ml-2">
                NEW
              </span>
            )}
          </div>

          {/* イベントタイプ */}
          <div className="flex gap-1 mb-3">
            {event.types.map((type) => (
              <span
                key={type}
                className={cn(
                  'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full',
                  eventTypeConfig[type].color
                )}
              >
                {eventTypeConfig[type].icon}
                <span className="ml-1">{eventTypeConfig[type].label}</span>
              </span>
            ))}
          </div>

          {/* 詳細情報 */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{getDateRange()}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="truncate">
                {event.prefecture}
                {event.venue_name && ` • ${event.venue_name}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>
                {eventPriceText(event)}
              </span>
            </div>

            {event.organizer_name && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="truncate">{event.organizer_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="px-4 pb-4">
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {event.description}
            </p>
          )}

          {/* CTA（デスクトップ用） */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm text-green-600 font-medium group-hover:text-green-700 transition-colors">
              詳細を見る →
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {isPast() && <span className="text-gray-400">終了</span>}
              {isUpcoming() && <span className="text-green-600">開催予定</span>}
            </div>
          </div>
        </div>

        {isPast() && (
          <div className="bg-gray-50 px-4 py-2 border-t">
            <span className="text-xs text-gray-500">このイベントは終了しました</span>
          </div>
        )}
      </div>
    </Link>
  )
}