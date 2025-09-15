import { createClient } from '@supabase/supabase-js'
import type { Product, Garden, Article, ArticleCategory, ArticleTag } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// データベース用の記事型（Supabase向けに調整）
export interface DatabaseArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image_url?: string
  featured_image_alt?: string
  category_id: string
  tag_ids?: string[]
  related_product_ids?: string[]
  seo_title?: string
  seo_description?: string
  reading_time?: number
  published_at: string
  updated_at: string
  created_at: string
  status: 'draft' | 'published'
}

export interface DatabaseArticleCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface DatabaseArticleTag {
  id: string
  name: string
  slug: string
  color?: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      gardens: {
        Row: Garden
        Insert: Omit<Garden, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Garden, 'id' | 'created_at' | 'updated_at'>>
      }
      articles: {
        Row: DatabaseArticle
        Insert: Omit<DatabaseArticle, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DatabaseArticle, 'id' | 'created_at' | 'updated_at'>>
      }
      article_categories: {
        Row: DatabaseArticleCategory
        Insert: Omit<DatabaseArticleCategory, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DatabaseArticleCategory, 'id' | 'created_at' | 'updated_at'>>
      }
      article_tags: {
        Row: DatabaseArticleTag
        Insert: Omit<DatabaseArticleTag, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DatabaseArticleTag, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}