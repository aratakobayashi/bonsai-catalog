'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { REGIONS } from '@/lib/utils'
import { CONTAINER, PageHeading, Placeholder } from '@/components/ui/design'
import { GardenMap, type GardenMapPoint } from '@/components/gardens/GardenMap'
import { PrefPlate, HighlightDots, gardenArea, gardenHighlights, gardenRegion } from '@/components/gardens/GardenParts'
import type { Garden } from '@/types'

const ALL = 'すべて'

// 「できること」の絞り込み（データで判定できるものだけ）
const FEATURES = [
  { key: 'experience', label: '体験・教室', test: (g: Garden) => Boolean(g.experience_programs) },
  { key: 'online', label: 'オンライン購入', test: (g: Garden) => Boolean(g.online_sales) },
  { key: 'website', label: '公式サイトあり', test: (g: Garden) => Boolean(g.website_url) },
] as const
type FeatureKey = (typeof FEATURES)[number]['key']

// 2点間の距離（km）
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

function hasCoords(g: Garden): g is Garden & { latitude: number; longitude: number } {
  return typeof g.latitude === 'number' && typeof g.longitude === 'number'
}

function GardenCard({
  garden,
  selected,
  distance,
  onSelect,
}: {
  garden: Garden
  selected: boolean
  distance?: number
  onSelect: () => void
}) {
  return (
    <article
      id={`garden-${garden.id}`}
      onMouseEnter={onSelect}
      className="cv-row group relative flex gap-4 border-b border-line py-5 lg:gap-5 lg:py-[22px]"
    >
      <PrefPlate garden={garden} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 text-[11.5px] text-ink-muted">
          <span className="truncate">{gardenArea(garden)}</span>
          {distance != null && <span className="flex-shrink-0 text-gold-dark">約{distance < 10 ? distance.toFixed(1) : Math.round(distance)}km</span>}
        </div>
        <h3 className={`mt-0.5 font-mincho text-[17px] font-bold leading-snug tracking-[0.04em] lg:text-xl ${selected ? 'text-gold-dark' : 'text-ink'}`}>
          {/* 行全体をリンクにする */}
          <Link href={`/gardens/${garden.id}`} className="after:absolute after:inset-0 group-hover:text-gold-dark">
            {garden.name}
          </Link>
        </h3>
        {garden.description && <p className="mt-1.5 line-clamp-3 text-[13px] leading-[1.8] text-ink-soft lg:text-[13.5px]">{garden.description}</p>}
        <div className="mt-1.5">
          <HighlightDots items={gardenHighlights(garden)} />
        </div>
      </div>
    </article>
  )
}

export function GardensPageClient({ gardens }: { gardens: Garden[] }) {
  const [region, setRegion] = useState<string>(ALL)
  const [prefecture, setPrefecture] = useState<string | null>(null)
  const [features, setFeatures] = useState<FeatureKey[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [showMapSp, setShowMapSp] = useState(false)
  // PCでは常に地図を出す。SPは「地図で見る」を押したときだけ地図（Leaflet）を読み込む
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // 詳細ページからの「〇〇県の盆栽園一覧」リンク（?prefecture=）に対応
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pref = params.get('prefecture')
    if (pref && gardens.some(g => g.prefecture === pref)) {
      setPrefecture(pref)
      setRegion(gardenRegion({ prefecture: pref }))
    }
  }, [gardens])

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    gardens.forEach(g => {
      const r = gardenRegion(g)
      counts[r] = (counts[r] || 0) + 1
    })
    return counts
  }, [gardens])

  // 件数の多い地方から並べる
  const regionList = useMemo(
    () => Object.keys(REGIONS).filter(r => regionCounts[r]).sort((a, b) => regionCounts[b] - regionCounts[a]),
    [regionCounts]
  )

  const filtered = useMemo(() => {
    let list = gardens
    if (prefecture) list = list.filter(g => g.prefecture === prefecture)
    else if (region !== ALL) list = list.filter(g => gardenRegion(g) === region)
    for (const key of features) {
      const f = FEATURES.find(x => x.key === key)!
      list = list.filter(f.test)
    }
    if (position) {
      list = [...list].sort((a, b) => {
        const da = hasCoords(a) ? distanceKm(position, { lat: a.latitude, lng: a.longitude }) : Infinity
        const db = hasCoords(b) ? distanceKm(position, { lat: b.latitude, lng: b.longitude }) : Infinity
        return da - db
      })
    }
    return list
  }, [gardens, region, prefecture, features, position])

  const points: GardenMapPoint[] = useMemo(
    () =>
      filtered.filter(hasCoords).map(g => ({
        id: g.id,
        name: g.name,
        lat: g.latitude,
        lng: g.longitude,
        area: gardenArea(g),
        href: `/gardens/${g.id}`,
      })),
    [filtered]
  )

  const selectRegion = (r: string) => {
    setRegion(r)
    setPrefecture(null)
    setSelectedId(null)
  }

  // 地図のピンを押したら一覧の該当カードまでスクロール
  const selectFromMap = (id: string) => {
    setSelectedId(id)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(`garden-${id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' })
  }

  const toggleFeature = (key: FeatureKey) => {
    setFeatures(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]))
    setSelectedId(null)
  }

  const locate = useCallback(() => {
    if (position) {
      setPosition(null)
      return
    }
    if (!('geolocation' in navigator)) {
      setGeoStatus('error')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setRegion(ALL)
        setPrefecture(null)
        setGeoStatus('idle')
      },
      () => setGeoStatus('error'),
      { timeout: 10000, maximumAge: 300000 }
    )
  }, [position])

  const scopeLabel = prefecture ?? (region === ALL ? '全国' : region)

  // 盆栽園／イベントの切り替え（明朝の文字タブ）
  const toggle = (
    <nav aria-label="出かける" className="flex gap-5 lg:justify-end lg:gap-7">
      <span className="pb-1.5 font-mincho text-[15px] font-bold text-ink shadow-[inset_0_-1.5px_0_#22201c] lg:text-base" aria-current="page">盆栽園</span>
      <Link href="/events" className="pb-1.5 font-mincho text-[15px] font-bold text-ink-muted hover:text-ink lg:text-base">イベント</Link>
    </nav>
  )

  const tabClass = (active: boolean) =>
    `flex-none py-3 font-mincho text-[14px] font-bold lg:text-[15px] ${active ? 'text-ink shadow-[inset_0_-1.5px_0_#22201c]' : 'text-ink-muted hover:text-ink'}`
  const textButton = (active: boolean) =>
    `text-[12.5px] ${active ? 'border-b border-ink pb-0.5 font-bold text-ink' : 'text-ink-soft group-hover:text-ink'}`
  // SPでも押しやすいよう、文字のボタンの押せる範囲を高さ44px以上にする
  const tapButton = 'group inline-flex min-h-11 items-center lg:min-h-0'

  return (
    <div className={`${CONTAINER} pb-14`}>
      {/* SPは見出しの上に切り替え */}
      <div className="pt-5 lg:hidden">{toggle}</div>
      <PageHeading
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '出かける', href: '/gardens' }, { label: '盆栽園' }]}
        title="盆栽園を訪ねる"
        lead={
          <>
            <span className="text-xs text-ink-muted lg:hidden">全国{gardens.length}件</span>
            <span className="hidden lg:inline">全国{gardens.length}の盆栽園を、地域とできることから探せます。</span>
          </>
        }
        aside={<div className="hidden lg:block">{toggle}</div>}
      />

      {/* 地方（下線のタブ。SPは横にスクロール） */}
      <div className="-mx-4 mt-5 overflow-x-auto px-4 lg:mx-0 lg:mt-9 lg:overflow-visible lg:px-0">
        <div className="flex min-w-max gap-5 border-b border-line lg:min-w-0 lg:flex-wrap lg:gap-7">
          <button type="button" onClick={() => selectRegion(ALL)} className={tabClass(region === ALL && !prefecture)} aria-pressed={region === ALL && !prefecture}>
            すべて {gardens.length}
          </button>
          {regionList.map(r => (
            <button key={r} type="button" onClick={() => selectRegion(r)} className={tabClass(region === r && !prefecture)} aria-pressed={region === r && !prefecture}>
              {r} {regionCounts[r]}
            </button>
          ))}
          {prefecture && (
            <button type="button" onClick={() => selectRegion(region)} className={tabClass(true)} aria-label={`${prefecture}の絞り込みを解除`}>
              {prefecture} ×
            </button>
          )}
        </div>
      </div>

      {/* できること・件数 */}
      <div className="mt-2 flex flex-wrap items-center gap-x-5 lg:mt-3.5 lg:gap-y-2">
        <span className="text-[12.5px] text-ink-muted">できること</span>
        {FEATURES.map(f => {
          const active = features.includes(f.key)
          return (
            <button key={f.key} type="button" onClick={() => toggleFeature(f.key)} aria-pressed={active} className={tapButton}>
              <span className={textButton(active)}>{f.label}</span>
            </button>
          )
        })}
        <span className="ml-auto text-[12.5px] text-ink-muted">
          {scopeLabel} {filtered.length}件{position && '（近い順）'}
        </span>
      </div>

      {/* SP: 現在地・地図 */}
      <div className="mt-1 flex gap-5 lg:hidden">
        <button type="button" onClick={locate} className="inline-flex min-h-11 items-center text-[13px] text-ink">
          <span className="border-b border-ink pb-0.5">{geoStatus === 'loading' ? '現在地を取得中…' : position ? '近い順を解除' : '現在地から探す'}</span>
        </button>
        <button type="button" onClick={() => setShowMapSp(v => !v)} aria-expanded={showMapSp} aria-controls="gardens-map" className="inline-flex min-h-11 items-center text-[13px] text-ink hover:text-gold-dark">
          {showMapSp ? '地図を閉じる' : '地図で見る'}
        </button>
      </div>
      {geoStatus === 'error' && <p className="mt-2 text-xs text-rakuten">現在地を取得できませんでした。端末の位置情報の設定をご確認ください。</p>}

      <div className="mt-2 grid gap-4 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-12">
        {/* 一覧 */}
        <div className="lg:order-1">
          {filtered.length > 0 ? (
            <div>
              {filtered.map(g => (
                <GardenCard
                  key={g.id}
                  garden={g}
                  selected={g.id === selectedId}
                  distance={position && hasCoords(g) ? distanceKm(position, { lat: g.latitude, lng: g.longitude }) : undefined}
                  onSelect={() => setSelectedId(g.id)}
                />
              ))}
            </div>
          ) : (
            <div className="border-b border-line py-12 text-center">
              <p className="font-mincho text-base font-bold text-ink">条件に合う盆栽園が見つかりませんでした</p>
              <p className="mt-2 text-sm text-ink-soft">地域や「できること」の条件を減らしてお試しください。</p>
            </div>
          )}

          <p className="mt-6 text-xs leading-relaxed text-ink-muted">
            掲載情報は公式サイトなどの公開情報をもとに確認しています。営業時間などは変わることがあるため、お出かけ前に各園へご確認ください。
            掲載内容の修正・掲載のご相談は<Link href="/contact" className="border-b border-ink-muted hover:text-gold-dark">お問い合わせ</Link>からどうぞ。
          </p>
        </div>
        {/* 地図（PCは右に固定、SPは「地図で見る」で開く）。キーボードで一覧を先に操作できるよう、DOMでは一覧の後に置く */}
        <div id="gardens-map" className={`${showMapSp ? 'block' : 'hidden'} order-first pt-2 lg:order-2 lg:block lg:pt-0`}>
          <div className="lg:sticky lg:top-24">
            <div className="isolate h-[320px] overflow-hidden border border-line lg:h-[calc(100vh-8rem)] lg:max-h-[640px]">
              {!(isDesktop || showMapSp) ? null : points.length > 0 ? (
                <GardenMap points={points} selectedId={selectedId} onSelect={selectFromMap} />
              ) : (
                <Placeholder label="地図に表示できる盆栽園がありません" className="h-full w-full" />
              )}
            </div>
            {/* PCのみ現在地ボタン */}
            <button type="button" onClick={locate} className="mt-3 hidden border-b border-ink pb-0.5 text-xs text-ink hover:text-gold-dark lg:inline-block">
              {geoStatus === 'loading' ? '現在地を取得中…' : position ? '近い順を解除' : '現在地から近い順に並べる'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
