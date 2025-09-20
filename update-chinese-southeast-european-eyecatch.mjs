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

// 更新対象の記事とファイル名
const articlesToUpdate = [
  { slug: 'chinese-penjing-vs-japanese-bonsai', imageUrl: '/images/articles/chinese-penjing-vs-japanese-bonsai-img-1.png' },
  { slug: 'southeast-asia-tropical-bonsai', imageUrl: '/images/articles/southeast-asia-tropical-bonsai-img-1.png' },
  { slug: 'european-bonsai-climate-adaptation', imageUrl: '/images/articles/european-bonsai-climate-adaptation-img-1.png' }
]

async function updateMultipleEyecatch() {
  console.log('🖼️ 中国・東南アジア・ヨーロッパ盆栽記事のアイキャッチ画像を一括更新中...\n')

  for (const article of articlesToUpdate) {
    try {
      console.log(`📝 ${article.slug} を更新中...`)

      // 記事のアイキャッチを更新
      const { data, error } = await supabase
        .from('articles')
        .update({
          featured_image_url: article.imageUrl,
          featured_image_alt: `${article.slug}のアイキャッチ画像`
        })
        .eq('slug', article.slug)
        .select('id, title, featured_image_url')

      if (error) {
        console.error(`❌ ${article.slug} の更新エラー:`, error)
        continue
      }

      if (data && data.length > 0) {
        console.log(`✅ ${article.slug} のアイキャッチ画像を更新しました！`)
        console.log(`   📄 タイトル: ${data[0].title}`)
        console.log(`   🖼️ 画像URL: ${data[0].featured_image_url}\n`)
      } else {
        console.log(`⚠️ ${article.slug} が見つかりませんでした\n`)
      }

    } catch (error) {
      console.error(`❌ ${article.slug} で予期しないエラー:`, error)
    }
  }

  console.log('🎉 一括更新が完了しました！')
}

updateMultipleEyecatch()