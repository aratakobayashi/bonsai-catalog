// Execute database migration with individual queries
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  try {
    console.log('🚀 Executing database migration step by step...\n');
    
    // First, add the new columns
    console.log('⚡ Step 1: Adding new columns to gardens table...');
    
    const addColumnsQueries = [
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS prefecture VARCHAR(50)",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS city VARCHAR(100)", 
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10)",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8)",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8)",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS business_hours TEXT",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS closed_days JSONB DEFAULT '[]'::jsonb",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS established_year INTEGER",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS owner_name VARCHAR(100)",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS owner_message TEXT",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS access_info TEXT",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS parking_info VARCHAR(255)",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS experience_programs BOOLEAN DEFAULT false",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS online_sales BOOLEAN DEFAULT false",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2)",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS social_instagram VARCHAR(255)",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS social_twitter VARCHAR(255)",
      "ALTER TABLE gardens ADD COLUMN IF NOT EXISTS social_facebook VARCHAR(255)"
    ];
    
    for (const query of addColumnsQueries) {
      const { error } = await supabase.rpc('query', { query_text: query });
      if (error) {
        console.log(`   ❌ Failed: ${query.substring(0, 50)}...`);
        console.log(`      Error: ${error.message}`);
      } else {
        console.log(`   ✅ Added column successfully`);
      }
    }
    
    console.log('\n✅ Migration completed! Verifying results...');
    
    // Verify by checking table structure
    const { data, error } = await supabase
      .from('gardens')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error verifying migration:', error.message);
    } else if (data && data.length > 0) {
      console.log('\n📊 Updated table structure:');
      const columns = Object.keys(data[0]);
      console.log(`   Total columns: ${columns.length}`);
      console.log('   New columns found:', columns.filter(col => 
        ['prefecture', 'specialties', 'rating', 'owner_name', 'business_hours'].includes(col)
      ));
    }
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

// Run migration
executeMigration();