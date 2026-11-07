'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Event } from '@/types'
import { EventCard } from '@/components/features/EventCard'
import { distanceKm } from '@/components/gardens/GardenParts'
import { getRegionFromPrefecture } from '@/lib/utils'

// 「今週末・近くの盆栽展」（/events/this-weekend）。見ている日の日付で、今週末・来週末に開かれる盆栽展を出す
// サイトは数日おきに作り直すため、週末の計算はブラウザで行う（作った日の結果を最初に出し、すぐに今日の日付で描き直す）

type Which = 'this' | 'next'
const REGION_ORDER = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州', '沖縄']

const ymd = (d: Date) => d.toISOString().slice(0, 10)

// 日本時間の今日から、今週末（平日はこの先の土日、土曜はその土日、日曜はその日）と来週末の範囲
export function weekendRange(now: number, which: Which): { start: string; end: string; label: string } {
  const jst = new Date(now + 9 * 3600 * 1000)
  const day = jst.getUTCDay()
  const toSat = day === 0 ? -1 : 6 - day
  const sat = new Date(jst.getTime() + (toSat + (which === 'next' ? 7 : 0)) * 86400000)
  const sun = new Date(sat.getTime() + 86400000)
  const start = which === 'this' && day === 0 ? ymd(jst) : ymd(sat)
  const md = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
  return { start, end: ymd(sun), label: `${md(sat)}（土）〜${md(sun)}（日）` }
}

export function WeekendEvents({ events, builtAt }: { events: Event[]; builtAt: number }) {
  const [now, setNow] = useState(builtAt)
  const [which, setWhich] = useState<Which>('this')
  const [region, setRegion] = useState<string | null>(null)
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [geo, setGeo] = useState<'idle' | 'loading' | 'error'>('idle')

  useEffect(() => setNow(Date.now()), [])

  const range = weekendRange(now, which)
  const inRange = useMemo(
    () => events.filter(e => e.start_date.slice(0, 10) <= range.end && e.end_date.slice(0, 10) >= range.start),
    [events, range.start, range.end],
  )
  const regions = useMemo(() => {
    const set = new Set(inRange.map(e => getRegionFromPrefecture(e.prefecture)))
    return REGION_ORDER.filter(r => set.has(r))
  }, [inRange])

  const shown = useMemo(() => {
    const list = inRange
      .filter(e => !region || getRegionFromPrefecture(e.prefecture) === region)
      .map(e => ({ event: e, km: position && e.lat != null && e.lng != null ? distanceKm(position, { lat: Number(e.lat), lng: Number(e.lng) }) : undefined }))
    return position
      ? list.sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9))
      : list.sort((a, b) => a.event.start_date.localeCompare(b.event.start_date))
  }, [inRange, region, position])

  const locate = () => {
    if (position) return setPosition(null)
    if (!('geolocation' in navigator)) return setGeo('error')
    setGeo('loading')
    navigator.geolocation.getCurrentPosition(
      pos => { setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setRegion(null); setGeo('idle') },
      () => setGeo('error'),
      { timeout: 10000, maximumAge: 300000 },
    )
  }

  const chip = (active: boolean) => `inline-flex min-h-11 flex-none items-center border px-4 text-[13.5px] ${active ? 'border-sumi bg-sumi text-white' : 'border-line bg-white text-ink hover:border-ink'}`

  return (
    <div>
      {/* 今週末／来週末 */}
      <div className="flex gap-2" role="tablist" aria-label="週末">
        {(['this', 'next'] as Which[]).map(w => {
          const r = weekendRange(now, w)
          return (
            <button key={w} type="button" role="tab" aria-selected={which === w} onClick={() => setWhich(w)} className={`${chip(which === w)} flex-1 flex-col justify-center py-1.5 sm:flex-none sm:flex-row sm:gap-2`}>
              <span className="font-bold">{w === 'this' ? '今週末' : '来週末'}</span>
              <span className={`text-[11.5px] ${which === w ? 'text-white/75' : 'text-ink-muted'}`}>{r.label}</span>
            </button>
          )
        })}
      </div>

      {/* 地域・現在地 */}
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
        <button type="button" onClick={locate} aria-pressed={Boolean(position)} className={chip(Boolean(position))}>
          {geo === 'loading' ? '現在地を確認中…' : position ? '近い順（解除）' : '現在地から近い順'}
        </button>
        <button type="button" onClick={() => setRegion(null)} aria-pressed={!region} className={chip(!region && !position)}>全国</button>
        {regions.map(r => (
          <button key={r} type="button" onClick={() => { setRegion(r); setPosition(null) }} aria-pressed={region === r} className={chip(region === r)}>{r}</button>
        ))}
      </div>
      {geo === 'error' && <p className="mt-2 text-[12px] text-ink-muted">現在地を確認できませんでした。地域から選んでください。</p>}

      <p className="mt-4 text-[13px] text-ink-soft" aria-live="polite">
        {range.label}に開かれる盆栽展：<strong className="text-ink">{shown.length}件</strong>
        {region ? `（${region}）` : ''}
      </p>

      {shown.length > 0 ? (
        <div className="mt-2 border-t border-line">
          {shown.map(({ event, km }) => (
            <div key={event.id} className="relative">
              <EventCard event={event} layout="list" />
              {km !== undefined && <span className="pointer-events-none absolute right-0 top-3 text-[12px] text-gold-dark">約{km < 10 ? km.toFixed(1) : Math.round(km)}km</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 border-y border-line py-8 text-center">
          <p className="text-[13.5px] text-ink-soft">この週末に開かれる盆栽展は、まだ見つかっていません。</p>
          <Link href="/events" className="mt-3 inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink">これから開かれる盆栽展をすべて見る ›</Link>
        </div>
      )}
    </div>
  )
}
