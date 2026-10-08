// Amazon と楽天の商品を1つの一覧として扱う（絞り込み・並び替え・ページ分割）
// DB の拡張（019_unified_catalog.sql）前のデータでも動くよう、欠けている項目は既定値で補う
import { unstable_cache } from 'next/cache'
import { supabaseServer } from '@/lib/supabase-server'
import { PRODUCT_TYPE_LABELS, type ProductType } from '@/lib/product-classify'
import { normalizeProduct, type CatalogProduct, type ProductSource } from '@/lib/catalog-model'
import type { SizeCategory } from '@/types'

export const PRODUCTS_CACHE_TAG = 'products'
export const PAGE_SIZE = 24

export type { CatalogProduct, ProductSource } from '@/lib/catalog-model'
export { normalizeProduct } from '@/lib/catalog-model'

const LIST_COLUMNS = [
  'id', 'name', 'price', 'image_url', 'source', 'amazon_url', 'rakuten_url', 'shop_name', 'product_type',
  'category', 'size_category', 'height_cm', 'review_count', 'review_average', 'free_shipping', 'is_active',
  'created_at', 'last_synced_at', 'sync_category', 'tags', 'indoor_suitable', 'gift_suitable',
  'beginner_friendly', 'difficulty_level',
].join(', ')

/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchAllProductsOnce(): Promise<CatalogProduct[]> {
  const primary = await supabaseServer
    .from('products')
    .select(LIST_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(3000)
  let data: any[] | null = primary.data as any[] | null
  let error = primary.error

  // 拡張前のDB（列が足りない）では全列を取得して補う
  if (error) {
    const fallback = await supabaseServer.from('products').select('*').order('created_at', { ascending: false })
    data = (fallback.data || []).map((row: any) => ({ ...row, description: undefined }))
    error = fallback.error
  }
  if (error) {
    console.error('商品データの取得エラー:', error.message)
    return []
  }
  return (data || [])
    .filter((row: any) => row.is_active !== false)
    .map(normalizeProduct)
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// 通信が一時的に切れた場合に備えて2回までやり直す
async function fetchAllProducts(): Promise<CatalogProduct[]> {
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetchAllProductsOnce()
    } catch (error) {
      lastError = error
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
  throw lastError
}

// 一覧用の商品データは30分キャッシュ（同期の直後には破棄される）
export const getCatalogProducts = unstable_cache(fetchAllProducts, ['catalog-products-v1'], {
  revalidate: 1800,
  tags: [PRODUCTS_CACHE_TAG],
})

// ---- 絞り込みの選択肢 ----

export const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'tree', label: PRODUCT_TYPE_LABELS.tree },
  { value: 'kokedama', label: '苔玉・キット' },
  { value: 'parts', label: '鉢・土・道具（すべて）' },
  { value: 'pot', label: PRODUCT_TYPE_LABELS.pot },
  { value: 'soil', label: PRODUCT_TYPE_LABELS.soil },
  { value: 'tool', label: PRODUCT_TYPE_LABELS.tool },
  { value: 'wire', label: PRODUCT_TYPE_LABELS.wire },
  { value: 'fertilizer', label: PRODUCT_TYPE_LABELS.fertilizer },
  { value: 'seed', label: PRODUCT_TYPE_LABELS.seed },
]

const PART_TYPES: ProductType[] = ['pot', 'soil', 'tool', 'wire', 'fertilizer']

interface SpeciesOption {
  value: string
  label: string
  match: (p: CatalogProduct) => boolean
}

const nameMatches = (pattern: RegExp) => (p: CatalogProduct) => pattern.test(p.originalName)

export const SPECIES_OPTIONS: SpeciesOption[] = [
  { value: 'goyomatsu', label: '五葉松', match: nameMatches(/五葉松|ゴヨウマツ/) },
  { value: 'kuromatsu', label: '黒松', match: nameMatches(/黒松|クロマツ/) },
  { value: 'shimpaku', label: '真柏', match: nameMatches(/真柏|シンパク/) },
  { value: 'momiji', label: 'もみじ・楓', match: nameMatches(/もみじ|モミジ|紅葉|楓|カエデ/) },
  { value: 'sakura', label: '桜', match: nameMatches(/桜|さくら|サクラ/) },
  { value: 'ume', label: '梅・長寿梅', match: nameMatches(/梅|うめ|ウメ/) },
  { value: 'mini', label: 'ミニ盆栽', match: p => p.sizeCategory === 'mini' || /ミニ/.test(p.originalName) },
  { value: 'kokedama', label: '苔玉', match: nameMatches(/苔玉|こけだま|コケダマ/) },
  { value: 'cat-shohaku', label: '松柏類（すべて）', match: p => p.category === '松柏類' },
  { value: 'cat-zouki', label: '雑木類（すべて）', match: p => p.category === '雑木類' },
  { value: 'cat-hana', label: '花もの（すべて）', match: p => p.category === '花もの' },
  { value: 'cat-mi', label: '実もの（すべて）', match: p => p.category === '実もの' },
]

export const SIZE_OPTIONS: { value: SizeCategory; label: string }[] = [
  { value: 'mini', label: 'ミニ（〜15cm目安）' },
  { value: 'small', label: '小品（〜25cm目安）' },
  { value: 'medium', label: '中品（〜45cm目安）' },
  { value: 'large', label: '大品' },
]

export const PRICE_PRESETS = [
  { label: '〜3,000円', min: undefined, max: 3000 },
  { label: '3,000〜6,000円', min: 3000, max: 6000 },
  { label: '6,000〜10,000円', min: 6000, max: 10000 },
  { label: '10,000〜30,000円', min: 10000, max: 30000 },
  { label: '30,000円〜', min: 30000, max: undefined },
]

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'おすすめ順' },
  { value: 'price_asc', label: '価格が安い順' },
  { value: 'price_desc', label: '価格が高い順' },
  { value: 'reviews', label: 'レビューが多い順' },
  { value: 'new', label: '新着順' },
] as const

export const FLAG_OPTIONS = [
  { value: 'free_shipping', label: '送料無料' },
  { value: 'reviewed', label: 'レビューあり' },
  { value: 'rating4', label: '評価★4以上' },
  { value: 'beginner', label: '初心者向けの表記あり' },
  { value: 'gift', label: 'ギフト対応の表記あり' },
  { value: 'indoor', label: '室内向けの表記あり' },
] as const

export type SortValue = typeof SORT_OPTIONS[number]['value']
export type FlagValue = typeof FLAG_OPTIONS[number]['value']

export interface CatalogFilters {
  q?: string
  type?: string
  species?: string
  size?: SizeCategory
  shop?: ProductSource
  min?: number
  max?: number
  flags: FlagValue[]
  sort: SortValue
  page: number
}

type RawParams = Record<string, string | string[] | undefined>

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)
const toPositiveInt = (value: string | undefined) => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

// 以前のURL（?category=松柏類&minPrice=...）を新しい条件に読み替える
const LEGACY_CATEGORY_TO_SPECIES: Record<string, string> = {
  松柏類: 'cat-shohaku', 雑木類: 'cat-zouki', 花もの: 'cat-hana', 実もの: 'cat-mi', ミニ盆栽: 'mini',
}

export function parseFilters(rawParams: RawParams): CatalogFilters {
  const legacyCategory = first(rawParams.category)
  const params: RawParams = {
    ...rawParams,
    species: rawParams.species ?? (legacyCategory ? LEGACY_CATEGORY_TO_SPECIES[legacyCategory] : undefined),
    min: rawParams.min ?? rawParams.minPrice ?? rawParams.price_min,
    max: rawParams.max ?? rawParams.maxPrice ?? rawParams.price_max,
  }
  const flagValues = ([] as string[]).concat(params.flag ?? [])
  const sort = first(params.sort)
  const size = first(params.size)
  const shop = first(params.shop)
  return {
    q: first(params.q)?.trim().slice(0, 60) || undefined,
    type: TYPE_OPTIONS.some(o => o.value === first(params.type)) ? first(params.type) : undefined,
    species: SPECIES_OPTIONS.some(o => o.value === first(params.species)) ? first(params.species) : undefined,
    size: SIZE_OPTIONS.some(o => o.value === size) ? (size as SizeCategory) : undefined,
    shop: shop === 'amazon' || shop === 'rakuten' ? shop : undefined,
    min: toPositiveInt(first(params.min)),
    max: toPositiveInt(first(params.max)),
    flags: FLAG_OPTIONS.map(o => o.value).filter(v => flagValues.includes(v)),
    sort: SORT_OPTIONS.some(o => o.value === sort) ? (sort as SortValue) : 'recommended',
    page: Math.min(toPositiveInt(first(params.page)) ?? 1, 200),
  }
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.q || filters.type || filters.species || filters.size || filters.shop ||
    filters.min || filters.max || filters.flags.length || filters.sort !== 'recommended' || filters.page > 1
  )
}

// おすすめ順：レビュー件数と評価を重視し、手動で選んだ商品（Amazon）を少し優先する
function recommendScore(p: CatalogProduct): number {
  const reviews = Math.log10(p.reviewCount + 1) * (p.reviewAverage || 3.5)
  return reviews + (p.source === 'amazon' ? 2 : 0) + (p.productType === 'tree' ? 1 : 0)
}

export function filterProducts(products: CatalogProduct[], filters: CatalogFilters): CatalogProduct[] {
  const terms = (filters.q || '').toLowerCase().split(/[\s　]+/).filter(Boolean)
  const species = SPECIES_OPTIONS.find(o => o.value === filters.species)

  let result = products.filter(p => {
    if (!filters.type && (p.productType === 'other')) return false
    if (filters.type === 'parts' && !PART_TYPES.includes(p.productType)) return false
    if (filters.type === 'kokedama' && !['kokedama', 'kit'].includes(p.productType)) return false
    if (filters.type && !['parts', 'kokedama'].includes(filters.type) && p.productType !== filters.type) return false
    if (species && !species.match(p)) return false
    if (filters.size && p.sizeCategory !== filters.size) return false
    if (filters.shop && p.source !== filters.shop) return false
    if (filters.min && p.price < filters.min) return false
    if (filters.max && p.price > filters.max) return false
    if (terms.length && !terms.every(t => `${p.originalName} ${p.shopName} ${p.tags.join(' ')}`.toLowerCase().includes(t))) return false
    for (const flag of filters.flags) {
      if (flag === 'free_shipping' && p.freeShipping !== true) return false
      if (flag === 'reviewed' && p.reviewCount === 0) return false
      if (flag === 'rating4' && !(p.reviewCount > 0 && p.reviewAverage >= 4)) return false
      if (flag === 'beginner' && !p.beginner) return false
      if (flag === 'gift' && !p.gift) return false
      if (flag === 'indoor' && !p.indoor) return false
    }
    return true
  })

  const sorters: Record<SortValue, (a: CatalogProduct, b: CatalogProduct) => number> = {
    recommended: (a, b) => recommendScore(b) - recommendScore(a),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    reviews: (a, b) => b.reviewCount - a.reviewCount,
    new: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
  }
  result = [...result].sort(sorters[filters.sort])
  return result
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(page, totalPages)
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    page: current,
    totalPages,
    total: items.length,
  }
}

// 絞り込み条件からURLを組み立てる（変更したい項目だけ上書き）
export function buildCatalogUrl(filters: CatalogFilters, overrides: Partial<CatalogFilters> = {}, basePath = '/products'): string {
  const merged = { ...filters, page: 1, ...overrides }
  const params = new URLSearchParams()
  if (merged.q) params.set('q', merged.q)
  if (merged.type) params.set('type', merged.type)
  if (merged.species) params.set('species', merged.species)
  if (merged.size) params.set('size', merged.size)
  if (merged.shop) params.set('shop', merged.shop)
  if (merged.min) params.set('min', String(merged.min))
  if (merged.max) params.set('max', String(merged.max))
  merged.flags.forEach(flag => params.append('flag', flag))
  if (merged.sort !== 'recommended') params.set('sort', merged.sort)
  if (merged.page > 1) params.set('page', String(merged.page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}
