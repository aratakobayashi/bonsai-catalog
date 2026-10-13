'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useUrlParams } from '@/components/static/ParamGate'
import { GuidesView, type GuidesData } from '@/components/features/GuidesView'

let cache: Promise<GuidesData> | null = null
function loadGuides(): Promise<GuidesData> {
  if (!cache) {
    cache = fetch('/data/articles.json').then(res => {
      if (!res.ok) throw new Error(`記事の一覧を読み込めませんでした（${res.status}）`)
      return res.json() as Promise<GuidesData>
    })
    cache.catch(() => { cache = null })
  }
  return cache
}

// カテゴリ・検索・並び順・ページ送りのURLは、ブラウザで記事の一覧を読んで描く
export function GuidesClient({ children }: { children: ReactNode }) {
  const params = useUrlParams()
  const active = Object.keys(params).length > 0
  const [data, setData] = useState<GuidesData | null>(null)
  useEffect(() => {
    if (!active || data) return
    let alive = true
    loadGuides().then(d => { if (alive) setData(d) }).catch(() => {})
    return () => { alive = false }
  }, [active, data])
  if (!active) return <>{children}</>
  if (!data) return <div aria-busy="true" className="pointer-events-none opacity-50">{children}</div>
  return <GuidesView data={data} params={params} />
}
