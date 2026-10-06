'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Event } from '@/types'
import { cn } from '@/lib/utils'
import { MapPin, Calendar, DollarSign } from 'lucide-react'
import { EventCard } from './EventCard'

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

const eventTypeConfig = {
  exhibition: { color: 'text-green-600 bg-green-50', icon: '🌳', label: '展示' },
  sale: { color: 'text-blue-600 bg-blue-50', icon: '🛒', label: '即売' },
  workshop: { color: 'text-orange-600 bg-orange-50', icon: '✂️', label: '体験' },
  lecture: { color: 'text-purple-600 bg-purple-50', icon: '📖', label: '講習' }
}

interface EventMapProps {
  events: Event[]
  className?: string
  selectedEvent?: Event | null
  onEventSelect?: (event: Event | null) => void
}

export function EventMap({ events, className, selectedEvent, onEventSelect }: EventMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState<Event | null>(selectedEvent || null)

  useEffect(() => {
    setMapLoaded(true)
  }, [])

  // Group events by prefecture and add coordinates
  const eventsWithCoordinates = useMemo(() => {
    return events
      .filter(event => prefectureCoordinates[event.prefecture])
      .map(event => ({
        ...event,
        coordinates: prefectureCoordinates[event.prefecture] as [number, number]
      }))
  }, [events])

  // Group events by prefecture for clustering
  const eventGroups = useMemo(() => {
    const groups = new Map<string, (Event & { coordinates: [number, number] })[]>()

    eventsWithCoordinates.forEach(event => {
      const key = event.prefecture
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(event)
    })

    return Array.from(groups.entries()).map(([prefecture, eventList]) => ({
      prefecture,
      events: eventList,
      coordinates: eventList[0].coordinates,
      count: eventList.length
    }))
  }, [eventsWithCoordinates])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getDateRange = (event: Event) => {
    if (event.start_date === event.end_date) {
      return formatDate(event.start_date)
    }
    return `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`
  }

  const isUpcoming = (event: Event) => {
    const today = new Date()
    const startDate = new Date(event.start_date)
    return startDate >= today
  }

  const isPast = (event: Event) => {
    const today = new Date()
    const endDate = new Date(event.end_date)
    return endDate < today
  }

  if (!mapLoaded) {
    return (
      <div className={cn("flex items-center justify-center h-96 bg-gray-50 rounded-lg", className)}>
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">マップを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Map Container */}
      <div className="relative h-96 rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={[35.6762, 139.6503]} // Tokyo center
          zoom={6}
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
                  // If single event, select it; if multiple, show prefecture info
                  if (groupEvents.length === 1) {
                    setSelectedMarker(groupEvents[0])
                    onEventSelect?.(groupEvents[0])
                  } else {
                    setSelectedMarker(null)
                    onEventSelect?.(null)
                  }
                }
              }}
            >
              <Popup>
                <div className="p-2 min-w-64">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {prefecture} ({count}件のイベント)
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {groupEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors",
                          selectedMarker?.id === event.id && "border-green-300 bg-green-50"
                        )}
                        onClick={() => {
                          setSelectedMarker(event)
                          onEventSelect?.(event)
                        }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm text-gray-900 leading-tight">
                            {event.title}
                          </h4>
                          <div className="flex gap-1 ml-2">
                            {event.types.slice(0, 1).map((type) => (
                              <span
                                key={type}
                                className="text-xs"
                                title={eventTypeConfig[type].label}
                              >
                                {eventTypeConfig[type].icon}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{getDateRange(event)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{event.price_type === 'free' ? '無料' : '有料'}</span>
                          </div>
                        </div>
                        {event.venue_name && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {event.venue_name}
                          </p>
                        )}
                        {isPast(event) && (
                          <span className="inline-block text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-1">
                            終了
                          </span>
                        )}
                        {isUpcoming(event) && (
                          <span className="inline-block text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded mt-1">
                            開催予定
                          </span>
                        )}
                      </div>
                    ))}
                    {groupEvents.length > 3 && (
                      <p className="text-xs text-gray-500 text-center py-1">
                        他 {groupEvents.length - 3} 件のイベント
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Selected Event Details */}
      {selectedMarker && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            選択されたイベント
          </h3>
          <EventCard
            event={selectedMarker}
            layout="compact"
          />
        </div>
      )}

      {/* Map Legend */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">凡例</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(eventTypeConfig).map(([type, config]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <span className="text-sm text-gray-700">{config.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            📍 マーカーをクリックしてイベント詳細を表示
          </p>
        </div>
      </div>
    </div>
  )
}