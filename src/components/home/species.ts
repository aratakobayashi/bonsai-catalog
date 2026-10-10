// トップの「樹種から選ぶ」：見頃（seasons.ts の樹種ごとの一般的な目安）と、species-traits の育てやすさ・置き場所
import { SPECIES_TRAITS, type Level, type Place } from '@/lib/species-traits'
import { getShopCategory } from '@/lib/shop-categories'
import { peakLabel, peakMonths } from '@/lib/seasons'
import { categoryCounts } from '@/lib/catalog'
import type { CatalogProduct } from '@/lib/catalog-model'

interface HomeSpeciesDef {
  slug: string // SHOP_CATEGORIES の slug（/products/category/[slug]）= SPECIES_TRAITS の key
  // 見頃の表示に付け足す補足
  note?: string
  // タイルに出す見どころ（短い一言）
  appeal: string
  // タイルの写真に使う商品（目で選んだもの。なければ自動で選ぶ）
  photoId?: string
}

const DEFS: HomeSpeciesDef[] = [
  { slug: 'momiji', appeal: '新緑と秋の紅葉' },
  { slug: 'goyomatsu', appeal: '一年中の緑、松の定番' },
  { slug: 'ume', note: '（長寿梅は春・秋）', appeal: '早春に咲く花' },
  { slug: 'kuromatsu', appeal: '力強い幹と濃い緑' },
  { slug: 'sakura', appeal: '春に咲く花' },
  { slug: 'himeringo', appeal: '春の花と秋の実' },
  { slug: 'nanten', appeal: '冬の赤い実、縁起物', photoId: '841fddc5-70e7-4f91-87f7-e598ec027d02' },
  { slug: 'gajumaru', appeal: '室内で楽しめる', photoId: '517b33ea-2596-495d-8900-e6c5bb2ae95b' },
]

const LEVEL_LABEL: Record<Level, string> = { easy: 'やさしい', normal: 'ふつう' }
const PLACE_LABEL: Record<Place, string> = { indoor: '室内にも', outdoor: '屋外' }

export interface HomeSpecies {
  slug: string
  name: string
  appeal: string
  photoId?: string
  peak: string
  care: string
  inSeason: boolean
  // カテゴリページと同じ条件の件数（products を渡したときだけ。渡さないときは undefined）
  count?: number
}

// products を渡すと、商品が0件の樹種（リンク先が空になるもの）は除く
export function getHomeSpecies(month: number, products?: CatalogProduct[]): HomeSpecies[] {
  const counts = products ? categoryCounts(products) : null
  return DEFS.flatMap(def => {
    const category = getShopCategory(def.slug)
    const trait = SPECIES_TRAITS.find(t => t.key === def.slug)
    const label = peakLabel(def.slug)
    if (!category || !trait || !label) return []
    const count = counts ? counts[def.slug] ?? 0 : undefined
    if (count === 0) return []
    return [{
      slug: def.slug,
      name: category.name,
      appeal: def.appeal,
      photoId: def.photoId,
      peak: `${label}${def.note ?? ''}`,
      care: `${LEVEL_LABEL[trait.level]}・${PLACE_LABEL[trait.place]}`,
      inSeason: peakMonths(def.slug).includes(month),
      ...(count !== undefined && { count }),
    }]
  })
}
