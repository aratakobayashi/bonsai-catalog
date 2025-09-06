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
  specialties?: string[]       // 専門分野（松類、花木、山野草等）
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
}

// 盆栽園の専門分野enum
export type GardenSpecialty = 
  | '松類'           // 松の専門
  | '落葉樹'         // もみじ、欅等
  | '花木'           // 桜、梅、ツツジ等
  | '針葉樹'         // 真柏、杜松等
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