import Link from 'next/link'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { CareIcon } from '@/components/catalog/CareIcon'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { byCuratedThenReviews, hasCuratedImage } from '@/components/home/curated'
import type { CatalogProduct } from '@/lib/catalog-model'

// 盆栽園のページから通販への案内：はじめてでも育てやすい盆栽を、樹種が重ならないように4つ
export function pickBridgeProducts(products: CatalogProduct[], n = 4): CatalogProduct[] {
  const pool = products
    .filter(p => p.source === 'rakuten' && p.productType === 'tree' && p.imageUrl && hasCuratedImage(p))
    .filter(p => p.level === 'easy' && p.price >= 3000 && p.price <= 12000)
    .sort(byCuratedThenReviews)
  const picked: CatalogProduct[] = []
  for (const p of pool) {
    if (p.speciesKey && picked.some(x => x.speciesKey === p.speciesKey)) continue
    picked.push(p)
    if (picked.length === n) break
  }
  return picked
}

const LINKS = [
  { href: '/shindan', label: 'かんたん盆栽診断', icon: 'question' },
  { href: '/selection/beginner-mini-bonsai', label: 'はじめての一鉢', icon: 'check' },
  { href: '/okurimono', label: '贈り物ナビ', icon: 'gift' },
  { href: '/products?type=tree', label: '盆栽を探す', icon: 'bonsai' },
]

export function GardenShopBridge({ products, title = '近くに盆栽園がないときは、通販でも選べます', className = '' }: { products: CatalogProduct[]; title?: string; className?: string }) {
  if (products.length === 0) return null
  return (
    <section aria-labelledby="garden-shop-bridge" className={`border border-line bg-white px-4 py-5 lg:px-6 lg:py-6 ${className}`}>
      <p className="flex items-center gap-3 text-[11px] tracking-[0.2em] text-gold-dark">
        通販で探す<span className="h-px w-8 bg-gold" aria-hidden="true" />
      </p>
      <h2 id="garden-shop-bridge" className="mt-1.5 font-mincho text-[18px] font-bold leading-[1.5] tracking-[0.05em] text-ink lg:text-[20px]">{title}</h2>
      <p className="mt-1.5 text-[12.5px] leading-[1.8] text-ink-soft">楽天市場の掲載商品から、はじめてでも育てやすい盆栽を選びました。盆栽園の商品ではありません。</p>
      <PrDisclosure compact className="mt-2" />
      <div className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6 md:grid-cols-4 lg:gap-5" data-list="garden_bridge">
        {products.map(product => <CatalogProductCard key={product.id} product={product} buyPlace="garden_bridge" sizes="(max-width: 767px) 46vw, 200px" />)}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-2 xl:grid-cols-4">
        {LINKS.map(l => (
          <li key={l.href} className="min-w-0">
            <Link href={l.href} className="flex min-h-11 items-center gap-2 border border-line bg-paper px-3 text-[13px] text-ink hover:border-ink">
              <CareIcon name={l.icon} className="h-4 w-4 flex-none text-gold-dark" />
              <span className="min-w-0 truncate">{l.label}</span>
              <span className="ml-auto text-ink-muted" aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
