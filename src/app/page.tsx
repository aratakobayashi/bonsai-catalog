import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCatalogProducts, SPECIES_OPTIONS, type CatalogProduct } from '@/lib/catalog'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import { getArticles } from '@/lib/database/articles'
import { isOptimizableImage } from '@/lib/image-utils'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER, Card, Placeholder, SectionTitle, chipClass } from '@/components/ui/design'
import { SELECTIONS } from '@/lib/selections'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { isArticleIndexable } from '@/lib/content-policy'
import { supabaseServer } from '@/lib/supabase-server'
import { isGardenPublished } from '@/lib/garden-verification'
import { getUpcomingEventsCount } from '@/lib/events'
import { getSeasonalPick } from '@/components/home/seasonal'
import type { Article } from '@/types'

// 1時間ごとに再生成（ISR）。ページを開いた直後のHTMLに商品・記事が入る
export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

// ヒーローの樹種チップ
const HERO_CHIPS = ['goyomatsu', 'momiji', 'sakura', 'mini', 'kokedama', 'hachi']

// 「目的から選ぶ」の表示名（特集ページ＋鉢・土・道具）
const PURPOSE_LABELS: Record<string, { title: string; spTitle?: string; sub: string; spSub?: string }> = {
  'beginner-mini-bonsai': { title: 'はじめての一鉢', sub: '育てやすいミニ盆栽' },
  'bonsai-gift': { title: '贈り物に選ぶ', spTitle: '贈り物に', sub: '母の日・敬老の日・新築祝い', spSub: '母の日・敬老の日' },
  'new-year-bonsai': { title: '正月に飾る', sub: '松竹梅・南天' },
}
const PURPOSE_ORDER = ['beginner-mini-bonsai', 'bonsai-gift', 'new-year-bonsai']

// 「レビューが多い盆栽」の予算タブ（商品一覧の条件へリンク）
const BUDGET_TABS = [
  { label: '〜3,000円', max: 3000 },
  { label: '〜5,000円', max: 5000 },
  { label: '〜10,000円', max: 10000 },
]

const byReviews = (a: CatalogProduct, b: CatalogProduct) => b.reviewCount - a.reviewCount || b.reviewAverage - a.reviewAverage

// 条件に合う商品のうち、レビューが多く画像のあるもの
// used に入っている商品は避ける（カードごとに違う写真にするため）
function pickImage(products: CatalogProduct[], match: (p: CatalogProduct) => boolean, used?: Set<string>): CatalogProduct | undefined {
  const picked = products.filter(p => p.imageUrl && match(p) && !used?.has(p.id)).sort(byReviews)[0]
  if (picked) used?.add(picked.id)
  return picked
}

async function getPopularArticles(): Promise<Article[]> {
  try {
    // noindex 指定の記事はトップに出さない
    const { articles } = await getArticles({ limit: 24, sortBy: 'publishedAt', sortOrder: 'desc' })
    return (articles || []).filter(article => isArticleIndexable(article.slug)).slice(0, 6)
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

function PurposeImage({ product, label }: { product?: CatalogProduct; label: string }) {
  if (!product) return <Placeholder className="h-[120px]" />
  return (
    <div className="relative h-[120px] bg-[#f1eee8]">
      <ProductThumb src={product.imageUrl} alt={label} sizes="(max-width: 1024px) 50vw, 25vw" />
    </div>
  )
}

export default async function HomePage() {
  const [products, popularArticles, gardenCount, eventCount] = await Promise.all([
    getCatalogProducts(),
    getPopularArticles(),
    getGardenCount(),
    getUpcomingEventsCount(),
  ])

  // 商品一覧（/products）の既定の表示と同じく「その他」を除いた件数
  const total = products.filter(p => p.productType !== 'other').length
  const trees = products.filter(p => p.productType === 'tree')
  const topReviewed = trees.filter(p => p.imageUrl && p.reviewCount > 0).sort(byReviews).slice(0, 4)

  const season = getSeasonalPick()
  const seasonMatch = SPECIES_OPTIONS.find(o => o.value === season.slug)?.match
  const seasonProduct = seasonMatch ? pickImage(trees.concat(products.filter(p => p.productType === 'kokedama')), seasonMatch) : undefined

  const usedImages = new Set<string>()
  const purposes = [
    ...PURPOSE_ORDER.map(slug => SELECTIONS.find(s => s.slug === slug)).filter(Boolean).map(selection => {
      const s = selection!
      const match: (p: CatalogProduct) => boolean =
        s.slug === 'beginner-mini-bonsai' ? p => p.productType === 'tree' && (p.sizeCategory === 'mini' || p.sizeCategory === 'small') && p.level === 'easy'
          : s.slug === 'bonsai-gift' ? p => p.productType === 'tree' && (p.gift || p.wrapping)
            : p => p.productType === 'tree' && p.newYear
      return { href: `/selection/${s.slug}`, ...PURPOSE_LABELS[s.slug], product: pickImage(products, match, usedImages) }
    }),
    {
      href: '/products?type=parts',
      title: '鉢・土・道具',
      sub: 'あわせて揃える',
      product: pickImage(products, p => ['pot', 'soil', 'tool', 'wire', 'fertilizer'].includes(p.productType)),
    },
  ]

  const heroChips = HERO_CHIPS.map(slug => SHOP_CATEGORIES.find(c => c.slug === slug)).filter(Boolean)

  return (
    <div>
      {/* ヒーロー */}
      <section className="bg-navy text-white">
        <div className={`${CONTAINER} grid gap-10 pb-7 pt-6 lg:grid-cols-[1fr_400px] lg:items-center lg:py-14`}>
          <div>
            <h1 className="font-mincho text-[26px] font-bold leading-normal tracking-[0.02em] lg:text-[42px] lg:leading-[1.45]">
              はじめての盆栽を、<br />まとめて探す。
            </h1>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/80 lg:mt-3 lg:text-[15px] lg:leading-[1.8]">
              <span className="lg:hidden">楽天市場・Amazonの{total.toLocaleString()}件を比較</span>
              <span className="hidden lg:inline">楽天市場とAmazonの盆栽・鉢・道具 {total.toLocaleString()}件を、樹種・予算・サイズで比べられます。</span>
            </p>
            <form action="/products" method="get" role="search" className="mt-4 flex h-12 max-w-[560px] items-center gap-3 rounded-[10px] bg-white pl-3.5 pr-1.5 lg:mt-6 lg:h-14 lg:rounded-xl lg:pl-[18px] lg:pr-2">
              <label htmlFor="home-search" className="sr-only">盆栽を検索</label>
              <input
                id="home-search"
                type="search"
                name="q"
                placeholder="樹種・商品名で探す（例：五葉松 ミニ、信楽焼 鉢）"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-[#8a8478] focus:outline-none lg:text-[15px]"
              />
              <button type="submit" className="h-9 flex-none rounded-[7px] bg-gold px-3.5 text-[13px] font-bold text-white hover:bg-gold-dark lg:h-[42px] lg:rounded-[9px] lg:px-[22px] lg:text-sm">
                探す
              </button>
            </form>
            <div className="mt-3.5 hidden flex-wrap gap-2 lg:flex">
              {heroChips.map(category => (
                <Link
                  key={category!.slug}
                  href={`/products/category/${category!.slug}`}
                  className="rounded-full border border-white/30 px-3.5 py-1.5 text-[13px] hover:border-gold hover:text-gold-light"
                >
                  {category!.name}
                </Link>
              ))}
            </div>
          </div>

          {/* 季節の一鉢（PC：ヒーロー内） */}
          <SeasonCard season={season} product={seasonProduct} className="hidden lg:block" />
        </div>
      </section>

      <div className={CONTAINER}>
        {/* 季節の一鉢（SP：ヒーローの下） */}
        <SeasonCard season={season} product={seasonProduct} className="mt-4 lg:hidden" />

        {/* 目的から選ぶ */}
        <section className="mt-7 lg:mt-12">
          <SectionTitle className="[&_h2]:text-[19px] lg:[&_h2]:text-2xl">目的から選ぶ</SectionTitle>
          <div className="mt-3 grid grid-cols-2 gap-2.5 lg:mt-4 lg:grid-cols-4 lg:gap-4">
            {purposes.map(item => (
              <Link key={item.href} href={item.href} className="group overflow-hidden rounded-xl border border-line bg-white hover:border-gold lg:rounded-[14px]">
                <div className="hidden lg:block"><PurposeImage product={item.product} label={item.title} /></div>
                <div className="p-3.5 lg:px-4">
                  <div className="text-sm font-bold text-ink group-hover:text-navy lg:text-[15px]">
                    <span className="lg:hidden">{item.spTitle ?? item.title}</span>
                    <span className="hidden lg:inline">{item.title}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-ink-soft lg:text-[12.5px]">
                    <span className="lg:hidden">{item.spSub ?? item.sub}</span>
                    <span className="hidden lg:inline">{item.sub}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-right text-[13px] text-ink-soft">
            迷ったら <Link href="/shindan" className="font-bold text-navy underline underline-offset-2 hover:text-gold-dark">かんたん盆栽診断（4つの質問）→</Link>
          </p>
        </section>

        {/* レビューが多い盆栽 */}
        <section className="mt-7 lg:mt-10">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h2 className="font-mincho text-[19px] font-bold text-navy lg:text-2xl">レビューが多い盆栽</h2>
            <div className="order-last flex w-full flex-wrap gap-1.5 lg:order-none lg:w-auto">
              <span className={chipClass(true)} aria-current="true">すべて</span>
              {BUDGET_TABS.map(tab => (
                <Link key={tab.max} href={`/products?type=tree&max=${tab.max}&sort=reviews`} className={chipClass(false)}>
                  {tab.label}
                </Link>
              ))}
            </div>
            <Link href="/products?type=tree&sort=reviews" className="ml-auto text-[13px] font-bold text-navy underline underline-offset-2 hover:text-gold-dark lg:text-[13.5px]">
              すべて見る →
            </Link>
          </div>
          <PrDisclosure compact className="mt-2 lg:hidden" />
          <PrDisclosure className="mt-2 hidden lg:block" />
          {topReviewed.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2.5 lg:mt-4 lg:grid-cols-4 lg:gap-4">
              {topReviewed.map((product, index) => (
                <CatalogProductCard key={product.id} product={product} priority={index < 2} />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-line bg-white p-6 text-center text-sm text-ink-muted">盆栽商品を準備中です...</p>
          )}
        </section>

        <div className="mt-7 grid gap-7 lg:mt-10 lg:grid-cols-[1fr_340px] lg:gap-8">
          {/* 育て方を読む */}
          <section>
            <SectionTitle
              className="[&_h2]:text-[19px] lg:[&_h2]:text-2xl"
              action={<Link href="/guides" className="text-[13px] font-bold text-navy underline underline-offset-2 hover:text-gold-dark">すべて見る →</Link>}
            >
              育て方を読む
            </SectionTitle>
            {popularArticles.length > 0 ? (
              <Card className="mt-3 overflow-hidden">
                <ul className="divide-y divide-[#efeae0]">
                  {popularArticles.map(article => (
                    <li key={article.id}>
                      <Link href={`/guides/${article.slug}`} className="group flex items-center gap-4 px-3.5 py-3 lg:px-[18px] lg:py-4">
                        <div className="relative hidden h-16 w-24 flex-none overflow-hidden rounded-lg lg:block">
                          {isOptimizableImage(article.featuredImage?.url) ? (
                            <Image
                              src={article.featuredImage!.url}
                              alt={article.featuredImage!.alt || article.title}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <Placeholder className="h-full w-full" />
                          )}
                        </div>
                        <div className="min-w-0">
                          {article.category?.name && <div className="hidden text-[11.5px] text-gold-dark lg:block">{article.category.name}</div>}
                          <div className="font-mincho text-[14.5px] font-bold leading-normal text-ink group-hover:text-navy lg:text-base">{article.title}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <p className="mt-3 rounded-xl border border-line bg-white p-6 text-center text-sm text-ink-muted">記事を準備中です...</p>
            )}
          </section>

          {/* 出かける */}
          <section>
            <SectionTitle className="[&_h2]:text-[19px] lg:[&_h2]:text-2xl">出かける</SectionTitle>
            <div className="mt-3 rounded-[14px] bg-navy px-[22px] py-5 text-white">
              <div className="text-xs tracking-[0.1em] text-[#e9c793]">開催中・近日</div>
              <div className="mt-1.5 font-mincho text-lg font-bold">盆栽展・即売会を探す</div>
              <p className="mt-1.5 text-[13px] leading-[1.7] text-white/80">
                {gardenCount > 0 || eventCount > 0
                  ? `全国の${[gardenCount > 0 && `盆栽園${gardenCount.toLocaleString()}件`, eventCount > 0 && `開催予定のイベント${eventCount.toLocaleString()}件`].filter(Boolean).join('、')}を地域別に。`
                  : '全国の盆栽園とイベントを地域別に。'}
              </p>
              <div className="mt-3.5 flex gap-2">
                <Link href="/gardens" className="rounded-lg border border-white/35 px-3 py-[7px] text-[13px] hover:border-gold hover:text-gold-light">盆栽園</Link>
                <Link href="/events" className="rounded-lg border border-white/35 px-3 py-[7px] text-[13px] hover:border-gold hover:text-gold-light">イベント</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function SeasonCard({
  season,
  product,
  className = '',
}: {
  season: ReturnType<typeof getSeasonalPick>
  product?: CatalogProduct
  className?: string
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-white text-ink lg:border-0 ${className}`}>
      {product ? (
        <div className="relative h-[180px] bg-[#f1eee8] lg:h-[210px]">
          <ProductThumb src={product.imageUrl} alt={`${season.name}の盆栽`} sizes="(max-width: 1024px) 100vw, 400px" priority size={400} />
        </div>
      ) : (
        <Placeholder label={`季節の盆栽写真（${season.name}）`} className="h-[180px] lg:h-[210px]" />
      )}
      <div className="px-4 pb-4 pt-3.5 lg:px-[22px] lg:pb-5 lg:pt-[18px]">
        <div className="flex items-center gap-2 text-[11.5px] tracking-[0.14em] text-gold-dark lg:text-xs">
          <span className="h-0.5 w-4 bg-gold lg:w-[18px]" aria-hidden="true" />
          {season.monthLabel}の一鉢
        </div>
        <div className="mt-1 font-mincho text-xl font-bold lg:mt-1.5 lg:text-2xl">{season.title}</div>
        <p className="mt-1 hidden text-[13px] leading-[1.7] text-ink-soft lg:block">{season.lead}</p>
        <Link
          href={`/products/category/${season.slug}`}
          className="mt-1.5 inline-block text-[13px] font-bold text-navy underline underline-offset-2 hover:text-gold-dark lg:mt-2.5 lg:text-[13.5px]"
        >
          {season.name}の盆栽を見る →
        </Link>
      </div>
    </div>
  )
}
