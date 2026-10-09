'use client'

import Link from 'next/link'
import { AFFILIATE_LINK_REL } from '@/lib/affiliate'
import { FAVORITES_MAX, useFavorites } from '@/lib/favorites'
import { LEVEL_OPTIONS, PLACE_OPTIONS, SEASON_OPTIONS } from '@/lib/species-traits'
import { formatPrice } from '@/lib/utils'
import { PageHeading } from '@/components/ui/design'
import { isInSeasonNow, shippingNote } from '@/components/catalog/CatalogProductCard'
import { useFavoriteProducts, useShareToast, type CompactProduct } from '@/components/catalog/CompareBar'
import { FavoriteButton } from '@/components/catalog/FavoriteButton'
import { ProductThumb } from '@/components/catalog/ProductThumb'

const SHOP_LABELS = { amazon: 'Amazon', rakuten: '楽天市場' } as const
const SIZE_NAMES: Record<string, string> = { mini: 'ミニ', small: '小品', medium: '中品', large: '大品' }
const label = (options: { value: string; label: string }[], value: string | null) => options.find(o => o.value === value)?.label

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
    { label: '価格', cells: products.map(p => ({ value: formatPrice(p.price), best: many && p.price === minPrice, note: shippingNote(p) })) },
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
        value: p.seasons.length ? p.seasons.map(s => label(SEASON_OPTIONS, s)).join('・') : null,
        note: isInSeasonNow(p) ? '今が見頃' : null,
        noteGold: true,
      })),
    },
    { label: '置き場所', cells: products.map(p => ({ value: label(PLACE_OPTIONS, p.place) ?? null })) },
    { label: '育てやすさ', cells: products.map(p => ({ value: label(LEVEL_OPTIONS, p.level) ?? null })) },
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
  const notMine = sharedIds.filter(id => !favorites.has(id))

  const addShared = () => {
    // 共有された順に並ぶよう、後ろから先頭に追加する
    ;[...notMine].reverse().forEach(id => favorites.toggle(id))
  }
  const columns = `grid-cols-[84px_repeat(var(--n),136px)] lg:grid-cols-[120px_repeat(var(--n),minmax(180px,1fr))]`

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
            {notMine.length > 0 ? (
              <button type="button" onClick={addShared} disabled={favorites.ids.length >= FAVORITES_MAX} className="h-10 bg-sumi px-5 text-[13px] text-white hover:bg-sumi-light disabled:opacity-50 lg:ml-auto">
                自分の気になるに追加する
              </button>
            ) : (
              <span className="text-gold-dark lg:ml-auto">すべて自分の気になるに入っています</span>
            )}
            <Link href="/favorites" className="border-b border-ink pb-0.5 text-ink">自分の気になるを見る（{favorites.ids.length}）</Link>
          </>
        ) : (
          ids.length > 0 && (
            <>
              <button type="button" onClick={() => share(ids)} className="border-b border-ink pb-0.5 text-ink lg:ml-auto">家族に送る</button>
              <button type="button" onClick={() => window.confirm('気になるをすべて外しますか？') && favorites.clear()} className="text-ink-muted hover:text-ink">
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
              {products.map(p => (
                <div key={p.id} className="min-w-0">
                  <Link href={`/products/${p.id}`} className="block text-ink hover:text-ink">
                    <div className="relative aspect-[4/5] overflow-hidden bg-paper-deep lg:aspect-[4/3]">
                      <ProductThumb src={p.imageUrl} alt={p.name} sizes="(max-width: 1024px) 136px, 280px" size={400} />
                    </div>
                    <p className="mt-2 line-clamp-3 font-mincho text-[13.5px] font-bold leading-[1.5] tracking-[0.04em] hover:text-gold-dark lg:mt-3 lg:text-base">{p.name}</p>
                  </Link>
                  <FavoriteButton productId={p.id} productName={p.name} className="mt-1.5" />
                </div>
              ))}
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
                <div key={p.id} className="flex min-w-0 flex-col gap-3">
                  {p.buyUrl && (
                    <a
                      href={p.buyUrl}
                      target="_blank"
                      rel={AFFILIATE_LINK_REL}
                      className="flex h-11 items-center justify-center gap-1 bg-sumi text-xs tracking-[0.04em] text-white hover:bg-sumi-light hover:text-white lg:h-[46px] lg:text-[13px]"
                    >
                      {SHOP_LABELS[p.source]}で見る <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  <Link href={`/products/${p.id}`} className="self-start border-b border-ink pb-0.5 text-xs text-ink hover:text-ink lg:text-[13px]">詳しく見る</Link>
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
      {missing.length > 0 && (
        <p className="mt-3 text-[12px] text-ink-muted">
          掲載が終了した商品が{missing.length}件あります。
          {!shared && (
            <button type="button" onClick={() => missing.forEach(id => favorites.remove(id))} className="ml-2 border-b border-ink-muted pb-px">リストから外す</button>
          )}
        </p>
      )}

      {message && (
        <div role="status" className="fixed bottom-[calc(56px+16px+env(safe-area-inset-bottom))] left-5 right-5 z-50 bg-sumi px-4 py-3 text-center text-[12.5px] text-white lg:bottom-8 lg:left-12 lg:right-auto lg:text-[13px]">
          {message}
        </div>
      )}
    </>
  )
}
