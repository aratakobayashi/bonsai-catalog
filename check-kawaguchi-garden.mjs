import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

async function checkKawaguchiGarden() {
  try {
    // Check for Kawaguchi garden
    const { data, error } = await supabase
      .from('gardens')
      .select('id, name, image_url, prefecture, specialties')
      .ilike('name', '%川口%');

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log('🔍 川口緑化センターのデータ:');
    console.log(JSON.stringify(data, null, 2));

    if (data && data.length > 0) {
      const garden = data[0];
      console.log('\n📋 画像URL詳細:');
      console.log('   image_url:', garden.image_url);
      console.log('   image_url type:', typeof garden.image_url);
      console.log('   image_url length:', garden.image_url ? garden.image_url.length : 'null');
      console.log('   starts with data:', garden.image_url?.startsWith('data:'));
    }

    // Also check all gardens for image status
    const { data: allGardens } = await supabase
      .from('gardens')
      .select('name, image_url');

    console.log('\n📊 全盆栽園の画像状況:');
    allGardens?.forEach(g => {
      const hasImage = g.image_url && g.image_url !== '';
      const isDataUrl = g.image_url?.startsWith('data:');
      console.log(`   ${g.name}: ${hasImage ? (isDataUrl ? '✅ Data URL' : '🔗 URL') : '❌ なし'}`);
    });

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkKawaguchiGarden();