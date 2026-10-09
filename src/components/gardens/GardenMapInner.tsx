'use client'

// 盆栽園の地図（Leaflet）。SSR できないため GardenMap から dynamic import で読み込む
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { GardenMapPoint } from './GardenMap'

function pinIcon(active: boolean) {
  const size = active ? 30 : 22
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${active ? '#b8935a' : '#1a365d'};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  })
}

function fitPoints(map: L.Map, points: GardenMapPoint[]) {
  if (points.length === 1) {
    map.setView([points[0].lat, points[0].lng], 14, { animate: false })
  } else if (points.length > 1) {
    map.fitBounds(L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number])), { padding: [32, 32], maxZoom: 13, animate: false })
  }
}

// 全ピンが収まるように表示（一覧のホバーで地図が動かないよう、選択では動かさない）
function Viewport({ points }: { points: GardenMapPoint[] }) {
  const map = useMap()
  const pointsRef = useRef(points)
  pointsRef.current = points
  useEffect(() => {
    const size = map.getSize()
    if (size.x > 0 && size.y > 0) fitPoints(map, points)
  }, [map, points])
  // 非表示から表示に切り替わったとき（大きさ0で作られた場合）は、大きさを合わせ直してから全ピンが収まるように合わせ直す
  useEffect(() => {
    const el = map.getContainer()
    let wasEmpty = el.clientWidth === 0 || el.clientHeight === 0
    const observer = new ResizeObserver(() => {
      const empty = el.clientWidth === 0 || el.clientHeight === 0
      map.invalidateSize({ animate: false })
      if (wasEmpty && !empty) fitPoints(map, pointsRef.current)
      wasEmpty = empty
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [map])
  return null
}

// タッチ端末では1本指のドラッグでページのスクロールが止まらないよう、地図をタップするまで移動を無効にする
function TapToDrag({ onEnable }: { onEnable: () => void }) {
  const map = useMapEvents({
    click: () => {
      if (!map.dragging.enabled()) {
        map.dragging.enable()
        onEnable()
      }
    },
  })
  return null
}

export default function GardenMapInner({
  points,
  selectedId,
  onSelect,
  showPopup = true,
}: {
  points: GardenMapPoint[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  showPopup?: boolean
}) {
  const center: [number, number] = points[0] ? [points[0].lat, points[0].lng] : [36.2, 138.25]
  // このコンポーネントはブラウザでだけ読み込まれる（ssr: false）
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [touch] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  const [dragEnabled, setDragEnabled] = useState(!touch)

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={points.length === 1 ? 14 : 6}
        scrollWheelZoom={false}
        dragging={!touch}
        zoomAnimation={!reducedMotion}
        fadeAnimation={!reducedMotion}
        markerZoomAnimation={!reducedMotion}
        className="h-full w-full"
        style={{ background: '#efeadf' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Viewport points={points} />
        {touch && <TapToDrag onEnable={() => setDragEnabled(true)} />}
        {points.map(p => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={pinIcon(p.id === selectedId)}
            title={p.name}
            alt={p.name}
            // ピンはキーボードの移動先にしない（同じ内容を一覧で選べるため）
            keyboard={false}
            zIndexOffset={p.id === selectedId ? 1000 : 0}
            eventHandlers={onSelect ? { click: () => onSelect(p.id) } : undefined}
          >
            {showPopup && (
              <Popup>
                <div className="min-w-[160px]">
                  {p.area && <div className="text-[11px] text-ink-muted">{p.area}</div>}
                  <div className="font-mincho text-[15px] font-bold text-navy">{p.name}</div>
                  {p.href && (
                    <Link href={p.href} className="mt-1 inline-block text-xs font-bold text-navy underline">
                      詳しく見る →
                    </Link>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
      {!dragEnabled && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-[500] -translate-x-1/2 whitespace-nowrap bg-white/90 px-2.5 py-1 text-[11px] text-ink-soft shadow-sm">
          地図をタップすると動かせます
        </div>
      )}
    </div>
  )
}
