'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Event } from '@/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { EventCard } from './EventCard'
import { eventPriceText } from '@/lib/event-display'
import { EVENT_TYPE_LABEL, eventShortDateText, getEventStatus } from './EventShared'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

// Fix Leaflet default markers
const FixLeafletIcons = dynamic(
  () => import('leaflet').then((L) => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
    return () => null
  }),
  { ssr: false }
)

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
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(selectedEvent?.prefecture ?? null)

  useEffect(() => {
    setMapLoaded(true)
  }, [])

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

  const selectedGroup = eventGroups.find(g => g.prefecture === selectedPrefecture) ?? null

  if (!mapLoaded) {
    return (
      <div className={cn('flex h-96 items-center justify-center border border-line bg-white text-sm text-ink-muted', className)}>
        地図を読み込み中…
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]', className)}>
      <div>
        <div className="relative h-[360px] overflow-hidden border border-line lg:h-[520px]">
          <MapContainer
            center={[36.2, 138.25]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <FixLeafletIcons />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {eventGroups.map(({ prefecture, events: groupEvents, coordinates, count }) => (
              <Marker
                key={prefecture}
                position={coordinates}
                eventHandlers={{
                  click: () => {
                    setSelectedPrefecture(prefecture)
                    onEventSelect?.(groupEvents.length === 1 ? groupEvents[0] : null)
                  }
                }}
              >
                <Popup>
                  <div className="min-w-56">
                    <p className="mb-1.5 font-bold text-ink">{prefecture}（{count}件）</p>
                    <ul className="max-h-48 space-y-1.5 overflow-y-auto">
                      {groupEvents.slice(0, 3).map(event => (
                        <li key={event.id} className="border-t border-line pt-1.5">
                          <Link href={`/events/${event.slug}`} className="block text-[13px] font-bold leading-snug text-ink hover:text-gold-dark">
                            {event.title}
                          </Link>
                          <span className="block text-[11.5px] text-ink-soft">
                            {event.types.map(t => EVENT_TYPE_LABEL[t]).join('・')}　{eventShortDateText(event)}・{eventPriceText(event)}
                            {getEventStatus(event) === 'past' && '（終了）'}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {groupEvents.length > 3 && <p className="mt-1.5 text-[11.5px] text-ink-muted">ほか{groupEvents.length - 3}件は右の一覧で確認できます</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <p className="mt-2 text-[11.5px] text-ink-muted">※ ピンは都道府県ごとのおおよその位置です。ピンを押すとその地域のイベントを表示します。</p>
      </div>

      <div>
        <div className="lg:sticky lg:top-24">
          <h3 className="mb-2.5 flex items-baseline gap-2 text-[13px] font-bold text-ink-soft">
            {selectedGroup ? `${selectedGroup.prefecture}のイベント（${selectedGroup.count}件）` : '地図のピンを選んでください'}
            {selectedGroup && (
              <button onClick={() => setSelectedPrefecture(null)} className="ml-auto text-xs font-normal border-b border-ink text-ink hover:text-gold-dark">
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
                <button key={g.prefecture} onClick={() => setSelectedPrefecture(g.prefecture)} className="border border-line bg-white px-3 py-1 text-[13px] text-ink hover:border-ink">
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
