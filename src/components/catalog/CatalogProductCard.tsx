import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { CatalogProduct } from '@/lib/catalog-model'
import type { Season } from '@/lib/species-traits'
import { FavoriteButton } from './FavoriteButton'
import { ProductThumb } from './ProductThumb'

export const SOURCE_LABELS = { amazon: 'Amazon', rakuten: '楽天市場' } as const

export function SourceBadge({ source }: { source: CatalogProduct['source'] }) {
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-bold ${source === 'rakuten' ? 'bg-red-50 text-rakuten' : 'bg-orange-50 text-amazon'}`}>
      {SOURCE_LABELS[source]}
    </span>
  )
}

// 商品の小さなラベル（ショップ・分類・送料無料）
export function ProductBadges({ product }: { product: CatalogProduct }) {
  const group = product.category && !['その他', '鉢・道具'].includes(product.category) ? product.category : null
  return (
    <div className="flex flex-wrap items-center gap-1">
      <SourceBadge source={product.source} />
      {group && <span className="rounded bg-[#f1eee8] px-1.5 py-0.5 text-[11px] text-ink-soft">{group}</span>}
      {product.freeShipping && <span className="rounded bg-green-50 px-1.5 py-0.5 text-[11px] text-green-700">送料無料</span>}
    </div>
  )
}

export function ProductRating({ product, className = '' }: { product: CatalogProduct; className?: string }) {
  if (product.reviewCount === 0) return null
  return (
    <span className={`text-xs text-ink-muted ${className}`}>
      ★{product.reviewAverage.toFixed(1)}（{product.reviewCount.toLocaleString()}件）
    </span>
  )
}

// 日本時間の今の季節（「今が見頃」の判定に使う）
export function currentSeason(now = new Date()): Season {
  const month = new Date(now.getTime() + 9 * 3600 * 1000).getUTCMonth() + 1
  return month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'autumn' : 'winter'
}

// 樹種の一般的な見ごろの季節が今の季節か
export function isInSeasonNow(product: Pick<CatalogProduct, 'seasons'>, now?: Date): boolean {
  return product.seasons.length > 0 && product.seasons.includes(currentSeason(now))
}

// 送料の表記（楽天の「送料込」は価格に送料が含まれる意味）。分からないときは出さない
export function shippingNote(product: Pick<CatalogProduct, 'freeShipping' | 'source'>): string | null {
  if (product.freeShipping === true) return product.source === 'rakuten' ? '送料込' : '送料無料'
  if (product.freeShipping === false) return '送料別'
  return null
}

interface CatalogProductCardProps {
  product: CatalogProduct
  priority?: boolean
  // PCの一覧で、右の詳細に表示中の商品
  selected?: boolean
  // リンク先（既定は商品ページ）
  href?: string
  // PCの一覧で押したときに、右の詳細を切り替えるURL（ListSelectArea が使う）
  selectHref?: string
  sizes?: string
}

// 商品カード（グリッド表示）。画像の右下に「気になる」のハート
export function CatalogProductCard({ product, priority = false, selected = false, href, selectHref, sizes = '(max-width: 1024px) 50vw, 25vw' }: CatalogProductCardProps) {
  const ship = shippingNote(product)
  const inSeason = isInSeasonNow(product)
  return (
    <div className="group relative flex flex-col gap-2.5 lg:gap-3">
      <Link
        href={href ?? `/products/${product.id}`}
        prefetch={false}
        data-select-href={selectHref}
        aria-current={selected ? 'true' : undefined}
        className="flex flex-col gap-2.5 text-ink hover:text-ink lg:gap-3"
      >
        <div className={`relative aspect-[4/5] overflow-hidden bg-paper-deep ${selected ? 'lg:outline lg:outline-1 lg:outline-offset-[6px] lg:outline-ink' : ''}`}>
          <ProductThumb src={product.imageUrl} alt={product.name} sizes={sizes} priority={priority} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="line-clamp-2 font-mincho text-[14px] font-bold leading-[1.5] tracking-[0.04em] group-hover:text-gold-dark lg:text-base">{product.name}</p>
          <div className="flex items-baseline gap-1.5 lg:gap-2.5">
            <span className="text-[13.5px] lg:text-[15px]">{formatPrice(product.price)}</span>
            {ship && <span className="hidden text-[11px] text-ink-muted sm:inline">{ship}</span>}
            {product.heightCm ? <span className="ml-auto text-[11px] text-ink-muted lg:text-xs">約{product.heightCm}cm</span> : null}
          </div>
          {inSeason && (
            <div className="flex items-center gap-1.5 text-[11px] text-gold-dark">
              <span className="h-[5px] w-[5px] rounded-full bg-gold" aria-hidden="true" />今が見頃
            </div>
          )}
        </div>
      </Link>
      {/* ハートはリンクの外に置く（リンクの中にボタンを入れない） */}
      <div className="absolute right-0 top-0 aspect-[4/5] w-full pointer-events-none">
        <FavoriteButton productId={product.id} productName={product.name} variant="icon" className="pointer-events-auto absolute bottom-0.5 right-0.5 h-11 w-11 lg:bottom-1 lg:right-1" />
      </div>
    </div>
  )
}
