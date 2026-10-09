// トップの「季節の一鉢」と「いま見頃の盆栽」：月ごとに見頃の樹種・楽しみ方を選ぶ（文言は一般的な見どころの範囲で書く）
import type { Enjoy, Season } from '@/lib/species-traits'
import { jstMonth, peakMonths, seasonOfMonth } from '@/lib/seasons'
import type { CatalogProduct } from '@/lib/catalog-model'

export interface SeasonalPick {
  slug: string // SHOP_CATEGORIES / SPECIES_OPTIONS の slug
  name: string
  title: string
  lead: string
}

const MONTH_LABELS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

const PICKS: Record<string, SeasonalPick> = {
  goyomatsu: { slug: 'goyomatsu', name: '五葉松', title: '冬も緑を、手もとに。', lead: '一年中緑を保つ、松柏類の定番です。' },
  ume: { slug: 'ume', name: '梅・長寿梅', title: '早春の花を、手のひらで。', lead: '寒さの中で咲く、花もの盆栽の定番です。' },
  sakura: { slug: 'sakura', name: '桜', title: '桜を、手のひらで。', lead: '小さな樹でも花を咲かせやすい品種が選ばれています。' },
  satsuki: { slug: 'satsuki', name: 'さつき', title: '初夏の花を、手のひらで。', lead: '色とりどりの花を咲かせる、花ものの代表です。' },
  kokedama: { slug: 'kokedama', name: '苔玉', title: '涼しげな緑を、器にのせて。', lead: '室内のインテリアとして楽しめる苔玉です。' },
  mimono: { slug: 'mimono', name: '実もの盆栽', title: '実りの秋を、手のひらで。', lead: '色づく実を楽しめる、実もの盆栽です。' },
  momiji: { slug: 'momiji', name: 'もみじ', title: '紅葉を、手のひらで。', lead: '秋の紅葉を楽しめる、雑木盆栽の代表です。' },
  nanten: { slug: 'nanten', name: '南天', title: '赤い実で、冬の彩りを。', lead: '縁起物として正月飾りにも選ばれる樹種です。' },
}

// 1月〜12月
const BY_MONTH = ['goyomatsu', 'ume', 'sakura', 'sakura', 'satsuki', 'satsuki', 'kokedama', 'kokedama', 'mimono', 'momiji', 'momiji', 'nanten']

// 日本時間の月（1〜12）
export function currentMonth(date = new Date()): number {
  return jstMonth(date)
}

export function getSeasonalPick(date = new Date()): SeasonalPick & { monthLabel: string } {
  const month = currentMonth(date) - 1
  return { ...PICKS[BY_MONTH[month]], monthLabel: MONTH_LABELS[month] }
}

// 「いま見頃の盆栽」の条件：樹種の楽しみ方（enjoy）が合い、見頃の月（seasons.ts）に今月が含まれるもの。
// 楽しみ方に「常緑」を含む月は、常緑の樹種も月を問わず対象にする
export interface SeasonalShelf {
  subtitle: string
  // 今月（1〜12）
  month: number
  // 今月の季節（以前の季節単位の判定との互換用）
  season: Season
  enjoy: Enjoy[]
}

// 1月〜12月（見出しは、その月に見頃の月を迎える樹種に合わせる）
const SHELVES: { label: string; enjoy: Enjoy[] }[] = [
  { label: '冬の実ものと松柏', enjoy: ['fruit', 'evergreen'] },
  { label: '梅の花', enjoy: ['flower'] },
  { label: '梅と桜', enjoy: ['flower'] },
  { label: '桜と新緑', enjoy: ['flower', 'leaf_color'] },
  { label: '花と新緑', enjoy: ['flower', 'leaf_color'] },
  { label: '初夏の花', enjoy: ['flower'] },
  { label: '夏の花と常緑', enjoy: ['flower', 'evergreen'] },
  { label: '夏の花と常緑', enjoy: ['flower', 'evergreen'] },
  { label: '実もの', enjoy: ['fruit'] },
  { label: '紅葉と実もの', enjoy: ['leaf_color', 'fruit'] },
  { label: '紅葉と実もの', enjoy: ['leaf_color', 'fruit'] },
  { label: '実ものと松柏', enjoy: ['fruit', 'evergreen'] },
]

export function getSeasonalShelf(date = new Date()): SeasonalShelf {
  const month = currentMonth(date)
  const { label, enjoy } = SHELVES[month - 1]
  return { subtitle: `${month}月は${label}`, month, season: seasonOfMonth(month), enjoy }
}

// 商品が「いま見頃の盆栽」の棚に合うか
export function matchesSeasonalShelf(product: Pick<CatalogProduct, 'enjoy' | 'speciesKey'>, shelf: SeasonalShelf): boolean {
  const inPeak = peakMonths(product).includes(shelf.month)
  return product.enjoy.some(e => shelf.enjoy.includes(e) && (e === 'evergreen' ? peakMonths(product).length === 0 : inPeak))
}
