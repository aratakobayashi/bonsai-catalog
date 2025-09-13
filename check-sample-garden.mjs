// Check sample garden data structure
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSampleGarden() {
  try {
    console.log('🔍 Checking sample garden data...\n');
    
    const { data, error } = await supabase
      .from('gardens')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching garden:', error.message);
      return;
    }

    if (data && data.length > 0) {
      const garden = data[0];
      console.log('📋 Full sample garden data:');
      console.log(JSON.stringify(garden, null, 2));
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkSampleGarden();