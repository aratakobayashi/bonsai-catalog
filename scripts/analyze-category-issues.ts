#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function analyzeIssues() {
  try {
    console.log('🔍 Detailed analysis of category issues...\n')

    // 1. Get all categories with detailed info
    const { data: categories, error: catError } = await supabase
      .from('article_categories')
      .select('*')
      .order('name')

    if (catError) {
      console.error('❌ Error fetching categories:', catError)
      return
    }

    console.log('📋 All categories with details:')
    categories?.forEach((cat, index) => {
      console.log(`  ${index + 1}. "${cat.name}" | slug: "${cat.slug}" | ID: ${cat.id.substring(0, 8)}...`)
      console.log(`     Icon: ${cat.icon} | Color: ${cat.color}`)
      console.log(`     Created: ${new Date(cat.created_at).toLocaleDateString()}`)
    })

    // 2. Find specific problem categories
    const duplicateNames = categories?.reduce((acc: any, cat) => {
      acc[cat.name] = acc[cat.name] || []
      acc[cat.name].push(cat)
      return acc
    }, {})

    console.log('\n🔍 Duplicate category names:')
    Object.entries(duplicateNames || {}).forEach(([name, cats]: [string, any]) => {
      if (cats.length > 1) {
        console.log(`\n❌ "${name}" has ${cats.length} entries:`)
        cats.forEach((cat: any, index: number) => {
          console.log(`  ${index + 1}. slug: "${cat.slug}" | ID: ${cat.id.substring(0, 8)}...`)
        })
      }
    })

    // 3. Articles using each problematic category
    const problemCats = categories?.filter(cat =>
      (cat.name === 'お手入れ・管理' && cat.slug !== 'care-bonsai') ||
      (cat.name === 'はじめての盆栽' && cat.slug !== 'start-guide')
    )

    if (problemCats && problemCats.length > 0) {
      console.log('\n📊 Articles in problematic categories:')

      for (const cat of problemCats) {
        const { data: articles, error: artError } = await supabase
          .from('articles')
          .select('id, title')
          .eq('category_id', cat.id)
          .eq('status', 'published')

        if (!artError) {
          console.log(`\n"${cat.name}" (${cat.slug}): ${articles?.length || 0} articles`)
          if (articles && articles.length > 0 && articles.length <= 5) {
            articles.forEach((article, index) => {
              console.log(`  ${index + 1}. ${article.title}`)
            })
          } else if (articles && articles.length > 5) {
            console.log(`  (Showing first 3 of ${articles.length} articles)`)
            articles.slice(0, 3).forEach((article, index) => {
              console.log(`  ${index + 1}. ${article.title}`)
            })
          }
        }
      }
    }

    // 4. Generate cleanup SQL commands
    console.log('\n📝 Cleanup SQL Commands (run in Supabase dashboard):')
    console.log('-- Step 1: Move articles from duplicate categories to main categories')

    const careGuide = categories?.find(cat => cat.slug === 'care-guide')
    const careBonsai = categories?.find(cat => cat.slug === 'care-bonsai')
    const emptySlug = categories?.find(cat => cat.slug === '-' || cat.slug === '')
    const startGuide = categories?.find(cat => cat.slug === 'start-guide')

    if (careGuide && careBonsai) {
      console.log(`UPDATE articles SET category_id = '${careBonsai.id}' WHERE category_id = '${careGuide.id}';`)
    }

    if (emptySlug && startGuide) {
      console.log(`UPDATE articles SET category_id = '${startGuide.id}' WHERE category_id = '${emptySlug.id}';`)
    }

    console.log('\n-- Step 2: Delete duplicate categories')
    if (careGuide) {
      console.log(`DELETE FROM article_categories WHERE id = '${careGuide.id}';`)
    }
    if (emptySlug) {
      console.log(`DELETE FROM article_categories WHERE id = '${emptySlug.id}';`)
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error)
  }
}

// Run analysis
analyzeIssues()