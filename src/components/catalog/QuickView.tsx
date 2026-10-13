'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { CatalogProduct } from '@/lib/catalog-model'
import { ProductImage, ProductInfo } from './ProductDetailPanel'

// PCの一覧の「さっと見る」。カードの [data-quick-view] ボタンを押すと、商品ページに移らずに画面の上で中身を見せる
// カードはサーバーで描くため、ボタンの押下はこの枠でまとめて受け取る
export function QuickViewHost({ products, children }: { products: CatalogProduct[]; children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const product = openId ? products.find(p => p.id === openId) ?? null : null

  const close = useCallback(() => {
    setOpenId(null)
    returnFocus.current?.focus()
  }, [])

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const button = (e.target as HTMLElement).closest<HTMLElement>('[data-quick-view]')
    if (!button) return
    e.preventDefault()
    returnFocus.current = button
    setOpenId(button.dataset.quickView ?? null)
    ;(window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'quick_view_open', { product_id: button.dataset.quickView })
  }

  useEffect(() => {
    if (!product) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
    }
  }, [product, close])

  return (
    <div onClickCapture={onClick}>
      {children}
      {product && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label={`${product.displayName || product.name}をさっと見る`}>
          <div className="absolute inset-0 bg-sumi/60" onClick={close} aria-hidden="true" />
          <div className="relative grid max-h-[calc(100vh-48px)] w-full max-w-[960px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden bg-paper shadow-[0_30px_80px_rgba(34,32,28,0.35)]">
            <div className="flex flex-col justify-center gap-6 bg-white pb-8">
              <ProductImage product={product} sizes="480px" className="aspect-square" />
              <Link href={`/products/${product.id}`} className="mx-8 flex h-12 items-center justify-center border border-ink text-sm tracking-[0.06em] text-ink hover:bg-ink hover:text-white">
                商品ページで詳しく見る <span aria-hidden="true" className="ml-2">›</span>
              </Link>
            </div>
            <div className="overflow-y-auto px-8 pb-8 pt-10" data-place="quick_view" data-product={product.id}>
              <ProductInfo product={product} />
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="閉じる"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center bg-paper/90 text-xl text-ink hover:bg-paper-deep"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
