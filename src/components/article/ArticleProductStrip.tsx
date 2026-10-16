import Link from 'next/link'
import type { CatalogProduct } from '@/lib/catalog-model'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'

// 記事の前半（本文の途中）に出す、記事の樹種・特集の商品の帯。最後の「次にやること」まで読まない人にも、商品を見てもらうため
export function ArticleProductStrip({ products, heading, more }: { products: CatalogProduct[]; heading: string; more?: { href: string; label: string } }) {
  if (products.length < 3) return null
  return (
    <aside aria-label={heading} className="my-10 border-y border-line bg-white px-4 py-5 lg:my-12 lg:px-6 lg:py-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-mincho text-[16px] font-bold tracking-[0.04em] text-ink lg:text-[17px]">{heading}</p>
        <p className="text-[11px] text-ink-muted"><span className="mr-1.5 text-ink-soft">PR</span>楽天市場・価格は取得時点の情報です</p>
      </div>
      {/* SP は横にスクロール、PC は4列 */}
      <div data-list="article_inline" className="-mx-4 mt-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0">
        {products.slice(0, 4).map(product => (
          <div key={product.id} className="w-[42%] flex-none snap-start lg:w-auto">
            <CatalogProductCard product={product} sizes="(max-width: 1023px) 42vw, 160px" />
          </div>
        ))}
      </div>
      {more && (
        <Link href={more.href} className="mt-3 inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">
          {more.label} ›
        </Link>
      )}
    </aside>
  )
}
