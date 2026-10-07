import Link from 'next/link'
import { AFFILIATE_LINK_REL } from '@/lib/affiliate'
import { formatPrice } from '@/lib/utils'
import { PRODUCT_TYPE_LABELS } from '@/lib/product-classify'
import type { CatalogProduct } from '@/lib/catalog-model'
import { ProductThumb } from './ProductThumb'

export const SOURCE_LABELS = { amazon: 'Amazon', rakuten: '楽天市場' } as const

export function SourceBadge({ source }: { source: CatalogProduct['source'] }) {
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
        source === 'rakuten' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
      }`}
    >
      {SOURCE_LABELS[source]}
    </span>
  )
}

export function CatalogProductCard({ product, priority = false }: { product: CatalogProduct; priority?: boolean }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`} className="block relative aspect-square bg-gray-100">
        <ProductThumb
          src={product.imageUrl}
          alt={product.name}
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          priority={priority}
        />
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-1 mb-2">
          <SourceBadge source={product.source} />
          <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
            {PRODUCT_TYPE_LABELS[product.productType]}
          </span>
          {product.freeShipping && (
            <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded">送料無料</span>
          )}
        </div>
        <Link href={`/products/${product.id}`} className="text-sm text-gray-900 line-clamp-3 mb-1 hover:underline">
          {product.name}
        </Link>
        <p className="text-xs text-gray-500 truncate mb-2">{product.shopName}</p>
        <div className="mt-auto">
          <p className="text-base font-semibold text-gray-900">{formatPrice(product.price)}</p>
          {product.reviewCount > 0 && (
            <p className="text-xs text-gray-600 mt-0.5">
              ★{product.reviewAverage.toFixed(1)}（{product.reviewCount.toLocaleString()}件）
            </p>
          )}
          {product.buyUrl && (
            <a
              href={product.buyUrl}
              target="_blank"
              rel={AFFILIATE_LINK_REL}
              className={`mt-2 block text-center text-sm font-semibold text-white rounded-lg py-2 ${
                product.source === 'rakuten' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {SOURCE_LABELS[product.source]}で見る
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
