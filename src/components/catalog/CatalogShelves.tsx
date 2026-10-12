import Link from 'next/link'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { byCuratedThenReviews, hasCuratedImage } from '@/components/home/curated'
import type { CatalogProduct } from '@/lib/catalog-model'
import { spreadSpecies } from '@/lib/catalog'
import { currentSeasonJst, jstMonth, peakMonths } from '@/lib/seasons'
import { isSeedlingOrMaterial } from '@/lib/selections'
import { getHomeSpecies } from '@/components/home/species'

// 商品一覧で何も絞り込んでいないときに、全件の一覧の上に並べる「棚」（目的ごとに8件、横にスクロール）
export interface Shelf {
  key: string
  title: string
  note: string
  href: string
  products: CatalogProduct[]
}

// 樹種の分かる、完成した盆栽・苔玉だけ（苗・素材や飾り物は棚に出さない）
const isTree = (p: CatalogProduct) => (p.productType === 'tree' || p.productType === 'kokedama') && Boolean(p.speciesKey) && !isSeedlingOrMaterial(p)

function pick(products: CatalogProduct[], test: (p: CatalogProduct) => boolean, used: Set<string>, n = 8): CatalogProduct[] {
  const list = products.filter(p => p.imageUrl && !used.has(p.id) && isTree(p) && test(p))
  // 写真のきれいな商品を先に、その中ではレビューの多い順。樹種が重ならないように散らす
  const curated = list.filter(hasCuratedImage).sort(byCuratedThenReviews)
  const rest = list.filter(p => !hasCuratedImage(p)).sort(byCuratedThenReviews)
  const picked = spreadSpecies([...curated, ...rest], 1, n).slice(0, n)
  // 同じ商品をほかの棚に重ねて出さない
  picked.forEach(p => used.add(p.id))
  return picked
}

export function buildShelves(products: CatalogProduct[]): Shelf[] {
  const month = jstMonth()
  const season = currentSeasonJst()
  const used = new Set<string>()
  const shelves: Shelf[] = [
    { key: 'in_season', title: `${month}月が見頃の盆栽`, note: '花・実・紅葉など、今月いちばんの見どころがある樹', href: `/products?type=tree&season=${season}`, products: pick(products, p => peakMonths(p).includes(month), used) },
    { key: 'gift', title: '贈り物に選ばれている盆栽', note: 'ラッピングやギフト対応のある商品', href: '/products?type=tree&use=gift', products: pick(products, p => p.gift || p.wrapping, used) },
    { key: 'under_4000', title: '4,000円までで始める', note: 'はじめての一鉢に、手頃な価格の盆栽', href: '/products?type=tree&max=4000', products: pick(products, p => p.price > 0 && p.price <= 4000 && p.level === 'easy', used) },
    { key: 'premium', title: '1万円からの本格盆栽', note: '樹齢を重ねた、樹形の整った一鉢', href: '/selection/premium-bonsai', products: pick(products, p => p.price >= 10000 && p.productType === 'tree', used) },
  ]
  return shelves.filter(s => s.products.length >= 4)
}

export function CatalogShelves({ shelves }: { shelves: Shelf[] }) {
  if (shelves.length === 0) return null
  return (
    <div className="mb-5 space-y-9 lg:mb-6 lg:space-y-12">
      {shelves.map(shelf => (
        <section key={shelf.key} aria-labelledby={`shelf-${shelf.key}`}>
          <div className="flex items-baseline gap-3">
            <div className="min-w-0">
              <h2 id={`shelf-${shelf.key}`} className="font-mincho text-[18px] font-bold tracking-[0.05em] text-ink lg:text-[21px]">{shelf.title}</h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">{shelf.note}</p>
            </div>
            <Link href={shelf.href} className="-my-2 ml-auto inline-flex min-h-11 shrink-0 items-center text-[13px] text-ink">
              <span className="border-b border-ink pb-0.5">すべて見る</span>
            </Link>
          </div>
          {/* 横にスクロール（PCは4列ずつ見える幅） */}
          <div data-list={`shelf:${shelf.key}`} className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:-mx-0 lg:gap-5 lg:px-0">
            {shelf.products.map(product => (
              <div key={product.id} className="w-[42%] flex-none snap-start sm:w-[28%] lg:w-[calc((100%-80px)/5)] xl:w-[calc((100%-100px)/6)]">
                <CatalogProductCard product={product} sizes="(max-width: 639px) 42vw, 200px" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// ---- 樹種のタイル（棚の下、全件の一覧の上。写真つきで横にスクロール） ----

export interface SpeciesTile {
  slug: string
  name: string
  count: number
  inSeason: boolean
  photo: CatalogProduct | undefined
}

export function buildSpeciesTiles(products: CatalogProduct[]): SpeciesTile[] {
  const month = jstMonth()
  return getHomeSpecies(month, products)
    .map(s => {
      const items = products.filter(p => p.speciesKey === s.slug && p.productType === 'tree' && p.imageUrl)
      const pinned = s.photoId ? items.find(p => p.id === s.photoId) : undefined
      const photo = pinned ?? (items.some(hasCuratedImage) ? items.filter(hasCuratedImage) : items).sort(byCuratedThenReviews)[0]
      return { slug: s.slug, name: s.name, count: items.length, inSeason: s.inSeason, photo }
    })
    .filter(s => s.count > 0)
    .sort((a, b) => Number(b.inSeason) - Number(a.inSeason))
}

export function SpeciesTiles({ tiles }: { tiles: SpeciesTile[] }) {
  if (tiles.length === 0) return null
  return (
    <section aria-labelledby="species-tiles" className="mb-9 lg:mb-12">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h2 id="species-tiles" className="font-mincho text-[18px] font-bold tracking-[0.05em] text-ink lg:text-[21px]">樹種から選ぶ</h2>
        <p className="text-[12px] text-ink-muted">育てやすさや見頃は、ほとんど樹種で決まります</p>
      </div>
      <ul className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-8 lg:gap-4 lg:overflow-visible lg:px-0">
        {tiles.map(t => (
          <li key={t.slug} className="w-[96px] flex-none snap-start lg:w-auto">
            <Link href={`/products/category/${t.slug}`} className="group block">
              <span className="relative block aspect-square overflow-hidden bg-paper-deep">
                {t.photo?.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo.imageUrl.replace(/_ex=\d+x\d+/, '_ex=240x240')} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                )}
                {t.inSeason && <span className="absolute left-1 top-1 bg-gold px-1.5 py-px text-[10px] font-bold text-sumi">見頃</span>}
              </span>
              <span className="mt-1.5 block truncate font-mincho text-[14px] font-bold text-ink group-hover:text-gold-dark">{t.name}</span>
              <span className="block text-[11px] text-ink-muted">{t.count}件</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
