import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running database migration...');
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync('./supabase/migrations/001_initial_schema.sql', 'utf8');
    
    console.log('📖 Migration SQL loaded');
    
    // Note: This won't work with the anon key - we need a service role key
    // But let's check if the tables exist first
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log('❌ Error checking tables:', error.message);
      console.log('💡 This likely means we need admin privileges to run migrations');
      return;
    }
    
    console.log('✅ Current tables:', tables);
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

runMigration().catch(console.error);