import { applyArticleOverride } from '@/lib/article-overrides'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { filterProducts, getCatalogProducts, parseFilters, type CatalogProduct } from '@/lib/catalog'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER } from '@/components/ui/design'
import { SELECTIONS, getSelection, pickSelectionProducts, type Selection } from '@/lib/selections'
import { formatPrice } from '@/lib/utils'
import { isFeaturable, orderSelectionsBySeason, selectionCounts } from '@/components/selection/selection-meta'
import { SelectionCard } from '@/components/selection/SelectionCard'
import { SelectionThumb } from '@/components/selection/SelectionThumb'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import { Placeholder } from '@/components/ui/design'
import { getArticleBySlug } from '@/lib/database/articles'
import { isArticleIndexable } from '@/lib/content-policy'
import type { Article } from '@/types'
import { supabaseServer } from '@/lib/supabase-server'
import { isGardenPublished } from '@/lib/garden-verification'
import { getUpcomingEventsCount } from '@/lib/events'
import { currentMonth, getSeasonalPick, getSeasonalShelf, type SeasonalShelf } from '@/components/home/seasonal'
import { getHomeSpecies } from '@/components/home/species'
import { HERO_PHOTOS } from '@/components/home/hero-photos'
import { byCuratedThenReviews, byReviews, hasCuratedImage } from '@/components/home/curated'

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

// いま見頃の盆栽：季節に合う樹種から、なるべく樹種が重ならないように4件（写真を選び直した商品を先に）
function pickSeasonal(trees: CatalogProduct[], shelf: SeasonalShelf, exclude?: string): CatalogProduct[] {
  const inSeason = (p: CatalogProduct) =>
    p.enjoy.some(e => shelf.enjoy.includes(e) && (e === 'evergreen' || p.seasons.includes(shelf.season)))
  const seen = new Set<string>()
  const candidates = trees
    .filter(p => p.imageUrl && p.id !== exclude && inSeason(p))
    .sort(byCuratedThenReviews)
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
  for (const p of trees.filter(t => t.imageUrl && t.reviewCount > 0).sort(byCuratedThenReviews)) {
    if (picked.length >= 4) break
    if (p.id !== exclude && !picked.includes(p)) picked.push(p)
  }
  return picked
}

// よく選ばれている盆栽：写真を選び直した盆栽から、樹種が重ならないようにレビューの多い順で8件（ほかの枠に出す商品は除く）
function pickPopular(trees: CatalogProduct[], exclude: Set<string>): CatalogProduct[] {
  const species = new Set<string>()
  const names = new Set<string>()
  return trees
    .filter(p => hasCuratedImage(p) && !exclude.has(p.id) && p.reviewCount > 0)
    .sort(byReviews)
    .filter(p => {
      const key = p.speciesLabel ?? p.id
      if (species.has(key) || names.has(p.originalName)) return false
      species.add(key)
      names.add(p.originalName)
      return true
    })
    .slice(0, 8)
}

// 公開中・noindex でない記事だけ（selection-meta の getGuideLinks と同じ条件）を3件。サムネイルも出すため記事そのものを返す
async function getCareArticles(speciesSlug: string): Promise<Article[]> {
  try {
    const species = SPECIES_GUIDES[speciesSlug]
    const slugs = Array.from(new Set([...CARE_BASICS, ...(species ? [species] : []), ...CARE_FALLBACK])).filter(isArticleIndexable)
    const articles = await Promise.all(slugs.map(slug => getArticleBySlug(slug).catch(() => null)))
    // 書き直した記事（src/content/articles）は、新しいタイトル・サムネイル・読む時間を出す
    return articles.filter((article): article is Article => article !== null).slice(0, 3).map(article => applyArticleOverride(article))
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
    safely('記事', () => getCareArticles(season.slug), [] as Article[]),
    safely('盆栽園の件数', getGardenCount, 0),
    safely('イベントの件数', getUpcomingEventsCount, 0),
  ])

  // 商品一覧（/products）の既定の表示と同じく「その他」を除いた件数
  const total = products.filter(p => p.productType !== 'other').length
  const trees = products.filter(p => p.productType === 'tree')

  const month = currentMonth()
  const heroImage = `/images/selections/${HERO_ILLUSTRATIONS[season.slug] ?? 'beginner-mini-bonsai'}.svg`
  // 実物の写真を登録した月は、その商品の写真をヒーローにする（見つからない・画像がないときはイラスト）
  const heroPhotoId = HERO_PHOTOS[month]
  const heroProduct = heroPhotoId ? products.find(p => p.id === heroPhotoId && p.imageUrl) : undefined

  // 樹種ごとの件数はカテゴリページ（/products/category/[slug]）と同じ条件で数える
  const baseFilters = parseFilters({})
  const species = getHomeSpecies(month).map(s => {
    const items = filterProducts(products, { ...baseFilters, species: s.slug, type: 'tree' })
    // 樹種の写真：文字やバナーのない写真の商品（なければ写真を選び直した商品）の中で、レビューの多いもの
    const withImage = items.filter(p => p.imageUrl)
    const pinned = s.photoId ? withImage.find(p => p.id === s.photoId) : undefined
    const photo = pinned ?? (withImage.some(hasCuratedImage) ? withImage.filter(hasCuratedImage) : withImage).sort(byCuratedThenReviews)[0]
    return { ...s, count: items.length, photo }
  })
    .filter(s => s.count > 0) // 商品のない樹種は出さない（リンク先が空になるため）
    // 今が見頃の樹種を先に
    .sort((a, b) => Number(b.inSeason) - Number(a.inSeason))

  const shelf = getSeasonalShelf()
  const seasonal = pickSeasonal(trees, shelf, heroProduct?.id)
  const popular = pickPopular(trees, new Set([...seasonal.map(p => p.id), ...(heroProduct ? [heroProduct.id] : [])]))
  // 掲載商品が少ない特集はトップに出さない
  const counts = selectionCounts(products)
  const featuredCount = SELECTIONS.filter(s => isFeaturable(s, counts)).length
  // 特集：掲載商品のある特集を、今月の特集から順に
  const features = orderSelectionsBySeason(SELECTIONS.filter(s => isFeaturable(s, counts)), month)
  const seasonLabel = `${month}月`
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
          {heroProduct ? (
            // 実物の写真（hero-photos.ts で月ごとに確かめて登録したもの）。LCP のため先に読み込み、楽天側で縮小した画像を使う
            <Link
              href={`/products/${heroProduct.id}`}
              prefetch={false}
              aria-label={`${season.monthLabel}の一鉢：${heroProduct.displayName || heroProduct.name}を見る`}
              className="relative block aspect-[4/3] overflow-hidden bg-paper-deep lg:aspect-[5/4]"
            >
              <ProductThumb
                src={heroProduct.imageUrl}
                alt={heroProduct.displayName || heroProduct.name}
                sizes="(max-width: 1023px) 100vw, 560px"
                size={800}
                priority
              />
            </Link>
          ) : (
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
          )}
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
        {/* 樹種から選ぶ（写真のタイル。SP は2列、PC は4列。今が見頃の樹種を先に） */}
        <section className="pt-12 lg:pt-24" aria-labelledby="home-species">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <h2 id="home-species" className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[26px]">樹種から選ぶ</h2>
            <span className="order-last w-full text-xs text-ink-muted lg:order-none lg:w-auto lg:text-[12.5px]">育てやすさや見頃は、ほとんど樹種で決まります</span>
            <Link href="/products?type=tree" className="-my-3 ml-auto inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
              <span className="border-b border-ink pb-0.5">すべての樹種</span>
            </Link>
          </div>
          <ul className="mt-[18px] grid grid-cols-2 gap-x-3 gap-y-6 lg:mt-7 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-9">
            {species.map(s => (
              <li key={s.slug}>
                <Link href={`/products/category/${s.slug}`} className="group block">
                  <span className="relative block aspect-square overflow-hidden bg-paper-deep">
                    {s.photo && (
                      <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
                        <ProductThumb src={s.photo.imageUrl} alt="" sizes="(max-width: 1023px) 46vw, 260px" size={480} />
                      </span>
                    )}
                    {s.inSeason && <span className="absolute left-2 top-2 bg-gold px-2 py-0.5 text-[10.5px] font-bold tracking-[0.1em] text-white lg:left-3 lg:top-3 lg:text-[11px]">今が見頃</span>}
                  </span>
                  <span className="mt-2.5 block font-mincho text-[17px] font-bold tracking-[0.06em] text-ink group-hover:text-gold-dark lg:mt-3 lg:text-xl">{s.name}</span>
                  <span className="mt-0.5 block text-[12px] leading-[1.6] text-ink-soft lg:text-[13px]">{s.appeal}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 特集（写真のカードで大きく。今月の特集を先頭に。SP は1枚目を大きく、残りは横にスクロール） */}
        {features.length > 0 && (
          <section className="pt-12 lg:pt-24" aria-labelledby="home-features">
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <h2 id="home-features" className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[26px]">特集から選ぶ</h2>
              <span className="order-last w-full text-xs text-ink-muted lg:order-none lg:w-auto lg:text-[12.5px]">目的や季節ごとに、選び方と商品をまとめました</span>
              <Link href="/selection" className="-my-3 ml-auto inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
                <span className="border-b border-ink pb-0.5">すべての特集（{featuredCount}件）</span>
              </Link>
            </div>
            <div className="mt-[18px] lg:mt-7 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-6">
              {/* 今月の特集 */}
              <Link href={`/selection/${features[0].slug}`} className="group block">
                <span className="relative block aspect-[40/21] overflow-hidden bg-ink">
                  <SelectionThumb selection={features[0]} sizes="(max-width: 1023px) 100vw, 640px" className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute left-3 top-3 bg-gold px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] text-white lg:left-4 lg:top-4">{seasonLabel}のおすすめ</span>
                </span>
                <span className="mt-3 block font-mincho text-[17px] font-bold tracking-[0.04em] text-ink group-hover:text-gold-dark lg:text-xl">{features[0].shortTitle}</span>
                <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-soft lg:text-[13.5px]">
                  {features[0].tagline}
                  {(counts.get(features[0].slug) ?? 0) > 0 && <span className="ml-2 text-ink-muted">{counts.get(features[0].slug)}件</span>}
                </span>
              </Link>
              {/* 次の特集（SP は横にスクロール、PC は2列×2段） */}
              <ul className="-mx-4 mt-6 flex snap-x gap-3.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:mt-0 lg:grid lg:grid-cols-2 lg:content-start lg:gap-x-5 lg:gap-y-5 lg:overflow-visible lg:px-0 lg:pb-0">
                {features.slice(1, 5).map(selection => (
                  <li key={selection.slug} className="w-[70%] flex-none snap-start sm:w-[44%] lg:w-auto">
                    <SelectionCard selection={selection} compact sizes="(max-width: 1023px) 70vw, 300px" />
                  </li>
                ))}
              </ul>
            </div>
            {/* 残りの特集は名前だけ並べる */}
            {features.length > 5 && (
              <ul className="mt-6 flex flex-wrap gap-2 lg:mt-8">
                {features.slice(5).map(selection => (
                  <li key={selection.slug}>
                    <Link href={`/selection/${selection.slug}`} className="inline-flex min-h-11 items-center border border-line bg-paper px-3.5 text-[13px] text-ink hover:border-ink">
                      {selection.shortTitle}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/shindan" className="inline-flex min-h-11 items-center border border-ink px-3.5 text-[13px] text-ink hover:bg-ink hover:text-paper">迷ったら かんたん盆栽診断</Link>
                </li>
              </ul>
            )}
          </section>
        )}

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

        {/* よく選ばれている盆栽（写真を選び直した盆栽。SP は横にスクロール、PC は8列） */}
        {popular.length >= 4 && (
          <section className="pt-12 lg:pt-24">
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <h2 className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[26px]">よく選ばれている盆栽</h2>
              <span className="order-last w-full text-xs text-ink-muted lg:order-none lg:w-auto lg:text-[12.5px]">樹種ごとにレビューの多い一鉢</span>
              <Link href="/products?type=tree" className="-my-3 ml-auto inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
                <span className="border-b border-ink pb-0.5">すべて見る</span>
              </Link>
            </div>
            <ul className="-mx-4 mt-[18px] flex snap-x gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:mt-7 lg:grid lg:grid-cols-8 lg:gap-5 lg:overflow-visible lg:px-0">
              {popular.map(product => {
                const title = product.displayName || product.name
                return (
                  <li key={product.id} className="w-[128px] flex-none snap-start lg:w-auto">
                    <Link href={`/products/${product.id}`} prefetch={false} className="group block text-ink hover:text-ink">
                      <span className="relative block aspect-square overflow-hidden bg-paper-deep">
                        <ProductThumb src={product.imageUrl} alt={title} sizes="(max-width: 1023px) 128px, 125px" size={256} />
                      </span>
                      {product.speciesLabel && <span className="mt-2 block text-[10.5px] text-gold-dark">{product.speciesLabel}</span>}
                      <span className={`${product.speciesLabel ? 'mt-0.5' : 'mt-2'} line-clamp-2 block text-[12.5px] leading-[1.5] group-hover:text-gold-dark`}>{title}</span>
                      <span className="mt-0.5 block text-[12.5px]">{formatPrice(product.price)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* 育て方を読む（PC は3列、SP は左に小さな画像の行。/guides の一覧と同じ見せ方） */}
        <section className="pt-12 lg:pt-24">
          <div className="flex items-baseline">
            <h2 className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[26px]">育て方を読む</h2>
            <Link href="/guides" className="-my-3 ml-auto inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
              <span className="border-b border-ink pb-0.5">すべて見る</span>
            </Link>
          </div>
          {careArticles.length > 0 ? (
            <ul className="mt-3 border-t border-line lg:mt-7 lg:grid lg:grid-cols-3 lg:gap-8 lg:border-0">
              {careArticles.map(article => (
                <li key={article.slug}>
                  <Link href={`/guides/${article.slug}`} className="group flex gap-3.5 border-b border-line py-4 lg:block lg:border-0 lg:py-0">
                    <span className="relative block aspect-[40/21] w-32 flex-none self-start overflow-hidden bg-paper-deep lg:w-full">
                      {article.featuredImage ? (
                        <Image
                          src={article.featuredImage.url}
                          alt={article.featuredImage.alt || article.title}
                          fill
                          sizes="(max-width: 1023px) 128px, 360px"
                          className="object-cover"
                        />
                      ) : (
                        <Placeholder className="h-full w-full" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      {article.category?.name && <span className="block text-[10.5px] text-gold-dark lg:mt-3.5 lg:text-[11px]">{article.category.name}</span>}
                      <h3 className="mt-0.5 line-clamp-3 font-mincho text-sm font-bold leading-[1.55] text-ink group-hover:text-gold-dark lg:mt-1 lg:text-[17px] lg:leading-[1.6]">{article.title}</h3>
                      {article.readingTime ? <span className="mt-1 block text-[10.5px] text-ink-muted lg:mt-2 lg:text-[11.5px]">{article.readingTime}分</span> : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 border-y border-line py-8 text-center text-sm text-ink-muted">記事を準備中です...</p>
          )}
        </section>

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
