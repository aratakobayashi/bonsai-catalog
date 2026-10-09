import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { CatalogProduct } from '@/lib/catalog-model'
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

// 商品カード（グリッド表示）
export function CatalogProductCard({ product, priority = false, selected = false }: { product: CatalogProduct; priority?: boolean; selected?: boolean }) {
  return (
    <Link
      href={`/products/${product.id}`}
      prefetch={false}
      className={`group flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md ${selected ? 'border-gold ring-1 ring-gold' : 'border-line'}`}
    >
      <div className="relative aspect-square bg-[#f1eee8]">
        <ProductThumb src={product.imageUrl} alt={product.name} sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw" priority={priority} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <ProductBadges product={product} />
        <p className="line-clamp-2 text-[13.5px] leading-snug text-ink group-hover:text-navy">{product.name}</p>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-bold text-ink">{formatPrice(product.price)}</span>
          <ProductRating product={product} />
        </div>
      </div>
    </Link>
  )
}
