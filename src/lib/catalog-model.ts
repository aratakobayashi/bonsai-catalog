// 商品データの共通の形（Amazon・楽天）。サーバー・クライアントのどちらからでも使える
import { productHeading } from '@/lib/product-heading'
import type { ProductType } from '@/lib/product-classify'
import { findSpeciesTrait, speciesCandidates, type Enjoy, type Level, type Place, type Season } from '@/lib/species-traits'
import { cleanProductName, shortProductName, stripPromoText } from '@/lib/product-name'
import productImages from '@/data/product-images.json'

// 楽天の1枚目は文字やバナー入りの宣伝画像が多いため、ショップが登録した候補（最大3枚）から
// 盆栽が一番よく見える1枚を選んだもの（src/data/product-images.json）があれば、そちらを使う。画像そのものは加工しない
const CHOSEN_IMAGES = productImages as Record<string, string>
function chosenImage(id: unknown, stored: unknown): string | null {
  const chosen = typeof id === 'string' ? CHOSEN_IMAGES[id] : undefined
  return chosen || (typeof stored === 'string' && stored ? stored : null)
}
import type { SizeCategory } from '@/types'

export type ProductSource = 'amazon' | 'rakuten'

export interface CatalogProduct {
  id: string
  // 表示用の名前（楽天の商品は宣伝文句などを除いたもの）
  name: string
  // 販売ページの元の商品名（検索・絞り込みに使う）
  originalName: string
  // 一覧のカード向けの短い名前（先頭の「盆栽」「ミニ盆栽」や繰り返しのキーワードを除いたもの）
  displayName: string
  // 販売ページの元の商品名から、期限のある宣伝文句（【マラソン…】【10%OFF…】など）だけを除いたもの（表示用）
  originalDisplayName: string
  price: number
  imageUrl: string | null
  source: ProductSource
  buyUrl: string | null
  shopName: string
  productType: ProductType
  category: string
  sizeCategory: SizeCategory
  heightCm: number | null
  reviewCount: number
  reviewAverage: number
  freeShipping: boolean | null
  createdAt: string
  lastSyncedAt: string | null
  syncCategory: string | null
  tags: string[]
  // 販売店の表記（「室内」「初心者」など）があるか。置き場所・育てやすさの判定とは別の情報
  indoor: boolean
  gift: boolean
  beginner: boolean
  difficulty: number | null
  // 樹種から判定した一般的な性質（鉢・土・道具などは null）
  // speciesKey は species-traits の key（= 樹種カテゴリの slug。seasons.ts の見頃にも使う）
  speciesKey: string | null
  speciesLabel: string | null
  // 置き場所・育てやすさ：樹種が分かるときは樹種の一般的な性質、分からないときだけ販売店の表記から
  place: Place | null
  enjoy: Enjoy[]
  seasons: Season[]
  level: Level | null
  // 販売店の表記（「販売店の表記：室内向け」などの表示用。樹種の性質と食い違うことがある）
  placeClaim: 'indoor' | undefined
  levelClaim: 'easy' | undefined
  // 商品名の表記から判定した用途・付属品
  newYear: boolean
  celebration: boolean
  wrapping: boolean
  saucer: boolean
  careGuide: boolean
}

const PLANT_TYPES: ProductType[] = ['tree', 'kokedama', 'kit', 'seed']
const PART_TYPES: ProductType[] = ['pot', 'soil', 'tool', 'wire', 'fertilizer']

// 取り込み時に樹種のカテゴリで探したため「盆栽（樹）」になっている道具・針金・肥料を、商品名から正しい種類に直す
// 「道具セット」「肥料付き」「針金付き」のように、盆栽に付いてくるものは盆栽のまま
const BUNDLED = /セット|付き|付属|付|サービス|プレゼント|分|おまけ|特典/
const TOOL_NAME = /鋏|はさみ|ハサミ|ばさみ|バサミ|ピンセット|ジョウロ|じょうろ|如雨露|ヤットコ|又枝切|根切|カットパスター|癒合剤|切口被覆|土入れ|盆栽道具/
const WIRE_NAME = /針金|アルミ線|銅線|ワイヤー/
const FERTILIZER_NAME = /肥料|置き肥|置肥|油かす|油粕|液肥|活力剤/
const BOOK_NAME = /書籍|育て方本|ブック|^本[：:]/

export function refineProductType(stored: ProductType, name: string): ProductType {
  const text = stripPromoText(name || '')
  if (BOOK_NAME.test(text)) return stored === 'tree' ? 'other' : stored
  if (!['tree', 'other', 'pot', 'soil', 'kit'].includes(stored)) return stored
  if (stored !== 'soil' && WIRE_NAME.test(text) && !BUNDLED.test(text) && !/樹齢|年生|苗/.test(text)) return 'wire'
  if (['tree', 'other', 'kit'].includes(stored) && FERTILIZER_NAME.test(text) && !BUNDLED.test(text.replace(FERTILIZER_NAME, ''))) return 'fertilizer'
  if (TOOL_NAME.test(text)) {
    // 「盆栽道具」で始まる商品（土入れ・鋏など）は道具。それ以外は、盆栽とのセットでないときだけ道具にする
    if (/^盆栽道具/.test(text) && stored !== 'pot') return 'tool'
    if (!BUNDLED.test(text) && !/樹齢|年生|苗|実生/.test(text)) return 'tool'
  }
  return stored
}
const NEW_YEAR_SPECIES = ['goyomatsu', 'kuromatsu', 'akamatsu', 'ume', 'nanten', 'senryo']

/* eslint-disable @typescript-eslint/no-explicit-any */
// 一覧・カードの商品名も、商品ページの見出しと同じ「品種・樹種の盆栽｜特徴」の短い名前にする（src/lib/product-heading.ts）
export function normalizeProduct(row: any): CatalogProduct {
  const base = normalizeProductBase(row)
  return { ...base, displayName: base.source === 'rakuten' ? productHeading(base, base.displayName) : base.displayName }
}

function normalizeProductBase(row: any): CatalogProduct {
  const source: ProductSource = row.source === 'rakuten' ? 'rakuten' : 'amazon'
  const tags: string[] = Array.isArray(row.tags) ? row.tags : []
  const isAmazon = source === 'amazon'
  const name: string = row.name || ''
  const storedType = (row.product_type as ProductType) || 'tree'
  const productType = refineProductType(storedType, name)
  const trait = PLANT_TYPES.includes(productType) ? findSpeciesTrait(name) : null
  const indoorClaim = isAmazon ? tags.some(t => t.includes('室内')) : row.indoor_suitable === true
  const beginnerClaim = isAmazon ? row.difficulty_level === 1 || tags.includes('初心者向け') : row.beginner_friendly === true
  const isPlant = PLANT_TYPES.includes(productType)
  // 樹種を1つに決められない商品（「長寿梅 五葉松 桜から選べる」など）でも、書かれている樹種の性質がそろっていればそれを使う
  const candidates = isPlant && !trait ? speciesCandidates(name) : []
  const sharedPlace = candidates.length && candidates.every(c => c.place === candidates[0].place) ? candidates[0].place : null
  const sharedLevel = candidates.length && candidates.every(c => c.level === candidates[0].level) ? candidates[0].level : null
  return {
    id: row.id,
    name: source === 'rakuten' ? cleanProductName(row.name) : row.name,
    originalName: row.name,
    displayName: shortProductName(name, trait?.label),
    originalDisplayName: stripPromoText(name),
    price: Number(row.price) || 0,
    imageUrl: chosenImage(row.id, row.image_url),
    source,
    buyUrl: (isAmazon ? row.amazon_url : row.rakuten_url) || null,
    shopName: row.shop_name || (isAmazon ? 'Amazon' : '楽天市場'),
    productType,
    // 種類を直した道具などは、分類も「鉢・道具」にそろえる
    category: PART_TYPES.includes(productType) && !PART_TYPES.includes(storedType) ? '鉢・道具' : row.category || 'その他',
    sizeCategory: (row.size_category as SizeCategory) || 'unknown',
    heightCm: row.height_cm ?? null,
    reviewCount: Number(row.review_count) || 0,
    reviewAverage: Number(row.review_average) || 0,
    freeShipping: typeof row.free_shipping === 'boolean' ? row.free_shipping : null,
    createdAt: row.created_at,
    lastSyncedAt: row.last_synced_at ?? null,
    syncCategory: row.sync_category ?? null,
    tags,
    // Amazon の既存データは列の既定値（true）が入っているため、明示的な情報（難易度・タグ）から判定する
    indoor: indoorClaim,
    gift: isAmazon ? row.gift_suitable === true || tags.some(t => t.includes('ギフト')) : row.gift_suitable === true,
    beginner: beginnerClaim,
    difficulty: row.difficulty_level ?? null,
    speciesKey: trait?.key ?? null,
    speciesLabel: trait?.label ?? null,
    // 樹種が分かるときは樹種の性質を優先する（黒松に「室内」と書かれていても屋外向き）。
    // 樹種が分からない盆栽・苔玉だけ、販売店の表記を使う（書かれている樹種の性質がそろっていればそちらを優先）
    place: trait ? trait.place : sharedPlace ?? (isPlant && indoorClaim ? 'indoor' : null),
    enjoy: trait?.enjoy ?? [],
    seasons: trait?.seasons ?? [],
    level: trait ? trait.level : sharedLevel ?? (isPlant && beginnerClaim ? 'easy' : null),
    placeClaim: indoorClaim ? 'indoor' : undefined,
    levelClaim: beginnerClaim ? 'easy' : undefined,
    newYear: /正月|迎春|新年|松竹梅|お年賀/.test(name) || (trait !== null && NEW_YEAR_SPECIES.includes(trait.key)),
    celebration: /祝|長寿(?!梅)|還暦|古希|喜寿|米寿|敬老|開店|新築|誕生日|記念日/.test(name),
    wrapping: /ラッピング|のし(?!おり)|熨斗|メッセージカード|ギフト包装/.test(name),
    saucer: /受け皿|受皿|水受け/.test(name),
    careGuide: /育て方|説明書|栽培方法|管理方法/.test(name),
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
