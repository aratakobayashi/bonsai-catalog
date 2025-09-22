#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugFilterQuery() {
  try {
    console.log('🔍 Debugging filter query...\n')

    // 1. 簡単なクエリで基本動作確認
    console.log('1️⃣ Simple query - all articles:')
    const { data: allArticles } = await supabase
      .from('articles')
      .select('id, title, category_id')
      .eq('status', 'published')
      .limit(3)

    console.log('  Found:', allArticles?.length, 'articles')
    allArticles?.forEach(a => console.log(`  - ${a.title.substring(0, 40)}... (category_id: ${a.category_id?.substring(0, 8)}...)`))

    // 2. カテゴリーと結合
    console.log('\n2️⃣ Query with category join:')
    const { data: withCategory } = await supabase
      .from('articles')
      .select(`
        id, title, category_id,
        category:article_categories!articles_category_id_fkey(id, name, slug)
      `)
      .eq('status', 'published')
      .limit(3)

    console.log('  Found:', withCategory?.length, 'articles')
    withCategory?.forEach((a: any) => {
      console.log(`  - ${a.title.substring(0, 40)}...`)
      console.log(`    Category: ${a.category?.name} (${a.category?.slug})`)
    })

    // 3. 特定カテゴリーIDでフィルター
    console.log('\n3️⃣ Filter by specific category_id:')
    const beginnerCategoryId = 'a1111111-1111-1111-1111-111111111111'
    const { data: byId } = await supabase
      .from('articles')
      .select('id, title, category_id')
      .eq('status', 'published')
      .eq('category_id', beginnerCategoryId)
      .limit(3)

    console.log(`  Filter by category_id=${beginnerCategoryId}:`)
    console.log('  Found:', byId?.length, 'articles')
    byId?.forEach(a => console.log(`  - ${a.title.substring(0, 50)}...`))

    // 4. JOINしてslugでフィルター（問題のあるクエリ）
    console.log('\n4️⃣ Filter with JOIN (problematic query):')
    const { data: bySlug, error } = await supabase
      .from('articles')
      .select(`
        id, title,
        category:article_categories!articles_category_id_fkey(id, name, slug)
      `)
      .eq('status', 'published')
      .eq('article_categories.slug', 'beginner')
      .limit(3)

    if (error) {
      console.error('  ❌ Error:', error.message)
    } else {
      console.log('  Found:', bySlug?.length, 'articles')
      bySlug?.forEach((a: any) => {
        console.log(`  - ${a.title.substring(0, 50)}...`)
        console.log(`    Category: ${a.category?.name} (${a.category?.slug})`)
      })
    }

    // 5. 正しいフィルター方法を試す
    console.log('\n5️⃣ Correct filter approach:')
    const { data: correctApproach } = await supabase
      .from('articles')
      .select(`
        id, title, category_id,
        category:article_categories!articles_category_id_fkey(id, name, slug)
      `)
      .eq('status', 'published')
      .eq('category.slug', 'beginner')
      .limit(3)

    console.log('  Found:', correctApproach?.length, 'articles')
    correctApproach?.forEach((a: any) => {
      console.log(`  - ${a.title.substring(0, 50)}...`)
      console.log(`    Category: ${a.category?.name} (${a.category?.slug})`)
    })

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run debug
debugFilterQuery()