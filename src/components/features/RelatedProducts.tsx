import { ShoppingBag } from 'lucide-react'
import { normalizeProduct } from '@/lib/catalog-model'
import { isHiddenProductSource } from '@/lib/affiliate'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import type { Product } from '@/types'

interface RelatedProductsProps {
  products: Product[]
  articleTitle?: string
}

// 記事に関連する商品（Amazon の掲載を止めている間は楽天の商品だけ）
export function RelatedProducts({ products: all }: RelatedProductsProps) {
  const products = all.filter(product => !isHiddenProductSource(product.source))
  if (products.length === 0) return null

  return (
    <section>
      <div className="flex items-center mb-6">
        <ShoppingBag className="h-5 w-5 text-orange-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">この記事に関連する商品</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {products.map(product => (
          <CatalogProductCard key={product.id} product={normalizeProduct(product)} />
        ))}
      </div>
    </section>
  )
}
