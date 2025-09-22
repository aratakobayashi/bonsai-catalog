#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugCategoryMapping() {
  try {
    console.log('🔍 Debugging category mapping and filtering...\n')

    // 1. Check all categories in database
    console.log('1️⃣ All categories in database:')
    const { data: allCategories, error: catError } = await supabase
      .from('article_categories')
      .select('id, slug, name, icon, color, description')
      .order('name')

    if (catError) {
      console.error('❌ Category fetch error:', catError)
      return
    }

    console.log(`Found ${allCategories?.length || 0} categories:`)
    allCategories?.forEach(cat => {
      console.log(`  - ${cat.slug} → ${cat.id} (${cat.name})`)
    })

    // 2. Test specific category mapping
    console.log('\n2️⃣ Testing specific category lookup:')
    const testSlug = 'beginner'
    const categoryMap = new Map(allCategories?.map(cat => [cat.slug, cat]) || [])
    const selectedCategory = categoryMap.get(testSlug)

    console.log(`Looking for slug: "${testSlug}"`)
    console.log(`Found category:`, selectedCategory)
    console.log(`Category ID:`, selectedCategory?.id)

    // 3. Test articles with that category_id
    if (selectedCategory?.id) {
      console.log('\n3️⃣ Testing articles with this category_id:')
      const { data: articles, count, error: artError } = await supabase
        .from('articles')
        .select('id, title, category_id', { count: 'exact' })
        .eq('status', 'published')
        .eq('category_id', selectedCategory.id)
        .limit(5)

      if (artError) {
        console.error('❌ Articles fetch error:', artError)
      } else {
        console.log(`Found ${count} articles with category_id=${selectedCategory.id}`)
        articles?.forEach(article => {
          console.log(`  - ${article.title} (${article.category_id})`)
        })
      }
    }

    // 4. Check all articles and their category assignments
    console.log('\n4️⃣ Sample of all published articles:')
    const { data: sampleArticles } = await supabase
      .from('articles')
      .select('id, title, category_id')
      .eq('status', 'published')
      .limit(10)

    sampleArticles?.forEach(article => {
      const matchingCat = allCategories?.find(c => c.id === article.category_id)
      console.log(`  - ${article.title}: ${article.category_id} → ${matchingCat?.slug || 'NOT FOUND'}`)
    })

    // 5. Test the exact query used in getArticles
    console.log('\n5️⃣ Testing exact getArticles query:')
    const categoryId = selectedCategory?.id
    if (categoryId) {
      let query = supabase
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
        .eq('category_id', categoryId)
        .order('published_at', { ascending: false })
        .range(0, 11)

      const { data, error, count } = await query

      if (error) {
        console.error('❌ Query error:', error)
      } else {
        console.log(`✅ Query successful: ${count} articles found`)
        data?.slice(0, 3).forEach(article => {
          console.log(`  - ${article.title}`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run debug
debugCategoryMapping()