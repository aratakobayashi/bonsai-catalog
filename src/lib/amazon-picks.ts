// Amazon の検索結果への案内（価格・画像を出さない文字のリンク）を、ページの話題ごとに決める
// 楽天の掲載だけでは選びにくい消耗品・道具・薬剤など、「すぐ届いてほしい」ものに絞る
// 薬剤は銘柄を書かず、種類で探す（症状ページの方針と同じく「ラベルの表示どおりに」を添える）

export interface AmazonPick {
  label: string
  keyword: string
  note?: string
}

export interface AmazonPickSet {
  heading: string
  note?: string
  picks: AmazonPick[]
}

const P = {
  scissors: { label: '盆栽ばさみ', keyword: '盆栽 はさみ' },
  tweezers: { label: 'ピンセット', keyword: '盆栽 ピンセット' },
  wire: { label: 'アルミ線（針金かけ）', keyword: '盆栽 アルミ線' },
  wireCutter: { label: '針金切り', keyword: '盆栽 針金切り' },
  soil: { label: '盆栽用の用土', keyword: '盆栽 用土' },
  akadama: { label: '赤玉土（小粒）', keyword: '赤玉土 小粒' },
  net: { label: '鉢底ネット', keyword: '鉢底ネット' },
  tsuchiire: { label: '土入れ', keyword: '盆栽 土入れ' },
  pot: { label: '盆栽鉢', keyword: '盆栽鉢' },
  okigoe: { label: '置き肥（固形の肥料）', keyword: '盆栽 置き肥' },
  liquid: { label: '液体肥料', keyword: '盆栽 液体肥料' },
  joro: { label: 'はす口のじょうろ', keyword: '盆栽 じょうろ' },
  mist: { label: '霧吹き（葉水用）', keyword: '霧吹き 園芸' },
  autoWater: { label: '自動水やり（タイマー式）', keyword: '自動水やり タイマー 鉢' },
  wick: { label: '給水器（ペットボトル式など）', keyword: '自動給水器 鉢植え' },
  insecticide: { label: '園芸用の殺虫スプレー', keyword: '園芸 殺虫剤 スプレー 庭木', note: '盆栽・庭木に使えると書かれたものを、ラベルの表示どおりに' },
  scale: { label: 'カイガラムシ用の薬剤', keyword: 'カイガラムシ 駆除 スプレー', note: '殻の上からは効きにくいので、こすり落としてから' },
  fungicide: { label: '園芸用の殺菌剤', keyword: '園芸 殺菌剤 うどんこ病', note: '盆栽・庭木に使えると書かれたものを、ラベルの表示どおりに' },
  slug: { label: 'ナメクジ用の誘引剤', keyword: 'ナメクジ 駆除 園芸' },
  shade: { label: '遮光ネット（寒冷紗）', keyword: '遮光ネット 50% 園芸' },
  frost: { label: '防寒の不織布', keyword: '不織布 防寒 園芸' },
  sealant: { label: '癒合剤（切り口の保護）', keyword: '癒合剤 盆栽' },
  light: { label: '植物育成ライト', keyword: '植物育成ライト LED' },
  stand: { label: '盆栽の飾り台・敷板', keyword: '盆栽 飾り台' },
  kokedamaKit: { label: '苔玉キット', keyword: '苔玉 キット' },
  moss: { label: '盆栽用の苔（ハイゴケ・スナゴケ）', keyword: '盆栽 苔 ハイゴケ' },
  bonsaiKit: { label: '盆栽の栽培キット', keyword: '盆栽 栽培キット' },
  toolSet: { label: '盆栽の道具セット', keyword: '盆栽 道具セット' },
} satisfies Record<string, AmazonPick>

const DELIVERY_NOTE = 'Amazon の検索結果が開きます。届く日はお届け先によって変わります。'

// 症状ページ（/shojo/[slug]）
const SHOJO_PICKS: Record<string, AmazonPick[]> = {
  pests: [P.insecticide, P.scale, P.slug, P.tweezers],
  'white-powder': [P.fungicide, P.scissors],
  'yellow-leaves': [P.soil, P.net, P.joro],
  'brown-tips': [P.shade, P.joro, P.mist],
  wilting: [P.joro, P.shade, P.autoWater],
  'leaf-drop': [P.frost, P.light, P.joro],
  'no-new-growth': [P.soil, P.net, P.okigoe],
  'dead-branches': [P.scissors, P.sealant],
  'soil-stays-wet': [P.soil, P.akadama, P.net],
  'water-not-absorbing': [P.soil, P.tsuchiire, P.joro],
  'no-flowers': [P.okigoe, P.scissors],
  'no-fruit': [P.okigoe, P.scissors],
}

export function amazonPicksForShojo(slug: string): AmazonPickSet | null {
  const picks = SHOJO_PICKS[slug]
  return picks ? { heading: 'すぐに手当てしたいとき（Amazon）', note: DELIVERY_NOTE, picks } : null
}

// 記事（/guides/[slug]）：話題がはっきりした記事だけ
const ARTICLE_PICKS: Record<string, AmazonPick[]> = {
  'article-9': [P.scissors, P.tweezers, P.wire, P.wireCutter, P.tsuchiire, P.joro, P.toolSet],
  'article-11': [P.scissors, P.joro, P.soil, P.okigoe],
  'article-4': [P.scissors, P.tweezers, P.joro, P.soil],
  'article-24': [P.scissors, P.tweezers, P.wire],
  'article-7': [P.scissors, P.wire, P.wireCutter, P.sealant],
  'article-16': [P.soil, P.akadama, P.net, P.tsuchiire, P.wire, P.pot],
  'bonsai-repotting-master-guide-2025': [P.soil, P.akadama, P.net, P.tsuchiire, P.pot],
  'bonsai-root-bound-prevention-solutions': [P.soil, P.net, P.tsuchiire, P.pot],
  'soil-science-ph-nutrition-guide': [P.akadama, P.soil, P.net],
  'root-microbiome-symbiosis-guide': [P.soil, P.okigoe],
  'article-8': [P.okigoe, P.liquid],
  'bonsai-watering-master-guide-2025': [P.joro, P.mist, P.autoWater],
  'article-18': [P.joro, P.mist],
  'article-19': [P.joro, P.soil],
  'article-23': [P.autoWater, P.wick, P.shade],
  'iot-smart-watering-automation-guide': [P.autoWater, P.wick],
  'bonsai-pest-control-natural-methods': [P.insecticide, P.scale, P.fungicide, P.tweezers],
  'bonsai-winter-care-failure-prevention': [P.frost, P.joro],
  'bonsai-summer-heat-damage-prevention': [P.shade, P.joro, P.autoWater],
  'indoor-photosynthesis-optimization-guide': [P.light],
  'bonsai-indoor-cultivation-success-guide': [P.light, P.mist],
  'kokedama-guide': [P.kokedamaKit, P.mist],
  'bonsai-disease-guide': [P.fungicide, P.scissors, P.mist],
  'bonsai-moss-guide': [P.moss, P.mist, P.tweezers],
  'bonsai-scissors-guide': [P.scissors, { label: '芽切りばさみ', keyword: '盆栽 芽切りばさみ' }, { label: '又枝切り', keyword: '盆栽 又枝切り' }, P.sealant],
  'bonsai-wire-guide': [P.wire, { label: '銅線（松柏向け）', keyword: '盆栽 銅線' }, P.wireCutter],
  'bonsai-display-guide': [P.stand],
  'senior-friendly-bonsai-guide': [P.scissors, P.joro],
  'children-bonsai-education-brain-development': [P.bonsaiKit, P.kokedamaKit],
}

// 贈り物の記事：盆栽そのものは楽天の特集で選び、Amazon は急ぎのときの道具・キットに
export const GIFT_AMAZON_PICKS: AmazonPickSet = {
  heading: '急いで届けたいとき（Amazon）',
  note: '盆栽の木そのものは、上の一覧や特集から選べます。Amazon は、道具やキットを急いで用意したいときに。届く日はお届け先によって変わります。',
  picks: [P.toolSet, P.kokedamaKit, P.bonsaiKit, P.stand],
}

export function amazonPicksForArticle(slug: string, isGift: boolean): AmazonPickSet | null {
  const picks = ARTICLE_PICKS[slug]
  if (picks) return { heading: 'この記事に出てくる道具・用品（Amazon）', note: DELIVERY_NOTE, picks }
  return isGift ? GIFT_AMAZON_PICKS : null
}

// 盆栽園のページ：園で選んだ樹を持ち帰ったあとの手入れに
export const GARDEN_AMAZON_PICKS: AmazonPickSet = {
  heading: '園で選んだ樹の手入れに（Amazon）',
  note: '持ち帰ったあとの水やり・植え替えに使うものです。園の商品ではありません。',
  picks: [P.joro, P.scissors, P.soil, P.net],
}

// 今月の手入れ（/teire/[month]）
const MONTH_PICKS: Record<number, AmazonPick[]> = {
  1: [P.frost, P.sealant, P.scissors],
  2: [P.soil, P.net, P.tsuchiire, P.pot],
  3: [P.soil, P.akadama, P.net, P.okigoe],
  4: [P.okigoe, P.insecticide, P.tweezers],
  5: [P.scissors, P.insecticide, P.okigoe],
  6: [P.fungicide, P.insecticide, P.wire],
  7: [P.shade, P.joro, P.autoWater],
  8: [P.shade, P.autoWater, P.mist],
  9: [P.okigoe, P.insecticide, P.joro],
  10: [P.okigoe, P.wire, P.wireCutter],
  11: [P.frost, P.wire, P.tweezers],
  12: [P.frost, P.stand, P.scissors],
}

// トップに出す月の案内。11〜12月は、手入れの用品に加えて贈り物（道具セット・キット）を前に出す（年末の買い物の時期のため）
const HOME_MONTH_PICKS: Record<number, AmazonPick[]> = {
  11: [P.frost, P.toolSet, P.kokedamaKit, P.wire],
  12: [P.toolSet, P.kokedamaKit, P.stand, P.frost],
}

export function amazonPicksForHome(month: number): AmazonPickSet | null {
  const picks = HOME_MONTH_PICKS[month]
  if (!picks) return amazonPicksForMonth(month)
  return { heading: `${month}月の手入れと贈り物に（Amazon）`, note: DELIVERY_NOTE, picks }
}

export function amazonPicksForMonth(month: number): AmazonPickSet | null {
  const picks = MONTH_PICKS[month]
  return picks ? { heading: `${month}月の作業で使うもの（Amazon）`, note: DELIVERY_NOTE, picks } : null
}
