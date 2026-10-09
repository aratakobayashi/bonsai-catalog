'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { clearFavoriteNotice, useFavoriteNotice, useFavorites } from '@/lib/favorites'
import type { CatalogProduct } from '@/lib/catalog-model'

// 「気になる」の一覧・比較に使う商品の情報（/api/products/by-ids が返す形）
export type CompactProduct = Pick<
  CatalogProduct,
  | 'id' | 'name' | 'displayName' | 'speciesKey' | 'placeClaim' | 'levelClaim' | 'price' | 'imageUrl' | 'source' | 'buyUrl' | 'shopName' | 'productType' | 'category'
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
      .then((data: { products: CompactProduct[]; checked?: boolean }) => {
        const found = new Map(data.products.map(p => [p.id, p]))
        // 商品データを読み込めなかった応答では、見つからない id を掲載終了（null）にしない
        if (data.checked === false && data.products.length === 0) throw new Error('catalog unavailable')
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

// 一覧の下の「気になる」の帯（PC）。スマホの「♥ N 比べる」は FavoritesDock（全ページ共通）が出す
export function CompareBar() {
  const { ids } = useFavorites()
  const { products } = useFavoriteProducts(ids)
  const { message, share } = useShareToast()
  if (!ids.length) return null
  const names = products.map(p => p.displayName || p.name).join('、')

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

      {message && (
        <div role="status" className="fixed bottom-[calc(56px+64px+env(safe-area-inset-bottom))] left-5 right-5 z-50 bg-sumi px-4 py-3 text-center text-[12.5px] text-white lg:bottom-20 lg:left-12 lg:right-auto lg:text-[13px]">
          {message}
        </div>
      )}
    </>
  )
}

const PRODUCT_PAGE = /^\/products\/[0-9a-f-]{36}\/?$/i

// 全ページ共通（レイアウトに1つ置く）：スマホ右下の「♥ N 比べる」と、「気になる」に入れたときのお知らせ
// 「気になる」は自分で読み込むので、どのページにも置ける。/favorites と商品ページ（購入バーがある）では「比べる」を出さない
export function FavoritesDock() {
  const pathname = usePathname() || '/'
  const { ids } = useFavorites()
  const notice = useFavoriteNotice()
  const onProductPage = PRODUCT_PAGE.test(pathname)
  const showPill = ids.length > 0 && !onProductPage && !pathname.startsWith('/favorites')

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(clearFavoriteNotice, notice.kind === 'first-add' ? 4000 : 5000)
    return () => clearTimeout(timer)
  }, [notice])

  // スマホ：商品ページは購入バー（72px）の上、ほかは下のタブ（56px）と「比べる」の上に出す
  const toastBottom = onProductPage
    ? 'bottom-[calc(72px+12px+env(safe-area-inset-bottom))]'
    : showPill
      ? 'bottom-[calc(56px+64px+env(safe-area-inset-bottom))]'
      : 'bottom-[calc(56px+14px+env(safe-area-inset-bottom))]'

  return (
    <>
      {showPill && (
        <Link
          href="/favorites"
          className="fixed bottom-[calc(56px+14px+env(safe-area-inset-bottom))] right-3.5 z-30 flex h-11 items-center gap-2 rounded-full bg-sumi px-4 text-[13px] text-white shadow-[0_6px_16px_rgba(34,32,28,0.2)] hover:text-white lg:hidden"
          aria-label={`気になる ${ids.length}件を比べる`}
        >
          <span aria-hidden="true">♥</span> {ids.length}
          <span className="text-[#d9c7a3]">比べる</span>
        </Link>
      )}

      <div aria-live="polite" className={`fixed left-4 right-4 z-[60] ${toastBottom} lg:bottom-20 lg:left-12 lg:right-auto`}>
        {notice && (
          <div key={notice.at} role="status" className="flex items-center gap-3 bg-sumi px-4 py-2 text-[13px] text-white shadow-[0_6px_16px_rgba(34,32,28,0.2)] lg:max-w-[480px]">
            <span className="min-w-0 flex-1 py-1">
              {notice.kind === 'first-add' ? (
                <><span aria-hidden="true">♥ </span>{notice.message}</>
              ) : (
                notice.message
              )}
            </span>
            {!pathname.startsWith('/favorites') && (
              <Link href="/favorites" onClick={clearFavoriteNotice} className="flex min-h-11 shrink-0 items-center whitespace-nowrap text-[#e9c793] hover:text-white">
                {notice.kind === 'first-add' ? '・ 比べる →' : '気になるを見る →'}
              </Link>
            )}
            <button type="button" onClick={clearFavoriteNotice} aria-label="お知らせを閉じる" className="flex h-11 w-8 shrink-0 items-center justify-center text-white/70 hover:text-white">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
