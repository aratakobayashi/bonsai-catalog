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
  'article-25': [P.light, P.mist, P.joro, P.stand],
  'indoor-bonsai-winter-care': [P.light, P.mist, P.frost],
  'indoor-bonsai-watering': [P.joro, P.mist, P.wick],
  'bonsai-indoor-cultivation-success-guide': [P.light, P.mist],
  'kokedama-guide': [P.kokedamaKit, P.mist],
  'bonsai-disease-guide': [P.fungicide, P.scissors, P.mist],
  'bonsai-moss-guide': [P.moss, P.mist, P.tweezers],
  'bonsai-scissors-guide': [P.scissors, { label: '芽切りばさみ', keyword: '盆栽 芽切りばさみ' }, { label: '又枝切り', keyword: '盆栽 又枝切り' }, P.sealant],
  'bonsai-wire-guide': [P.wire, { label: '銅線（松柏向け）', keyword: '盆栽 銅線' }, P.wireCutter],
  'bonsai-display-guide': [P.stand],
  'senior-friendly-bonsai-guide': [P.scissors, P.joro],
  'children-bonsai-education-brain-development': [P.bonsaiKit, P.kokedamaKit],
  // 作る記事：材料と道具
  'kokedama-making': [P.kokedamaKit, { label: 'ケト土', keyword: 'ケト土' }, P.moss, P.akadama],
  'bonsai-from-nursery-stock': [P.pot, P.soil, P.net, P.scissors, P.wire],
  'bonsai-cuttings': [{ label: '挿し木用の土', keyword: '挿し木 用土' }, { label: '鹿沼土（小粒）', keyword: '鹿沼土 小粒' }, { label: '育苗ポット・トレー', keyword: '育苗トレー ポット' }, { label: '発根促進剤', keyword: '発根促進剤 園芸', note: '使い方はラベルの表示どおりに' }],
  'bonsai-from-seed': [P.bonsaiKit, { label: '種まき用の土', keyword: '種まき用土' }, { label: '育苗ポット・トレー', keyword: '育苗トレー ポット' }, P.mist],
  'bonsai-forest-planting': [{ label: '盆栽の浅鉢（楕円・長方）', keyword: '盆栽鉢 楕円 浅鉢' }, P.soil, P.net, P.moss, P.wire],
  'moss-terrarium': [{ label: '苔テラリウムのキット', keyword: '苔テラリウム キット' }, { label: 'テラリウム用のガラス容器', keyword: 'テラリウム ガラス容器 蓋付き' }, { label: 'テラリウム用の土', keyword: 'テラリウム ソイル 苔' }, { label: 'ピンセット（ロング）', keyword: 'テラリウム ピンセット' }, P.mist],
  // 始める・買う・体験する記事：キットと最初の道具
  'bonsai-kit-guide': [P.bonsaiKit, P.kokedamaKit, P.toolSet, P.soil],
  'bonsai-experience-programs-complete-guide': [P.kokedamaKit, P.bonsaiKit, P.toolSet],
  'bonsai-pot-guide': [P.pot, P.net, P.soil, P.tsuchiire],
  'article-5': [P.scissors, P.tweezers, P.joro, P.toolSet],
  'beginner-tree-species-guide': [P.toolSet, P.scissors, P.joro],
  'beginner-bonsai-buying-guide-online-vs-store': [P.toolSet, P.scissors, P.joro, P.okigoe],
  'bonsai-online-sales-complete-guide': [P.joro, P.scissors, P.soil, P.okigoe],
}

// 年末の贈り物（お歳暮・クリスマス・正月）：急いで届けたいときの Amazon。届く日は Amazon の商品ページで確かめられる
const GIFT_RUSH_NOTE = 'Amazon の商品ページで、お届け先に届く日を確かめてから注文できます。盆栽そのものを比べたいときは、上の一覧や特集から。'
const kokedamaGift = { label: '苔玉のギフト', keyword: '苔玉 ギフト' }
const SEASON_GIFT_PICKS: Record<string, AmazonPickSet> = {
  oseibo: {
    heading: 'お歳暮を急いで届けたいとき（Amazon）',
    note: GIFT_RUSH_NOTE,
    picks: [{ label: 'お歳暮向けの盆栽ギフト', keyword: '盆栽 お歳暮 ギフト' }, kokedamaGift, { label: '盆栽の道具セット（贈り物に）', keyword: '盆栽 道具セット' }, P.stand],
  },
  christmas: {
    heading: 'クリスマスに間に合わせたいとき（Amazon）',
    note: GIFT_RUSH_NOTE,
    picks: [{ label: 'クリスマス向けのミニ盆栽', keyword: 'ミニ盆栽 クリスマス プレゼント' }, kokedamaGift, P.kokedamaKit, P.bonsaiKit],
  },
  newyear: {
    heading: '正月飾りを急いで用意したいとき（Amazon）',
    note: GIFT_RUSH_NOTE,
    picks: [{ label: '正月飾りの盆栽・寄せ植え', keyword: '正月 盆栽 寄せ植え' }, { label: '松竹梅の盆栽', keyword: '松竹梅 盆栽' }, P.stand, { label: '盆栽の敷板・花台', keyword: '盆栽 敷板' }],
  },
}
const SEASON_BY_SLUG: Record<string, string> = {
  'oseibo-bonsai': 'oseibo', 'oseibo-bonsai-gift': 'oseibo',
  'christmas-bonsai': 'christmas', 'christmas-bonsai-guide': 'christmas',
  'new-year-bonsai': 'newyear', 'new-year-bonsai-display': 'newyear',
}
export const seasonGiftPicks = (slug: string): AmazonPickSet | null => SEASON_GIFT_PICKS[SEASON_BY_SLUG[slug]] ?? null
// 年末の特集で、商品一覧のすぐ下に出す Amazon の検索語
export const SEASON_RUSH_KEYWORD: Record<string, { keyword: string; label: string }> = {
  'oseibo-bonsai': { keyword: '盆栽 お歳暮 ギフト', label: 'お歳暮の盆栽ギフト' },
  'christmas-bonsai': { keyword: 'ミニ盆栽 クリスマス プレゼント', label: 'クリスマスのミニ盆栽' },
  'new-year-bonsai': { keyword: '正月 盆栽 寄せ植え', label: '正月飾りの盆栽' },
}

// 贈り物の記事：盆栽そのものは楽天の特集で選び、Amazon は急ぎのときの道具・キットに
export const GIFT_AMAZON_PICKS: AmazonPickSet = {
  heading: '急いで届けたいとき（Amazon）',
  note: '盆栽の木そのものは、上の一覧や特集から選べます。Amazon は、道具やキットを急いで用意したいときに。届く日はお届け先によって変わります。',
  picks: [P.toolSet, P.kokedamaKit, P.bonsaiKit, P.stand],
}

// 個別の指定がない記事：樹種の記事はその樹種の盆栽と手入れの道具、それ以外は記事のカテゴリに合う道具
const CATEGORY_PICKS: Record<string, AmazonPick[]> = {
  'basic-care': [P.joro, P.scissors, P.okigoe, P.soil],
  beginner: [P.toolSet, P.scissors, P.joro, P.okigoe],
  troubleshooting: [P.insecticide, P.fungicide, P.scissors, P.soil],
  scientific: [P.soil, P.okigoe, P.joro],
  shopping: [P.toolSet, P.pot, P.soil, P.stand],
  enjoyment: [P.stand, P.toolSet, P.kokedamaKit],
  experience: [P.kokedamaKit, P.bonsaiKit, P.toolSet],
  events: [P.stand, P.joro, P.scissors],
  international: [P.toolSet, P.scissors, P.joro],
  species: [P.scissors, P.okigoe, P.joro, P.soil],
}

export function amazonPicksForArticle(slug: string, isGift: boolean, context: { category?: string; speciesLabel?: string | null; isSupply?: boolean } = {}): AmazonPickSet | null {
  const season = seasonGiftPicks(slug)
  if (season) return season
  const picks = ARTICLE_PICKS[slug]
  if (picks) return { heading: 'この記事に出てくる道具・用品（Amazon）', note: DELIVERY_NOTE, picks }
  if (isGift) return GIFT_AMAZON_PICKS
  if (context.speciesLabel && !context.isSupply) {
    const name = context.speciesLabel.split('・')[0]
    return { heading: `${name}の盆栽と手入れの道具（Amazon）`, note: DELIVERY_NOTE, picks: [{ label: `${name}の盆栽`, keyword: `${name} 盆栽` }, P.scissors, P.okigoe, P.joro] }
  }
  const byCategory = context.category ? CATEGORY_PICKS[context.category] : undefined
  return byCategory ? { heading: 'あわせて使う道具・用品（Amazon）', note: DELIVERY_NOTE, picks: byCategory } : null
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
  11: [{ label: 'お歳暮向けの盆栽ギフト', keyword: '盆栽 お歳暮 ギフト' }, P.toolSet, P.kokedamaKit, P.frost],
  12: [{ label: 'クリスマス向けのミニ盆栽', keyword: 'ミニ盆栽 クリスマス プレゼント' }, { label: '正月飾りの盆栽・寄せ植え', keyword: '正月 盆栽 寄せ植え' }, P.toolSet, P.stand],
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

// 特集（/selection/[slug]）：特集の盆栽と一緒に使う用品。贈り物の特集は、急ぎのときの道具・キット
const SELECTION_PICKS: Record<string, AmazonPick[]> = {
  'indoor-bonsai': [P.light, P.mist, P.joro, P.stand],
  'beginner-mini-bonsai': [P.scissors, P.joro, P.tweezers, P.okigoe],
  'bonsai-under-3000': [P.scissors, P.joro, P.toolSet],
  'starter-tools': [P.toolSet, P.scissors, P.wire, P.tsuchiire, P.soil],
  'winter-bonsai': [P.frost, P.light, P.mist],
  'evergreen-bonsai': [P.scissors, P.wire, P.okigoe],
  'autumn-leaves-bonsai': [P.scissors, P.okigoe, P.joro],
  'flowering-bonsai': [P.okigoe, P.scissors, P.insecticide],
  'fruit-bonsai': [P.okigoe, P.scissors, P.insecticide],
}
const GIFT_SELECTION_SLUGS = new Set(['bonsai-gift', 'celebration-bonsai', 'oseibo-bonsai', 'christmas-bonsai', 'new-year-bonsai', 'premium-bonsai'])

export function amazonPicksForSelection(slug: string): AmazonPickSet | null {
  const season = seasonGiftPicks(slug)
  if (season) return season
  if (GIFT_SELECTION_SLUGS.has(slug)) return GIFT_AMAZON_PICKS
  const picks = SELECTION_PICKS[slug]
  return picks ? { heading: 'あわせて使う道具・用品（Amazon）', note: DELIVERY_NOTE, picks } : null
}

// はじめての1か月（/hajimete）：届いた日からの世話に使うもの
export const HAJIMETE_AMAZON_PICKS: AmazonPickSet = {
  heading: '届いた盆栽の世話に使うもの（Amazon）',
  note: DELIVERY_NOTE,
  picks: [P.joro, P.scissors, P.okigoe, P.soil, P.net, P.toolSet],
}

// 室内で育てられる？（/shitsunai）：室内に置くときに使うもの
export const SHITSUNAI_AMAZON_PICKS: AmazonPickSet = {
  heading: '室内に置くときに使うもの（Amazon）',
  note: DELIVERY_NOTE,
  picks: [P.light, P.mist, P.joro, P.stand],
}

// 体験・教室（/taiken）の「家で始める」：キットごとの Amazon の検索語
export const TAIKEN_KIT_AMAZON: Record<string, AmazonPick> = {
  kokedama: P.kokedamaKit,
  grow: P.bonsaiKit,
  set: P.toolSet,
}

// 盆栽展（/events）：即売で選んだ樹の、持ち帰ったあとの手入れに
export const EVENT_AMAZON_PICKS: AmazonPickSet = {
  heading: '盆栽展で樹を選んだら（Amazon）',
  note: '即売などで買った樹の、持ち帰ったあとの水やり・植え替えに使うものです。会場の商品ではありません。',
  picks: [P.joro, P.scissors, P.soil, P.net, P.stand],
}

// 一覧系のページ
export const SHOJO_INDEX_AMAZON_PICKS: AmazonPickSet = { heading: 'よく使う手当ての用品（Amazon）', note: DELIVERY_NOTE, picks: [P.insecticide, P.fungicide, P.soil, P.joro] }
export const ZUKAN_AMAZON_PICKS: AmazonPickSet = { heading: '樹形づくりに使う道具（Amazon）', note: DELIVERY_NOTE, picks: [P.wire, P.wireCutter, P.scissors, P.toolSet] }
export const KUMIAWASE_AMAZON_PICKS: AmazonPickSet = { heading: '自分で植え替えるときに（Amazon）', note: DELIVERY_NOTE, picks: [P.pot, P.soil, P.net, P.moss] }
export const NOTE_AMAZON_PICKS: AmazonPickSet = { heading: '毎日の手入れに使うもの（Amazon）', note: DELIVERY_NOTE, picks: [P.joro, P.scissors, P.okigoe, P.tweezers] }
