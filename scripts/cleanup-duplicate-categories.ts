#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupCategories() {
  try {
    console.log('🧹 Starting category cleanup...\n')

    // 1. Get all categories
    const { data: categories, error: catError } = await supabase
      .from('article_categories')
      .select('*')
      .order('created_at')

    if (catError) {
      console.error('❌ Error fetching categories:', catError)
      return
    }

    console.log('📋 Current categories:')
    categories?.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name} (${cat.slug}) - ID: ${cat.id}`)
    })

    // 2. Identify the problematic categories
    const careGuideCategory = categories?.find(cat => cat.slug === 'care-guide')
    const careBonsaiCategory = categories?.find(cat => cat.slug === 'care-bonsai')
    const emptySlugCategory = categories?.find(cat => cat.slug === '-' || cat.slug === '')
    const startGuideCategory = categories?.find(cat => cat.slug === 'start-guide')

    console.log('\n🔍 Problematic categories identified:')
    if (careGuideCategory) console.log(`  - care-guide: ${careGuideCategory.id}`)
    if (emptySlugCategory) console.log(`  - empty slug: ${emptySlugCategory.id}`)

    // 3. Update articles that use the duplicate categories
    if (careGuideCategory && careBonsaiCategory) {
      console.log('\n🔄 Moving articles from care-guide to care-bonsai...')
      const { data: updatedArticles, error: updateError } = await supabase
        .from('articles')
        .update({ category_id: careBonsaiCategory.id })
        .eq('category_id', careGuideCategory.id)

      if (updateError) {
        console.error('❌ Error updating articles:', updateError)
      } else {
        console.log(`✅ Updated articles for care-guide category`)
      }
    }

    if (emptySlugCategory && startGuideCategory) {
      console.log('\n🔄 Moving articles from empty slug to start-guide...')
      const { data: updatedArticles, error: updateError } = await supabase
        .from('articles')
        .update({ category_id: startGuideCategory.id })
        .eq('category_id', emptySlugCategory.id)

      if (updateError) {
        console.error('❌ Error updating articles:', updateError)
      } else {
        console.log(`✅ Updated articles for empty slug category`)
      }
    }

    // 4. Delete the duplicate categories
    if (careGuideCategory) {
      console.log('\n🗑️ Deleting care-guide category...')
      const { error: deleteError } = await supabase
        .from('article_categories')
        .delete()
        .eq('id', careGuideCategory.id)

      if (deleteError) {
        console.error('❌ Error deleting care-guide:', deleteError)
      } else {
        console.log('✅ Deleted care-guide category')
      }
    }

    if (emptySlugCategory) {
      console.log('\n🗑️ Deleting empty slug category...')
      const { error: deleteError } = await supabase
        .from('article_categories')
        .delete()
        .eq('id', emptySlugCategory.id)

      if (deleteError) {
        console.error('❌ Error deleting empty slug category:', deleteError)
      } else {
        console.log('✅ Deleted empty slug category')
      }
    }

    // 5. Verify cleanup
    console.log('\n🔍 Verifying cleanup...')
    const { data: finalCategories, error: finalError } = await supabase
      .from('article_categories')
      .select('*')
      .order('name')

    if (finalError) {
      console.error('❌ Error fetching final categories:', finalError)
    } else {
      console.log('📋 Final categories:')
      finalCategories?.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (${cat.slug})`)
      })
    }

    console.log('\n🎉 Cleanup completed!')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

// Run cleanup
cleanupCategories()