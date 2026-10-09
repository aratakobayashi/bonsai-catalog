// 一覧の絞り込みバーの選択肢（チップを押したときに出るリンクの一覧）
import {
  ENJOY_OPTIONS,
  FLAG_OPTIONS,
  LEVEL_OPTIONS,
  PLACE_OPTIONS,
  PRICE_PRESETS,
  SEASON_OPTIONS,
  SIZE_OPTIONS,
  SORT_OPTIONS,
  SPECIES_OPTIONS,
  TYPE_OPTIONS,
  USE_OPTIONS,
  buildCatalogUrl,
  filterProducts,
  type CatalogFilters,
} from '@/lib/catalog'
import type { CatalogProduct } from '@/lib/catalog-model'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { SPECIES_TRAITS, type SpeciesTrait } from '@/lib/species-traits'
import { currentSeason } from '@/components/catalog/CatalogProductCard'
import type { FilterMenu, FilterOption } from '@/components/catalog/FilterBar'

const label = (options: readonly { value: string; label: string }[], value?: string) => options.find(o => o.value === value)?.label

export function buildFilterMenus(filters: CatalogFilters, basePath = '/products'): { menus: FilterMenu[]; sort: FilterMenu } {
  const url = (overrides: Partial<CatalogFilters>) => buildCatalogUrl(filters, overrides, basePath)
  const opt = (text: string, overrides: Partial<CatalogFilters>, active: boolean): FilterOption => ({ label: text, href: url(overrides), active })
  const priceLabel = filters.min || filters.max
    ? PRICE_PRESETS.find(p => p.min === filters.min && p.max === filters.max)?.label ?? `${filters.min ?? ''}〜${filters.max ?? ''}円`
    : undefined
  const purposeCount = [filters.place, filters.enjoy, filters.season, filters.level, filters.use].filter(Boolean).length + filters.flags.length

  const menus: FilterMenu[] = [
    {
      key: 'species',
      label: '樹種・分類',
      current: label(SPECIES_OPTIONS, filters.species) ?? label(TYPE_OPTIONS, filters.type),
      groups: [
        { title: '種類', options: [opt('すべて', { type: undefined }, !filters.type), ...TYPE_OPTIONS.map(o => opt(o.label, { type: o.value }, filters.type === o.value))] },
        { title: '樹種・分類', options: [opt('指定なし', { species: undefined }, !filters.species), ...SPECIES_OPTIONS.map(o => opt(o.label, { species: o.value }, filters.species === o.value))] },
      ],
    },
    {
      key: 'price',
      label: '予算',
      current: priceLabel,
      groups: [{ options: [opt('指定なし', { min: undefined, max: undefined }, !filters.min && !filters.max), ...PRICE_PRESETS.map(p => opt(p.label, { min: p.min, max: p.max }, filters.min === p.min && filters.max === p.max))] }],
    },
    {
      key: 'size',
      label: 'サイズ',
      current: label(SIZE_OPTIONS, filters.size),
      groups: [{ options: [opt('指定なし', { size: undefined }, !filters.size), ...SIZE_OPTIONS.map(o => opt(o.label, { size: o.value }, filters.size === o.value))] }],
    },
    {
      key: 'shop',
      label: 'ショップ',
      current: filters.shop === 'rakuten' ? '楽天市場' : filters.shop === 'amazon' ? 'Amazon' : undefined,
      groups: [{ options: [opt('すべて', { shop: undefined }, !filters.shop), opt('楽天市場', { shop: 'rakuten' }, filters.shop === 'rakuten'), opt('Amazon', { shop: 'amazon' }, filters.shop === 'amazon')] }],
    },
    {
      key: 'purpose',
      label: 'こだわり',
      current: purposeCount ? `こだわり（${purposeCount}）` : undefined,
      groups: [
        { title: '置き場所', options: PLACE_OPTIONS.map(o => opt(o.label, { place: filters.place === o.value ? undefined : o.value }, filters.place === o.value)) },
        { title: '楽しみ方', options: ENJOY_OPTIONS.map(o => opt(o.label, { enjoy: filters.enjoy === o.value ? undefined : o.value }, filters.enjoy === o.value)) },
        { title: '見ごろの季節', options: SEASON_OPTIONS.map(o => opt(o.label, { season: filters.season === o.value ? undefined : o.value }, filters.season === o.value)) },
        { title: '育てやすさ', options: LEVEL_OPTIONS.map(o => opt(o.label, { level: filters.level === o.value ? undefined : o.value }, filters.level === o.value)) },
        { title: '用途', options: USE_OPTIONS.map(o => opt(o.label, { use: filters.use === o.value ? undefined : o.value }, filters.use === o.value)) },
        {
          title: 'ショップの表記',
          options: FLAG_OPTIONS.map(o => {
            const on = filters.flags.includes(o.value)
            return opt(o.label, { flags: on ? filters.flags.filter(f => f !== o.value) : [...filters.flags, o.value] }, on)
          }),
        },
      ],
    },
  ]

  const sort: FilterMenu = {
    key: 'sort',
    label: '並び順',
    current: label(SORT_OPTIONS, filters.sort),
    groups: [{ options: SORT_OPTIONS.map(o => opt(o.label, { sort: o.value }, filters.sort === o.value)) }],
  }
  return { menus, sort }
}

// 「条件」の横に並べる、選択中の条件の名前（カテゴリページで固定している樹種・種類は除く）
export function conditionLabels(filters: CatalogFilters, fixedCategory = false): string[] {
  const labels: (string | undefined)[] = []
  if (!fixedCategory) {
    labels.push(label(TYPE_OPTIONS, filters.type), label(SPECIES_OPTIONS, filters.species))
  }
  if (filters.min || filters.max) {
    labels.push(PRICE_PRESETS.find(p => p.min === filters.min && p.max === filters.max)?.label ?? `${filters.min?.toLocaleString() ?? ''}〜${filters.max?.toLocaleString() ?? ''}円`)
  }
  labels.push(
    label(SIZE_OPTIONS, filters.size)?.replace(/（.*）/, ''),
    filters.shop === 'rakuten' ? '楽天市場' : filters.shop === 'amazon' ? 'Amazon' : undefined,
    label(PLACE_OPTIONS, filters.place),
    label(ENJOY_OPTIONS, filters.enjoy),
    filters.season ? `見ごろ：${label(SEASON_OPTIONS, filters.season)}` : undefined,
    label(LEVEL_OPTIONS, filters.level),
    label(USE_OPTIONS, filters.use),
    ...filters.flags.map(f => label(FLAG_OPTIONS, f)),
  )
  return labels.filter((v): v is string => Boolean(v))
}

// ---- 樹種のタブ（一覧の上の「すべて／黒松／もみじ…」） ----

export interface SpeciesTab {
  key: string
  label: string
  href: string
  count: number
  active: boolean
  // 樹種の一般的な見ごろの季節が今の季節か
  inSeason: boolean
}

// ミニ盆栽（サイズ）と実もの盆栽（分類）は樹種ではないため、タブには出さない
const TAB_EXCLUDE = ['mini', 'mimono']

export function speciesTraitOf(slug: string): SpeciesTrait | null {
  return SPECIES_TRAITS.find(t => t.key === slug) ?? null
}

// タブの件数は「今の条件のまま、その樹種のカテゴリを開いたときの件数」
// knownAllCount：「すべて」の件数が分かっているとき（一覧の件数と同じとき）に渡すと、数え直さない
export function buildSpeciesTabs(products: CatalogProduct[], filters: CatalogFilters, activeSlug?: string, knownAllCount?: number): { all: SpeciesTab; tabs: SpeciesTab[] } {
  const base: CatalogFilters = { ...filters, species: undefined, page: 1 }
  // カテゴリページでは種類（樹木・苔玉）が固定なので、「すべて」に戻るときは外す
  const allFilters: CatalogFilters = activeSlug ? { ...base, type: undefined } : base
  const linkFilters: CatalogFilters = { ...base, type: undefined }
  const treeBase = filterProducts(products, { ...base, type: 'tree' })
  const kokedamaBase = filterProducts(products, { ...base, type: 'kokedama' })
  const season = currentSeason()

  const tabs = SHOP_CATEGORIES
    .filter(c => c.group === 'tree' && !TAB_EXCLUDE.includes(c.slug))
    .map(c => {
      const option = SPECIES_OPTIONS.find(o => o.value === c.slug)
      const pool = c.slug === 'kokedama' ? kokedamaBase : treeBase
      const count = option ? pool.filter(option.match).length : 0
      return {
        key: c.slug,
        label: c.name.replace(/（.*）/, ''),
        href: buildCatalogUrl(linkFilters, {}, `/products/category/${c.slug}`),
        count,
        active: c.slug === activeSlug,
        inSeason: speciesTraitOf(c.slug)?.seasons.includes(season) ?? false,
      }
    })
    .filter(t => t.count > 0 || t.active)

  return {
    all: {
      key: 'all',
      label: 'すべて',
      href: buildCatalogUrl(allFilters, {}, '/products'),
      count: knownAllCount ?? filterProducts(products, allFilters).length,
      active: !activeSlug && !filters.species,
      inSeason: false,
    },
    tabs,
  }
}
