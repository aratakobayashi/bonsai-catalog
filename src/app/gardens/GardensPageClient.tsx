'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { CONTAINER, PageHeading, Placeholder } from '@/components/ui/design'
import { GardenMap, type GardenMapPoint } from '@/components/gardens/GardenMap'
import {
  FactChips,
  REGION_ORDER,
  distanceKm,
  formatKm,
  gardenArea,
  gardenFacts,
  gardenRegion,
  hasCoords,
  mapAppUrl,
  telHref,
} from '@/components/gardens/GardenParts'
import type { Garden } from '@/types'

// 一覧で使う項目だけ（page.tsx で作る）。summary は定型文でない説明だけ
export type GardenListItem = Pick<
  Garden,
  'id' | 'name' | 'prefecture' | 'city' | 'address' | 'latitude' | 'longitude' | 'phone' | 'website_url' | 'online_sales' | 'experience_programs'
> & { summary: string | null }

const ALL = 'すべて'
// 全国・地方の表示では、1つの都道府県に出す園の数（残りは「すべて見る」）
const GROUP_LIMIT = 3
// 近い順の表示で、最初に出す件数
const NEAR_PAGE = 20

// 「できること」の絞り込み（データで判定できるものだけ）
const FEATURES = [
  { key: 'experience', label: '体験・教室', test: (g: GardenListItem) => Boolean(g.experience_programs) },
  { key: 'online', label: 'オンライン購入', test: (g: GardenListItem) => Boolean(g.online_sales) },
  { key: 'website', label: '公式サイトあり', test: (g: GardenListItem) => Boolean(g.website_url) },
] as const
type FeatureKey = (typeof FEATURES)[number]['key']

type LatLng = { lat: number; lng: number }

function distanceTo(position: LatLng | null, g: GardenListItem): number | undefined {
  return position && hasCoords(g) ? distanceKm(position, { lat: g.latitude, lng: g.longitude }) : undefined
}

function prefectureHref(prefecture: string) {
  return `/gardens?prefecture=${encodeURIComponent(prefecture)}`
}

// 一覧の1行：名前・市区町村・説明（定型文以外）・できること／右に公式サイト・地図
function GardenRow({
  garden,
  selected,
  distance,
  showPrefecture,
  onHover,
}: {
  garden: GardenListItem
  selected: boolean
  distance?: number
  showPrefecture: boolean
  onHover: (id: string | null) => void
}) {
  const area = showPrefecture ? gardenArea(garden) : garden.city
  const actionClass =
    'relative z-10 inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap border border-line bg-white px-2 text-[12px] text-ink hover:border-ink lg:min-h-9 lg:w-auto lg:px-3'
  return (
    <article
      id={`garden-${garden.id}`}
      onMouseEnter={() => onHover(garden.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(garden.id)}
      className={`cv-row group relative flex gap-3 border-b border-line py-3.5 lg:items-center lg:gap-5 lg:py-3 ${selected ? 'bg-gold-light/40' : ''}`}
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-mincho text-[16px] font-bold leading-snug tracking-[0.04em] text-ink lg:text-[17px]">
          {/* 行全体を詳細ページへのリンクにする */}
          <Link href={`/gardens/${garden.id}`} className="after:absolute after:inset-0 group-hover:text-gold-dark">
            {garden.name}
          </Link>
        </h3>
        <p className="mt-0.5 flex flex-wrap gap-x-2 text-[12px] text-ink-muted">
          {area && <span>{area}</span>}
          {distance != null && <span className="font-bold text-gold-dark">{formatKm(distance)}</span>}
        </p>
        {garden.summary && <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.7] text-ink-soft lg:line-clamp-1">{garden.summary}</p>}
        <FactChips items={gardenFacts(garden)} className="mt-1.5 lg:mt-1" />
      </div>
      <div className="flex w-[92px] flex-shrink-0 flex-col justify-center gap-1.5 lg:w-auto lg:flex-row lg:gap-2">
        {garden.website_url ? (
          <a href={garden.website_url} target="_blank" rel="noopener noreferrer" className={actionClass} aria-label={`${garden.name}の公式サイト（新しいタブ）`}>
            公式サイト ↗
          </a>
        ) : garden.phone ? (
          <a href={telHref(garden.phone)} className={actionClass} aria-label={`${garden.name}に電話する（${garden.phone}）`}>
            電話する
          </a>
        ) : null}
        <a href={mapAppUrl(garden)} target="_blank" rel="noopener noreferrer" className={actionClass} aria-label={`${garden.name}の場所を地図アプリで開く（新しいタブ）`}>
          地図 ↗
        </a>
      </div>
    </article>
  )
}

export function GardensPageClient({ gardens }: { gardens: GardenListItem[] }) {
  const [region, setRegion] = useState<string>(ALL)
  const [prefecture, setPrefecture] = useState<string | null>(null)
  const [features, setFeatures] = useState<FeatureKey[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [position, setPosition] = useState<LatLng | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [nearLimit, setNearLimit] = useState(NEAR_PAGE)
  // 地図のピンから開いた都道府県（折りたたみを解除する）
  const [expanded, setExpanded] = useState<string[]>([])
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)
  const [showMapSp, setShowMapSp] = useState(false)
  const listTopRef = useRef<HTMLDivElement>(null)

  // PCでは常に地図を出す。SPは「地図で見る」を押したときだけ地図（Leaflet）を読み込む
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // ?prefecture= に対応（詳細ページの「〇〇県の盆栽園一覧」リンク・ブラウザの戻る）
  useEffect(() => {
    const read = () => {
      const pref = new URLSearchParams(window.location.search).get('prefecture')
      if (pref && gardens.some(g => g.prefecture === pref)) {
        setPrefecture(pref)
        setRegion(gardenRegion({ prefecture: pref }))
      } else {
        setPrefecture(null)
      }
    }
    read()
    window.addEventListener('popstate', read)
    return () => window.removeEventListener('popstate', read)
  }, [gardens])

  const prefectureCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    gardens.forEach(g => {
      if (g.prefecture) counts[g.prefecture] = (counts[g.prefecture] || 0) + 1
    })
    return counts
  }, [gardens])

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    gardens.forEach(g => {
      const r = gardenRegion(g)
      counts[r] = (counts[r] || 0) + 1
    })
    return counts
  }, [gardens])

  const regionList = useMemo(() => REGION_ORDER.filter(r => regionCounts[r]), [regionCounts])
  // 都道府県のチップ（一覧と同じく北から南。gardens は並べ替え済み）
  const prefectureList = useMemo(() => {
    const list: string[] = []
    gardens.forEach(g => {
      if (g.prefecture && !list.includes(g.prefecture)) list.push(g.prefecture)
    })
    return region === ALL ? list : list.filter(p => gardenRegion({ prefecture: p }) === region)
  }, [gardens, region])

  // 地域で絞った一覧（「できること」の件数を出すため、できることの絞り込み前）
  const scoped = useMemo(() => {
    if (prefecture) return gardens.filter(g => g.prefecture === prefecture)
    if (region !== ALL) return gardens.filter(g => gardenRegion(g) === region)
    return gardens
  }, [gardens, region, prefecture])

  const filtered = useMemo(() => {
    let list = scoped
    for (const key of features) {
      const f = FEATURES.find(x => x.key === key)!
      list = list.filter(f.test)
    }
    if (position) {
      list = [...list].sort((a, b) => (distanceTo(position, a) ?? Infinity) - (distanceTo(position, b) ?? Infinity))
    }
    return list
  }, [scoped, features, position])

  // 都道府県ごとのまとまり（近い順のときは使わない）
  const groups = useMemo(() => {
    const map = new Map<string, GardenListItem[]>()
    filtered.forEach(g => {
      const key = g.prefecture || 'その他'
      map.set(key, [...(map.get(key) || []), g])
    })
    return Array.from(map, ([name, items]) => ({ name, items }))
  }, [filtered])

  const isCollapsed = useCallback(
    (pref: string) => !prefecture && !expanded.includes(pref),
    [prefecture, expanded]
  )

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

  const scrollToListTop = () => {
    const el = listTopRef.current
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' })
  }

  // 都道府県を選ぶ（URLも ?prefecture= にする）
  const selectPrefecture = (pref: string | null, scroll = false) => {
    setPrefecture(pref)
    if (pref) setRegion(gardenRegion({ prefecture: pref }))
    setSelectedId(null)
    setExpanded([])
    window.history.pushState(null, '', pref ? prefectureHref(pref) : '/gardens')
    if (scroll) requestAnimationFrame(scrollToListTop)
  }

  const selectRegion = (r: string) => {
    setRegion(r)
    if (prefecture) selectPrefecture(null)
    setSelectedId(null)
  }

  const toggleFeature = (key: FeatureKey) => {
    setFeatures(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]))
    setSelectedId(null)
  }

  // 地図のピンを押したら一覧の該当の行までスクロール（折りたたまれていれば開く）
  const selectFromMap = (id: string) => {
    setSelectedId(id)
    const garden = filtered.find(g => g.id === id)
    if (!garden) return
    if (position) {
      const index = filtered.indexOf(garden)
      if (index >= nearLimit) setNearLimit(index + 1)
    } else if (garden.prefecture && isCollapsed(garden.prefecture)) {
      const items = groups.find(gr => gr.name === garden.prefecture)?.items || []
      if (items.indexOf(garden) >= GROUP_LIMIT) setExpanded(prev => [...prev, garden.prefecture!])
    }
    setPendingScrollId(id)
  }
  useEffect(() => {
    if (!pendingScrollId) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(`garden-${pendingScrollId}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' })
    setPendingScrollId(null)
  }, [pendingScrollId])

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
        setNearLimit(NEAR_PAGE)
        setRegion(ALL)
        setPrefecture(null)
        window.history.replaceState(null, '', '/gardens')
        setGeoStatus('idle')
        requestAnimationFrame(scrollToListTop)
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
    `inline-flex min-h-11 flex-none items-center font-mincho text-[14px] font-bold lg:text-[15px] ${active ? 'text-ink shadow-[inset_0_-2px_0_#22201c]' : 'text-ink-muted hover:text-ink'}`
  const chip = (active: boolean) =>
    `inline-flex min-h-11 flex-none items-center gap-1 border px-3 text-[13px] lg:min-h-9 ${active ? 'border-sumi bg-sumi font-bold text-white hover:text-white' : 'border-line bg-white text-ink hover:border-ink'}`
  const geoLabel = geoStatus === 'loading' ? '現在地を取得中…' : position ? '近い順を解除する' : '現在地から近い盆栽園'

  const renderRow = (g: GardenListItem, showPrefecture: boolean) => (
    <GardenRow
      key={g.id}
      garden={g}
      selected={g.id === selectedId}
      distance={distanceTo(position, g)}
      showPrefecture={showPrefecture}
      onHover={setSelectedId}
    />
  )

  return (
    <div className={`${CONTAINER} pb-14`}>
      {/* SPは見出しの上に切り替え */}
      <div className="pt-5 lg:hidden">{toggle}</div>
      <PageHeading
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '出かける', href: '/gardens' }, { label: '盆栽園' }]}
        title="盆栽園を訪ねる"
        lead={`全国${gardens.length}の盆栽園を、現在地や都道府県から探せます。`}
        aside={<div className="hidden lg:block">{toggle}</div>}
      />

      {/* 現在地・地図 */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 lg:mt-7">
        <button
          type="button"
          onClick={locate}
          aria-pressed={Boolean(position)}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 bg-sumi px-5 text-sm tracking-[0.04em] text-white hover:bg-sumi-light sm:flex-none"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <circle cx="12" cy="12" r="7.5" />
          </svg>
          {geoLabel}
        </button>
        <button
          type="button"
          onClick={() => setShowMapSp(v => !v)}
          aria-expanded={showMapSp}
          aria-controls="gardens-map"
          className="inline-flex h-12 items-center justify-center border border-ink bg-white px-5 text-sm text-ink lg:hidden"
        >
          {showMapSp ? '地図を閉じる' : '地図で見る'}
        </button>
        <p className="w-full text-[11.5px] text-ink-muted sm:w-auto">位置情報はこの端末の中で距離の計算にだけ使い、送信しません。</p>
      </div>
      {geoStatus === 'error' && (
        <p className="mt-2 text-xs text-rakuten" role="alert">現在地を取得できませんでした。端末の位置情報の設定をご確認いただくか、下の都道府県からお探しください。</p>
      )}

      {/* 都道府県から探す：地方のタブ＋都道府県のチップ（件数つき） */}
      <div className="mt-6 lg:mt-8">
        <h2 className="text-[12.5px] text-ink-muted">都道府県から探す</h2>
        <div className="-mx-4 mt-1 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex min-w-max gap-5 border-b border-line lg:min-w-0 lg:flex-wrap lg:gap-7">
            <button type="button" onClick={() => selectRegion(ALL)} className={tabClass(region === ALL)} aria-pressed={region === ALL}>
              すべて<span className="ml-1 text-[12px] font-normal">{gardens.length}</span>
            </button>
            {regionList.map(r => (
              <button key={r} type="button" onClick={() => selectRegion(r)} className={tabClass(region === r)} aria-pressed={region === r}>
                {r}<span className="ml-1 text-[12px] font-normal">{regionCounts[r]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:overflow-visible lg:px-0">
          <ul className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
            {prefectureList.map(p => {
              const active = prefecture === p
              return (
                <li key={p}>
                  <a
                    href={active ? '/gardens' : prefectureHref(p)}
                    onClick={e => {
                      e.preventDefault()
                      selectPrefecture(active ? null : p)
                    }}
                    aria-current={active ? 'page' : undefined}
                    className={chip(active)}
                  >
                    {p}
                    <span className={`text-[11.5px] ${active ? 'text-white/80' : 'text-ink-muted'}`}>{prefectureCounts[p]}</span>
                    {active && (
                      <>
                        <span aria-hidden="true">×</span>
                        <span className="sr-only">（選択を解除）</span>
                      </>
                    )}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* できること・件数 */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 lg:mt-4">
        <span className="text-[12.5px] text-ink-muted">できること</span>
        {FEATURES.map(f => {
          const active = features.includes(f.key)
          const count = scoped.filter(f.test).length
          return (
            <button key={f.key} type="button" onClick={() => toggleFeature(f.key)} aria-pressed={active} className="group inline-flex min-h-11 items-center gap-1.5 text-[12.5px] lg:min-h-9">
              <span aria-hidden="true" className={`inline-block h-3.5 w-3.5 border ${active ? 'border-sumi bg-sumi' : 'border-ink-muted bg-white'}`} />
              <span className={active ? 'font-bold text-ink' : 'text-ink-soft group-hover:text-ink'}>{f.label}</span>
              <span className="text-ink-muted">{count}</span>
            </button>
          )
        })}
      </div>

      <div ref={listTopRef} className="mt-3 scroll-mt-16 grid gap-4 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-10">
        {/* 一覧 */}
        <div className="lg:order-1">
          <div className="flex items-baseline gap-3 border-b border-ink pb-2">
            <h2 className="font-mincho text-[17px] font-bold tracking-[0.04em] text-ink lg:text-lg">
              {position ? '現在地から近い順' : `${scopeLabel}の盆栽園`}
            </h2>
            <span className="text-[12.5px] text-ink-muted" aria-live="polite">{filtered.length}件</span>
            {prefecture && (
              <a
                href="/gardens"
                onClick={e => {
                  e.preventDefault()
                  selectPrefecture(null)
                }}
                className="ml-auto inline-flex min-h-11 items-center text-[12.5px] text-ink lg:min-h-0"
              >
                <span className="border-b border-ink pb-0.5">全国の一覧へ</span>
              </a>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="border-b border-line py-12 text-center">
              <p className="font-mincho text-base font-bold text-ink">条件に合う盆栽園が見つかりませんでした</p>
              <p className="mt-2 text-sm text-ink-soft">地域や「できること」の条件を減らしてお試しください。</p>
            </div>
          ) : position ? (
            <div>
              {filtered.slice(0, nearLimit).map(g => renderRow(g, true))}
              {filtered.length > nearLimit && (
                <button
                  type="button"
                  onClick={() => setNearLimit(n => n + NEAR_PAGE)}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center border border-ink bg-white text-sm text-ink hover:bg-paper-deep"
                >
                  さらに表示する（残り{filtered.length - nearLimit}件）
                </button>
              )}
            </div>
          ) : (
            groups.map(group => {
              const collapsed = isCollapsed(group.name) && group.items.length > GROUP_LIMIT
              const items = collapsed ? group.items.slice(0, GROUP_LIMIT) : group.items
              return (
                <section key={group.name} aria-labelledby={`pref-${group.name}`}>
                  {/* 都道府県の見出し（スクロール中も上に残す） */}
                  {!prefecture && (
                    <div className="sticky top-14 z-20 -mx-4 flex items-baseline gap-2 border-b border-line bg-paper/95 px-4 pb-2 pt-4 backdrop-blur lg:mx-0 lg:px-0 lg:pt-3 lg:pb-1.5">
                      <h3 id={`pref-${group.name}`} className="font-mincho text-[15px] font-bold tracking-[0.06em] text-ink">
                        {group.name}
                      </h3>
                      <span className="text-[12px] text-ink-muted">{group.items.length}件</span>
                    </div>
                  )}
                  {prefecture && <h3 id={`pref-${group.name}`} className="sr-only">{group.name}</h3>}
                  {items.map(g => renderRow(g, false))}
                  {collapsed && (
                    <a
                      href={prefectureHref(group.name)}
                      onClick={e => {
                        e.preventDefault()
                        selectPrefecture(group.name, true)
                      }}
                      className="flex min-h-11 items-center justify-between border-b border-line text-[13px] text-ink hover:text-gold-dark"
                    >
                      <span>
                        {group.name}の盆栽園をすべて見る（{group.items.length}）
                      </span>
                      <span aria-hidden="true">›</span>
                    </a>
                  )}
                </section>
              )
            })
          )}

          <p className="mt-6 text-xs leading-relaxed text-ink-muted">
            掲載情報は公式サイトなどの公開情報をもとに確認しています。営業時間などは変わることがあるため、お出かけ前に各園へご確認ください。
            掲載内容の修正・掲載のご相談は<Link href="/contact" className="border-b border-ink-muted hover:text-gold-dark">お問い合わせ</Link>からどうぞ。
          </p>
        </div>

        {/* 地図（PCは右に固定して画面の高さに合わせる、SPは「地図で見る」で開く）。キーボードで一覧を先に操作できるよう、DOMでは一覧の後に置く */}
        <div id="gardens-map" className={`${showMapSp ? 'block' : 'hidden'} order-first lg:order-2 lg:block`}>
          <div className="lg:sticky lg:top-[72px]">
            <div className="isolate h-[55vh] min-h-[300px] overflow-hidden border border-line lg:h-[calc(100vh-88px)] lg:min-h-[420px]">
              {!(isDesktop || showMapSp) ? null : points.length > 0 ? (
                <GardenMap points={points} selectedId={selectedId} onSelect={selectFromMap} />
              ) : (
                <Placeholder label="地図に表示できる盆栽園がありません" className="h-full w-full" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
