#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// .env.localを読み込み
dotenv.config({ path: path.join(__dirname, '.env.local') })

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateOnlineSalesEyecatch() {
  try {
    console.log('🖼️ bonsai-online-sales-complete-guideのアイキャッチ画像を更新中...')

    // bonsai-online-sales-complete-guideのfeaturedImageを更新
    const { data, error } = await supabase
      .from('articles')
      .update({
        featured_image_url: '/images/articles/bonsai-online-sales-complete-guide-img-1.png',
        featured_image_alt: 'bonsai-online-sales-complete-guideのアイキャッチ画像'
      })
      .eq('slug', 'bonsai-online-sales-complete-guide')
      .select('id, title, featured_image_url')

    if (error) {
      console.error('❌ 更新エラー:', error)
      process.exit(1)
    }

    if (data && data.length > 0) {
      console.log('✅ bonsai-online-sales-complete-guideのアイキャッチ画像を更新しました！')
      console.log('📄 タイトル:', data[0].title)
      console.log('🖼️ 新しい画像URL:', data[0].featured_image_url)
    } else {
      console.log('⚠️ bonsai-online-sales-complete-guideが見つかりませんでした')
    }

  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
    process.exit(1)
  }
}

updateOnlineSalesEyecatch()