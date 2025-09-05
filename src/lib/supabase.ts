import { createClient } from '@supabase/supabase-js'
import type { Product, Garden } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    }
  }
}