// データで選ぶ「盆栽のおすすめ」（/osusume）。掲載中の商品を、レビューの評価と件数・樹種の育てやすさなどで点数にして並べる
// 点数の付け方はページに公開する（OSUSUME_METHOD）。商品データを取り直すたびに順位も入れ替わる
import type { CatalogProduct } from '@/lib/catalog-model'
import { isSeedlingOrMaterial } from '@/lib/selections'

export interface OsusumeTheme {
  slug: string
  // 一覧・タブに出す短い名前
  label: string
  // ページの見出し（h1）
  title: string
  // 検索結果のタイトル
  metaTitle: string
  description: string
  lead: string
  // 対象にする商品の条件
  filter: (p: CatalogProduct) => boolean
  // この特集で点数に足す要素（育てやすさ・室内向きなど）
  bonus?: (p: CatalogProduct) => number
  // 1つの樹種から選ぶ上限（室内向きのように樹種が少ない特集は多めにする）。既定は3
  maxPerSpecies?: number
}

const PLANT = (p: CatalogProduct) => (p.productType === 'tree' || p.productType === 'kokedama') && !isSeedlingOrMaterial(p) && p.price > 0
const inRange = (p: CatalogProduct, min: number, max: number) => p.price >= min && p.price <= max

export const OSUSUME_THEMES: OsusumeTheme[] = [
  {
    slug: 'beginner',
    label: '初心者向け',
    title: 'はじめての盆栽のおすすめ',
    metaTitle: '初心者におすすめの盆栽｜レビューと育てやすさで選んだ一鉢 - 盆栽コレクション',
    description: 'はじめての盆栽におすすめの一鉢を、掲載中の盆栽からレビューの評価と件数、樹種の育てやすさ、手ごろな大きさと価格で選びました。選んだ理由と、点数の付け方も公開しています。',
    lead: '育てやすい樹種で、手ごろな大きさ・価格のものから、レビューの評価が高く件数も多い順に選びました。',
    filter: p => PLANT(p) && p.level === 'easy' && (p.sizeCategory === 'mini' || p.sizeCategory === 'small') && p.price <= 8000,
    bonus: p => (p.beginner ? 0.15 : 0) + (p.careGuide ? 0.1 : 0),
  },
  {
    slug: 'indoor',
    label: '室内向け',
    title: '室内で育てやすい盆栽のおすすめ',
    metaTitle: '室内で育てやすい盆栽のおすすめ｜レビューで選んだ部屋に置ける一鉢 - 盆栽コレクション',
    description: '室内で育てやすい盆栽のおすすめを、掲載中の盆栽から樹種の性質（室内に置きやすいか）とレビューの評価・件数で選びました。窓辺に置くときの注意と、点数の付け方も紹介します。',
    lead: '寒さに弱く、明るい室内で管理する樹種の盆栽から、レビューの評価が高く件数も多い順に選びました。',
    filter: p => PLANT(p) && (p.place === 'indoor' || (p.place === null && p.placeClaim === 'indoor')),
    maxPerSpecies: 8,
    bonus: p => (p.saucer ? 0.1 : 0),
  },
  {
    slug: 'under-3000',
    label: '3,000円以下',
    title: '3,000円以下の盆栽のおすすめ',
    metaTitle: '3,000円以下で買える盆栽のおすすめ｜レビューで選んだ手ごろな一鉢 - 盆栽コレクション',
    description: '3,000円以下で買える盆栽のおすすめを、掲載中の盆栽からレビューの評価と件数で選びました。手ごろな価格で始めたい人や、ちょっとした贈り物に。点数の付け方も公開しています。',
    lead: '3,000円以下の盆栽から、レビューの評価が高く件数も多い順に選びました。',
    filter: p => PLANT(p) && inRange(p, 1, 3000),
  },
  {
    slug: '3000-5000',
    label: '3,000〜5,000円',
    title: '3,000〜5,000円の盆栽のおすすめ',
    metaTitle: '5,000円前後の盆栽のおすすめ｜3,000〜5,000円でレビューの良い一鉢 - 盆栽コレクション',
    description: '3,000〜5,000円の盆栽のおすすめを、掲載中の盆栽からレビューの評価と件数で選びました。はじめての一鉢や気軽な贈り物の中心になる価格帯です。点数の付け方も公開しています。',
    lead: '3,000〜5,000円の盆栽から、レビューの評価が高く件数も多い順に選びました。',
    filter: p => PLANT(p) && inRange(p, 3000, 5000),
  },
  {
    slug: 'gift',
    label: '贈り物向け',
    title: '贈り物に選ばれている盆栽のおすすめ',
    metaTitle: '贈り物におすすめの盆栽｜ラッピング対応・レビューで選んだ一鉢 - 盆栽コレクション',
    description: '贈り物におすすめの盆栽を、掲載中の盆栽からラッピング・のしなどの対応とレビューの評価・件数で選びました。5,000〜15,000円の、改まったお祝いにも贈りやすい価格帯が中心です。',
    lead: 'ラッピングやのしに対応し、贈りやすい価格帯の盆栽から、レビューの評価が高く件数も多い順に選びました。',
    filter: p => PLANT(p) && (p.gift || p.wrapping) && inRange(p, 3000, 15000),
    bonus: p => (p.wrapping ? 0.1 : 0) + (p.careGuide ? 0.05 : 0),
  },
]

export const getOsusumeTheme = (slug: string) => OSUSUME_THEMES.find(t => t.slug === slug)

// 点数の付け方（ページで公開する文章と同じ内容）
export const OSUSUME_METHOD = [
  'レビューの評価は、件数が少ないと偶然の影響が大きいため、掲載中の商品全体の平均に近づけてから使います（件数が多いほど、その商品の評価そのものに近づきます）。',
  'レビューの件数が多いほど、少しずつ点数を足します（多くの人に選ばれていることの目安）。',
  '写真で樹の様子がよく分かる商品と、送料込みの商品に、少しだけ点数を足します。',
  '特集ごとに、樹種の育てやすさ・室内向きか・ラッピング対応などの条件を加えます。',
  '同じ店の商品・同じ樹種の商品ばかりにならないよう、1つの店から2点、1つの樹種から3点まで（室内向けは樹種が少ないため8点まで）にしています。',
  '販売店からお金をもらって順位を上げることはしていません。商品リンクは広告（アフィリエイト）です。',
]

export interface OsusumeItem {
  product: CatalogProduct
  score: number
  reasons: string[]
}

// 点数（ベイズ平均で補正したレビューの評価＋件数＋写真・送料＋特集の条件）
export function rankOsusume(products: CatalogProduct[], theme: OsusumeTheme, limit = 20): OsusumeItem[] {
  const pool = products.filter(theme.filter)
  const rated = products.filter(p => p.reviewCount > 0)
  const mean = rated.length ? rated.reduce((s, p) => s + p.reviewAverage, 0) / rated.length : 4.3
  const M = 20
  const scored = pool
    .filter(p => p.reviewCount > 0)
    .map(p => {
      const bayes = (p.reviewCount / (p.reviewCount + M)) * p.reviewAverage + (M / (p.reviewCount + M)) * mean
      const score = bayes + Math.log10(p.reviewCount + 1) * 0.25 + (p.imageUrl ? 0.05 : 0) + (p.freeShipping ? 0.05 : 0) + (theme.bonus?.(p) ?? 0)
      return { product: p, score, reasons: reasonsOf(p, theme) }
    })
    .sort((a, b) => b.score - a.score)

  // 同じ店・同じ樹種が続かないように上限をつける。似た名前（同じ商品の色違いなど）も1点に
  const perShop = new Map<string, number>()
  const perSpecies = new Map<string, number>()
  const seenNames = new Set<string>()
  const result: OsusumeItem[] = []
  for (const item of scored) {
    const shop = item.product.shopName || item.product.source
    const species = item.product.speciesKey ?? 'other'
    const nameKey = (item.product.displayName || item.product.name).replace(/\s/g, '').slice(0, 14)
    if ((perShop.get(shop) ?? 0) >= 2 || (perSpecies.get(species) ?? 0) >= (theme.maxPerSpecies ?? 3) || seenNames.has(nameKey)) continue
    perShop.set(shop, (perShop.get(shop) ?? 0) + 1)
    perSpecies.set(species, (perSpecies.get(species) ?? 0) + 1)
    seenNames.add(nameKey)
    result.push(item)
    if (result.length >= limit) break
  }
  return result
}

// 選んだ理由（カードに出す短い言葉）
function reasonsOf(p: CatalogProduct, theme: OsusumeTheme): string[] {
  const reasons: string[] = []
  if (p.reviewCount >= 200) reasons.push('レビューがとても多い')
  else if (p.reviewAverage >= 4.5 && p.reviewCount >= 20) reasons.push('レビューの評価が高い')
  if (theme.slug !== 'indoor' && p.level === 'easy') reasons.push('育てやすい樹種')
  if (p.place === 'indoor') reasons.push('室内に置きやすい')
  if (p.freeShipping) reasons.push('送料込み')
  if (p.wrapping) reasons.push('ラッピング・のし対応')
  if (p.careGuide) reasons.push('育て方の説明書付き')
  if (p.saucer) reasons.push('受け皿付き')
  return reasons.slice(0, 3)
}
