'use client'

import Link from 'next/link'
import { Event, EventType } from '@/types'
import { cn } from '@/lib/utils'
import { Calendar, MapPin, DollarSign, Users } from 'lucide-react'

const eventTypeConfig = {
  exhibition: { color: 'text-green-600 bg-green-50', icon: '🌳', label: '展示' },
  sale: { color: 'text-blue-600 bg-blue-50', icon: '🛒', label: '即売' },
  workshop: { color: 'text-orange-600 bg-orange-50', icon: '✂️', label: 'WS' },
  lecture: { color: 'text-purple-600 bg-purple-50', icon: '📖', label: '講習' }
}

interface EventCardProps {
  event: Event
  className?: string
  layout?: 'card' | 'list'
}

export function EventCard({ event, className, layout = 'card' }: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getDateRange = () => {
    if (event.start_date === event.end_date) {
      return formatDate(event.start_date)
    }
    return `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`
  }

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
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
          {/* 日付 */}
          <div className="flex-shrink-0 text-center min-w-[60px]" role="img" aria-label={`${formatDate(event.start_date)}開催`}>
            <div className="text-sm font-semibold text-gray-900">
              {new Date(event.start_date).getDate()}
            </div>
            <div className="text-xs text-gray-500 uppercase">
              {new Date(event.start_date).toLocaleDateString('ja-JP', { month: 'short' })}
            </div>
          </div>

          {/* メイン情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate pr-2">
                {event.title}
              </h3>
              <div className="flex gap-1 flex-shrink-0">
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

            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.prefecture}</span>
                {event.venue_name && (
                  <span className="truncate">• {event.venue_name}</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{event.price_type === 'free' ? '無料' : '有料'}</span>
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

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn("group", className)}
      aria-label={`${event.title} - ${getDateRange()}開催のイベント詳細を見る`}
    >
      <div className="bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
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
                {event.price_type === 'free' ? '無料' : '有料'}
                {event.price_note && ` • ${event.price_note}`}
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
        {event.description && (
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          </div>
        )}

        {isPast() && (
          <div className="bg-gray-50 px-4 py-2 border-t">
            <span className="text-xs text-gray-500">このイベントは終了しました</span>
          </div>
        )}
      </div>
    </Link>
  )
}