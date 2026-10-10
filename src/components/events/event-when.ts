// イベント一覧の「いつ」の絞り込み（開催中・今週末・今月・来月）と、注目のイベントの選び方
// 日付の計算は端末の日付で行う（EventShared の parseEventDate と同じ考え方）
import type { Event } from '@/types'
import { isTentativeEvent } from '@/lib/event-display'
import { getEventStatus, parseEventDate, startOfToday } from '@/components/features/EventShared'

export type EventWhen = 'all' | 'ongoing' | 'weekend' | 'this-month' | 'next-month'

export const WHEN_OPTIONS: { value: EventWhen; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'ongoing', label: '開催中' },
  { value: 'weekend', label: '今週末' },
  { value: 'this-month', label: '今月' },
  { value: 'next-month', label: '来月' },
]

// URL の ?when=（不明な値は「すべて」）
export function parseEventWhen(value: string | null | undefined): EventWhen {
  return WHEN_OPTIONS.some(o => o.value === value) ? (value as EventWhen) : 'all'
}

// 今週末（土日）。土日に見ているときはその週末
export function weekendRange(today: Date = startOfToday()): [Date, Date] {
  const day = today.getDay()
  const sat = new Date(today)
  if (day === 0) sat.setDate(today.getDate() - 1)
  else sat.setDate(today.getDate() + (6 - day))
  const sun = new Date(sat)
  sun.setDate(sat.getDate() + 1)
  return [sat, sun]
}

function monthRange(today: Date, offset: number): [Date, Date] {
  return [
    new Date(today.getFullYear(), today.getMonth() + offset, 1),
    new Date(today.getFullYear(), today.getMonth() + offset + 1, 0),
  ]
}

function overlaps(event: Event, [from, to]: [Date, Date]) {
  return parseEventDate(event.start_date) <= to && parseEventDate(event.end_date) >= from
}

// 「いつ」に当てはまるか。日程未発表のイベントは、例年の月が今月・来月に当たるときだけ含める
export function matchesWhen(event: Event, when: EventWhen, today: Date = startOfToday()): boolean {
  const status = getEventStatus(event, today)
  if (status === 'past') return false
  const tentative = isTentativeEvent(event)
  switch (when) {
    case 'all':
      return true
    case 'ongoing':
      return !tentative && status === 'ongoing'
    case 'weekend':
      return !tentative && overlaps(event, weekendRange(today))
    case 'this-month':
    case 'next-month': {
      const range = monthRange(today, when === 'this-month' ? 0 : 1)
      if (tentative) {
        const start = parseEventDate(event.start_date)
        return start.getFullYear() === range[0].getFullYear() && start.getMonth() === range[0].getMonth()
      }
      return overlaps(event, range)
    }
  }
}

export function whenCounts(events: Event[], today: Date = startOfToday()): Record<EventWhen, number> {
  const counts = { all: 0, ongoing: 0, weekend: 0, 'this-month': 0, 'next-month': 0 } as Record<EventWhen, number>
  events.forEach(event => {
    WHEN_OPTIONS.forEach(({ value }) => {
      if (matchesWhen(event, value, today)) counts[value]++
    })
  })
  return counts
}

// 見出しなどに出す「いつ」の説明（今週末 10/10〜10/11 など）
export function whenRangeText(when: EventWhen, today: Date = startOfToday()): string | null {
  const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
  if (when === 'weekend') {
    const [sat, sun] = weekendRange(today)
    return `${md(sat)}（土）〜${md(sun)}（日）`
  }
  if (when === 'this-month' || when === 'next-month') {
    const [from] = monthRange(today, when === 'this-month' ? 0 : 1)
    return `${from.getFullYear()}年${from.getMonth() + 1}月`
  }
  return null
}

// 全国規模の主な展示（タイトルの語で判定する。掲載データにあるものだけが対象）
const NOTABLE_KEYWORDS = [
  '国風盆栽展',
  '日本盆栽作風展',
  '日本盆栽大観展',
  '大盆栽まつり',
  '雅風展',
  '日本水石名品展',
  '皐月展',
  '鹿沼さつき祭り',
]

export function isNotableEvent(event: Pick<Event, 'title'>): boolean {
  return NOTABLE_KEYWORDS.some(keyword => event.title.includes(keyword))
}

// 注目のイベント（2〜4件）：日程が確定していて、終わっていないもの。
// 主な展示を開催日の近い順に優先し、足りなければ開催中・近日のイベントで補う
export function pickFeaturedEvents(events: Event[], today: Date = startOfToday(), max = 4): Event[] {
  const horizon = new Date(today)
  horizon.setDate(today.getDate() + 180)
  const candidates = events
    .filter(e => !isTentativeEvent(e) && getEventStatus(e, today) !== 'past' && parseEventDate(e.start_date) <= horizon)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
  const notable = candidates.filter(isNotableEvent)
  const picked = notable.slice(0, max)
  if (picked.length < 3) {
    const soon = new Date(today)
    soon.setDate(today.getDate() + 14)
    for (const e of candidates) {
      if (picked.length >= 3) break
      if (picked.includes(e)) continue
      if (getEventStatus(e, today) === 'ongoing' || parseEventDate(e.start_date) <= soon) picked.push(e)
    }
  }
  if (picked.length < 2) return []
  return picked.sort((a, b) => a.start_date.localeCompare(b.start_date))
}

// 並べ替え用の日付。日程未発表のイベントは例年の月の末尾に置く
export function eventSortKey(event: Event) {
  const start = parseEventDate(event.start_date)
  return isTentativeEvent(event) ? new Date(start.getFullYear(), start.getMonth() + 1, 0, 12).getTime() : start.getTime()
}

// 開催中・これからのイベント：開催中（終了の近い順）→ これから（開催日順）
export function currentEventsInOrder(events: Event[], today: Date = startOfToday()): Event[] {
  return events
    .filter(e => getEventStatus(e, today) !== 'past')
    .sort((a, b) => {
      const sa = getEventStatus(a, today)
      const sb = getEventStatus(b, today)
      if (sa !== sb) return sa === 'ongoing' ? -1 : 1
      return sa === 'ongoing'
        ? parseEventDate(a.end_date).getTime() - parseEventDate(b.end_date).getTime()
        : eventSortKey(a) - eventSortKey(b)
    })
}

// イベント一覧で最初に出す件数（残りは「もっと見る」。最初の表示を軽くするため）
export const EVENTS_FIRST_PAGE = 10
