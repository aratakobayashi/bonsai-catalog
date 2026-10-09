'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Event, EventSearchParams, EventsResponse } from '@/types'
import { EventCalendar } from '@/components/features/EventCalendar'
import { EventFilters, EventPeriod } from '@/components/features/EventFilters'
import { EventMap } from '@/components/features/EventMap'
import { EventListView } from '@/components/features/EventListView'
import {
  EVENT_TYPE_LABEL,
  eventPeriodText,
  eventPlaceText,
  eventStatusLabel,
  getEventStatus,
  googleCalendarUrl,
  parseEventDate,
  startOfToday,
} from '@/components/features/EventShared'
import { eventPriceText, isTentativeEvent } from '@/lib/event-display'
import EventViewTabs, { parseEventView } from './EventViewTabs'

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
  const status = eventStatusLabel(event)
  const eyebrow = [...event.types.map(type => EVENT_TYPE_LABEL[type] ?? type), status?.text].filter(Boolean).join('・')
  return (
    <div>
      <div className="border-t border-ink pt-5">
        {eyebrow && <div className="text-[11.5px] text-gold-dark">{eyebrow}</div>}
        <h2 className="mt-1.5 font-mincho text-2xl font-bold leading-snug tracking-[0.04em] text-ink">{event.title}</h2>
        <dl className="mt-3 border-t border-line text-[13px]">
          {[
            ['日程', eventPeriodText(event, true)],
            ['会場', [event.venue_name, eventPlaceText(event)].filter(Boolean).join('・')],
            ['参加費', eventPriceText(event)],
            ...(event.organizer_name ? [['主催', event.organizer_name]] : []),
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[76px_1fr] border-b border-line py-3">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex gap-2.5">
          <Link href={`/events/${event.slug}`} className="flex h-12 flex-1 items-center justify-center bg-sumi text-sm tracking-[0.04em] text-white hover:bg-sumi-light hover:text-white">
            詳しく見る
          </Link>
          {calendarUrl && (
            <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center border border-ink bg-white px-4 text-[13px] text-ink hover:bg-paper-deep">
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

// initialEvents：条件なしの一覧をサーバー側で取得したもの（最初の表示を速くするため、条件がないときはそのまま使う）
export default function EventsPageClient({ initialEvents }: { initialEvents?: Event[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = parseEventView(searchParams.get('view'))

  const hasUrlFilters = ['prefecture', 'types', 'garden_id', 'month', 'search'].some(key => searchParams.get(key))
  const useInitial = Boolean(initialEvents) && !hasUrlFilters
  const [events, setEvents] = useState<Event[]>(useInitial ? initialEvents! : [])
  const [loading, setLoading] = useState(!useInitial)
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

  // 絞り込みは URL から毎回組み立てる（ブラウザの戻る・進むでも条件が URL と一致する）
  const filters = initialFilters
  const period = parsePeriod(searchParams.get('period'))

  // API に渡すパラメータ（API のパラメータ名に合わせて search→q, garden_id→gardenId）
  const apiQuery = useMemo(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      if (Array.isArray(value) && value.length === 0) return
      const apiKey = key === 'search' ? 'q' : key === 'garden_id' ? 'gardenId' : key
      params.set(apiKey, Array.isArray(value) ? value.join(',') : value.toString())
    })
    return params.toString()
  }, [filters])

  // 最後に取得した条件。最初の表示でサーバーから受け取った一覧を使ったときは、その条件を取得済みとする
  const lastFetchedKey = useRef<string | null>(useInitial ? apiQuery : null)

  // イベントデータを取得（古い条件の結果が後から届いても上書きしない）
  const latestQuery = useRef(apiQuery)
  const fetchEvents = async (query: string) => {
    latestQuery.current = query
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/events?${query}`)
      if (!response.ok) {
        throw new Error('イベントデータの取得に失敗しました')
      }

      const data: EventsResponse = await response.json()
      if (latestQuery.current !== query) return
      setEvents(data.events)
      setEventsResponse(data)
      lastFetchedKey.current = query
    } catch (err) {
      if (latestQuery.current !== query) return
      console.error('Error fetching events:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      if (latestQuery.current === query) setLoading(false)
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

  const handleFiltersChange = (newFilters: EventSearchParams) => updateURL(newFilters, period)

  const handlePeriodChange = (newPeriod: EventPeriod) => updateURL({ ...filters, month: undefined }, newPeriod)

  const clearSearch = () => handleFiltersChange({ ...filters, search: undefined, garden_id: undefined })

  // すべての条件を外す（表示の切り替えは残す）
  const clearAll = () => updateURL({ page: 1, limit: filters.limit }, 'upcoming')

  // URL の条件が変わったら取り直す（条件なしの最初の表示はサーバーの一覧を使う）
  useEffect(() => {
    if (lastFetchedKey.current === apiQuery) return
    fetchEvents(apiQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiQuery])

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
  const hasPast = useMemo(() => {
    const today = startOfToday()
    return events.some(e => getEventStatus(e, today) === 'past')
  }, [events])
  const hasAnyFilter = hasUrlFilters || period !== 'upcoming'

  if (loading && events.length === 0) {
    return (
      <div className="flex min-h-[100vh] items-start justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink" />
      </div>
    )
  }

  return (
    <div className={loading ? 'opacity-60 transition-opacity motion-reduce:transition-none' : 'transition-opacity motion-reduce:transition-none'}>
      <EventFilters
        className="mt-5 lg:mt-9"
        trailing={<EventViewTabs />}
        filters={filters}
        period={period}
        onFiltersChange={handleFiltersChange}
        onPeriodChange={handlePeriodChange}
        prefectures={eventsResponse?.prefectures || Array.from(new Set(events.map(e => e.prefecture))).sort()}
        count={error ? undefined : view === 'month' ? events.length : displayed.length}
        hasPast={hasPast}
      />

      {(filters.search || filters.garden_id) && (
        <div className="mt-3 flex items-center gap-2 text-[13px] text-ink-soft">
          {filters.search ? `「${filters.search}」の検索結果` : '盆栽園で絞り込み中'}
          <button type="button" onClick={clearSearch} className="inline-flex min-h-11 items-center lg:min-h-0">
            <span className="border-b border-ink pb-0.5 text-ink hover:text-gold-dark">解除</span>
          </button>
        </div>
      )}

      <div className="mt-6 lg:mt-8">
        {error ? (
          // 取得に失敗しても絞り込みは残し、条件を外すか、もう一度読み込めるようにする
          <div className="border-b border-t border-line px-6 py-12 text-center" role="alert">
            <p className="font-mincho font-bold text-ink">{error}</p>
            <p className="mt-2 text-sm text-ink-soft">
              {hasAnyFilter ? '条件を解除するか、時間をおいてもう一度お試しください。' : '時間をおいてもう一度お試しください。'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              {hasAnyFilter && (
                <button type="button" onClick={clearAll} className="h-12 bg-sumi px-6 text-sm text-white hover:bg-sumi-light">
                  条件を解除
                </button>
              )}
              <button
                type="button"
                onClick={() => fetchEvents(apiQuery)}
                className={hasAnyFilter ? 'h-12 border border-ink bg-white px-6 text-sm text-ink hover:bg-paper-deep' : 'h-12 bg-sumi px-6 text-sm text-white hover:bg-sumi-light'}
              >
                再試行
              </button>
            </div>
          </div>
        ) : view === 'month' ? (
          <EventCalendar events={events} />
        ) : view === 'map' ? (
          <EventMap events={displayed} />
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
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
