#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 環境変数が設定されていません:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateArticle44Eyecatch() {
  try {
    console.log('🖼️ 記事44のアイキャッチ画像を更新中...')

    // 記事44のfeaturedImageを更新
    const { data, error } = await supabase
      .from('articles')
      .update({
        featured_image_url: '/images/articles/article-44-img-1.png',
        featured_image_alt: 'article-44のアイキャッチ画像'
      })
      .eq('slug', 'article-44')
      .select('id, title, featured_image_url')

    if (error) {
      console.error('❌ 更新エラー:', error)
      process.exit(1)
    }

    if (data && data.length > 0) {
      console.log('✅ 記事44のアイキャッチ画像を更新しました！')
      console.log('📄 タイトル:', data[0].title)
      console.log('🖼️ 新しい画像URL:', data[0].featured_image_url)
    } else {
      console.log('⚠️ 記事44が見つかりませんでした')
    }

  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
    process.exit(1)
  }
}

updateArticle44Eyecatch()