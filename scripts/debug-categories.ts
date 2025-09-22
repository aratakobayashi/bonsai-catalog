#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugCategories() {
  try {
    console.log('🔍 Debugging category issues...\n')

    // 1. Check all categories
    console.log('📋 All categories:')
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

    // 2. Check for duplicates
    console.log('\n🔍 Checking for duplicates:')
    const slugCounts = categories?.reduce((acc: any, cat) => {
      acc[cat.slug] = (acc[cat.slug] || 0) + 1
      return acc
    }, {})

    const duplicates = Object.entries(slugCounts || {}).filter(([slug, count]) => (count as number) > 1)
    if (duplicates.length > 0) {
      console.log('❌ Found duplicates:')
      duplicates.forEach(([slug, count]) => {
        console.log(`  - ${slug}: ${count} times`)
      })
    } else {
      console.log('✅ No duplicate slugs found')
    }

    // 3. Check articles and their categories
    console.log('\n📰 Sample articles with categories:')
    const { data: articles, error: artError } = await supabase
      .from('articles')
      .select(`
        id, title, slug, status,
        category:article_categories!articles_category_id_fkey(id, name, slug)
      `)
      .eq('status', 'published')
      .limit(5)

    if (artError) {
      console.error('❌ Error fetching articles:', artError)
      return
    }

    articles?.forEach((article: any, index) => {
      console.log(`  ${index + 1}. "${article.title}"`)
      console.log(`     Category: ${article.category?.name || 'No category'} (${article.category?.slug || 'N/A'})`)
    })

    // 4. Check category distribution
    console.log('\n📊 Articles per category:')
    const { data: distribution, error: distError } = await supabase
      .from('articles')
      .select(`
        category_id,
        category:article_categories!articles_category_id_fkey(name, slug)
      `)
      .eq('status', 'published')

    if (distError) {
      console.error('❌ Error fetching distribution:', distError)
      return
    }

    const categoryCount = distribution?.reduce((acc: any, article: any) => {
      const categoryName = article.category?.name || 'No category'
      acc[categoryName] = (acc[categoryName] || 0) + 1
      return acc
    }, {})

    Object.entries(categoryCount || {}).forEach(([name, count]) => {
      console.log(`  - ${name}: ${count} articles`)
    })

    // 5. Test specific category filter
    console.log('\n🧪 Testing category filter (care-bonsai):')
    const { data: filteredArticles, error: filterError } = await supabase
      .from('articles')
      .select(`
        id, title,
        category:article_categories!articles_category_id_fkey(name, slug)
      `)
      .eq('status', 'published')
      .eq('article_categories.slug', 'care-bonsai')

    if (filterError) {
      console.error('❌ Filter error:', filterError)
    } else {
      console.log(`  Found ${filteredArticles?.length || 0} articles with category 'care-bonsai'`)
    }

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run debug
debugCategories()