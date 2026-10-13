'use client'

import type { ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { paramsRecord, useCatalog } from '@/lib/client/use-catalog'
import type { CatalogProduct } from '@/lib/catalog-model'

// 広告・計測用のパラメータは、ページの中身を変えないので無視する
const IGNORED = /^(utm_|gclid$|fbclid$|yclid$|msclkid$|_ga$|ref$)/

// URL の条件（?a=1）。中身に関係のない計測用のものは除く
export function useUrlParams(): Record<string, string | string[]> {
  const search = useSearchParams()
  const all = paramsRecord(search)
  return Object.fromEntries(Object.entries(all).filter(([key]) => !IGNORED.test(key)))
}

// 条件付きのURLのときだけ、ブラウザで商品データを読み込んで描き直す。
// 条件がないときと読み込み中は、ビルド時に作った既定の表示（children）をそのまま見せる
export function CatalogParamGate({ children, render }: { children: ReactNode; render: (products: CatalogProduct[], params: Record<string, string | string[]>) => ReactNode }) {
  const params = useUrlParams()
  const active = Object.keys(params).length > 0
  const { products, error } = useCatalog(active)
  if (!active) return <>{children}</>
  if (error) return <>{children}</>
  if (!products) return <div aria-busy="true" className="pointer-events-none opacity-50 transition-opacity">{children}</div>
  return <>{render(products, params)}</>
}
