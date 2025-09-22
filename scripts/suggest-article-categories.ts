#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// カテゴリー分類のキーワード定義
const categoryKeywords = {
  'beginner': {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'はじめての盆栽',
    keywords: ['初心者', '入門', '始め方', 'はじめて', '基本知識', '選び方', '初めて'],
    priority: 1
  },
  'basic-care': {
    id: 'a4444444-4444-4444-4444-444444444444',
    name: '基本のお手入れ',
    keywords: ['水やり', '剪定', '植え替え', '肥料', '管理', '手入れ', '育て方'],
    priority: 2
  },
  'species': {
    id: 'a3333333-3333-3333-3333-333333333333',
    name: '樹種別ガイド',
    keywords: ['松', '梅', '桜', 'もみじ', '楓', 'サツキ', 'ツツジ', '黒松', '赤松', '五葉松', 'ケヤキ', '姫リンゴ', '南天', '長寿梅'],
    priority: 3
  },
  'troubleshooting': {
    id: 'a9999999-9999-9999-9999-999999999999',
    name: 'トラブル解決',
    keywords: ['枯れ', '病気', '害虫', '失敗', '問題', 'トラブル', '対策', '原因'],
    priority: 4
  },
  'shopping': {
    id: 'a7777777-7777-7777-7777-777777777777',
    name: '購入・体験ガイド',
    keywords: ['購入', '買う', '園芸店', '価格', '相場', '道具', '鉢'],
    priority: 5
  },
  'events': {
    id: 'a6666666-6666-6666-6666-666666666666',
    name: 'イベント・コミュニティ',
    keywords: ['展示会', 'イベント', 'クラブ', 'コンテスト', '教室'],
    priority: 6
  },
  'enjoyment': {
    id: 'a8888888-8888-8888-8888-888888888888',
    name: '楽しみ方',
    keywords: ['撮影', '写真', '鑑賞', 'インテリア', '飾る'],
    priority: 7
  },
  'scientific': {
    id: 'a2222222-2222-2222-2222-222222222222',
    name: '科学的管理法',
    keywords: ['科学', 'ホルモン', '生理学', '微生物', '研究'],
    priority: 8
  },
  'international': {
    id: 'a5555555-5555-5555-5555-555555555555',
    name: '国際・文化',
    keywords: ['歴史', '文化', '海外', '外交', '伝統'],
    priority: 9
  }
}

function suggestCategory(title: string, content?: string): { primary: string, secondary: string[] } {
  const text = (title + ' ' + (content || '')).toLowerCase()
  const scores: Record<string, number> = {}

  // 各カテゴリーのスコアを計算
  for (const [slug, config] of Object.entries(categoryKeywords)) {
    scores[slug] = 0
    for (const keyword of config.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        scores[slug] += 10 / config.priority  // 優先度が高いほど高スコア
      }
    }
  }

  // スコアでソート
  const sorted = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])

  // プライマリカテゴリーを決定
  let primary = sorted[0]?.[0] || 'beginner'

  // セカンダリカテゴリーを決定（スコアが近いものを選択）
  const secondary: string[] = []
  const primaryScore = sorted[0]?.[1] || 0
  for (let i = 1; i < sorted.length && i < 3; i++) {
    if (sorted[i][1] > primaryScore * 0.5) {  // プライマリの50%以上のスコアがある場合
      secondary.push(sorted[i][0])
    }
  }

  return { primary, secondary }
}

async function suggestCategories() {
  try {
    console.log('📊 記事のカテゴリー分類を提案します...\n')

    // 全記事を取得
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        category_id,
        categories,
        category:article_categories!articles_category_id_fkey(name, slug)
      `)
      .eq('status', 'published')
      .order('title')

    if (error) {
      console.error('❌ Error fetching articles:', error)
      return
    }

    // カテゴリー別の提案を集計
    const suggestions: Record<string, any[]> = {}
    const multiCategorySuggestions: any[] = []

    for (const article of articles || []) {
      const suggestion = suggestCategory(article.title, article.excerpt)
      const primaryCat = categoryKeywords[suggestion.primary as keyof typeof categoryKeywords]

      // 現在のカテゴリーと異なる場合のみ提案
      const currentCategorySlug = article.category?.slug
      if (currentCategorySlug !== suggestion.primary) {
        if (!suggestions[suggestion.primary]) {
          suggestions[suggestion.primary] = []
        }
        suggestions[suggestion.primary].push({
          title: article.title,
          currentCategory: article.category?.name || 'なし',
          id: article.id
        })
      }

      // マルチカテゴリーの提案
      if (suggestion.secondary.length > 0) {
        multiCategorySuggestions.push({
          title: article.title,
          primary: suggestion.primary,
          secondary: suggestion.secondary,
          id: article.id
        })
      }
    }

    // 結果を表示
    console.log('🔄 カテゴリー変更の提案:\n')
    for (const [slug, articles] of Object.entries(suggestions)) {
      const category = categoryKeywords[slug as keyof typeof categoryKeywords]
      console.log(`\n${category.name} への移動を提案 (${articles.length}件):`)
      console.log('=' .repeat(50))
      articles.slice(0, 5).forEach((article, idx) => {
        console.log(`  ${idx + 1}. ${article.title.substring(0, 50)}...`)
        console.log(`     現在: ${article.currentCategory} → 提案: ${category.name}`)
      })
      if (articles.length > 5) {
        console.log(`  ... 他 ${articles.length - 5} 件`)
      }
    }

    // マルチカテゴリーの提案
    console.log('\n\n🏷️ マルチカテゴリーの提案 (複数のカテゴリーに該当):')
    console.log('=' .repeat(50))
    multiCategorySuggestions.slice(0, 10).forEach((article, idx) => {
      console.log(`  ${idx + 1}. ${article.title.substring(0, 50)}...`)
      const primaryName = categoryKeywords[article.primary as keyof typeof categoryKeywords].name
      const secondaryNames = article.secondary.map((s: string) => categoryKeywords[s as keyof typeof categoryKeywords].name)
      console.log(`     メイン: ${primaryName}`)
      console.log(`     サブ: ${secondaryNames.join(', ')}`)
    })

    // SQL生成
    console.log('\n\n📝 カテゴリー更新用SQL (最初の10件):')
    console.log('=' .repeat(50))
    let sqlCount = 0
    for (const [slug, articles] of Object.entries(suggestions)) {
      const category = categoryKeywords[slug as keyof typeof categoryKeywords]
      for (const article of articles.slice(0, 2)) {
        console.log(`UPDATE articles SET category_id = '${category.id}', categories = '["${slug}"]'::jsonb WHERE id = '${article.id}'; -- ${article.title.substring(0, 30)}...`)
        sqlCount++
        if (sqlCount >= 10) break
      }
      if (sqlCount >= 10) break
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// 実行
suggestCategories()