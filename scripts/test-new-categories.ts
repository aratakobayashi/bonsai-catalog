#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testNewCategories() {
  try {
    console.log('🔍 Testing new category system...\n')

    // 1. 新しいカテゴリーの確認
    console.log('📋 New categories:')
    const { data: categories, error: catError } = await supabase
      .from('article_categories')
      .select('*')
      .order('name')

    if (catError) {
      console.error('❌ Error fetching categories:', catError)
      return
    }

    categories?.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name} (${cat.slug}) - ${cat.icon}`)
    })

    // 2. 各新カテゴリーでフィルタリングテスト
    console.log('\n🧪 Testing filters with new slugs:')
    const testSlugs = ['beginner', 'basic-care', 'species', 'scientific', 'events']

    for (const slug of testSlugs) {
      const { data: articles, error: filterError } = await supabase
        .from('articles')
        .select(`
          id, title,
          category:article_categories!articles_category_id_fkey(name, slug)
        `)
        .eq('status', 'published')
        .eq('article_categories.slug', slug)
        .limit(3)

      if (filterError) {
        console.error(`  ❌ Error filtering by ${slug}:`, filterError)
      } else {
        const category = categories?.find(c => c.slug === slug)
        console.log(`\n  ${category?.icon} ${category?.name} (${slug}): ${articles?.length || 0} articles found`)
        if (articles && articles.length > 0) {
          articles.forEach((article, idx) => {
            console.log(`    ${idx + 1}. ${article.title.substring(0, 50)}...`)
          })
        }
      }
    }

    // 3. categories JSONフィールドのテスト
    console.log('\n📦 Testing multi-category JSON field:')
    const { data: articlesWithJson, error: jsonError } = await supabase
      .from('articles')
      .select('id, title, categories')
      .eq('status', 'published')
      .limit(5)

    if (jsonError) {
      console.error('❌ Error fetching categories field:', jsonError)
    } else {
      console.log(`  Found ${articlesWithJson?.length} articles with categories field`)
      articlesWithJson?.forEach((article, idx) => {
        console.log(`  ${idx + 1}. Categories: ${JSON.stringify(article.categories)}`)
      })
    }

    // 4. 記事の分布確認
    console.log('\n📊 Article distribution:')
    for (const cat of categories || []) {
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('status', 'published')

      console.log(`  ${cat.icon} ${cat.name}: ${count || 0} articles`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run test
testNewCategories()