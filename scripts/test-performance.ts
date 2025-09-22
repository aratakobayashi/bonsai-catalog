#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPerformance() {
  try {
    console.log('⚡ Testing performance improvements...\n')

    const testCategories = ['beginner', 'basic-care', 'species']

    for (const categorySlug of testCategories) {
      console.log(`🧪 Testing "${categorySlug}" category filter`)

      const startTime = Date.now()

      // シミュレート: 最適化後のクエリ
      const { data: categoryData } = await supabase
        .from('article_categories')
        .select('id, slug, name, icon, color')
        .eq('slug', categorySlug)
        .single()

      if (!categoryData) {
        console.log('  ❌ Category not found')
        continue
      }

      const { data: articles, count } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image_url,
          published_at,
          updated_at,
          reading_time,
          category_id,
          tag_ids
        `, { count: 'exact' })
        .eq('status', 'published')
        .eq('category_id', categoryData.id)
        .order('published_at', { ascending: false })
        .limit(12)

      const endTime = Date.now()
      const duration = endTime - startTime

      console.log(`  ✅ ${count} articles found in ${duration}ms`)
      console.log(`  📝 Sample: ${articles?.[0]?.title?.substring(0, 40)}...`)

      // パフォーマンス評価
      if (duration < 500) {
        console.log(`  🚀 FAST (${duration}ms)`)
      } else if (duration < 1000) {
        console.log(`  ⚡ GOOD (${duration}ms)`)
      } else {
        console.log(`  🐌 SLOW (${duration}ms)`)
      }
      console.log('')
    }

    // キャッシュテスト（2回目のリクエスト）
    console.log('💾 Testing cache effectiveness (2nd request)...')
    const startCache = Date.now()

    const { data: categories } = await supabase
      .from('article_categories')
      .select('id, slug, name, icon, color')

    const endCache = Date.now()
    console.log(`  📊 Categories fetched in ${endCache - startCache}ms`)

  } catch (error) {
    console.error('❌ Performance test failed:', error)
  }
}

// Run performance test
testPerformance()