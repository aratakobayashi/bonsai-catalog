import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { filterProducts, getCatalogProducts, parseFilters, type CatalogProduct } from '@/lib/catalog'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER } from '@/components/ui/design'
import { SELECTIONS, getSelection, pickSelectionProducts, type Selection } from '@/lib/selections'
import { formatPrice } from '@/lib/utils'
import { getGuideLinks, isFeaturable, selectionCounts, type GuideLink } from '@/components/selection/selection-meta'
import { supabaseServer } from '@/lib/supabase-server'
import { isGardenPublished } from '@/lib/garden-verification'
import { getUpcomingEventsCount } from '@/lib/events'
import { currentMonth, getSeasonalPick, getSeasonalShelf, type SeasonalShelf } from '@/components/home/seasonal'
import { getHomeSpecies } from '@/components/home/species'

// 1時間ごとに再生成（ISR）。ページを開いた直後のHTMLに商品・記事が入る
// 商品データの取得が一時的に失敗したときの表示が長く残らないよう、10分ごとに作り直す
export const revalidate = 600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

// 「目的から選ぶ」の行（表示名は短く、条件は各特集の掲載条件 filter をそのまま言葉にしたもの。価格は実際の掲載商品の最安値）
const PURPOSES: { slug: string; label: string; criteria: string }[] = [
  { slug: 'beginner-mini-bonsai', label: 'はじめての一鉢', criteria: '育てやすい樹種・ミニ／小品サイズ' },
  { slug: 'bonsai-gift', label: '贈り物に', criteria: 'ギフト対応・花もの・縁起物' },
  { slug: 'new-year-bonsai', label: '正月に飾る', criteria: '松・梅・南天・竹' },
  { slug: 'starter-tools', label: '鉢・土・道具', criteria: '盆栽鉢・用土・道具・針金・肥料' },
]

// ヒーローのイラスト（public/images/selections の自前の SVG。季節の一鉢の樹種に合わせる）
const HERO_ILLUSTRATIONS: Record<string, string> = {
  goyomatsu: 'evergreen-bonsai',
  ume: 'flowering-bonsai',
  sakura: 'flowering-bonsai',
  satsuki: 'flowering-bonsai',
  kokedama: 'indoor-bonsai',
  mimono: 'fruit-bonsai',
  momiji: 'autumn-leaves-bonsai',
  nanten: 'new-year-bonsai',
}

// 「育て方を読む」：初心者向けの基本（水やり・置き場所）と、季節の一鉢の樹種のガイド（docs/growth/content-audit.csv の記事 slug）
const CARE_BASICS = ['bonsai-watering-master-guide-2025', 'article-12']
const SPECIES_GUIDES: Record<string, string> = {
  goyomatsu: 'article-6',
  ume: 'article-3',
  sakura: 'sakura-general-guide',
  satsuki: 'azalea-guide',
  kokedama: 'article-51',
  mimono: 'article-2',
  momiji: 'article-1',
  nanten: 'nanten-guide',
}
const CARE_FALLBACK = ['article-11', 'beginner-tree-species-guide']

const byReviews = (a: CatalogProduct, b: CatalogProduct) => b.reviewCount - a.reviewCount || b.reviewAverage - a.reviewAverage

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

// 公開中・noindex でない記事だけ（getGuideLinks が確認する）を3件
async function getCareArticles(speciesSlug: string): Promise<GuideLink[]> {
  try {
    const species = SPECIES_GUIDES[speciesSlug]
    return await getGuideLinks([...CARE_BASICS, ...(species ? [species] : []), ...CARE_FALLBACK], 3)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
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

async function getGardenCount(): Promise<number> {
  const { data, error } = await supabaseServer.from('gardens').select('id')
  if (error) {
    console.error('盆栽園データの取得エラー:', error)
    return 0
  }
  return ((data || []) as { id: string }[]).filter(garden => isGardenPublished(garden)).length
}

export default async function HomePage() {
  const season = getSeasonalPick()
  const [products, careArticles, gardenCount, eventCount] = await Promise.all([
    safely('商品', getCatalogProducts, [] as CatalogProduct[]),
    safely('記事', () => getCareArticles(season.slug), [] as GuideLink[]),
    safely('盆栽園の件数', getGardenCount, 0),
    safely('イベントの件数', getUpcomingEventsCount, 0),
  ])

  // 商品一覧（/products）の既定の表示と同じく「その他」を除いた件数
  const total = products.filter(p => p.productType !== 'other').length
  const trees = products.filter(p => p.productType === 'tree')

  const month = currentMonth()
  const heroImage = `/images/selections/${HERO_ILLUSTRATIONS[season.slug] ?? 'beginner-mini-bonsai'}.svg`

  // 樹種ごとの件数はカテゴリページ（/products/category/[slug]）と同じ条件で数える
  const baseFilters = parseFilters({})
  const species = getHomeSpecies(month).map(s => ({
    ...s,
    count: filterProducts(products, { ...baseFilters, species: s.slug, type: 'tree' }).length,
  })).filter(s => s.count > 0) // 商品のない樹種は出さない（リンク先が空になるため）

  const shelf = getSeasonalShelf()
  const seasonal = pickSeasonal(trees, shelf)
  // 掲載商品が少ない特集はトップに出さない
  const counts = selectionCounts(products)
  const featuredCount = SELECTIONS.filter(s => isFeaturable(s, counts)).length
  const purposes = PURPOSES.flatMap(p => {
    const selection = getSelection(p.slug)
    if (!selection || !isFeaturable(selection, counts)) return []
    const prices = pickSelectionProducts(selection, products).map(item => item.price).filter(price => price > 0)
    const from = prices.length > 0 ? `・${formatPrice(Math.min(...prices))}〜` : ''
    return [{ ...p, selection: selection as Selection, criteria: `${p.criteria}${from}` }]
  })

  return (
    <div className="pb-12 lg:pb-20">
      {/* ヒーロー（SP は写真が先） */}
      <section className="lg:mx-auto lg:grid lg:max-w-[1184px] lg:grid-cols-[minmax(0,1fr)_560px] lg:items-center lg:gap-16 lg:px-12 lg:pt-16">
        <figure className="lg:order-last">
          <Link
            href={`/products/category/${season.slug}`}
            aria-label={`${season.monthLabel}の一鉢：${season.name}の盆栽を見る`}
            className="relative block aspect-[16/9] overflow-hidden bg-paper-deep lg:aspect-[16/11]"
          >
            {/* 自前の軽い SVG イラスト（文字や広告表記のある商品画像は使わない） */}
            <Image
              src={heroImage}
              alt=""
              width={800}
              height={500}
              priority
              unoptimized
              sizes="(max-width: 1023px) 100vw, 560px"
              className="h-full w-full object-cover"
            />
          </Link>
          <figcaption className="mt-2.5 hidden text-xs text-ink-muted lg:block">
            {season.monthLabel}の一鉢・{season.name}　{season.title}
          </figcaption>
        </figure>

        <div className="px-4 pt-6 lg:px-0 lg:pt-0">
          <p className="text-[11px] tracking-[0.18em] text-gold-dark lg:text-xs lg:tracking-[0.2em]">樹種と育てやすさから選ぶ</p>
          <h1 className="mt-2 font-mincho text-[27px] font-bold leading-[1.45] tracking-[0.08em] text-ink lg:mt-3.5 lg:text-[42px]">
            はじめての一鉢を、<br />ゆっくり選ぶ。
          </h1>
          <p className="mt-3 text-[13px] leading-[1.9] text-ink-soft lg:mt-[18px] lg:text-[15px] lg:leading-[2]">
            {total > 0 ? `${total.toLocaleString()}件の` : ''}盆栽・鉢・道具を、樹種・サイズ・価格で比べられます。
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
            <button type="submit" className="-mr-2 flex h-11 min-w-11 flex-none items-center justify-center px-2 text-[13px] text-ink-soft hover:text-ink">探す</button>
          </form>

          {/* SP：検索のすぐ下に目的からの入口（下の「目的から選ぶ」と同じ特集） */}
          {purposes.length > 0 && (
            <nav aria-label="目的から選ぶ" className="mt-6 lg:hidden">
              <p className="text-[11px] tracking-[0.12em] text-ink-muted">目的から選ぶ</p>
              <ul className="mt-1.5 grid grid-cols-2 border-t border-line">
                {purposes.map(({ slug, label }, i) => (
                  <li key={slug} className={`border-b border-line ${i % 2 === 0 ? 'border-r pr-3' : 'pl-3'}`}>
                    <Link href={`/selection/${slug}`} className="flex min-h-11 items-center py-2 font-mincho text-[14px] font-bold text-ink">
                      {label}
                      <span className="ml-auto font-sans font-normal text-ink-muted" aria-hidden="true">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
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
            <div className="mt-1 lg:hidden">
              <Link href="/products?type=tree" className="inline-flex min-h-11 items-center text-[13px] text-ink">
                <span className="border-b border-ink pb-0.5">すべての樹種</span>
              </Link>
            </div>
          </div>
        </section>

        {/* いま見頃の盆栽 */}
        <section className="pt-12 lg:pt-24">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <h2 className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[26px]">いま見頃の盆栽</h2>
            <span className="order-last w-full text-xs text-ink-muted lg:order-none lg:w-auto lg:text-[12.5px]">{shelf.subtitle}</span>
            <Link href={`/products?type=tree&season=${shelf.season}`} className="-my-3 ml-auto inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
              <span className="border-b border-ink pb-0.5">すべて見る</span>
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
              {purposes.map(({ slug, label, criteria }) => (
                <li key={slug} className="border-b border-line">
                  <Link href={`/selection/${slug}`} className="group flex items-center gap-3 py-3.5 lg:items-baseline lg:py-4">
                    <span className="flex min-w-0 flex-1 flex-col lg:flex-row lg:items-baseline">
                      <span className="font-mincho text-base font-bold text-ink group-hover:text-gold-dark lg:w-[170px] lg:flex-none lg:text-[17px]">{label}</span>
                      <span className="mt-0.5 flex-1 text-[11.5px] text-ink-soft lg:mt-0 lg:text-[12.5px]">{criteria}</span>
                    </span>
                    <span className="flex-none text-ink-muted" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-x-6 text-[13px]">
              <Link href="/selection" className="inline-flex min-h-11 items-center text-ink"><span className="border-b border-ink pb-0.5">特集をすべて見る（{featuredCount}件）</span></Link>
              <Link href="/shindan" className="inline-flex min-h-11 items-center text-ink"><span className="border-b border-ink pb-0.5">迷ったら かんたん盆栽診断</span></Link>
            </div>
          </section>

          {/* 育て方を読む */}
          <section>
            <div className="flex items-baseline">
              <h2 className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[22px]">育て方を読む</h2>
              <Link href="/guides" className="-my-3 ml-auto inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
                <span className="border-b border-ink pb-0.5">すべて見る</span>
              </Link>
            </div>
            {careArticles.length > 0 ? (
              <ul className="mt-3 border-t border-line lg:mt-4">
                {careArticles.map(article => (
                  <li key={article.slug} className="border-b border-line">
                    <Link href={`/guides/${article.slug}`} className="group block py-4">
                      {article.category && <span className="block text-[11px] text-gold-dark">{article.category}</span>}
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
