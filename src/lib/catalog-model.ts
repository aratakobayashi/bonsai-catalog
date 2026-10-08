// 商品データの共通の形（Amazon・楽天）。サーバー・クライアントのどちらからでも使える
import type { ProductType } from '@/lib/product-classify'
import { findSpeciesTrait, type Enjoy, type Level, type Place, type Season } from '@/lib/species-traits'
import { cleanProductName } from '@/lib/product-name'
import type { SizeCategory } from '@/types'

export type ProductSource = 'amazon' | 'rakuten'

export interface CatalogProduct {
  id: string
  // 表示用の名前（楽天の商品は宣伝文句などを除いたもの）
  name: string
  // 販売ページの元の商品名（検索・絞り込みに使う）
  originalName: string
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
  indoor: boolean
  gift: boolean
  beginner: boolean
  difficulty: number | null
  // 樹種から判定した一般的な性質（鉢・土・道具などは null）
  speciesLabel: string | null
  place: Place | null
  enjoy: Enjoy[]
  seasons: Season[]
  level: Level | null
  // 商品名の表記から判定した用途・付属品
  newYear: boolean
  celebration: boolean
  wrapping: boolean
  saucer: boolean
  careGuide: boolean
}

const PLANT_TYPES: ProductType[] = ['tree', 'kokedama', 'kit', 'seed']
const NEW_YEAR_SPECIES = ['goyomatsu', 'kuromatsu', 'akamatsu', 'ume', 'nanten', 'senryo']

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeProduct(row: any): CatalogProduct {
  const source: ProductSource = row.source === 'rakuten' ? 'rakuten' : 'amazon'
  const tags: string[] = Array.isArray(row.tags) ? row.tags : []
  const isAmazon = source === 'amazon'
  const name: string = row.name || ''
  const productType = (row.product_type as ProductType) || 'tree'
  const trait = PLANT_TYPES.includes(productType) ? findSpeciesTrait(name) : null
  const indoorClaim = isAmazon ? tags.some(t => t.includes('室内')) : row.indoor_suitable === true
  const beginnerClaim = isAmazon ? row.difficulty_level === 1 || tags.includes('初心者向け') : row.beginner_friendly === true
  return {
    id: row.id,
    name: source === 'rakuten' ? cleanProductName(row.name) : row.name,
    originalName: row.name,
    price: Number(row.price) || 0,
    imageUrl: row.image_url || null,
    source,
    buyUrl: (isAmazon ? row.amazon_url : row.rakuten_url) || null,
    shopName: row.shop_name || (isAmazon ? 'Amazon' : '楽天市場'),
    productType,
    category: row.category || 'その他',
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
    speciesLabel: trait?.label ?? null,
    // 販売店が「室内」と書いている商品は室内向きとして扱う
    place: indoorClaim ? 'indoor' : trait?.place ?? null,
    enjoy: trait?.enjoy ?? [],
    seasons: trait?.seasons ?? [],
    level: beginnerClaim ? 'easy' : trait?.level ?? null,
    newYear: /正月|迎春|新年|松竹梅|お年賀/.test(name) || (trait !== null && NEW_YEAR_SPECIES.includes(trait.key)),
    celebration: /祝|長寿(?!梅)|還暦|古希|喜寿|米寿|敬老|開店|新築|誕生日|記念日/.test(name),
    wrapping: /ラッピング|のし|熨斗|メッセージカード|ギフト包装/.test(name),
    saucer: /受け皿|受皿|水受け/.test(name),
    careGuide: /育て方|説明書|栽培方法|管理方法/.test(name),
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
