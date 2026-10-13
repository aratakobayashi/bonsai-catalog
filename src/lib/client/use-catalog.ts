'use client'

import { useEffect, useState } from 'react'
import type { CatalogProduct } from '@/lib/catalog-model'

// ビルド時に作った商品データ（/data/catalog.json）を読む。同じページの中では1回だけ取得して使い回す
let cache: Promise<CatalogProduct[]> | null = null

export function loadCatalog(): Promise<CatalogProduct[]> {
  if (!cache) {
    cache = fetch('/data/catalog.json')
      .then(res => {
        if (!res.ok) throw new Error(`商品データを読み込めませんでした（${res.status}）`)
        return res.json() as Promise<CatalogProduct[]>
      })
    cache.catch(() => { cache = null })
  }
  return cache
}

// 読み込み中は null、失敗したときは error に理由が入る
export function useCatalog(enabled = true): { products: CatalogProduct[] | null; error: string | null } {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!enabled) return
    let alive = true
    loadCatalog()
      .then(list => { if (alive) setProducts(list) })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : String(e)) })
    return () => { alive = false }
  }, [enabled])
  return { products, error }
}

// URL の ?a=1&b=2 を、ページ側の parse 関数に渡す形（同じ名前が複数あれば配列）にする
export function paramsRecord(search: URLSearchParams): Record<string, string | string[]> {
  const record: Record<string, string | string[]> = {}
  search.forEach((value, key) => {
    const prev = record[key]
    record[key] = prev === undefined ? value : Array.isArray(prev) ? [...prev, value] : [prev, value]
  })
  return record
}
