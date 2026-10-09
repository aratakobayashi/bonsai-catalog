'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AFFILIATE_LINK_REL } from '@/lib/affiliate'
import { FAVORITES_MAX, useFavorites } from '@/lib/favorites'
import { LEVEL_OPTIONS, PLACE_OPTIONS } from '@/lib/species-traits'
import { isInSeasonNow, peakLabel } from '@/lib/seasons'
import { shippingDetail, shippingLabel } from '@/lib/shipping'
import { formatPrice } from '@/lib/utils'
import { PageHeading } from '@/components/ui/design'
import { useFavoriteProducts, useShareToast, type CompactProduct } from '@/components/catalog/CompareBar'
import { FavoriteButton } from '@/components/catalog/FavoriteButton'
import { ProductThumb } from '@/components/catalog/ProductThumb'

const SHOP_LABELS = { amazon: 'Amazon', rakuten: '楽天市場' } as const
const SIZE_NAMES: Record<string, string> = { mini: 'ミニ', small: '小品', medium: '中品', large: '大品' }
const label = (options: { value: string; label: string }[], value: string | null) => options.find(o => o.value === value)?.label

// ショップの商品ページへのボタン（広告リンク）
function ShopLink({ product, className = '' }: { product: CompactProduct; className?: string }) {
  if (!product.buyUrl) return null
  return (
    <a
      href={product.buyUrl}
      target="_blank"
      rel={AFFILIATE_LINK_REL}
      className={`flex h-11 items-center justify-center gap-1 whitespace-nowrap bg-sumi text-xs tracking-[0.04em] text-white hover:bg-sumi-light hover:text-white lg:text-[13px] ${className}`}
    >
      販売ページを見る <span aria-hidden="true">↗</span>
    </a>
  )
}

interface Cell {
  value: string | null
  best?: boolean
  note?: string | null
  noteGold?: boolean
}

function compareRows(products: CompactProduct[]): { label: string; cells: Cell[] }[] {
  const minPrice = Math.min(...products.map(p => p.price))
  const many = products.length >= 2
  return [
    { label: '価格', cells: products.map(p => ({ value: formatPrice(p.price), best: many && p.price === minPrice, note: shippingLabel(p) })) },
    { label: '送料', cells: products.map(p => ({ value: shippingDetail(p) })) },
    {
      label: '届くサイズ',
      cells: products.map(p => ({
        value: p.heightCm ? `約${p.heightCm}cm` : SIZE_NAMES[p.sizeCategory] ?? null,
        note: p.heightCm ? SIZE_NAMES[p.sizeCategory] : null,
      })),
    },
    {
      label: '見頃',
      cells: products.map(p => ({
        value: peakLabel(p),
        note: isInSeasonNow(p) ? '今が見頃' : null,
        noteGold: true,
      })),
    },
    {
      label: '置き場所',
      cells: products.map(p => ({
        value: label(PLACE_OPTIONS, p.place) ?? null,
        note: p.placeClaim === 'indoor' && p.place && p.place !== 'indoor' ? '販売店の表記：室内向け（樹種としては屋外向き）' : null,
      })),
    },
    {
      label: '育てやすさ',
      cells: products.map(p => ({
        value: label(LEVEL_OPTIONS, p.level) ?? null,
        note: p.levelClaim === 'easy' && p.level && p.level !== 'easy' ? `販売店の表記：初心者向け（樹種としては${label(LEVEL_OPTIONS, p.level)}）` : null,
      })),
    },
    { label: 'ショップ', cells: products.map(p => ({ value: p.shopName, note: SHOP_LABELS[p.source] })) },
    {
      label: 'レビュー',
      cells: products.map(p => ({ value: p.reviewCount > 0 ? `★${p.reviewAverage.toFixed(1)}（${p.reviewCount.toLocaleString()}件）` : 'まだありません' })),
    },
  ]
}

// 「気になる」の一覧と比較表。共有されたURL（?ids=）のときは、その商品を表示する
export function FavoritesView({ sharedIds }: { sharedIds: string[] }) {
  const favorites = useFavorites()
  const shared = sharedIds.length > 0
  const ids = shared ? sharedIds : favorites.ids
  const { products, missing, loading, failed } = useFavoriteProducts(ids)
  const { message, share } = useShareToast()
  // 共有されたリストのうち、掲載中で自分の気になるにまだ入っていないもの
  const notMine = products.map(p => p.id).filter(id => !favorites.has(id))
  const room = FAVORITES_MAX - favorites.ids.length
  // 掲載が終わった商品は、自分のリストから自動で外す（件数を見えている商品にそろえる）。外した件数はお知らせに出す
  const [pruned, setPruned] = useState(0)
  const { removeMany } = favorites
  const missingKey = shared ? '' : missing.join(',')
  useEffect(() => {
    if (!missingKey) return
    const gone = missingKey.split(',')
    removeMany(gone)
    setPruned(n => n + gone.length)
  }, [missingKey, removeMany])

  // 共有された順に、上限まで追加する（入りきらない分は追加せず、お知らせを出す。古いものを押し出さない）
  const addShared = () => favorites.addMany(notMine)
  const columns = `grid-cols-[84px_repeat(var(--n),136px)] lg:grid-cols-[120px_repeat(var(--n),minmax(180px,240px))]`

  return (
    <>
      <PageHeading
        title={shared ? '共有された気になる' : '気になる'}
        lead={shared ? '家族や友人から送られた「気になる」の盆栽です。並べて比べられます。' : '「気になる」に入れた盆栽を並べて比べられます。家族に送って相談することもできます。'}
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '気になる' }]}
      />

      <div className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-3 border-b border-line pb-4 text-[13px] lg:mt-8">
        <span className="text-ink-muted">
          <span className="text-[15px] text-ink">{products.length}</span> 件{products.length >= 2 && '・◎はいちばん安い価格'}
        </span>
        {shared ? (
          <>
            {products.length === 0 ? null : notMine.length > 0 ? (
              <span className="flex flex-col gap-1 lg:ml-auto lg:items-end">
                <button type="button" onClick={addShared} disabled={room <= 0} className="h-11 bg-sumi px-5 text-[13px] text-white hover:bg-sumi-light disabled:opacity-50">
                  自分の気になるに追加する{room > 0 && notMine.length > room ? `（${room}件まで）` : ''}
                </button>
                {room <= 0 && <span className="text-[11.5px] text-ink-muted">自分の気になるが上限の{FAVORITES_MAX}件です。外してから追加してください</span>}
                {room > 0 && notMine.length > room && <span className="text-[11.5px] text-ink-muted">上限の{FAVORITES_MAX}件までのため、{notMine.length - room}件は追加されません</span>}
              </span>
            ) : (
              <span className="text-gold-dark lg:ml-auto">すべて自分の気になるに入っています</span>
            )}
            <Link href="/favorites" className="inline-flex min-h-11 items-center text-ink"><span className="border-b border-ink pb-0.5">自分の気になるを見る（{favorites.ids.length}）</span></Link>
          </>
        ) : (
          products.length > 0 && (
            <>
              <button type="button" onClick={() => share(products.map(p => p.id))} className="inline-flex min-h-11 items-center text-ink lg:ml-auto">
                <span className="border-b border-ink pb-0.5">家族に送る</span>
              </button>
              <button type="button" onClick={() => window.confirm('気になるをすべて外しますか？') && favorites.clear()} className="inline-flex min-h-11 items-center text-ink-muted hover:text-ink">
                すべて外す
              </button>
            </>
          )
        )}
      </div>

      {loading && products.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">読み込み中…</p>
      ) : failed && products.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">商品の情報を読み込めませんでした。時間をおいて開き直してください。</p>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-mincho text-base font-bold text-ink-soft">
            {shared ? '共有された商品は、現在掲載されていません。' : 'まだ「気になる」に入れた盆栽はありません。'}
          </p>
          <p className="mt-2 text-[13px] text-ink-muted">商品の画像の右下の ♡ を押すと、ここに集まります。</p>
          <Link href="/products" className="mt-6 inline-flex h-12 items-center bg-sumi px-8 text-sm tracking-[0.06em] text-white hover:bg-sumi-light hover:text-white">盆栽を探す</Link>
        </div>
      ) : (
        <div className="-mx-4 mt-6 overflow-x-auto lg:mx-0 lg:mt-8" style={{ ['--n' as string]: products.length }}>
          <div className="min-w-max lg:min-w-0">
            {/* 商品（画像・名前） */}
            <div className={`grid ${columns} gap-x-3.5 pb-4 pr-4 lg:gap-x-8 lg:pr-0`}>
              <div className="sticky left-0 z-[1] bg-paper" />
              {products.map(p => {
                const name = p.displayName || p.name
                return (
                  <div key={p.id} className="flex min-w-0 flex-col">
                    <Link href={`/products/${p.id}`} className="block text-ink hover:text-ink">
                      <div className="relative aspect-[4/5] overflow-hidden bg-paper-deep lg:aspect-[4/3]">
                        <ProductThumb src={p.imageUrl} alt={name} sizes="(max-width: 1024px) 136px, 240px" size={400} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-[13.5px] font-medium leading-[1.5] hover:text-gold-dark lg:mt-3 lg:font-mincho lg:text-[15px] lg:font-bold lg:tracking-[0.03em]">{name}</p>
                    </Link>
                    <div className="mt-1 text-[13px] text-ink">
                      {formatPrice(p.price)}
                      {shippingLabel(p) && <span className="ml-1.5 text-xs text-ink-muted">{shippingLabel(p)}</span>}
                    </div>
                    {/* ショップへのボタンは商品のすぐ下に置く（比較表の下まで下げない） */}
                    <ShopLink product={p} className="mt-2" />
                    <FavoriteButton productId={p.id} productName={name} className="self-start" />
                  </div>
                )
              })}
            </div>

            {compareRows(products).map(row => (
              <div key={row.label} className={`grid ${columns} gap-x-3.5 border-t border-line pr-4 text-[12.5px] leading-[1.55] lg:gap-x-8 lg:pr-0 lg:text-[13.5px]`}>
                <div className="sticky left-0 z-[1] bg-paper py-2.5 pl-4 text-[11.5px] text-ink-muted lg:py-3 lg:pl-0 lg:text-[12.5px]">{row.label}</div>
                {row.cells.map((cell, i) => (
                  <div key={products[i].id} className="min-w-0 py-2.5 lg:py-3">
                    <span className={cell.value ? 'text-ink' : 'text-ink-muted'}>{cell.value ?? '—'}</span>
                    {cell.best && <span className="ml-1.5 text-[11px] text-gold-dark">◎</span>}
                    {cell.note && <span className={`block text-[11px] ${cell.noteGold ? 'text-gold-dark' : 'text-ink-muted'}`}>{cell.note}</span>}
                  </div>
                ))}
              </div>
            ))}

            {/* ショップ・詳細へのリンク */}
            <div className={`grid ${columns} gap-x-3.5 border-t border-line pb-2 pr-4 pt-4 lg:gap-x-8 lg:pr-0 lg:pt-[18px]`}>
              <div className="sticky left-0 z-[1] bg-paper" />
              {products.map(p => (
                <div key={p.id} className="flex min-w-0 flex-col gap-1">
                  <ShopLink product={p} />
                  <Link href={`/products/${p.id}`} className="inline-flex min-h-11 items-center self-start text-xs text-ink hover:text-ink lg:text-[13px]"><span className="border-b border-ink pb-0.5">詳しく見る</span></Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {products.length > 0 && (
        <p className="mt-5 text-[11px] leading-relaxed text-ink-muted">
          価格・送料は取得時点の参考価格です。最新の情報は各ショップの商品ページでご確認ください。見頃・置き場所・育てやすさは樹種の一般的な目安で、「—」はデータから読み取れなかった項目です。
          {products.some(p => p.source === 'rakuten') && (
            <>
              楽天市場の商品情報は{' '}
              <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
            </>
          )}
        </p>
      )}
      {shared && missing.length > 0 && <p className="mt-3 text-[12px] text-ink-muted">掲載が終了した商品が{missing.length}件あります。</p>}
      {!shared && pruned > 0 && (
        <p className="mt-3 text-[12px] text-ink-muted">掲載が終了した商品{pruned}件を、気になるから外しました。</p>
      )}

      {message && (
        <div role="status" className="fixed bottom-[calc(56px+16px+env(safe-area-inset-bottom))] left-5 right-5 z-50 bg-sumi px-4 py-3 text-center text-[12.5px] text-white lg:bottom-8 lg:left-12 lg:right-auto lg:text-[13px]">
          {message}
        </div>
      )}
    </>
  )
}
