import Link from 'next/link'
import type { CatalogProduct } from '@/lib/catalog-model'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'

export interface BudgetBand {
  label: string
  note: string
  products: CatalogProduct[]
}

const BANDS: { label: string; note: string; min: number; max: number }[] = [
  { label: '〜5,000円', note: 'ミニ・小品が中心。気軽な贈り物に', min: 0, max: 5000 },
  { label: '5,000〜10,000円', note: '小品盆栽。鉢にもこだわれる', min: 5000, max: 10000 },
  { label: '10,000円以上', note: '樹形の整った一鉢。改まったお祝いに', min: 10000, max: Infinity },
]

// 特集の商品（おすすめ順）を予算の帯ごとに分ける。すでに記事の途中で見せた商品は除き、1つの帯に最大 perBand 件
export function budgetBands(pool: CatalogProduct[], exclude: Set<string>, perBand = 3): BudgetBand[] {
  return BANDS.map(band => ({
    label: band.label,
    note: band.note,
    products: pool.filter(p => !exclude.has(p.id) && p.price >= band.min && p.price < band.max).slice(0, perBand),
  })).filter(band => band.products.length > 0)
}

// 贈り物の記事の最後に出す「予算から選ぶ」。帯が2つ以上そろわないときは出さない
export function ArticleBudgetPicks({ bands, more }: { bands: BudgetBand[]; more?: { href: string; label: string } }) {
  if (bands.length < 2) return null
  return (
    <section aria-labelledby="article-budget" className="mt-12 border-t border-ink pt-6 lg:mt-16">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="article-budget" className="font-mincho text-[19px] font-bold tracking-[0.05em] text-ink lg:text-[22px]">予算から選ぶ</h2>
        <p className="text-[11px] text-ink-muted"><span className="mr-1.5 text-ink-soft">PR</span>楽天市場・価格は取得時点の情報です</p>
      </div>
      <div data-list="article_budget" className="mt-2">
        {bands.map(band => (
          <div key={band.label} className="border-b border-line py-5">
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-mincho text-[16px] font-bold text-ink lg:text-[17px]">{band.label}</span>
              <span className="text-[12px] text-ink-muted lg:text-[12.5px]">{band.note}</span>
            </p>
            {/* SP は横にスクロール、PC は3列 */}
            <div className="-mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0">
              {band.products.map(product => (
                <div key={product.id} className="w-[42%] flex-none snap-start lg:w-auto">
                  <CatalogProductCard product={product} buyPlace="article_budget" sizes="(max-width: 1023px) 42vw, 220px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {more && (
        <Link href={more.href} className="mt-3 inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">
          {more.label} ›
        </Link>
      )}
    </section>
  )
}
