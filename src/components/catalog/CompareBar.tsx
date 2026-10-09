'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFavorites } from '@/lib/favorites'
import type { CatalogProduct } from '@/lib/catalog-model'

// 「気になる」の一覧・比較に使う商品の情報（/api/products/by-ids が返す形）
export type CompactProduct = Pick<
  CatalogProduct,
  | 'id' | 'name' | 'price' | 'imageUrl' | 'source' | 'buyUrl' | 'shopName' | 'productType' | 'category'
  | 'sizeCategory' | 'heightCm' | 'reviewCount' | 'reviewAverage' | 'freeShipping' | 'lastSyncedAt'
  | 'speciesLabel' | 'place' | 'enjoy' | 'seasons' | 'level'
>

// 取得した商品はページを移動しても使い回す
const productCache = new Map<string, CompactProduct | null>()

// id の商品情報を取得する（掲載が終わった商品は missing に入る）
export function useFavoriteProducts(ids: string[]) {
  const key = ids.join(',')
  const [, setVersion] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const need = key ? key.split(',').filter(id => !productCache.has(id)) : []
    if (!need.length) return
    fetch(`/api/products/by-ids?ids=${need.join(',')}`)
      .then(res => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((data: { products: CompactProduct[] }) => {
        const found = new Map(data.products.map(p => [p.id, p]))
        need.forEach(id => productCache.set(id, found.get(id) ?? null))
      })
      // 通信できないときは保存せず、次に表示したときにもう一度取得する
      .catch(() => setFailed(true))
      .finally(() => setVersion(v => v + 1))
  }, [key])

  const products = ids.map(id => productCache.get(id)).filter((p): p is CompactProduct => Boolean(p))
  const missing = ids.filter(id => productCache.get(id) === null)
  return { products, missing, failed, loading: !failed && ids.some(id => !productCache.has(id)) }
}

// 「家族に送る」：気になるリストのURLを共有（共有機能がなければURLをコピー）。結果のメッセージを返す
export async function shareFavorites(ids: string[]): Promise<string | null> {
  const url = `${window.location.origin}/favorites?ids=${ids.join(',')}`
  if (navigator.share) {
    try {
      await navigator.share({ title: '気になる盆栽', text: '気になる盆栽のリストです', url })
      return null
    } catch (error) {
      // 共有をキャンセルしたときは何もしない
      if (error instanceof DOMException && error.name === 'AbortError') return null
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return '気になるリストのURLをコピーしました'
  } catch {
    window.prompt('このURLを送ってください', url)
    return null
  }
}

export function useShareToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const share = useCallback(async (ids: string[]) => {
    const result = await shareFavorites(ids)
    if (!result) return
    setMessage(result)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 2200)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  return { message, share }
}

// 一覧の下の「気になる」の帯（PC）と、右下の「♥ N 比べる」（スマホ）
export function CompareBar() {
  const { ids } = useFavorites()
  const { products } = useFavoriteProducts(ids)
  const { message, share } = useShareToast()
  if (!ids.length) return null
  const names = products.map(p => p.name).join('、')

  return (
    <>
      <div className="sticky bottom-0 z-[4] hidden h-[52px] shrink-0 items-center gap-[18px] border-t border-line bg-paper/[.97] pl-12 pr-10 text-[13px] lg:flex">
        <span className="shrink-0">気になる <span className="text-[15px]">{ids.length}</span></span>
        <span className="min-w-0 flex-1 truncate text-ink-muted">{names}</span>
        <button type="button" onClick={() => share(ids)} className="shrink-0 border-b border-line pb-px text-[13px] hover:border-ink">家族に送る</button>
        <Link
          href="/favorites"
          className={`flex h-[34px] shrink-0 items-center border border-sumi px-[18px] text-[13px] ${ids.length >= 2 ? 'bg-sumi text-white hover:bg-sumi-light hover:text-white' : 'text-ink hover:text-ink'}`}
        >
          {ids.length >= 2 ? '並べて比べる' : '気になるを見る'}
        </Link>
      </div>

      <Link
        href="/favorites"
        className="fixed bottom-[calc(56px+14px+env(safe-area-inset-bottom))] right-3.5 z-30 flex h-10 items-center gap-2 rounded-full bg-sumi px-4 text-[12.5px] text-white shadow-[0_6px_16px_rgba(34,32,28,0.2)] hover:text-white lg:hidden"
        aria-label={`気になる ${ids.length}件を比べる`}
      >
        <span aria-hidden="true">♥</span> {ids.length}
        <span className="text-[#d9c7a3]">比べる</span>
      </Link>

      {message && (
        <div role="status" className="fixed bottom-[calc(56px+64px+env(safe-area-inset-bottom))] left-5 right-5 z-50 bg-sumi px-4 py-3 text-center text-[12.5px] text-white lg:bottom-20 lg:left-12 lg:right-auto lg:text-[13px]">
          {message}
        </div>
      )}
    </>
  )
}
