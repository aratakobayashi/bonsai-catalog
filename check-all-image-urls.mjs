import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

async function checkAllImageUrls() {
  try {
    const { data, error } = await supabase
      .from('gardens')
      .select('name, image_url')
      .limit(10);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log('🔍 最初の10件の盆栽園の画像URL詳細:');
    console.log('===============================================\n');

    data?.forEach((garden, index) => {
      console.log(`${index + 1}. ${garden.name}`);
      console.log(`   URL: ${garden.image_url}`);

      if (garden.image_url) {
        if (garden.image_url.startsWith('data:')) {
          console.log(`   タイプ: ✅ AI生成画像 (Base64データ)`);
          console.log(`   サイズ: ${garden.image_url.length} 文字`);
        } else if (garden.image_url.includes('example.com')) {
          console.log(`   タイプ: ❌ ダミーURL`);
        } else {
          console.log(`   タイプ: 🔗 外部URL`);
        }
      } else {
        console.log(`   タイプ: ❌ 画像なし`);
      }
      console.log('');
    });

    // 統計を取得
    const { data: allData } = await supabase
      .from('gardens')
      .select('name, image_url');

    let dataUrlCount = 0;
    let exampleUrlCount = 0;
    let realUrlCount = 0;
    let nullCount = 0;

    allData?.forEach(garden => {
      if (!garden.image_url) {
        nullCount++;
      } else if (garden.image_url.startsWith('data:')) {
        dataUrlCount++;
      } else if (garden.image_url.includes('example.com')) {
        exampleUrlCount++;
      } else {
        realUrlCount++;
      }
    });

    console.log('📊 全盆栽園の画像統計:');
    console.log(`   AI生成画像 (data:): ${dataUrlCount}件`);
    console.log(`   ダミーURL (example.com): ${exampleUrlCount}件`);
    console.log(`   外部URL: ${realUrlCount}件`);
    console.log(`   画像なし: ${nullCount}件`);
    console.log(`   合計: ${allData?.length || 0}件`);

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkAllImageUrls();