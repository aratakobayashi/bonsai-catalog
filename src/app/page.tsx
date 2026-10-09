import type { Metadata } from 'next'
import Link from 'next/link'
import { filterProducts, getCatalogProducts, parseFilters, SPECIES_OPTIONS, type CatalogProduct } from '@/lib/catalog'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import { getArticles } from '@/lib/database/articles'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER, Placeholder } from '@/components/ui/design'
import { SELECTIONS, getSelection, type Selection } from '@/lib/selections'
import { isArticleIndexable } from '@/lib/content-policy'
import { supabaseServer } from '@/lib/supabase-server'
import { isGardenPublished } from '@/lib/garden-verification'
import { getUpcomingEventsCount } from '@/lib/events'
import { currentMonth, getSeasonalPick, getSeasonalShelf, type SeasonalShelf } from '@/components/home/seasonal'
import { getHomeSpecies } from '@/components/home/species'
import type { Article } from '@/types'

// 1時間ごとに再生成（ISR）。ページを開いた直後のHTMLに商品・記事が入る
export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

// 「目的から選ぶ」の行（表示名は短く、一言は特集の tagline）
const PURPOSES: { slug: string; label: string }[] = [
  { slug: 'beginner-mini-bonsai', label: 'はじめての一鉢' },
  { slug: 'bonsai-gift', label: '贈り物に' },
  { slug: 'new-year-bonsai', label: '正月に飾る' },
  { slug: 'starter-tools', label: '鉢・土・道具' },
]

const byReviews = (a: CatalogProduct, b: CatalogProduct) => b.reviewCount - a.reviewCount || b.reviewAverage - a.reviewAverage

// 条件に合う商品のうち、レビューが多く画像のあるもの
function pickImage(products: CatalogProduct[], match: (p: CatalogProduct) => boolean): CatalogProduct | undefined {
  return products.filter(p => p.imageUrl && match(p)).sort(byReviews)[0]
}

// いま見頃の盆栽：季節に合う樹種から、なるべく樹種が重ならないように4件
function pickSeasonal(trees: CatalogProduct[], shelf: SeasonalShelf, exclude?: string): CatalogProduct[] {
  const inSeason = (p: CatalogProduct) =>
    p.enjoy.some(e => shelf.enjoy.includes(e) && (e === 'evergreen' || p.seasons.includes(shelf.season)))
  const seen = new Set<string>()
  const candidates = trees
    .filter(p => p.imageUrl && p.id !== exclude && inSeason(p))
    .sort(byReviews)
    .filter(p => {
      if (seen.has(p.originalName)) return false
      seen.add(p.originalName)
      return true
    })
  const species = new Set<string>()
  const picked = candidates.filter(p => {
    const key = p.speciesLabel ?? p.id
    if (species.has(key)) return false
    species.add(key)
    return true
  }).slice(0, 4)
  for (const p of candidates) {
    if (picked.length >= 4) break
    if (!picked.includes(p)) picked.push(p)
  }
  // 季節の商品が少ないときはレビューの多い盆栽で補う
  for (const p of trees.filter(t => t.imageUrl && t.reviewCount > 0).sort(byReviews)) {
    if (picked.length >= 4) break
    if (p.id !== exclude && !picked.includes(p)) picked.push(p)
  }
  return picked
}

async function getPopularArticles(): Promise<Article[]> {
  try {
    // noindex 指定の記事はトップに出さない
    const { articles } = await getArticles({ limit: 24, sortBy: 'publishedAt', sortOrder: 'desc' })
    return (articles || []).filter(article => isArticleIndexable(article.slug)).slice(0, 3)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

async function getGardenCount(): Promise<number> {
  const { data, error } = await supabaseServer.from('gardens').select('id')
  if (error) {
    console.error('盆栽園データの取得エラー:', error)
    return 0
  }
  return ((data || []) as { id: string }[]).filter(garden => isGardenPublished(garden)).length
}

// データの取得が一時的に失敗しても、エラー画面ではなく取れた分だけで表示する
// （エラー画面のまま ISR のキャッシュに残り、しばらく表示され続けるのを防ぐ）
async function safely<T>(label: string, task: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await task()
  } catch (error) {
    console.error(`トップの${label}の取得に失敗しました:`, error instanceof Error ? error.message : error)
    return fallback
  }
}

export default async function HomePage() {
  const [products, popularArticles, gardenCount, eventCount] = await Promise.all([
    safely('商品', getCatalogProducts, [] as Awaited<ReturnType<typeof getCatalogProducts>>),
    safely('記事', getPopularArticles, [] as Awaited<ReturnType<typeof getPopularArticles>>),
    safely('盆栽園の件数', getGardenCount, 0),
    safely('イベントの件数', getUpcomingEventsCount, 0),
  ])

  // 商品一覧（/products）の既定の表示と同じく「その他」を除いた件数
  const total = products.filter(p => p.productType !== 'other').length
  const trees = products.filter(p => p.productType === 'tree')

  const month = currentMonth()
  const season = getSeasonalPick()
  const seasonMatch = SPECIES_OPTIONS.find(o => o.value === season.slug)?.match
  const seasonProduct = seasonMatch ? pickImage(trees.concat(products.filter(p => p.productType === 'kokedama')), seasonMatch) : undefined

  // 樹種ごとの件数はカテゴリページ（/products/category/[slug]）と同じ条件で数える
  const baseFilters = parseFilters({})
  const species = getHomeSpecies(month).map(s => ({
    ...s,
    count: filterProducts(products, { ...baseFilters, species: s.slug, type: 'tree' }).length,
  }))

  const shelf = getSeasonalShelf()
  const seasonal = pickSeasonal(trees, shelf, seasonProduct?.id)
  const purposes = PURPOSES.map(p => ({ ...p, selection: getSelection(p.slug) })).filter((p): p is typeof p & { selection: Selection } => Boolean(p.selection))

  return (
    <div className="pb-12 lg:pb-20">
      {/* ヒーロー（SP は写真が先） */}
      <section className="lg:mx-auto lg:grid lg:max-w-[1184px] lg:grid-cols-[minmax(0,1fr)_560px] lg:items-center lg:gap-16 lg:px-12 lg:pt-16">
        <figure className="lg:order-last">
          <Link
            href={`/products/category/${season.slug}`}
            aria-label={`${season.monthLabel}の一鉢：${season.name}の盆栽を見る`}
            className="relative block h-[300px] overflow-hidden bg-paper-deep lg:h-[600px]"
          >
            {seasonProduct ? (
              <ProductThumb src={seasonProduct.imageUrl} alt={`${season.name}の盆栽`} sizes="(max-width: 1023px) 100vw, 560px" priority size={600} />
            ) : (
              <Placeholder label={`季節の一鉢（${season.name}）`} className="absolute inset-0" />
            )}
          </Link>
          <figcaption className="mt-2.5 hidden text-xs text-ink-muted lg:block">
            {season.monthLabel}の一鉢・{season.name}　{season.title}
          </figcaption>
        </figure>

        <div className="px-4 pt-6 lg:px-0 lg:pt-0">
          <p className="text-[11px] tracking-[0.18em] text-gold-dark lg:text-xs lg:tracking-[0.2em]">楽天市場・Amazon の盆栽をまとめて</p>
          <h1 className="mt-2 font-mincho text-[27px] font-bold leading-[1.45] tracking-[0.08em] text-ink lg:mt-3.5 lg:text-[42px]">
            はじめての一鉢を、<br />ゆっくり選ぶ。
          </h1>
          <p className="mt-3 text-[13px] leading-[1.9] text-ink-soft lg:mt-[18px] lg:text-[15px] lg:leading-[2]">
            {total.toLocaleString()}件の盆栽・鉢・道具を、樹種・サイズ・価格で比べられます。
          </p>
          <form action="/products" method="get" role="search" className="mt-5 flex h-[46px] max-w-[440px] items-center gap-3 border-b border-ink lg:mt-7 lg:h-[50px]">
            <label htmlFor="home-search" className="sr-only">盆栽を検索</label>
            <input
              id="home-search"
              type="search"
              name="q"
              placeholder="樹種・商品名で探す（例：もみじ、五葉松）"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button type="submit" className="flex-none text-[13px] text-ink-soft hover:text-ink">探す</button>
          </form>
        </div>
      </section>

      <div className={CONTAINER}>
        {/* 樹種から選ぶ */}
        <section className="pt-12 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16 lg:pt-24">
          <div>
            <h2 className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[26px]">樹種から選ぶ</h2>
            <p className="mt-3.5 hidden text-sm leading-[2] text-ink-soft lg:block">
              育てやすさ・置き場所・見頃は、ほとんど樹種で決まります。まず樹種を決めると、選ぶのがぐっと楽になります。
            </p>
            <p className="mb-2.5 mt-2 flex items-center gap-1.5 text-[11px] text-ink-muted lg:mb-0 lg:mt-4 lg:text-[11.5px]">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              今が見頃
            </p>
          </div>
          <div>
            <ul className="grid border-t border-line lg:grid-cols-2 lg:gap-x-12">
              {species.map((s, i) => (
                <li key={s.slug} className={`border-b border-line ${i >= 6 ? 'hidden lg:block' : ''}`}>
                  <Link href={`/products/category/${s.slug}`} className="group flex items-baseline gap-3 py-3.5 lg:py-[18px]">
                    <span className={`h-1.5 w-1.5 flex-none self-center rounded-full ${s.inSeason ? 'bg-gold' : ''}`} aria-hidden="true" />
                    <span className="w-24 flex-none font-mincho text-[17px] font-bold tracking-[0.04em] text-ink group-hover:text-gold-dark lg:w-[110px] lg:text-xl">
                      {s.name}
                      {s.inSeason && <span className="sr-only">（今が見頃）</span>}
                    </span>
                    <span className="min-w-0 flex-1 text-[11.5px] leading-[1.6] text-ink-soft lg:text-[12.5px]">
                      {s.peak}<br />{s.care}
                    </span>
                    {s.count > 0 && <span className="flex-none text-[11px] text-ink-muted">{s.count.toLocaleString()}件</span>}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3.5 lg:hidden">
              <Link href="/products?type=tree" className="border-b border-ink pb-0.5 text-[13px] text-ink">すべての樹種</Link>
            </div>
          </div>
        </section>

        {/* いま見頃の盆栽 */}
        <section className="pt-12 lg:pt-24">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <h2 className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[26px]">いま見頃の盆栽</h2>
            <span className="order-last w-full text-xs text-ink-muted lg:order-none lg:w-auto lg:text-[12.5px]">{shelf.subtitle}</span>
            <Link href={`/products?type=tree&season=${shelf.season}`} className="ml-auto border-b border-ink pb-0.5 text-[13px] text-ink">
              すべて見る
            </Link>
          </div>
          {seasonal.length > 0 ? (
            <div className="mt-[18px] grid grid-cols-2 gap-x-3.5 gap-y-7 lg:mt-7 lg:grid-cols-4 lg:gap-6">
              {seasonal.map(product => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-4 border-y border-line py-8 text-center text-sm text-ink-muted">盆栽商品を準備中です...</p>
          )}
          <PrDisclosure className="mt-3.5" />
        </section>

        <div className="grid gap-12 pt-12 lg:grid-cols-2 lg:gap-16 lg:pt-24">
          {/* 目的から選ぶ */}
          <section>
            <h2 className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[22px]">目的から選ぶ</h2>
            <ul className="mt-3 border-t border-line lg:mt-4">
              {purposes.map(({ slug, label, selection }) => (
                <li key={slug} className="border-b border-line">
                  <Link href={`/selection/${slug}`} className="group flex flex-col py-3.5 lg:flex-row lg:items-baseline lg:py-4">
                    <span className="font-mincho text-base font-bold text-ink group-hover:text-gold-dark lg:w-[170px] lg:flex-none lg:text-[17px]">{label}</span>
                    <span className="mt-0.5 flex-1 text-[11.5px] text-ink-soft lg:mt-0 lg:text-[12.5px]">{selection.tagline}</span>
                    <span className="hidden text-ink-muted lg:inline" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              <Link href="/selection" className="border-b border-ink pb-0.5 text-ink">特集をすべて見る（{SELECTIONS.length}件）</Link>
              <Link href="/shindan" className="border-b border-ink pb-0.5 text-ink">迷ったら かんたん盆栽診断</Link>
            </div>
          </section>

          {/* 育て方を読む */}
          <section>
            <div className="flex items-baseline">
              <h2 className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[22px]">育て方を読む</h2>
              <Link href="/guides" className="ml-auto border-b border-ink pb-0.5 text-[13px] text-ink">すべて見る</Link>
            </div>
            {popularArticles.length > 0 ? (
              <ul className="mt-3 border-t border-line lg:mt-4">
                {popularArticles.map(article => (
                  <li key={article.id} className="border-b border-line">
                    <Link href={`/guides/${article.slug}`} className="group block py-4">
                      {article.category?.name && <span className="block text-[11px] text-gold-dark">{article.category.name}</span>}
                      <span className="mt-[3px] block font-mincho text-[15px] font-bold leading-[1.6] text-ink group-hover:text-gold-dark lg:text-base">{article.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 border-y border-line py-8 text-center text-sm text-ink-muted">記事を準備中です...</p>
            )}
          </section>
        </div>

        {/* 出かける（盆栽園・イベント） */}
        <p className="mt-12 border-t border-line pt-5 text-[13px] leading-[1.9] text-ink-soft lg:mt-16">
          <span className="mr-3 font-mincho font-bold text-ink">出かける</span>
          <Link href="/gardens" className="mr-4 border-b border-ink pb-0.5 text-ink">
            全国の盆栽園{gardenCount > 0 && `（${gardenCount.toLocaleString()}件）`}
          </Link>
          <Link href="/events" className="border-b border-ink pb-0.5 text-ink">
            盆栽展・イベント{eventCount > 0 && `（開催予定${eventCount.toLocaleString()}件）`}
          </Link>
        </p>
      </div>
    </div>
  )
}
