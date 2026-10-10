// 「そろえるリスト」：樹の種類・大きさ・目的から、合う鉢の大きさ・土の配合・道具の目安と、掲載中の商品を出す
// 配合・号数は一般的な目安（記事 soil-science-ph-nutrition-guide・bonsai-repotting-master-guide-2025 と同じ値）
import type { CatalogProduct } from '@/lib/catalog-model'
import { hasCuratedImage } from '@/components/home/curated'

export type TreeGroup = 'shohaku' | 'zoki' | 'hana' | 'satsuki' | 'indoor'
export type TreeSize = 'mini' | 'small' | 'medium'
export type Purpose = 'start' | 'repot'

export const GROUP_OPTIONS: { value: TreeGroup; label: string; note: string }[] = [
  { value: 'shohaku', label: '松柏類', note: '黒松・五葉松・真柏など' },
  { value: 'zoki', label: '雑木類', note: 'もみじ・欅など' },
  { value: 'hana', label: '花もの・実もの', note: '梅・桜・長寿梅・姫りんごなど' },
  { value: 'satsuki', label: 'さつき・つつじ', note: '酸性の土を好む' },
  { value: 'indoor', label: '室内向き', note: 'ガジュマルなど' },
]

export const SIZE_OPTIONS: { value: TreeSize; label: string; note: string }[] = [
  { value: 'mini', label: 'ミニ', note: '樹高 〜15cm' },
  { value: 'small', label: '小品', note: '樹高 15〜25cm' },
  { value: 'medium', label: '中品', note: '樹高 25〜40cm' },
]

export const PURPOSE_OPTIONS: { value: Purpose; label: string; note: string }[] = [
  { value: 'start', label: 'はじめての手入れ', note: '剪定・水やりの道具' },
  { value: 'repot', label: '植え替え', note: '鉢・土・植え替えの道具' },
]

export interface SoroeruState {
  group: TreeGroup
  size: TreeSize
  purpose: Purpose
}

const pick = <T extends string>(value: unknown, options: { value: T }[], fallback: T): T =>
  options.some(o => o.value === value) ? (value as T) : fallback

export function parseSoroeru(params: Record<string, string | string[] | undefined>): SoroeruState & { chosen: boolean } {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  return {
    group: pick(first(params.group), GROUP_OPTIONS, 'zoki'),
    size: pick(first(params.size), SIZE_OPTIONS, 'small'),
    purpose: pick(first(params.purpose), PURPOSE_OPTIONS, 'repot'),
    chosen: Boolean(first(params.group)),
  }
}

export function soroeruHref(state: SoroeruState, change: Partial<SoroeruState> = {}): string {
  const next = { ...state, ...change }
  return `/soroeru?group=${next.group}&size=${next.size}&purpose=${next.purpose}#list`
}

// 商品の樹種・大きさから、そろえるリストの初期値を決める（商品ページからの案内用）
const GROUP_BY_SPECIES: Record<string, TreeGroup> = {
  goyomatsu: 'shohaku', kuromatsu: 'shohaku', akamatsu: 'shohaku', shimpaku: 'shohaku', toshou: 'shohaku', hinoki: 'shohaku',
  momiji: 'zoki', keyaki: 'zoki', nire: 'zoki',
  ume: 'hana', chojubai: 'hana', sakura: 'hana', himeringo: 'hana', mimono: 'hana', nanten: 'hana', tsubaki: 'hana', sarusuberi: 'hana',
  satsuki: 'satsuki',
  gajumaru: 'indoor', ficus: 'indoor',
}
export function soroeruStateFor(product: Pick<CatalogProduct, 'speciesKey' | 'sizeCategory' | 'heightCm'>): SoroeruState {
  const group = (product.speciesKey && GROUP_BY_SPECIES[product.speciesKey]) || 'zoki'
  const h = product.heightCm ?? 0
  const size: TreeSize = h ? (h <= 15 ? 'mini' : h <= 25 ? 'small' : 'medium') : product.sizeCategory === 'mini' ? 'mini' : product.sizeCategory === 'medium' || product.sizeCategory === 'large' ? 'medium' : 'small'
  return { group, size, purpose: 'repot' }
}

// ---- 目安 ----

const POT_RANGE: Record<TreeSize, [number, number]> = { mini: [2, 3.5], small: [3, 5], medium: [5, 8] }
const GRAIN: Record<TreeSize, string> = { mini: '極小粒〜小粒', small: '小粒', medium: '小粒〜中粒' }

const SOIL: Record<TreeGroup, { mix: string; why: string; kinds: RegExp }> = {
  shohaku: { mix: '赤玉土6〜7：桐生砂または川砂3〜4', why: '水はけを重視。乾いてから水を与える管理に合います', kinds: /赤玉|桐生砂|川砂|日向土|盆栽.{0,4}土|配合/ },
  zoki: { mix: '赤玉土7〜8：桐生砂または日向土2〜3', why: '水持ちをやや重視。夏の水切れを防ぎます', kinds: /赤玉|桐生砂|日向土|盆栽.{0,4}土|配合/ },
  hana: { mix: '赤玉土7：桐生砂2：腐葉土1', why: '水持ちと養分のもちをやや高めます', kinds: /赤玉|桐生砂|腐葉土|盆栽.{0,4}土|配合/ },
  satsuki: { mix: '鹿沼土だけ（または鹿沼土を主体に）', why: 'さつき・つつじは酸性の土を好みます', kinds: /鹿沼土/ },
  indoor: { mix: '赤玉土を主体に、水はけのよい土', why: '室内は乾きにくいため、水はけを優先します', kinds: /赤玉|観葉|盆栽.{0,4}土|配合/ },
}

export interface Guide {
  pot: { range: string; note: string }
  soil: { mix: string; grain: string; why: string }
  tools: { label: string; note: string; pattern: RegExp; type: CatalogProduct['productType'] }[]
}

export function soroeruGuide(state: SoroeruState): Guide {
  const [lo, hi] = POT_RANGE[state.size]
  const tools: Guide['tools'] = [
    { label: '盆栽ばさみ', note: '枝や葉を切る基本の道具。最初の1本', pattern: /鋏|ばさみ|はさみ|ハサミ/, type: 'tool' },
    { label: 'ピンセット', note: '芽摘み・草取り・苔の手入れに', pattern: /ピンセット/, type: 'tool' },
  ]
  if (state.purpose === 'repot') {
    tools.push(
      { label: '土入れ', note: '根のすき間に土を入れる', pattern: /土入れ|土すくい|スコップ/, type: 'tool' },
      { label: '根かき・竹串', note: '古い土を落として根をほぐす', pattern: /根かき|根掻き|根捌き/, type: 'tool' },
      { label: 'アルミ線（1.5〜2mm）', note: '鉢底網と樹を鉢に固定する', pattern: /アルミ線|アルミ.{0,4}針金/, type: 'wire' },
    )
  } else {
    tools.push(
      { label: 'じょうろ', note: '細かい水が出る、はす口付きのもの', pattern: /じょうろ|ジョウロ|如雨露/, type: 'tool' },
      { label: '置き肥', note: '春と秋に土の上に置く固形の肥料', pattern: /玉肥|置き肥|固形|油かす|油粕/, type: 'fertilizer' },
    )
  }
  return {
    pot: { range: `${lo}〜${hi}号`, note: '鉢の幅は、樹高のおよそ2/3〜同じくらいが目安です（1号＝直径約3cm）' },
    soil: { mix: SOIL[state.group].mix, grain: GRAIN[state.size], why: SOIL[state.group].why },
    tools,
  }
}

// ---- 掲載中の商品から選ぶ ----

// 商品名の号数（「3〜5号」「4.5号」）が、目安の範囲に重なるか
function potSizeMatches(name: string, [lo, hi]: [number, number]): boolean {
  const n = name.replace(/[～~〜]/g, '〜')
  const range = n.match(/(\d+(?:\.\d)?)\s*(?:号)?\s*〜\s*(\d+(?:\.\d)?)\s*号/)
  if (range) return Number(range[1]) <= hi && Number(range[2]) >= lo
  const one = n.match(/(?<![\d.])(\d+(?:\.\d)?)\s*号/)
  if (one) return Number(one[1]) >= lo && Number(one[1]) <= hi
  return false
}

// 盆栽用と分かるもの・写真のきれいなもの・レビューの多いものを先に
const score = (p: CatalogProduct) =>
  (hasCuratedImage(p) ? 4 : 0) + (/盆栽/.test(p.originalName) ? 2 : 0) - (/観葉|バラ|多肉|サボテン|野菜|家庭菜園|花の土|草花/.test(p.originalName) ? 3 : 0)
const best = (list: CatalogProduct[], n: number) =>
  list.sort((a, b) => score(b) - score(a) || b.reviewCount - a.reviewCount).slice(0, n)

export interface SoroeruPicks {
  pots: CatalogProduct[]
  soils: CatalogProduct[]
  tools: { label: string; note: string; products: CatalogProduct[] }[]
}

export function soroeruPicks(state: SoroeruState, guide: Guide, products: CatalogProduct[]): SoroeruPicks {
  const range = POT_RANGE[state.size]
  const pots = state.purpose === 'repot' ? best(products.filter(p => p.productType === 'pot' && /鉢/.test(p.originalName) && potSizeMatches(p.originalName, range)), 3) : []
  const soilKinds = SOIL[state.group].kinds
  const soils = state.purpose === 'repot' ? best(products.filter(p => p.productType === 'soil' && soilKinds.test(p.originalName) && !/スコップ|すくい|シャベル/.test(p.originalName)), 3) : []
  const tools = guide.tools.map(tool => ({
    label: tool.label,
    note: tool.note,
    products: best(products.filter(p => p.productType === tool.type && tool.pattern.test(p.originalName)), 2),
  }))
  return { pots, soils, tools }
}
