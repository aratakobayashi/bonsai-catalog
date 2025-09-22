#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAllNewCategories() {
  try {
    console.log('🔍 Testing ALL 9 new categories filtering...\n')

    const newCategories = [
      { slug: 'beginner', name: 'はじめての盆栽', icon: '🌱' },
      { slug: 'basic-care', name: '基本のお手入れ', icon: '⚒️' },
      { slug: 'species', name: '樹種別ガイド', icon: '🌲' },
      { slug: 'scientific', name: '科学的管理法', icon: '🧪' },
      { slug: 'international', name: '国際・文化', icon: '🌍' },
      { slug: 'events', name: 'イベント・コミュニティ', icon: '🎪' },
      { slug: 'shopping', name: '購入・体験ガイド', icon: '🛒' },
      { slug: 'enjoyment', name: '楽しみ方', icon: '📸' },
      { slug: 'troubleshooting', name: 'トラブル解決', icon: '🔧' }
    ]

    let totalCount = 0
    let workingCategories = 0

    for (const category of newCategories) {
      // Step 1: Get category ID from slug
      const { data: categoryData } = await supabase
        .from('article_categories')
        .select('id')
        .eq('slug', category.slug)
        .single()

      if (!categoryData) {
        console.log(`  ❌ ${category.icon} ${category.name} - Category not found`)
        continue
      }

      // Step 2: Get articles count and samples
      const { data: articles, count } = await supabase
        .from('articles')
        .select('id, title', { count: 'exact' })
        .eq('status', 'published')
        .eq('category_id', categoryData.id)
        .limit(2)

      const articleCount = count || 0
      totalCount += articleCount

      if (articleCount > 0) {
        workingCategories++
        console.log(`✅ ${category.icon} ${category.name}: ${articleCount} articles`)
        articles?.forEach((article, idx) => {
          console.log(`    ${idx + 1}. ${article.title.substring(0, 40)}...`)
        })
      } else {
        console.log(`⚠️  ${category.icon} ${category.name}: 0 articles`)
      }
      console.log('')
    }

    console.log('=' .repeat(60))
    console.log(`📊 QA Summary:`)
    console.log(`  ✅ Working categories: ${workingCategories}/9`)
    console.log(`  📰 Total articles: ${totalCount}`)
    console.log(`  🎯 Coverage: ${Math.round(workingCategories / 9 * 100)}%`)

    if (workingCategories === 9) {
      console.log(`\n🎉 SUCCESS: All 9 categories are working!`)
    } else {
      console.log(`\n⚠️  ${9 - workingCategories} categories need more content`)
    }

  } catch (error) {
    console.error('❌ QA Test failed:', error)
  }
}

// Run QA test
testAllNewCategories()