#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function applyCategoryUpdates() {
  try {
    console.log('🔄 Applying category updates...\n')

    // カテゴリー分類のキーワード定義
    const updates = [
      // トラブル解決カテゴリー
      {
        category: 'troubleshooting',
        categoryId: 'a9999999-9999-9999-9999-999999999999',
        keywords: ['枯れそう', '復活', '虫', '駆除', '冬越し', '失敗', '室内栽培', 'うまくいかない'],
        limit: 5
      },
      // 国際・文化カテゴリー
      {
        category: 'international',
        categoryId: 'a5555555-5555-5555-5555-555555555555',
        keywords: ['敬老の日', '新築祝い', '海外', 'ヨーロッパ', '中国', '文化', '歴史'],
        limit: 5
      },
      // 科学的管理法カテゴリー
      {
        category: 'scientific',
        categoryId: 'a2222222-2222-2222-2222-222222222222',
        keywords: ['科学', 'メディテーション', 'オフィス', 'バイオ', '光合成', '効率'],
        limit: 4
      },
      // イベント・コミュニティカテゴリー
      {
        category: 'events',
        categoryId: 'a6666666-6666-6666-6666-666666666666',
        keywords: ['コンテスト', 'クラブ', 'ビジネス', '親子', 'イベント'],
        limit: 4
      },
      // 購入・体験ガイドカテゴリー
      {
        category: 'shopping',
        categoryId: 'a7777777-7777-7777-7777-777777777777',
        keywords: ['オークション', '販売', '投資', '購入', '価格'],
        limit: 3
      },
      // 楽しみ方カテゴリー
      {
        category: 'enjoyment',
        categoryId: 'a8888888-8888-8888-8888-888888888888',
        keywords: ['撮影', '写真', 'インテリア'],
        limit: 2
      }
    ]

    let totalUpdated = 0

    for (const update of updates) {
      console.log(`\n📝 ${update.category} カテゴリーへの移動を検索中...`)

      // キーワードにマッチする記事を検索
      const keywordPattern = update.keywords.join('|')
      const { data: candidates } = await supabase
        .from('articles')
        .select('id, title')
        .eq('status', 'published')
        .or(`title.ilike.%${update.keywords[0]}%,title.ilike.%${update.keywords[1] || update.keywords[0]}%`)
        .limit(update.limit)

      if (candidates && candidates.length > 0) {
        console.log(`  ✅ ${candidates.length}件の候補記事を発見`)

        for (const article of candidates) {
          // 記事を更新
          const { error } = await supabase
            .from('articles')
            .update({
              category_id: update.categoryId,
              categories: `["${update.category}"]`
            })
            .eq('id', article.id)

          if (error) {
            console.error(`  ❌ Error updating ${article.id}:`, error.message)
          } else {
            console.log(`  ✅ Updated: ${article.title.substring(0, 50)}...`)
            totalUpdated++
          }
        }
      } else {
        console.log('  ⚠️ マッチする記事が見つかりませんでした')
      }
    }

    console.log(`\n🎉 合計 ${totalUpdated} 件の記事のカテゴリーを更新しました！`)

    // 最終的な分布を確認
    console.log('\n📊 最新のカテゴリー分布:')
    const { data: categories } = await supabase
      .from('article_categories')
      .select('*')
      .order('name')

    for (const category of categories || []) {
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'published')

      console.log(`  ${category.icon} ${category.name}: ${count || 0} 記事`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// 実行
applyCategoryUpdates()