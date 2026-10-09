import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import type { CatalogProduct } from '@/lib/catalog-model'

// 記事サイドバーの「関連する商品」（線で区切った小さな行の一覧）
export function ArticleSidebarProducts({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return null

  return (
    <section aria-labelledby="sidebar-products">
      <h2 id="sidebar-products" className="text-[11px] tracking-[0.1em] text-ink-muted">関連する商品</h2>
      <p className="mt-0.5 text-[10.5px] text-ink-muted">PR・価格は取得時点の情報です</p>
      <ul className="mt-2.5 border-t border-line">
        {products.map(product => (
          <li key={product.id} className="border-b border-paper-deep">
            <Link href={`/products/${product.id}`} className="group flex gap-3 py-3">
              <div className="relative h-[60px] w-12 flex-none overflow-hidden bg-paper-deep">
                <ProductThumb src={product.imageUrl} alt={product.name} sizes="48px" size={128} />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[13px] leading-[1.5] text-ink group-hover:text-gold-dark">{product.name}</p>
                <p className="mt-1 text-xs text-ink-soft">{formatPrice(product.price)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/products" className="mt-4 inline-block border-b border-ink pb-0.5 text-[12.5px] text-ink hover:text-gold-dark">
        商品をもっと見る
      </Link>
    </section>
  )
}
