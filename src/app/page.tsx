import { applyArticleOverride } from '@/lib/article-overrides'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { filterProducts, parseFilters, type CatalogProduct } from '@/lib/catalog'
import { getCatalogProducts } from '@/lib/catalog-data'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER } from '@/components/ui/design'
import GiftSeasonBanner from '@/components/gift/GiftSeasonBanner'
import { SELECTIONS, getSelection, pickSelectionProducts, type Selection } from '@/lib/selections'
import { formatPrice } from '@/lib/utils'
import { isFeaturable, orderSelectionsBySeason, selectionCounts } from '@/components/selection/selection-meta'
import { SelectionCard } from '@/components/selection/SelectionCard'
import { HomeTools } from '@/components/home/HomeTools'
import { potShowcase, readyPool } from '@/lib/kumiawase'
import { SelectionThumb } from '@/components/selection/SelectionThumb'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import { Placeholder } from '@/components/ui/design'
import { getArticleBySlug } from '@/lib/database/articles'
import { isArticleIndexable } from '@/lib/content-policy'
import type { Article, Event } from '@/types'
import { supabaseServer } from '@/lib/supabase-server'
import { getHomeEvents, getUpcomingEventsCount } from '@/lib/events'
import { getGardenList } from '@/lib/gardens-list'
import type { GardenListItem } from '@/app/gardens/GardensPageClient'
import { HomeOutings } from '@/components/home/HomeOutings'
import { currentMonth, getSeasonalPick, getSeasonalShelf, type SeasonalShelf } from '@/components/home/seasonal'
import { getHomeSpecies } from '@/components/home/species'
import { HERO_PHOTOS, HERO_SCENES } from '@/components/home/hero-photos'
import photoCredits from '@/data/photo-credits.json'
import { byCuratedThenReviews, byReviews, hasCuratedImage } from '@/components/home/curated'

// 1時間ごとに再生成（ISR）。ページを開いた直後のHTMLに商品・記事が入る
export const revalidate = 3600

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


export default async function HomePage() {
  const season = getSeasonalPick()
  const [products, careArticles, gardens, eventCount, homeEvents] = await Promise.all([
    safely('商品', getCatalogProducts, [] as CatalogProduct[]),
    safely('記事', () => getCareArticles(season.slug), [] as Article[]),
    safely('盆栽園', getGardenList, [] as GardenListItem[]),
    safely('イベントの件数', getUpcomingEventsCount, 0),
    safely('イベント', () => getHomeEvents(6), [] as Event[]),
  ])

  // 商品が取れなかったときはビルドを止める（空のページを公開しない。前の公開がそのまま残る）
  if (products.length === 0) throw new Error('商品データを取得できませんでした')

  // 商品一覧（/products）の既定の表示と同じく「その他」を除いた件数
  const total = products.filter(p => p.productType !== 'other').length
  const trees = products.filter(p => p.productType === 'tree')

  const month = currentMonth()
  // 実物の写真を登録した月は、その商品の写真をヒーローにする（見つからない・画像がないときはイラスト）
  const heroPhotoId = HERO_PHOTOS[month]
  const heroProduct = heroPhotoId ? products.find(p => p.id === heroPhotoId && p.imageUrl) : undefined
  const heroScene = HERO_SCENES[month]
  const heroCredit = (photoCredits as Record<string, { creator?: string; license?: string; source?: string }>)[heroScene.src]

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
      {/* ヒーロー：墨色の帯に月ごとの盆栽の写真を大きく敷き、その上に見出し・ボタン・検索（特集ページの冒頭と同じ色使い）。
          SP は写真の下部に見出しを重ね、ボタンと検索は写真の下に続ける。写真は LCP のため先に読み込む */}
      <section className="bg-sumi text-white" aria-label="盆栽コレクション">
        <div className="relative lg:mx-auto lg:max-w-[1088px] lg:pt-8">
          <div className="relative h-[330px] overflow-hidden sm:h-[420px] lg:h-[580px]">
            <Image src={heroScene.src} alt={heroScene.alt} fill priority sizes="(max-width: 1087px) 100vw, 1088px" className="object-cover lg:object-[70%_50%]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(34,32,28,1)_0%,rgba(34,32,28,.6)_30%,rgba(34,32,28,0)_65%)] lg:bg-[linear-gradient(90deg,rgba(34,32,28,.94)_0%,rgba(34,32,28,.72)_38%,rgba(34,32,28,.08)_78%)]" />
            {/* PC：今月の一鉢（買える商品を写真の右下に小さく重ねる） */}
            {heroProduct && (
              <Link href={`/products/${heroProduct.id}`} prefetch={false} className="group absolute bottom-6 right-6 hidden w-[340px] items-center gap-3 border border-white/15 bg-black/45 p-2.5 backdrop-blur-sm hover:border-gold lg:flex">
                <span className="relative h-16 w-16 flex-none overflow-hidden bg-paper-deep">
                  <ProductThumb src={heroProduct.imageUrl} alt="" sizes="64px" size={160} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] tracking-[0.12em] text-gold">{season.monthLabel}の一鉢</span>
                  <span className="mt-0.5 block truncate text-[14px] font-bold text-white">{heroProduct.displayName || heroProduct.name}</span>
                  <span className="block text-[12.5px] text-white/70">{formatPrice(heroProduct.price)}</span>
                </span>
                <span className="flex-none pr-1 text-gold" aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          <div className="relative -mt-[118px] px-4 pb-7 sm:-mt-[132px] lg:absolute lg:inset-y-0 lg:left-0 lg:mt-0 lg:flex lg:w-[600px] lg:flex-col lg:justify-center lg:px-14 lg:pb-0 lg:pt-8">
            <p className="flex items-center gap-3 text-[11px] tracking-[0.22em] text-gold lg:text-xs">
              楽天市場の盆栽を、まとめて比べる
              <span className="hidden h-px w-10 bg-gold sm:block" aria-hidden="true" />
            </p>
            <h1 className="mt-2.5 font-mincho text-[29px] font-bold leading-[1.45] tracking-[0.08em] text-white lg:mt-4 lg:text-[46px] lg:leading-[1.4]">
              はじめての一鉢を、<br />ゆっくり選ぶ。
            </h1>
            <p className="mt-3.5 text-[13px] leading-[1.9] text-white/75 lg:mt-5 lg:max-w-[440px] lg:text-[15px] lg:leading-[2] lg:text-white/85">
              楽天市場の{total > 0 ? <strong className="mx-0.5 font-bold text-gold">{total.toLocaleString()}件</strong> : ''}の盆栽・鉢・道具を、樹種・大きさ・育てやすさ・価格で比べられます。
            </p>
            {/* 次の一歩：迷っている人は診断、決まっている人は一覧へ */}
            <div className="mt-5 flex flex-wrap gap-2.5 lg:mt-7 lg:gap-3">
              <Link href="/shindan" className="inline-flex min-h-12 flex-1 items-center justify-center bg-gold px-5 text-[14px] font-bold tracking-[0.06em] text-sumi hover:bg-white hover:text-sumi sm:flex-none lg:min-h-[52px] lg:px-7">
                かんたん盆栽診断<span className="ml-1.5 hidden text-[11.5px] font-normal opacity-80 sm:inline">4つの質問</span>
              </Link>
              <Link href="/products?type=tree" className="inline-flex min-h-12 flex-1 items-center justify-center border border-white/60 px-5 text-[14px] tracking-[0.06em] text-white hover:border-white hover:bg-white hover:text-sumi sm:flex-none lg:min-h-[52px] lg:px-7">
                盆栽を探す
              </Link>
            </div>
            <form action="/products" method="get" role="search" className="mt-4 flex h-[46px] max-w-[440px] items-center gap-3 border-b border-white/40 focus-within:border-white lg:mt-7 lg:h-[50px]">
              <label htmlFor="home-search" className="sr-only">盆栽を検索</label>
              <input
                id="home-search"
                type="search"
                name="q"
                placeholder="樹種・商品名で探す（例：もみじ、五葉松）"
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/55 focus:outline-none"
              />
              <button type="submit" className="-mr-2 flex h-11 min-w-11 flex-none items-center justify-center px-2 text-[13px] text-white/80 hover:text-white">探す</button>
            </form>
          </div>

          {/* SP：今月の一鉢（写真の下） */}
          {heroProduct && (
            <Link href={`/products/${heroProduct.id}`} prefetch={false} className="group mx-4 flex items-center gap-3 border border-white/15 bg-black/30 p-2.5 hover:border-gold lg:hidden">
              <span className="relative h-16 w-16 flex-none overflow-hidden bg-paper-deep">
                <ProductThumb src={heroProduct.imageUrl} alt="" sizes="64px" size={160} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] tracking-[0.12em] text-gold">{season.monthLabel}の一鉢</span>
                <span className="mt-0.5 block truncate text-[14px] font-bold text-white">{heroProduct.displayName || heroProduct.name}</span>
                <span className="block text-[12.5px] text-white/70">{formatPrice(heroProduct.price)}</span>
              </span>
              <span className="flex-none pr-1 text-gold" aria-hidden="true">→</span>
            </Link>
          )}

          <p className="flex items-start gap-3 px-4 pb-5 pt-3 text-[10.5px] text-white/45 lg:px-0 lg:pb-8">
            <Link href={`/products/category/${season.slug}`} className="text-white/60 underline decoration-white/25 underline-offset-4 hover:text-white">{season.monthLabel}の盆栽・{season.name}を見る</Link>
            {heroCredit && (
              <span className="ml-auto text-right">
                写真：{heroCredit.source ? <a href={heroCredit.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{heroCredit.creator || '出典'}</a> : heroCredit.creator}
                {heroCredit.license && ` / ${heroCredit.license}`}
              </span>
            )}
          </p>
        </div>
      </section>

      {/* いまの時期の贈り物（お歳暮・クリスマス・母の日など。時期でないときは出さない） */}
      <GiftSeasonBanner placement="home" className={`${CONTAINER} pt-8 lg:pt-12`} />

      {/* 目的から選ぶ（墨色の帯どうしの間に、明るい紙色の帯を挟む） */}
      {purposes.length > 0 && (
        <nav aria-label="目的から選ぶ" className={`${CONTAINER} pt-8 lg:pt-12`}>
          <p className="text-[11.5px] tracking-[0.14em] text-gold-dark">目的から選ぶ</p>
          <ul className="mt-2 grid grid-cols-2 border-t border-line lg:grid-cols-4">
            {purposes.map(({ slug, label, criteria }, i) => (
              <li key={slug} className={`border-b border-line ${i % 2 === 0 ? 'border-r pr-3' : 'pl-3'} lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0`}>
                <Link href={`/selection/${slug}`} className="group flex min-h-[52px] items-center py-2.5 lg:min-h-[64px]">
                  <span className="min-w-0 flex-1">
                    <span className="block font-mincho text-[14.5px] font-bold text-ink group-hover:text-gold-dark lg:text-[16px]">{label}</span>
                    <span className="mt-0.5 hidden text-[11.5px] text-ink-muted lg:block">{criteria}</span>
                  </span>
                  <span className="font-sans text-ink-muted" aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* 迷ったら、ここから（診断・組み合わせ・今月の手入れを、写真と中身の見えるカードで。ファーストビューのすぐ下） */}
      <HomeTools month={month} readyCount={readyPool(products).length} showcase={potShowcase(products)} />

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
            <div data-list="home_seasonal" className="mt-[18px] grid grid-cols-2 gap-x-3.5 gap-y-7 lg:mt-7 lg:grid-cols-4 lg:gap-6">
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

        {/* 出かける（近く開かれる盆栽展と、地域から探す盆栽園。商品の欄のあと） */}
        <HomeOutings events={homeEvents} gardens={gardens} eventCount={eventCount} />

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

      </div>
    </div>
  )
}
