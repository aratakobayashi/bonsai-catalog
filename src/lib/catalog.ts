// Amazon と楽天の商品を1つの一覧として扱う（絞り込み・並び替え・ページ分割）
// DB の拡張（019_unified_catalog.sql）前のデータでも動くよう、欠けている項目は既定値で補う
import { unstable_cache } from 'next/cache'
import { supabaseServer } from '@/lib/supabase-server'
import { PRODUCT_TYPE_LABELS, type ProductType } from '@/lib/product-classify'
import { normalizeProduct, type CatalogProduct, type ProductSource } from '@/lib/catalog-model'
import type { SizeCategory } from '@/types'
import {
  ENJOY_OPTIONS,
  LEVEL_OPTIONS,
  PLACE_OPTIONS,
  SEASON_OPTIONS,
  type Enjoy,
  type Level,
  type Place,
  type Season,
} from '@/lib/species-traits'
import { keywordTypeIntent, matchesKeyword, parseKeyword } from '@/lib/search-normalize'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { AMAZON_ENABLED, isHiddenProductSource } from '@/lib/affiliate'

export const PRODUCTS_CACHE_TAG = 'products'
// キーワードの最大文字数（一覧の検索と検索候補で共通）
export const KEYWORD_MAX_LENGTH = 60
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
// Supabase は1回に最大1,000行までしか返さず、Next.js のデータキャッシュは1件2MBまでなので、
// 商品は800行ずつに分けて取得・キャッシュする（1行は約1KB）
const CHUNK_SIZE = 800
const MAX_CHUNKS = 15

async function fetchChunkOnce(index: number): Promise<any[]> {
  const from = index * CHUNK_SIZE
  const primary = await supabaseServer
    .from('products')
    .select(LIST_COLUMNS)
    .or('is_active.is.null,is_active.eq.true')
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .range(from, from + CHUNK_SIZE - 1)
  let data: any[] | null = primary.data as any[] | null
  let error = primary.error

  // 拡張前のDB（列が足りない）では全列を取得して補う
  if (error) {
    // 2つ目以降の塊の失敗は「0件」として保存せず、やり直しに回す
    if (index > 0) throw new Error(`商品データの取得エラー: ${error.message}`)
    const fallback = await supabaseServer.from('products').select('*').order('created_at', { ascending: false }).limit(1000)
    data = (fallback.data || []).map((row: any) => ({ ...row, description: undefined }))
    error = fallback.error
  }
  if (error) {
    // 空の結果をキャッシュに残さないよう、失敗は例外にしてやり直す
    throw new Error(`商品データの取得エラー: ${error.message}`)
  }
  return data || []
}

// 通信が一時的に切れた場合に備えて2回までやり直す
async function fetchChunk(index: number): Promise<any[]> {
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetchChunkOnce(index)
    } catch (error) {
      lastError = error
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
  throw lastError
}

// DB の行データを3時間キャッシュし（同期の直後には破棄される）、表示用の形への変換は毎回行う。
// 変換処理（商品名の整理など）を変えたときに、古いキャッシュの表示が残らないようにするため
const getCachedChunk = unstable_cache(fetchChunk, ['catalog-product-rows-v2'], {
  revalidate: 10800,
  tags: [PRODUCTS_CACHE_TAG],
})

async function getCachedProductRows(): Promise<any[]> {
  const rows: any[] = []
  const seen = new Set<string>()
  for (let index = 0; index < MAX_CHUNKS; index++) {
    const chunk = await getCachedChunk(index)
    // キャッシュの更新時刻がずれて同じ商品が2つの塊に入った場合に備えて重複を除く
    chunk.forEach(row => {
      if (!seen.has(row.id)) {
        seen.add(row.id)
        rows.push(row)
      }
    })
    if (chunk.length < CHUNK_SIZE) break
  }
  // Amazon の掲載を止めている間は Amazon の商品を除く（src/lib/affiliate.ts の AMAZON_ENABLED）
  return rows.filter(row => row.is_active !== false && !isHiddenProductSource(row.source))
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  // 通信が一時的に失敗した場合に備えて、間をあけて3回まで取得する
  // （デプロイ直後はキャッシュが空で取得が集中し、失敗しやすい。失敗したまま「準備中」の表示がキャッシュに残るのを防ぐ）
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const rows = await getCachedProductRows()
      if (rows.length > 0) return rows.map(normalizeProduct)
      lastError = new Error('商品データが0件でした')
    } catch (error) {
      lastError = error
    }
    console.error(`商品データの取得に失敗しました（${attempt + 1}回目）:`, lastError instanceof Error ? lastError.message : lastError)
    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
  }
  throw lastError
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
// 樹種は商品名の最初に書かれている樹種（species-traits の判定）で分ける。
// 名前全体で探すと、キーワードを羅列した商品が多くの樹種に入ってしまうため
const speciesIs = (...keys: string[]) => (p: CatalogProduct) => p.speciesKey !== null && keys.includes(p.speciesKey)

export const SPECIES_OPTIONS: SpeciesOption[] = [
  { value: 'goyomatsu', label: '五葉松', match: speciesIs('goyomatsu') },
  { value: 'kuromatsu', label: '黒松', match: speciesIs('kuromatsu') },
  { value: 'shimpaku', label: '真柏', match: speciesIs('shimpaku') },
  { value: 'momiji', label: 'もみじ・楓', match: speciesIs('momiji') },
  { value: 'sakura', label: '桜', match: speciesIs('sakura') },
  { value: 'ume', label: '梅・長寿梅', match: speciesIs('ume', 'chojubai') },
  { value: 'mini', label: 'ミニ盆栽', match: p => p.sizeCategory === 'mini' || /ミニ/.test(p.originalName) },
  { value: 'kokedama', label: '苔玉', match: nameMatches(/苔玉|こけだま|コケダマ/) },
  { value: 'akamatsu', label: '赤松', match: speciesIs('akamatsu') },
  { value: 'satsuki', label: 'さつき', match: speciesIs('satsuki') },
  { value: 'keyaki', label: '欅（けやき）', match: speciesIs('keyaki') },
  { value: 'sansho', label: '山椒', match: speciesIs('sansho') },
  { value: 'nanten', label: '南天', match: speciesIs('nanten') },
  { value: 'himeringo', label: '姫りんご', match: speciesIs('himeringo') },
  { value: 'mimono', label: '実もの盆栽', match: p => p.category === '実もの' },
  { value: 'olive', label: 'オリーブ', match: speciesIs('olive') },
  { value: 'gajumaru', label: 'ガジュマル', match: speciesIs('gajumaru') },
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
  { value: 'free_shipping', label: '送料込' },
  { value: 'reviewed', label: 'レビューあり' },
  { value: 'rating4', label: '評価★4以上' },
  { value: 'wrapping', label: 'ラッピング・のし対応' },
  { value: 'saucer', label: '受け皿付き' },
  { value: 'care_guide', label: '育て方の説明付き' },
] as const

export { PLACE_OPTIONS, ENJOY_OPTIONS, SEASON_OPTIONS, LEVEL_OPTIONS }

export const USE_OPTIONS = [
  { value: 'gift', label: '贈り物' },
  { value: 'new_year', label: '正月飾り' },
  { value: 'celebration', label: 'お祝い（長寿・開店など）' },
] as const
export type UseValue = typeof USE_OPTIONS[number]['value']

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
  place?: Place
  enjoy?: Enjoy
  season?: Season
  level?: Level
  use?: UseValue
  flags: FlagValue[]
  sort: SortValue
  page: number
}

// 絞り込み条件のうち、並び順とページ以外の項目（0件のときに外す候補になる）
export const FILTER_KEYS = ['q', 'type', 'species', 'size', 'shop', 'price', 'place', 'enjoy', 'season', 'level', 'use', 'flags'] as const
export type FilterKey = typeof FILTER_KEYS[number]

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
  // 以前の「表記あり」チェック（flag=indoor など）を新しい条件に読み替える
  const legacy = {
    place: flagValues.includes('indoor') ? 'indoor' : undefined,
    level: flagValues.includes('beginner') ? 'easy' : undefined,
    use: flagValues.includes('gift') ? 'gift' : undefined,
  }
  const pick = <T extends string>(options: readonly { value: T }[], value: string | undefined): T | undefined =>
    options.find(o => o.value === value)?.value
  const sort = first(params.sort)
  const size = first(params.size)
  const shop = first(params.shop)
  return {
    q: first(params.q)?.trim().slice(0, KEYWORD_MAX_LENGTH) || undefined,
    type: TYPE_OPTIONS.some(o => o.value === first(params.type)) ? first(params.type) : undefined,
    species: SPECIES_OPTIONS.some(o => o.value === first(params.species)) ? first(params.species) : undefined,
    size: SIZE_OPTIONS.some(o => o.value === size) ? (size as SizeCategory) : undefined,
    // Amazon の掲載を止めている間は楽天市場の商品だけなので、?shop= の指定は無視する（ショップの絞り込みも出さない）
    shop: AMAZON_ENABLED && (shop === 'amazon' || shop === 'rakuten') ? shop : undefined,
    min: toPositiveInt(first(params.min)),
    max: toPositiveInt(first(params.max)),
    place: pick(PLACE_OPTIONS, first(params.place) ?? legacy.place),
    enjoy: pick(ENJOY_OPTIONS, first(params.enjoy)),
    season: pick(SEASON_OPTIONS, first(params.season)),
    level: pick(LEVEL_OPTIONS, first(params.level) ?? legacy.level),
    use: pick(USE_OPTIONS, first(params.use) ?? legacy.use),
    flags: FLAG_OPTIONS.map(o => o.value).filter(v => flagValues.includes(v)),
    sort: SORT_OPTIONS.some(o => o.value === sort) ? (sort as SortValue) : 'recommended',
    page: Math.min(toPositiveInt(first(params.page)) ?? 1, 200),
  }
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.q || filters.type || filters.species || filters.size || filters.shop ||
    filters.min || filters.max || filters.place || filters.enjoy || filters.season || filters.level || filters.use ||
    filters.flags.length || filters.sort !== 'recommended' || filters.page > 1
  )
}

// おすすめ順：レビュー件数と評価を重視し、手動で選んだ商品（Amazon）を少し優先する
function recommendScore(p: CatalogProduct): number {
  const reviews = Math.log10(p.reviewCount + 1) * (p.reviewAverage || 3.5)
  return reviews + (p.source === 'amazon' ? 2 : 0) + (p.productType === 'tree' ? 1 : 0)
}

export function filterProducts(products: CatalogProduct[], filters: CatalogFilters): CatalogProduct[] {
  const keyword = parseKeyword(filters.q)
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
    if (filters.place && p.place !== filters.place) return false
    if (filters.enjoy && !p.enjoy.includes(filters.enjoy)) return false
    if (filters.season && !p.seasons.includes(filters.season)) return false
    if (filters.level && p.level !== filters.level) return false
    if (filters.use === 'gift' && !(p.gift || p.wrapping)) return false
    if (filters.use === 'new_year' && !p.newYear) return false
    if (filters.use === 'celebration' && !p.celebration) return false
    if (keyword.length && !matchesKeyword(keyword, `${p.originalName} ${p.shopName} ${p.tags.join(' ')} ${p.speciesLabel ?? ''} ${PRODUCT_TYPE_LABELS[p.productType] ?? ''}`)) return false
    for (const flag of filters.flags) {
      if (flag === 'free_shipping' && p.freeShipping !== true) return false
      if (flag === 'reviewed' && p.reviewCount === 0) return false
      if (flag === 'rating4' && !(p.reviewCount > 0 && p.reviewAverage >= 4)) return false
      if (flag === 'wrapping' && !p.wrapping) return false
      if (flag === 'saucer' && !p.saucer) return false
      if (flag === 'care_guide' && !p.careGuide) return false
    }
    return true
  })

  // キーワードが種類を指している（「鉢」「はさみ」など）ときは、おすすめ順でその種類を先に並べる（鉢植えの盆栽より盆栽鉢を先に）
  const intent = filters.q && !filters.type ? keywordTypeIntent(keyword) : null
  const intentRank = (p: CatalogProduct) => (intent && intent.includes(p.productType) ? 0 : 1)
  const sorters: Record<SortValue, (a: CatalogProduct, b: CatalogProduct) => number> = {
    recommended: (a, b) => intentRank(a) - intentRank(b) || recommendScore(b) - recommendScore(a),
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
  if (merged.place) params.set('place', merged.place)
  if (merged.enjoy) params.set('enjoy', merged.enjoy)
  if (merged.season) params.set('season', merged.season)
  if (merged.level) params.set('level', merged.level)
  if (merged.use) params.set('use', merged.use)
  merged.flags.forEach(flag => params.append('flag', flag))
  if (merged.sort !== 'recommended') params.set('sort', merged.sort)
  if (merged.page > 1) params.set('page', String(merged.page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

// 条件を1つ外した場合の条件（0件のときの代わりの案に使う）
export function withoutFilter(filters: CatalogFilters, key: FilterKey): CatalogFilters {
  const next: CatalogFilters = { ...filters, page: 1 }
  if (key === 'price') return { ...next, min: undefined, max: undefined }
  if (key === 'flags') return { ...next, flags: [] }
  return { ...next, [key]: undefined }
}

export function isFilterActive(filters: CatalogFilters, key: FilterKey): boolean {
  if (key === 'price') return Boolean(filters.min || filters.max)
  if (key === 'flags') return filters.flags.length > 0
  return Boolean(filters[key])
}

// 0件のとき、条件を1つずつ外して件数が多い順に代わりの案を返す
export function relaxSuggestions(products: CatalogProduct[], filters: CatalogFilters, limit = 3) {
  return FILTER_KEYS.filter(key => isFilterActive(filters, key))
    .map(key => {
      const relaxed = withoutFilter(filters, key)
      return { key, filters: relaxed, count: filterProducts(products, relaxed).length }
    })
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// ---- カテゴリごとの件数（0件のカテゴリを出さないために使う） ----

// 鉢・土・道具のカテゴリ（SHOP_CATEGORIES の slug）と商品の種類
export const CATEGORY_PART_TYPES: Record<string, ProductType> = {
  hachi: 'pot', tsuchi: 'soil', dougu: 'tool', harigane: 'wire', hiryo: 'fertilizer',
}

// カテゴリページ（/products/category/[slug]）で使う条件（並び順などは既定）
export function categoryFilters(slug: string, base: CatalogFilters = parseFilters({})): CatalogFilters {
  const partType = CATEGORY_PART_TYPES[slug]
  return partType
    ? { ...base, species: undefined, type: partType }
    : { ...base, species: slug, type: slug === 'kokedama' ? 'kokedama' : 'tree' }
}

const countsCache = new WeakMap<CatalogProduct[], Record<string, number>>()

// SHOP_CATEGORIES の slug ごとの件数（カテゴリページを開いたときと同じ条件で数える）。同じ配列なら結果を使い回す
export function categoryCounts(products: CatalogProduct[]): Record<string, number> {
  const cached = countsCache.get(products)
  if (cached) return cached
  const counts: Record<string, number> = {}
  SHOP_CATEGORIES.forEach(c => { counts[c.slug] = filterProducts(products, categoryFilters(c.slug)).length })
  countsCache.set(products, counts)
  return counts
}

// 商品が1件以上あるカテゴリの slug
export function nonEmptyCategorySlugs(products: CatalogProduct[]): Set<string> {
  const counts = categoryCounts(products)
  return new Set(Object.keys(counts).filter(slug => counts[slug] > 0))
}

const optionCountsCache = new WeakMap<CatalogProduct[], { type: Record<string, number>; species: Record<string, number> }>()

// 絞り込みの選択肢（種類・樹種）ごとの件数（ほかの条件なし）。0件の選択肢を出さないために使う
export function optionCounts(products: CatalogProduct[]): { type: Record<string, number>; species: Record<string, number> } {
  const cached = optionCountsCache.get(products)
  if (cached) return cached
  const base = parseFilters({})
  const type: Record<string, number> = {}
  const species: Record<string, number> = {}
  TYPE_OPTIONS.forEach(o => { type[o.value] = filterProducts(products, { ...base, type: o.value }).length })
  SPECIES_OPTIONS.forEach(o => { species[o.value] = filterProducts(products, { ...base, species: o.value }).length })
  const result = { type, species }
  optionCountsCache.set(products, result)
  return result
}
