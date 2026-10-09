// 商品詳細（一覧の右側のパネルと商品ページで共通）に出す情報の組み立て
// 実データ（商品データ・樹種の一般的な性質・育て方の目安）だけで組み立て、ないものは出さない
import { PRODUCT_TYPE_LABELS } from '@/lib/product-classify'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { getCareGuide } from '@/lib/care-guides'
import { ENJOY_OPTIONS, LEVEL_OPTIONS, PLACE_OPTIONS, SEASON_OPTIONS } from '@/lib/species-traits'
import { formatPrice } from '@/lib/utils'
import { isEvergreen, isInSeasonNow, peakLabel, peakMonths } from '@/lib/seasons'
import { shippingDetail, shippingLabel } from '@/lib/shipping'
import type { CatalogProduct } from '@/lib/catalog-model'

export const SHOP_LABELS = { amazon: 'Amazon', rakuten: '楽天市場' } as const

const SIZE_NAMES: Record<string, { name: string; note: string }> = {
  mini: { name: 'ミニ', note: '樹高15cm程度まで' },
  small: { name: '小品', note: '樹高25cm程度まで' },
  medium: { name: '中品', note: '樹高45cm程度まで' },
  large: { name: '大品', note: '樹高45cm以上' },
}

export const PART_TYPES = ['pot', 'soil', 'tool', 'wire', 'fertilizer']

export function isPartProduct(product: CatalogProduct): boolean {
  return PART_TYPES.includes(product.productType)
}

export function categoryLink(product: CatalogProduct) {
  const slug = product.syncCategory || SHOP_CATEGORIES.find(c => c.group === 'tree' && product.originalName.includes(c.name))?.slug
  const category = SHOP_CATEGORIES.find(c => c.slug === slug)
  return category ? { href: `/products/category/${category.slug}`, label: category.name, intro: category.intro, group: category.group } : null
}

// 見頃の月（見頃のバー用。seasons.ts の樹種ごとの見頃。常緑・樹種不明は空）
export function seasonMonths(product: CatalogProduct): number[] {
  return peakMonths(product)
}

// 日本時間の今月（1〜12）
export function currentMonthJst(date = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', month: 'numeric' }).format(date))
}

export function seasonText(product: CatalogProduct): string {
  return product.seasons.map(v => SEASON_OPTIONS.find(o => o.value === v)?.label).filter(Boolean).join('・')
}

export function enjoyText(product: CatalogProduct): string {
  return product.enjoy.map(e => ENJOY_OPTIONS.find(o => o.value === e)?.label).filter(Boolean).join('・')
}

export const placeLabel = (product: CatalogProduct) => PLACE_OPTIONS.find(o => o.value === product.place)?.label ?? null
export const levelLabel = (product: CatalogProduct) => LEVEL_OPTIONS.find(o => o.value === product.level)?.label ?? null

export interface ProductStat {
  label: string
  value: string
  note?: string
  accent?: boolean
  // 価格の横に出すレビュー（★平均（件数））
  rating?: string
}

// 見頃の表示（「花 2〜3月」「一年中（常緑）」）。樹種が分からないときは null
export function peakText(product: CatalogProduct): string | null {
  return peakLabel(product)
}

export function ratingText(product: CatalogProduct): string | null {
  return product.reviewCount > 0 ? `★${product.reviewAverage.toFixed(1)}（${product.reviewCount.toLocaleString()}件）` : null
}

// 3つの数字（届くサイズ・価格・見頃）。データがあるものだけ返す
export function productStats(product: CatalogProduct, now = new Date()): ProductStat[] {
  const stats: ProductStat[] = []
  if (!isPartProduct(product)) {
    const size = SIZE_NAMES[product.sizeCategory]
    if (product.heightCm) stats.push({ label: '届くサイズ', value: `約${product.heightCm}cm`, note: size?.name })
    else if (size) stats.push({ label: '届くサイズ', value: size.name, note: size.note })
  }
  if (product.price > 0) {
    stats.push({
      label: '価格',
      value: formatPrice(product.price),
      note: shippingLabel(product) ?? '送料はショップで確認',
      // スマホの3列の幅に収まる短い形（★4.7・1,165件）
      rating: product.reviewCount > 0 ? `★${product.reviewAverage.toFixed(1)}・${product.reviewCount.toLocaleString()}件` : undefined,
    })
  }
  if (!isPartProduct(product)) {
    if (isEvergreen(product)) {
      stats.push({ label: '見頃', value: '一年中', note: '常緑' })
    } else {
      const label = peakLabel(product)
      if (label) {
        const inSeason = isInSeasonNow(product, now)
        stats.push({ label: '見頃', value: label, note: inSeason ? '今が見頃' : undefined, accent: inSeason })
      }
    }
  }
  return stats
}

export interface ProductRow {
  label: string
  value: string
  note?: string
  // 販売店の表記が樹種の性質と食い違うときの小さな注記
  claim?: string
}

// 販売店の表記（「室内」「初心者」）が樹種の一般的な性質と食い違うときの注記
export function placeClaimNote(product: CatalogProduct): string | undefined {
  if (product.placeClaim !== 'indoor' || !product.place || product.place === 'indoor') return undefined
  return '販売店の表記：室内向け（樹種としては屋外向き）'
}

export function levelClaimNote(product: CatalogProduct): string | undefined {
  if (product.levelClaim !== 'easy' || !product.level || product.level === 'easy') return undefined
  return `販売店の表記：初心者向け（樹種としては${levelLabel(product) ?? '少し手間がかかる'}）`
}

function careText(product: CatalogProduct, label: string): string | undefined {
  return getCareGuide(product.productType, product.category)?.items.find(i => i.label === label)?.text
}

// 詳細の表（置き場所・育てやすさ・ギフト・販売・レビューなど）
export function productRows(product: CatalogProduct): ProductRow[] {
  const isPart = isPartProduct(product)
  const place = placeLabel(product)
  const level = levelLabel(product)
  const water = careText(product, '水やり')
  const extras = [
    product.gift && 'ギフト対応あり',
    product.wrapping && 'ラッピング・のし対応',
    product.saucer && '受け皿付き',
    product.careGuide && '育て方の説明付き',
  ].filter((v): v is string => Boolean(v))
  return [
    ...(isPart || !product.speciesLabel ? [{ label: '種類', value: PRODUCT_TYPE_LABELS[product.productType] }] : []),
    ...(place ? [{ label: '置き場所', value: place, note: careText(product, '置き場所'), claim: placeClaimNote(product) }] : []),
    ...(level ? [{ label: '育てやすさ', value: level, note: water ? `水やり：${water}` : undefined, claim: levelClaimNote(product) }] : []),
    ...(extras.length ? [{ label: 'ギフト・付属', value: extras.join('　'), note: '販売ページの商品名の表記より' }] : []),
    { label: '送料', value: shippingDetail(product) },
    { label: '販売', value: `${product.shopName}（${SHOP_LABELS[product.source]}）` },
    ...(product.reviewCount > 0
      ? [{ label: 'レビュー', value: `${product.reviewCount.toLocaleString()}件　★${product.reviewAverage.toFixed(1)}` }]
      : []),
  ]
}

function syncedDate(product: CatalogProduct): string | null {
  if (!product.lastSyncedAt) return null
  // 日本時間の日付で表示する
  const jst = (t: number) => new Date(t + 9 * 60 * 60 * 1000)
  const d = jst(new Date(product.lastSyncedAt).getTime())
  if (Number.isNaN(d.getTime())) return null
  const md = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
  return d.getUTCFullYear() === jst(Date.now()).getUTCFullYear() ? md : `${d.getUTCFullYear()}/${md}`
}

export function priceNote(product: CatalogProduct): string {
  const date = syncedDate(product)
  if (date) return `${date}時点の参考価格。最新の価格・在庫・送料は${SHOP_LABELS[product.source]}の商品ページでご確認ください。`
  if (product.source === 'amazon') return '参考価格です。価格は変動します。Amazonでご確認ください。'
  return '参考価格。最新の価格・在庫・送料は商品ページでご確認ください。'
}

// スマホ下部のバー用の短い注記（例：送料込・10/7時点）
export function shortPriceNote(product: CatalogProduct): string {
  const date = syncedDate(product)
  return [shippingLabel(product) ?? '', date ? `${date}時点` : product.source === 'amazon' ? '価格は変動します' : '参考価格']
    .filter(Boolean)
    .join('・')
}
