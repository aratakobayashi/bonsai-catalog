// 盆栽の手入れカレンダー（iCalendar 形式）。樹種グループごとに、毎月1日の終日の予定を12件（毎年くり返し）作る
// スマホ・パソコンのカレンダーアプリで「照会（購読）」すると、毎月の手入れが予定に入る。内容は今月の手入れ（care-calendar.ts）と同じ
import { CARE_GROUPS, getMonthCare, type CareGroupKey } from '@/lib/care-calendar'

const SITE = 'https://www.bonsai-collection.com'
const START_YEAR = 2026

// 文字のエスケープ（RFC 5545：\ ; , と改行）
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

// 1行75バイトを超える行は折り返す（続きの行は空白で始める）
function fold(line: string): string {
  const enc = new TextEncoder()
  const out: string[] = []
  let cur = ''
  for (const ch of line) {
    if (enc.encode(cur + ch).length > (out.length ? 74 : 75)) {
      out.push(cur)
      cur = ch
    } else cur += ch
  }
  out.push(cur)
  return out.join('\r\n ')
}

const pad = (n: number) => String(n).padStart(2, '0')

export function careIcs(groupKey: CareGroupKey): string {
  const group = CARE_GROUPS.find(g => g.key === groupKey)!
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//bonsai-collection.com//care-calendar//JA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(`盆栽の手入れ（${group.label}）`)}`,
    'X-WR-TIMEZONE:Asia/Tokyo',
    `X-WR-CALDESC:${esc(`盆栽コレクションの「今月の手入れ」から、${group.label}（${group.examples}）の毎月の作業を予定に入れます。`)}`,
    'REFRESH-INTERVAL;VALUE=DURATION:P7D',
    'X-PUBLISHED-TTL:P7D',
  ]
  for (let m = 1; m <= 12; m++) {
    const care = getMonthCare(m)
    const g = care.groups[groupKey]
    const tasks = g.tasks.filter(t => !t.only)
    const url = `${SITE}/teire/${m}#group-${groupKey}`
    const description = [
      `${m}月の盆栽（${group.label}）：${care.phase}`,
      care.lead,
      '',
      `水やり：${g.water}`,
      `置き場所：${g.place}`,
      `肥料：${g.fertilizer}`,
      ...(tasks.length ? ['', '今月の作業：', ...tasks.map(t => `・${t.title}：${t.text}`)] : []),
      '',
      `くわしく：${url}`,
    ].join('\n')
    lines.push(
      'BEGIN:VEVENT',
      `UID:care-${groupKey}-${pad(m)}@bonsai-collection.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${START_YEAR}${pad(m)}01`,
      `DTEND;VALUE=DATE:${START_YEAR}${pad(m)}02`,
      'RRULE:FREQ=YEARLY',
      `SUMMARY:${esc(`盆栽：${m}月の手入れ（${group.label}）`)}`,
      `DESCRIPTION:${esc(description)}`,
      `URL:${url}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

export const careIcsPath = (groupKey: string) => `/calendar/${groupKey}.ics`
export const careIcsUrl = (groupKey: string) => `${SITE}${careIcsPath(groupKey)}`
