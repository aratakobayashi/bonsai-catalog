// イベント一覧・詳細で共通して使う表示部品と日付の判定
import type { Event, EventType } from '@/types'
import { eventDateText, getEventMeta, isTentativeEvent } from '@/lib/event-display'

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  exhibition: '展示',
  sale: '即売会',
  workshop: 'ワークショップ',
  lecture: '講習会',
}

export const EVENT_TYPES = Object.keys(EVENT_TYPE_LABEL) as EventType[]

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export type EventStatus = 'ongoing' | 'upcoming' | 'past'

// 'YYYY-MM-DD' を端末のタイムゾーンの日付として読む（UTC解釈で1日ずれるのを防ぐ）
export function parseEventDate(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// 日程未発表のイベントは日付が仮の値なので、例年の月が今月以降なら「これから」とみなす
export function getEventStatus(event: Event, today: Date = startOfToday()): EventStatus {
  const start = parseEventDate(event.start_date)
  if (isTentativeEvent(event)) {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    return start >= monthStart ? 'upcoming' : 'past'
  }
  const end = parseEventDate(event.end_date)
  if (end < today) return 'past'
  if (start <= today) return 'ongoing'
  return 'upcoming'
}

function md(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}（${WEEKDAYS[date.getDay()]}）`
}

// 日程の表示。日程未発表のイベントは「例年◯月ごろ」だけを出す（公式発表の確認のお願いは注意書きで1回だけ出す）
export function eventPeriodText(event: Pick<Event, 'slug' | 'start_date' | 'end_date'>, withYear = false): string {
  if (isTentativeEvent(event)) {
    const usual = getEventMeta(event.slug)?.usualPeriod
    if (usual) return usual.startsWith('例年') ? usual : `例年${usual}`
    return `例年${parseEventDate(event.start_date).getMonth() + 1}月ごろ`
  }
  return eventDateText(event, withYear)
}

// 一覧用の短い日程（10/10（土）〜10/12（月））。日程未発表なら例年の時期を出す
export function eventShortDateText(event: Event): string {
  if (isTentativeEvent(event)) return eventPeriodText(event)
  const start = parseEventDate(event.start_date)
  const end = parseEventDate(event.end_date)
  const withYear = start.getFullYear() !== new Date().getFullYear()
  const prefix = withYear ? `${start.getFullYear()}年` : ''
  return event.start_date.slice(0, 10) === event.end_date.slice(0, 10)
    ? `${prefix}${md(start)}`
    : `${prefix}${md(start)}〜${md(end)}`
}

// 開催中・あと◯日・開催終了などのラベル
export function eventStatusLabel(event: Event): { text: string; tone: 'green' | 'gold' | 'gray' } | null {
  const today = startOfToday()
  const status = getEventStatus(event, today)
  if (isTentativeEvent(event)) return status === 'past' ? { text: '開催終了', tone: 'gray' } : { text: '日程未発表', tone: 'gray' }
  if (status === 'past') return { text: '開催終了', tone: 'gray' }
  if (status === 'ongoing') return { text: '開催中', tone: 'green' }
  const days = Math.round((parseEventDate(event.start_date).getTime() - today.getTime()) / 86400000)
  return days <= 30 ? { text: `あと${days}日`, tone: 'green' } : null
}

// Googleカレンダーへの登録リンク（日程が確定していて、まだ終わっていないイベントのみ）
export function googleCalendarUrl(event: Event): string | null {
  if (isTentativeEvent(event) || getEventStatus(event) === 'past') return null
  const fmt = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const end = parseEventDate(event.end_date)
  end.setDate(end.getDate() + 1)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(parseEventDate(event.start_date))}/${fmt(end)}`,
    location: [event.venue_name, event.address || event.prefecture].filter(Boolean).join(' '),
  })
  if (event.official_url) params.set('details', event.official_url)
  return `https://calendar.google.com/calendar/render?${params}`
}

// 地図アプリで会場を開くリンク
export function mapAppUrl(event: Event): string {
  const query = event.lat && event.lng
    ? `${event.lat},${event.lng}`
    : [event.venue_name, event.address, event.prefecture].filter(Boolean).join(' ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

// 都道府県＋市区町村程度の短い所在地
export function eventPlaceText(event: Event): string {
  if (!event.address) return event.prefecture
  const rest = event.address.startsWith(event.prefecture) ? event.address.slice(event.prefecture.length) : event.address
  const city = rest.match(/^(.{1,6}?[市区町村])/)?.[1]
  return city ? `${event.prefecture}${city}` : event.prefecture
}

// 一覧の左に置く日付（大きな日＋曜日。複数日は「〜12 月」を下に添える）。日程未発表のイベントは「例年◯月ごろ」
// showMonth：月の見出しの下にないとき（開催中の欄・注目・関連イベントなど）は月も出す
export function EventDateBlock({ event, muted = false, showMonth = true, compact = false }: { event: Event; muted?: boolean; showMonth?: boolean; compact?: boolean }) {
  const start = parseEventDate(event.start_date)
  const box = compact ? 'w-[52px] flex-none' : 'w-[58px] flex-none lg:w-[72px]'
  if (isTentativeEvent(event)) {
    return (
      <div className={box}>
        <div className="text-[11px] leading-tight text-ink-muted">例年</div>
        <div className={`font-mono text-[20px] leading-tight lg:text-[22px] ${muted ? 'text-ink-muted' : 'text-ink'}`}>{start.getMonth() + 1}月</div>
        <div className="text-[11px] leading-tight text-ink-muted">ごろ</div>
      </div>
    )
  }
  const end = parseEventDate(event.end_date)
  const multi = event.start_date.slice(0, 10) !== event.end_date.slice(0, 10)
  const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()
  return (
    <div className={box}>
      {showMonth && <div className="text-[11px] leading-tight text-ink-muted">{start.getMonth() + 1}月</div>}
      <div className="flex items-baseline gap-1">
        <span className={`font-mono leading-none ${compact ? 'text-[22px]' : 'text-[28px] lg:text-[32px]'} ${muted ? 'text-ink-muted' : 'text-ink'}`}>{start.getDate()}</span>
        <Weekday date={start} muted={muted} />
      </div>
      {multi && (
        <div className="mt-1 whitespace-nowrap text-[12px] leading-tight text-ink-soft">
          〜{sameMonth ? end.getDate() : `${end.getMonth() + 1}/${end.getDate()}`}
          <Weekday date={end} muted={muted} className="ml-0.5 text-[11px]" />
        </div>
      )}
    </div>
  )
}

// 曜日（土は紺、日は赤で見分けやすく）
export function Weekday({ date, muted = false, className = 'text-[12px]' }: { date: Date; muted?: boolean; className?: string }) {
  const day = date.getDay()
  const tone = muted ? 'text-ink-muted' : day === 6 ? 'text-navy' : day === 0 ? 'text-rakuten' : 'text-ink-soft'
  return <span className={`${className} ${tone}`}>{WEEKDAYS[day]}</span>
}

export type EventBadgeKind = 'live' | 'soon' | 'past' | 'tentative'

// 状態のバッジ（開催中・本日最終日・明日から・あと◯日・開催終了・日程未発表）
export function eventBadge(event: Event, today: Date = startOfToday()): { text: string; kind: EventBadgeKind } | null {
  const status = getEventStatus(event, today)
  if (status === 'past') return { text: '開催終了', kind: 'past' }
  if (isTentativeEvent(event)) return { text: '日程未発表', kind: 'tentative' }
  if (status === 'ongoing') {
    const last = parseEventDate(event.end_date).getTime() === today.getTime() && event.start_date.slice(0, 10) !== event.end_date.slice(0, 10)
    return { text: last ? '開催中・本日まで' : '開催中', kind: 'live' }
  }
  const days = Math.round((parseEventDate(event.start_date).getTime() - today.getTime()) / 86400000)
  if (days === 1) return { text: '明日から', kind: 'soon' }
  return days <= 30 ? { text: `あと${days}日`, kind: 'soon' } : null
}

const BADGE_CLASS: Record<EventBadgeKind, string> = {
  live: 'bg-sumi text-white',
  soon: 'border border-ink text-ink',
  past: 'bg-paper-deep text-ink-soft border border-line',
  tentative: 'border border-line text-ink-muted',
}

export function EventBadge({ event, className = '' }: { event: Event; className?: string }) {
  const badge = eventBadge(event)
  if (!badge) return null
  return (
    <span className={`inline-flex items-center px-1.5 text-[11px] font-bold leading-[1.7] tracking-[0.02em] ${BADGE_CLASS[badge.kind]} ${className}`}>
      {badge.text}
    </span>
  )
}

// 種別の小さなチップ（展示・即売会など）
export function EventTypeChip({ type }: { type: EventType }) {
  return <span className="inline-flex items-center border border-line bg-white px-1.5 text-[11px] leading-[1.7] text-ink-soft">{EVENT_TYPE_LABEL[type] ?? type}</span>
}

// 一覧用の短い料金（無料／有料／公式で確認）。短い料金表記があればそれを出す
export function eventPriceShort(event: Pick<Event, 'slug' | 'price_type' | 'price_note'>): string {
  const meta = getEventMeta(event.slug)
  if (meta && !meta.priceKnown) return '料金は公式で確認'
  if (event.price_type === 'free') return '無料'
  return event.price_note && event.price_note.length <= 12 ? event.price_note : '有料'
}

// 詳細ページの大きな日程（2026年／10月10日（土）〜12日（月）／3日間）
export function eventRangeParts(event: Event): { year: string; main: string; days: number | null } {
  if (isTentativeEvent(event)) return { year: '', main: eventPeriodText(event), days: null }
  const start = parseEventDate(event.start_date)
  const end = parseEventDate(event.end_date)
  const md = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  if (days <= 1) return { year: `${start.getFullYear()}年`, main: md(start), days: 1 }
  const endText = start.getFullYear() !== end.getFullYear()
    ? `${end.getFullYear()}年${md(end)}`
    : start.getMonth() === end.getMonth() ? `${end.getDate()}日（${WEEKDAYS[end.getDay()]}）` : md(end)
  return { year: `${start.getFullYear()}年`, main: `${md(start)}〜${endText}`, days }
}

export function EventTypeTag({ type }: { type: EventType }) {
  return <span className="text-[11px] text-gold-dark">{EVENT_TYPE_LABEL[type] ?? type}</span>
}

export function EventPlaceTag({ children }: { children: string }) {
  return <span className="text-[11px] text-ink-muted">{children}</span>
}

// 開催中・あと◯日などは小さな文字だけで示す（色付きのラベルは使わない）
export function EventStatusTag({ event }: { event: Event }) {
  const label = eventStatusLabel(event)
  if (!label) return null
  return <span className={`text-[11px] ${label.tone === 'gray' ? 'text-ink-muted' : 'text-gold-dark'}`}>{label.text}</span>
}
