// Check current gardens table structure
import { createClient } from '@supabase/supabase-js';

// Hardcoded for testing - replace with actual values
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGardensTable() {
  try {
    console.log('🔍 Checking gardens table structure...\n');
    
    // Check if gardens table exists and get current data
    const { data, error } = await supabase
      .from('gardens')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching gardens:', error.message);
      return;
    }

    console.log(`✅ Found ${data?.length || 0} gardens in database`);
    
    if (data && data.length > 0) {
      console.log('\n📊 Current data structure:');
      const firstGarden = data[0];
      Object.keys(firstGarden).forEach(key => {
        console.log(`   ${key}: ${typeof firstGarden[key]} ${Array.isArray(firstGarden[key]) ? '(array)' : ''}`);
      });

      console.log('\n📋 Sample garden:');
      console.log('   Name:', firstGarden.name);
      console.log('   Address:', firstGarden.address);
      console.log('   Has prefecture?:', 'prefecture' in firstGarden);
      console.log('   Has specialties?:', 'specialties' in firstGarden);
      console.log('   Has rating?:', 'rating' in firstGarden);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the check
checkGardensTable();