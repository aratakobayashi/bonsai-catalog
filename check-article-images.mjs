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

async function checkArticleImages() {
  console.log('🔍 記事のアイキャッチ画像設定を確認中...\n')

  const articleSlugs = ['article-41', 'article-43', 'article-44', 'article-45']

  for (const slug of articleSlugs) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, featured_image_url, featured_image_alt')
        .eq('slug', slug)
        .single()

      if (error) {
        console.error(`❌ ${slug} の取得エラー:`, error)
        continue
      }

      if (data) {
        console.log(`📝 ${slug}`)
        console.log(`   📄 タイトル: ${data.title}`)
        console.log(`   🖼️ 画像URL: ${data.featured_image_url || 'なし'}`)
        console.log(`   🏷️ 画像ALT: ${data.featured_image_alt || 'なし'}`)
        console.log()
      } else {
        console.log(`⚠️ ${slug} が見つかりませんでした\n`)
      }

    } catch (error) {
      console.error(`❌ ${slug} で予期しないエラー:`, error)
    }
  }
}

checkArticleImages()