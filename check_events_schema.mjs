import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking events table schema...')

  // Check if events table exists and get its structure
  const { data: tables, error: tablesError } = await supabase.rpc('get_tables_info')

  if (tablesError) {
    console.log('Could not get table info, trying direct query...')

    // Try to get table columns through a select query
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(1)

    if (error) {
      console.log('Events table error:', error)
      if (error.code === 'PGRST116') {
        console.log('❌ Events table does not exist yet.')
        console.log('Need to create the events table first.')
      }
    } else {
      console.log('✅ Events table exists')
      console.log('Sample data:', data)
    }
  } else {
    console.log('Tables info:', tables)
  }
}

checkSchema()