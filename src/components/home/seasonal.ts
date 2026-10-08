// トップの「季節の一鉢」：月ごとに見頃の樹種カテゴリを選ぶ（文言は一般的な見どころの範囲で書く）

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

export function getSeasonalPick(date = new Date()): SeasonalPick & { monthLabel: string } {
  // 日本時間の月で判定する
  const month = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', month: 'numeric' }).format(date)) - 1
  return { ...PICKS[BY_MONTH[month]], monthLabel: MONTH_LABELS[month] }
}
