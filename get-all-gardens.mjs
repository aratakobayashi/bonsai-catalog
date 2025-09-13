// Get all existing gardens to understand current coverage
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAllGardens() {
  try {
    console.log('🔍 Getting all existing gardens...\n');
    
    const { data, error, count } = await supabase
      .from('gardens')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Error fetching gardens:', error.message);
      return;
    }

    console.log(`✅ Total gardens in database: ${count}\n`);
    
    if (data && data.length > 0) {
      console.log('📊 Existing gardens by prefecture:');
      const prefectureCount = {};
      
      data.forEach(garden => {
        const pref = garden.prefecture || 'Unknown';
        prefectureCount[pref] = (prefectureCount[pref] || 0) + 1;
      });
      
      Object.keys(prefectureCount).sort().forEach(pref => {
        console.log(`   ${pref}: ${prefectureCount[pref]} gardens`);
      });
      
      console.log('\n📋 All existing gardens:');
      data.forEach((garden, index) => {
        console.log(`${index + 1}. ${garden.name} - ${garden.prefecture}, ${garden.city}`);
        if (garden.address) console.log(`   Address: ${garden.address}`);
        console.log('');
      });
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

getAllGardens();