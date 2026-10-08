import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import type { CatalogProduct } from '@/lib/catalog-model'

// 記事サイドバーの「この記事に関連する商品」（小さな行の一覧）
export function ArticleSidebarProducts({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return null

  return (
    <section className="rounded-xl border border-line bg-white p-4">
      <h2 className="text-[13px] font-bold text-navy">この記事に関連する商品</h2>
      <p className="mt-0.5 text-[11px] text-ink-muted">PR・価格は取得時点の情報です</p>
      <ul className="mt-2 divide-y divide-line">
        {products.map(product => (
          <li key={product.id}>
            <Link href={`/products/${product.id}`} className="group flex gap-2.5 py-2.5">
              <div className="relative h-[42px] w-[42px] flex-none overflow-hidden rounded-md bg-[#f1eee8]">
                <ProductThumb src={product.imageUrl} alt={product.name} sizes="42px" />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[12px] leading-snug text-ink group-hover:text-navy">{product.name}</p>
                <p className="mt-0.5 text-[13px] font-bold text-ink">{formatPrice(product.price)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/products" className="mt-1 inline-block text-[12px] font-bold text-navy underline underline-offset-2 hover:text-gold-dark">
        商品をもっと見る →
      </Link>
    </section>
  )
}
