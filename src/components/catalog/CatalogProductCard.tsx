import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { CatalogProduct } from '@/lib/catalog-model'
import type { Season } from '@/lib/species-traits'
import { currentSeasonJst, isInSeasonNow } from '@/lib/seasons'
import { shippingLabel } from '@/lib/shipping'
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
      {shippingLabel(product) && <span className="rounded bg-green-50 px-1.5 py-0.5 text-[11px] text-green-700">{shippingLabel(product)}</span>}
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

// 「今が見頃」の判定は seasons.ts に一本化（以前の import 先を壊さないよう再輸出する）
export { isInSeasonNow }
// 日本時間の今の季節（カテゴリページなどが使う）
export function currentSeason(now = new Date()): Season {
  return currentSeasonJst(now)
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
  const ship = shippingLabel(product)
  const inSeason = isInSeasonNow(product)
  const title = product.displayName || product.name
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
          <ProductThumb src={product.imageUrl} alt={title} sizes={sizes} priority={priority} />
        </div>
        <div className="flex flex-col gap-1">
          {/* スマホの小さな文字は明朝の太字だと重いため、ゴシックにする（PCは明朝） */}
          <p className="line-clamp-2 text-[14px] font-medium leading-[1.5] group-hover:text-gold-dark lg:font-mincho lg:text-base lg:font-bold lg:tracking-[0.03em]">{title}</p>
          <div className="flex items-baseline gap-1.5 lg:gap-2.5">
            <span className="text-[13.5px] lg:text-[15px]">{formatPrice(product.price)}</span>
            {ship && <span className="text-xs text-ink-muted">{ship}</span>}
          </div>
          {(product.reviewCount > 0 || product.heightCm) && (
            <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-ink-muted">
              {product.reviewCount > 0 && (
                <span>
                  ★{product.reviewAverage.toFixed(1)}（{product.reviewCount.toLocaleString()}件）
                </span>
              )}
              {product.heightCm ? <span>約{product.heightCm}cm</span> : null}
            </div>
          )}
          {inSeason && (
            <div className="flex items-center gap-1.5 text-xs text-gold-dark">
              <span className="h-[5px] w-[5px] rounded-full bg-gold" aria-hidden="true" />今が見頃
            </div>
          )}
        </div>
      </Link>
      {/* ハートはリンクの外に置く（リンクの中にボタンを入れない） */}
      <div className="absolute right-0 top-0 aspect-[4/5] w-full pointer-events-none">
        <FavoriteButton productId={product.id} productName={title} variant="icon" className="pointer-events-auto absolute bottom-0.5 right-0.5 lg:bottom-1 lg:right-1" />
      </div>
    </div>
  )
}
