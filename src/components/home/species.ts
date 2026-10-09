// トップの「樹種から選ぶ」：樹種カテゴリごとの見頃（一般的な目安）と、species-traits の育てやすさ・置き場所
import { SPECIES_TRAITS, type Level, type Place } from '@/lib/species-traits'
import { getShopCategory } from '@/lib/shop-categories'

interface HomeSpeciesDef {
  slug: string // SHOP_CATEGORIES の slug（/products/category/[slug]）
  trait: string // SPECIES_TRAITS の key
  peak: string
  // 見頃の月（1〜12）。常緑は空
  months: number[]
}

const DEFS: HomeSpeciesDef[] = [
  { slug: 'momiji', trait: 'momiji', peak: '紅葉 10〜11月', months: [10, 11] },
  { slug: 'goyomatsu', trait: 'goyomatsu', peak: '通年（常緑）', months: [] },
  { slug: 'ume', trait: 'ume', peak: '花 2〜3月（長寿梅は春・秋）', months: [2, 3] },
  { slug: 'kuromatsu', trait: 'kuromatsu', peak: '通年（常緑）', months: [] },
  { slug: 'sakura', trait: 'sakura', peak: '花 3〜4月', months: [3, 4] },
  { slug: 'himeringo', trait: 'himeringo', peak: '花 4月・実 9〜11月', months: [4, 9, 10, 11] },
  { slug: 'nanten', trait: 'nanten', peak: '実 11〜2月', months: [11, 12, 1, 2] },
  { slug: 'gajumaru', trait: 'gajumaru', peak: '通年（常緑）', months: [] },
]

const LEVEL_LABEL: Record<Level, string> = { easy: 'やさしい', normal: 'ふつう' }
const PLACE_LABEL: Record<Place, string> = { indoor: '室内にも', outdoor: '屋外' }

export interface HomeSpecies {
  slug: string
  name: string
  peak: string
  care: string
  inSeason: boolean
}

export function getHomeSpecies(month: number): HomeSpecies[] {
  return DEFS.flatMap(def => {
    const category = getShopCategory(def.slug)
    const trait = SPECIES_TRAITS.find(t => t.key === def.trait)
    if (!category || !trait) return []
    return [{
      slug: def.slug,
      name: category.name,
      peak: def.peak,
      care: `${LEVEL_LABEL[trait.level]}・${PLACE_LABEL[trait.place]}`,
      inSeason: def.months.includes(month),
    }]
  })
}
