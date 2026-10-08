// 商品データの共通の形（Amazon・楽天）。サーバー・クライアントのどちらからでも使える
import type { ProductType } from '@/lib/product-classify'
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
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeProduct(row: any): CatalogProduct {
  const source: ProductSource = row.source === 'rakuten' ? 'rakuten' : 'amazon'
  const tags: string[] = Array.isArray(row.tags) ? row.tags : []
  const isAmazon = source === 'amazon'
  return {
    id: row.id,
    name: source === 'rakuten' ? cleanProductName(row.name) : row.name,
    originalName: row.name,
    price: Number(row.price) || 0,
    imageUrl: row.image_url || null,
    source,
    buyUrl: (isAmazon ? row.amazon_url : row.rakuten_url) || null,
    shopName: row.shop_name || (isAmazon ? 'Amazon' : '楽天市場'),
    productType: (row.product_type as ProductType) || 'tree',
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
    indoor: isAmazon ? tags.some(t => t.includes('室内')) : row.indoor_suitable === true,
    gift: isAmazon ? row.gift_suitable === true || tags.some(t => t.includes('ギフト')) : row.gift_suitable === true,
    beginner: isAmazon ? row.difficulty_level === 1 || tags.includes('初心者向け') : row.beginner_friendly === true,
    difficulty: row.difficulty_level ?? null,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
