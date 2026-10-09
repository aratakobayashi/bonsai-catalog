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

// 一覧の左に置く日付（大きな数字＋「10月・土」）。日程未発表のイベントは日を出さない
export function EventDateBlock({ event, muted = false }: { event: Event; muted?: boolean }) {
  const start = parseEventDate(event.start_date)
  const box = 'w-[46px] flex-none lg:w-[66px]'
  if (isTentativeEvent(event)) {
    return (
      <div className={box}>
        <div className="text-[11px] text-ink-muted">例年</div>
        <div className={`font-mono text-[22px] leading-tight lg:text-[26px] ${muted ? 'text-ink-muted' : 'text-ink'}`}>{start.getMonth() + 1}月</div>
        <div className="text-[11px] text-ink-muted">ごろ</div>
      </div>
    )
  }
  return (
    <div className={box}>
      <div className={`font-mono text-[26px] leading-none lg:text-[30px] ${muted ? 'text-ink-muted' : 'text-ink'}`}>{start.getDate()}</div>
      <div className="mt-1.5 text-[11px] leading-snug text-ink-muted">{start.getMonth() + 1}月・{WEEKDAYS[start.getDay()]}</div>
    </div>
  )
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
