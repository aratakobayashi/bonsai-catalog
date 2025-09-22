export type SizeCategory = 'mini' | 'small' | 'medium' | 'large' | 'unknown'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season'
export type Location = 'indoor' | 'outdoor' | 'semi-shade'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  tags: string[]
  size_category: SizeCategory
  season?: Season
  location?: Location
  image_url: string
  amazon_url: string
  created_at: string
  updated_at: string
  // UI拡張フィールド
  difficulty_level?: number // 1=簡単, 2=普通, 3=難しい
  height_cm?: number
  width_cm?: number
  pot_diameter_cm?: number
  care_frequency?: string
  sunlight_requirement?: string
  watering_frequency?: string
  bloom_months?: number[]
  foliage_months?: number[]
  indoor_suitable?: boolean
  gift_suitable?: boolean
  beginner_friendly?: boolean
}

export interface Garden {
  // 既存フィールド
  id: string
  name: string
  address: string
  description: string
  image_url?: string
  website_url?: string
  phone?: string
  created_at: string
  updated_at: string
  
  // 拡張フィールド - 位置情報
  prefecture?: string           // 都道府県
  city?: string                // 市区町村
  postal_code?: string         // 郵便番号
  latitude?: number            // 緯度
  longitude?: number           // 経度
  
  // 営業情報
  business_hours?: string      // 営業時間
  closed_days?: string[]       // 定休日
  
  // 専門性・特徴
  specialties?: string[]       // 専門分野（松柏類、雑木類、花もの、実もの、草もの等）
  established_year?: number    // 創業年
  
  // 園主情報
  owner_name?: string         // 園主名
  owner_message?: string      // 園主からのメッセージ
  
  // アクセス情報
  access_info?: string        // アクセス情報
  parking_info?: string       // 駐車場情報
  
  // サービス情報
  experience_programs?: boolean // 体験教室の有無
  online_sales?: boolean       // オンライン販売対応
  
  // 評価情報
  rating?: number             // 評価（0-5）
  review_count?: number       // レビュー数
  featured?: boolean          // 注目園フラグ
  
  // 追加コンテンツ
  additional_images?: string[] // 追加画像
  
  // SNSリンク
  social_instagram?: string    // Instagram URL
  social_twitter?: string      // Twitter URL  
  social_facebook?: string     // Facebook URL
}

export interface ProductFilters {
  category?: string
  tags?: string[]
  size_category?: SizeCategory
  price_min?: number
  price_max?: number
  search?: string
  season?: string[]
  location?: string[]
  beginner_friendly?: boolean
}

// 盆栽園の専門分野enum
export type GardenSpecialty = 
  | '松柏類'         // 松、真柏、杜松等
  | '雑木類'         // もみじ、欅、ブナ等
  | '花もの'         // 桜、梅、ツツジ等
  | '実もの'         // 柿、南天、ピラカンサ等
  | '草もの'         // 山野草、苔等
  | '山野草'         // 山野草専門
  | '盆器'           // 鉢専門
  | '道具'           // 道具専門
  | '古典盆栽'       // 伝統的盆栽
  | '現代盆栽'       // モダン盆栽
  | '初心者向け'     // 初心者サポート
  | '上級者向け'     // 高度な技術

// 盆栽園フィルター用の型
export interface GardenFilters {
  prefecture?: string
  city?: string
  specialties?: GardenSpecialty[]
  has_experience_programs?: boolean
  has_online_sales?: boolean
  has_parking?: boolean
  min_rating?: number
  featured_only?: boolean
  search?: string
}

// 記事関連の型定義
export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: {
    url: string
    alt?: string
    width?: number
    height?: number
  }
  category: ArticleCategory // メインカテゴリー（後方互換性）
  categories?: string[] // 複数カテゴリー（新機能）
  tags?: ArticleTag[]
  relatedProducts?: string[] // 商品IDの配列
  seoTitle?: string
  seoDescription?: string
  readingTime?: number // 分
  publishedAt: string
  updatedAt: string
  status?: 'draft' | 'published'
}

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string // UI表示用の色（例: 'bg-green-100 text-green-800'）
  icon?: string // アイコン（例: '🌱'）
}

export interface ArticleTag {
  id: string
  name: string
  slug: string
  color?: string // UI表示用の色
}

// 記事フィルター用
export interface ArticleFilters {
  category?: string
  tags?: string[]
  search?: string
  page?: number
  limit?: number
  sortBy?: 'publishedAt' | 'updatedAt' | 'readingTime' | 'title'
  sortOrder?: 'asc' | 'desc'
}

// 記事一覧のレスポンス型
export interface ArticleListResponse {
  articles: Article[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// イベント関連の型定義
export type EventType = 'exhibition' | 'sale' | 'workshop' | 'lecture'
export type EventPriceType = 'free' | 'paid'
export type EventRelationType = 'announcement' | 'report' | 'summary'

export interface Event {
  id: string
  title: string
  slug: string
  start_date: string
  end_date: string
  prefecture: string
  venue_name?: string
  address?: string
  lat?: number
  lng?: number
  types: EventType[]
  price_type: EventPriceType
  price_note?: string
  organizer_name?: string
  official_url?: string
  garden_id?: string
  related_product_tags?: string[]
  description?: string
  created_at: string
  updated_at: string
  garden?: Garden
}

export interface EventArticle {
  id: string
  event_id: string
  article_id: string
  relation_type: EventRelationType
  created_at: string
  article?: Article
}

export interface EventSearchParams {
  prefecture?: string
  types?: EventType[]
  garden_id?: string
  month?: string
  search?: string
  view?: 'month' | 'list' | 'map'
  page?: number
  limit?: number
}

export interface EventsResponse {
  events: Event[]
  total: number
  page: number
  limit: number
  prefectures: string[]
  upcoming_count: number
}