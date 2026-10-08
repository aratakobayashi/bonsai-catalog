// イベントの日程・料金の表示（日程未発表の恒例行事や、料金が公表されていないイベントを正しく表示する）
// 確認結果は src/data/event-updates.json の meta（slug ごと）に入っている
import eventData from '@/data/event-updates.json'
import type { Event } from '@/types'

interface EventMeta {
  dateStatus: 'confirmed' | 'tentative'
  usualPeriod: string | null
  priceKnown: boolean
  sources: string[]
}

const metaBySlug = eventData.meta as Record<string, EventMeta>

export const EVENT_VERIFIED_AT: string | null = eventData.verifiedAt

export function getEventMeta(slug: string): EventMeta | null {
  return metaBySlug[slug] ?? null
}

// 日程が未発表（例年の時期だけわかっている）イベント
export function isTentativeEvent(event: Pick<Event, 'slug'>): boolean {
  return getEventMeta(event.slug)?.dateStatus === 'tentative'
}

function format(date: string, withYear: boolean) {
  return new Date(date).toLocaleDateString('ja-JP', withYear
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { month: 'short', day: 'numeric' })
}

export function eventDateText(event: Pick<Event, 'slug' | 'start_date' | 'end_date'>, withYear = false): string {
  const meta = getEventMeta(event.slug)
  if (meta?.dateStatus === 'tentative') {
    return `${meta.usualPeriod ?? '日程未定'}（今回の日程は公式発表をご確認ください）`
  }
  const start = format(event.start_date, withYear)
  return event.start_date === event.end_date ? start : `${start} - ${format(event.end_date, withYear)}`
}

export function eventPriceText(event: Pick<Event, 'slug' | 'price_type' | 'price_note'>): string {
  const meta = getEventMeta(event.slug)
  if (meta && !meta.priceKnown) return event.price_note || '料金は公式サイトでご確認ください'
  if (event.price_type === 'free') return '無料'
  return event.price_note || '有料'
}
