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
  type CatalogFilters,
} from '@/lib/catalog'
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
