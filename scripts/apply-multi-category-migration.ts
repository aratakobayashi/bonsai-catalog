#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('🚀 Starting multi-category migration...')

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/017_add_multi_categories.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Split SQL into individual statements (simple approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`)
      console.log(statement.substring(0, 100) + '...')

      const { error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error)
        // Continue with other statements instead of exiting
        continue
      }

      console.log(`✅ Statement ${i + 1} executed successfully`)
    }

    console.log('\n🎉 Migration completed!')

    // Verify new categories
    const { data: categories, error: catError } = await supabase
      .from('article_categories')
      .select('name, slug')
      .order('name')

    if (catError) {
      console.error('❌ Error fetching categories:', catError)
    } else {
      console.log('\n📋 Current categories:')
      categories?.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`))
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
applyMigration()