#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testFixedFiltering() {
  try {
    console.log('🔍 Testing fixed filtering approach...\n')

    const testCategories = [
      { slug: 'beginner', name: 'はじめての盆栽', icon: '🌱' },
      { slug: 'basic-care', name: '基本のお手入れ', icon: '⚒️' },
      { slug: 'species', name: '樹種別ガイド', icon: '🌲' }
    ]

    for (const cat of testCategories) {
      console.log(`\n${cat.icon} Testing "${cat.name}" (${cat.slug})`)
      console.log('=' .repeat(50))

      // Step 1: Get category ID from slug
      const { data: categoryData } = await supabase
        .from('article_categories')
        .select('id')
        .eq('slug', cat.slug)
        .single()

      if (!categoryData) {
        console.log('  ❌ Category not found')
        continue
      }

      const categoryId = categoryData.id
      console.log(`  ✅ Category ID: ${categoryId}`)

      // Step 2: Get articles by category_id
      const { data: articles, count } = await supabase
        .from('articles')
        .select(`
          id, title, category_id,
          category:article_categories!articles_category_id_fkey(name, slug)
        `, { count: 'exact' })
        .eq('status', 'published')
        .eq('category_id', categoryId)
        .limit(3)

      console.log(`  📊 Total articles: ${count}`)

      if (articles && articles.length > 0) {
        console.log('  📝 Sample articles:')
        articles.forEach((article: any, idx: number) => {
          console.log(`    ${idx + 1}. ${article.title.substring(0, 50)}...`)
          console.log(`       Category: ${article.category?.name} (${article.category?.slug})`)
        })
      } else {
        console.log('  ⚠️ No articles found in this category')
      }
    }

    // Test multi-category (categories JSON field)
    console.log('\n\n🔮 Testing multi-category support')
    console.log('=' .repeat(50))

    const { data: multiCatArticles } = await supabase
      .from('articles')
      .select('id, title, categories')
      .eq('status', 'published')
      .filter('categories', 'cs', '["beginner"]')
      .limit(3)

    console.log(`  📦 Articles with "beginner" in categories array: ${multiCatArticles?.length || 0}`)
    multiCatArticles?.forEach((article: any, idx: number) => {
      console.log(`    ${idx + 1}. ${article.title.substring(0, 50)}...`)
      console.log(`       Categories: ${JSON.stringify(article.categories)}`)
    })

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run test
testFixedFiltering()