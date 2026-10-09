'use client'

import { useState, useMemo } from 'react'
import { Event } from '@/types'
import { cn } from '@/lib/utils'
import { EventCard } from './EventCard'
import { GardenMap, type GardenMapPoint } from '@/components/gardens/GardenMap'

// Prefecture coordinates (approximate center points)
const prefectureCoordinates: Record<string, [number, number]> = {
  '北海道': [43.2203, 142.8635],
  '青森県': [40.8244, 140.74],
  '岩手県': [39.7036, 141.1527],
  '宮城県': [38.2682, 140.8721],
  '秋田県': [39.7186, 140.1024],
  '山形県': [38.2404, 140.3635],
  '福島県': [37.7503, 140.4676],
  '茨城県': [36.3417, 140.4468],
  '栃木県': [36.5658, 139.8836],
  '群馬県': [36.3911, 139.0608],
  '埼玉県': [35.8572, 139.6489],
  '千葉県': [35.6074, 140.1065],
  '東京都': [35.6762, 139.6503],
  '神奈川県': [35.4478, 139.6425],
  '新潟県': [37.9026, 139.0232],
  '富山県': [36.6959, 137.2137],
  '石川県': [36.5946, 136.6256],
  '福井県': [36.0652, 136.2218],
  '山梨県': [35.6636, 138.5684],
  '長野県': [36.6513, 138.1810],
  '岐阜県': [35.3912, 136.7223],
  '静岡県': [34.9756, 138.3828],
  '愛知県': [35.1802, 136.9066],
  '三重県': [34.7309, 136.5085],
  '滋賀県': [35.0045, 135.8686],
  '京都府': [35.0211, 135.7556],
  '大阪府': [34.6937, 135.5023],
  '兵庫県': [34.6913, 135.1830],
  '奈良県': [34.6851, 135.8048],
  '和歌山県': [34.2261, 135.1675],
  '鳥取県': [35.5037, 134.2384],
  '島根県': [35.4723, 133.0505],
  '岡山県': [34.6617, 133.9341],
  '広島県': [34.3963, 132.4596],
  '山口県': [34.1859, 131.4706],
  '徳島県': [34.0658, 134.5593],
  '香川県': [34.3401, 134.0431],
  '愛媛県': [33.8416, 132.7658],
  '高知県': [33.5597, 133.5311],
  '福岡県': [33.6064, 130.4181],
  '佐賀県': [33.2494, 130.2989],
  '長崎県': [32.7447, 129.8737],
  '熊本県': [32.7898, 130.7417],
  '大分県': [33.2382, 131.6126],
  '宮崎県': [31.9111, 131.4239],
  '鹿児島県': [31.5604, 130.5581],
  '沖縄県': [26.2124, 127.6792]
}

interface EventMapProps {
  events: Event[]
  className?: string
  selectedEvent?: Event | null
  onEventSelect?: (event: Event | null) => void
}

export function EventMap({ events, className, selectedEvent, onEventSelect }: EventMapProps) {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(selectedEvent?.prefecture ?? null)

  // 都道府県ごとにまとめてピンを立てる
  const eventGroups = useMemo(() => {
    const groups = new Map<string, Event[]>()
    events
      .filter(event => prefectureCoordinates[event.prefecture])
      .forEach(event => {
        if (!groups.has(event.prefecture)) groups.set(event.prefecture, [])
        groups.get(event.prefecture)!.push(event)
      })
    return Array.from(groups.entries()).map(([prefecture, eventList]) => ({
      prefecture,
      events: eventList,
      coordinates: prefectureCoordinates[prefecture],
      count: eventList.length
    }))
  }, [events])

  // 盆栽園の地図と同じ部品・同じ紺のピンで表示する（全ピンが収まるように表示）
  const points: GardenMapPoint[] = useMemo(
    () => eventGroups.map(g => ({ id: g.prefecture, name: `${g.prefecture}のイベント（${g.count}件）`, lat: g.coordinates[0], lng: g.coordinates[1] })),
    [eventGroups]
  )

  const selectedGroup = eventGroups.find(g => g.prefecture === selectedPrefecture) ?? null

  const select = (prefecture: string) => {
    setSelectedPrefecture(prefecture)
    const group = eventGroups.find(g => g.prefecture === prefecture)
    onEventSelect?.(group && group.events.length === 1 ? group.events[0] : null)
  }

  return (
    <div className={cn('grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]', className)}>
      <div>
        <div className="isolate relative h-[360px] overflow-hidden border border-line lg:h-[520px]">
          {points.length > 0 ? (
            <GardenMap points={points} selectedId={selectedPrefecture} onSelect={select} showPopup={false} />
          ) : (
            <div className="flex h-full items-center justify-center bg-white text-sm text-ink-muted">地図に表示できるイベントがありません</div>
          )}
        </div>
        <p className="mt-2 text-[11.5px] text-ink-muted">※ ピンは都道府県ごとのおおよその位置です。ピンを押すとその地域のイベントを表示します。</p>
      </div>

      <div>
        <div className="lg:sticky lg:top-24">
          <h3 className="mb-2.5 flex items-baseline gap-2 text-[13px] font-bold text-ink-soft" aria-live="polite">
            {selectedGroup ? `${selectedGroup.prefecture}のイベント（${selectedGroup.count}件）` : '地図のピンか地域を選んでください'}
            {selectedGroup && (
              <button type="button" onClick={() => setSelectedPrefecture(null)} className="ml-auto inline-flex min-h-11 items-center text-xs font-normal text-ink underline underline-offset-4 hover:text-gold-dark lg:min-h-0">
                選択を解除
              </button>
            )}
          </h3>
          {selectedGroup ? (
            <div className="flex flex-col border-t border-line">
              {selectedGroup.events.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {eventGroups.map(g => (
                <button key={g.prefecture} type="button" onClick={() => select(g.prefecture)} className="min-h-11 border border-line bg-white px-3 py-1 text-[13px] text-ink hover:border-ink lg:min-h-0">
                  {g.prefecture}<span className="ml-1 text-ink-muted">{g.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
