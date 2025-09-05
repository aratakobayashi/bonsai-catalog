import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

// Server Component用のSupabaseクライアント
// 環境変数のフォールバック値を設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 環境変数が設定されていない場合のエラーハンドリング
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase環境変数が未設定です。環境変数を確認してください。')
}

// サーバーサイド用のSupabaseクライアント作成
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false
    }
  }
)