'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Event, EventSearchParams, EventsResponse } from '@/types'
import { EventCalendar } from '@/components/features/EventCalendar'
import { EventFilters, EventPeriod } from '@/components/features/EventFilters'
import { EventMap } from '@/components/features/EventMap'
import { EventListView } from '@/components/features/EventListView'
import {
  EventStatusTag,
  EventTypeTag,
  eventPlaceText,
  getEventStatus,
  googleCalendarUrl,
  parseEventDate,
  startOfToday,
} from '@/components/features/EventShared'
import { Placeholder } from '@/components/ui/design'
import { eventDateText, eventPriceText, isTentativeEvent } from '@/lib/event-display'
import { parseEventView } from './EventViewTabs'

function parsePeriod(value: string | null): EventPeriod {
  return value === 'past' || value === 'all' ? value : 'upcoming'
}

// 並べ替え用の日付。日程未発表のイベントは例年の月の末尾に置く
function sortKey(event: Event) {
  const start = parseEventDate(event.start_date)
  return isTentativeEvent(event) ? new Date(start.getFullYear(), start.getMonth() + 1, 0, 12).getTime() : start.getTime()
}

// PCのリスト表示で右側に出す、選択中イベントの概要
function EventPreview({ event }: { event: Event }) {
  const calendarUrl = googleCalendarUrl(event)
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-white">
      <Placeholder label={event.venue_name || eventPlaceText(event)} className="h-[180px]" />
      <div className="px-6 py-[22px]">
        <div className="flex flex-wrap gap-1.5">
          {event.types.map(type => <EventTypeTag key={type} type={type} />)}
          <EventStatusTag event={event} />
        </div>
        <h2 className="mt-2 font-mincho text-2xl font-bold leading-snug text-navy">{event.title}</h2>
        <dl className="mt-1 text-[13.5px]">
          {[
            ['日程', eventDateText(event, true)],
            ['会場', [event.venue_name, eventPlaceText(event)].filter(Boolean).join('・')],
            ['参加費', eventPriceText(event)],
            ...(event.organizer_name ? [['主催', event.organizer_name]] : []),
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[72px_1fr] border-b border-[#f1ece2] py-2.5">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex gap-2.5">
          <Link href={`/events/${event.slug}`} className="flex h-11 flex-1 items-center justify-center rounded-[10px] bg-navy text-sm font-bold text-white hover:bg-navy-light">
            詳しく見る
          </Link>
          {calendarUrl && (
            <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center rounded-[10px] border border-navy px-4 text-[13.5px] text-navy hover:bg-gold-light">
              カレンダーに追加
            </a>
          )}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
          ※ 日程・料金は変更になることがあります。お出かけ前に公式サイトでご確認ください。
        </p>
      </div>
    </div>
  )
}

export default function EventsPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = parseEventView(searchParams.get('view'))

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventsResponse, setEventsResponse] = useState<EventsResponse | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // URLパラメータから初期フィルターを設定
  const initialFilters = useMemo((): EventSearchParams => {
    const filters: EventSearchParams = {
      page: 1,
      limit: 1000 // 全イベントを取得（ページネーション無効化）
    }

    if (searchParams.get('prefecture')) filters.prefecture = searchParams.get('prefecture')!
    if (searchParams.get('types')) filters.types = searchParams.get('types')!.split(',') as any
    if (searchParams.get('garden_id')) filters.garden_id = searchParams.get('garden_id')!
    if (searchParams.get('month')) filters.month = searchParams.get('month')!
    if (searchParams.get('search')) filters.search = searchParams.get('search')!

    return filters
  }, [searchParams])

  const [filters, setFilters] = useState<EventSearchParams>(initialFilters)
  const [period, setPeriod] = useState<EventPeriod>(() => parsePeriod(searchParams.get('period')))

  // イベントデータを取得（API のパラメータ名に合わせて search→q, garden_id→gardenId）
  const fetchEvents = async (currentFilters: EventSearchParams) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        if (Array.isArray(value) && value.length === 0) return
        const apiKey = key === 'search' ? 'q' : key === 'garden_id' ? 'gardenId' : key
        params.set(apiKey, Array.isArray(value) ? value.join(',') : value.toString())
      })

      const response = await fetch(`/api/events?${params}`)
      if (!response.ok) {
        throw new Error('イベントデータの取得に失敗しました')
      }

      const data: EventsResponse = await response.json()
      setEvents(data.events)
      setEventsResponse(data)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // フィルター・期間を URL に反映（表示タブの状態は残す）
  const updateURL = (newFilters: EventSearchParams, newPeriod: EventPeriod) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (key === 'page' || key === 'limit') return
      if (value === undefined || value === null || value === '') return
      if (Array.isArray(value)) {
        if (value.length > 0) params.set(key, value.join(','))
      } else {
        params.set(key, value.toString())
      }
    })
    if (newPeriod !== 'upcoming' && !newFilters.month) params.set('period', newPeriod)
    if (view !== 'list') params.set('view', view)
    const qs = params.toString()
    router.push(qs ? `/events?${qs}` : '/events', { scroll: false })
  }

  const handleFiltersChange = (newFilters: EventSearchParams) => {
    setFilters(newFilters)
    updateURL(newFilters, period)
  }

  const handlePeriodChange = (newPeriod: EventPeriod) => {
    setPeriod(newPeriod)
    updateURL({ ...filters, month: undefined }, newPeriod)
  }

  const clearSearch = () => handleFiltersChange({ ...filters, search: undefined, garden_id: undefined })

  useEffect(() => {
    fetchEvents(filters)
  }, [filters])

  // 表示するイベント：既定は開催中・これから（開催日順）。終了分は新しい順
  const displayed = useMemo(() => {
    const today = startOfToday()
    if (filters.month) return [...events].sort((a, b) => sortKey(a) - sortKey(b))
    const current = events
      .filter(e => getEventStatus(e, today) !== 'past')
      .sort((a, b) => {
        const sa = getEventStatus(a, today)
        const sb = getEventStatus(b, today)
        if (sa !== sb) return sa === 'ongoing' ? -1 : 1
        return sa === 'ongoing'
          ? parseEventDate(a.end_date).getTime() - parseEventDate(b.end_date).getTime()
          : sortKey(a) - sortKey(b)
      })
    const past = events
      .filter(e => getEventStatus(e, today) === 'past')
      .sort((a, b) => sortKey(b) - sortKey(a))
    if (period === 'past') return past
    if (period === 'all') return [...current, ...past]
    return current
  }, [events, filters.month, period])

  const selected = displayed.find(e => e.id === selectedId) ?? displayed[0] ?? null

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-navy" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-sm text-rakuten">{error}</p>
        <button
          onClick={() => fetchEvents(filters)}
          className="rounded-[10px] bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-light"
        >
          再試行
        </button>
      </div>
    )
  }

  return (
    <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
      <EventFilters
        className="mt-4 lg:mt-5"
        filters={filters}
        period={period}
        onFiltersChange={handleFiltersChange}
        onPeriodChange={handlePeriodChange}
        prefectures={eventsResponse?.prefectures || []}
        count={view === 'month' ? events.length : displayed.length}
      />

      {(filters.search || filters.garden_id) && (
        <div className="mt-3 flex items-center gap-2 text-[13px] text-ink-soft">
          {filters.search ? `「${filters.search}」の検索結果` : '盆栽園で絞り込み中'}
          <button type="button" onClick={clearSearch} className="text-navy underline hover:text-gold-dark">解除</button>
        </div>
      )}

      <p className="mt-3 text-xs text-ink-soft lg:hidden">{view === 'month' ? events.length : displayed.length}件</p>

      <div className="mt-3 lg:mt-5">
        {view === 'month' ? (
          <EventCalendar events={events} />
        ) : view === 'map' ? (
          <EventMap events={displayed} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
            <EventListView events={displayed} selectedId={selected?.id} onSelect={e => setSelectedId(e.id)} />
            {selected && (
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <EventPreview event={selected} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
