// Check for test data in gardens table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTestData() {
  console.log('🔍 盆栽園データの内容を詳細チェック...\n');

  const { data: gardens, error } = await supabase
    .from('gardens')
    .select('*')
    .order('created_at', { ascending: true }); // 古い順で表示

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`📊 総盆栽園数: ${gardens.length}件\n`);

  // Analyze each garden
  gardens.forEach((garden, index) => {
    const isLikelyTest = (
      garden.name.includes('テスト') ||
      garden.name.includes('test') ||
      garden.name.includes('Test') ||
      garden.description?.includes('テスト') ||
      garden.address?.includes('テスト') ||
      // Check for placeholder/generic data
      garden.phone?.includes('1234') ||
      garden.phone?.includes('0000') ||
      garden.website_url?.includes('example.com') ||
      garden.image_url?.includes('placeholder') ||
      garden.image_url?.includes('via.placeholder')
    );

    const dataCompleteness = [
      garden.prefecture ? '都道府県✅' : '都道府県❌',
      garden.phone ? '電話✅' : '電話❌', 
      garden.website_url ? 'Web✅' : 'Web❌',
      garden.specialties && garden.specialties.length > 0 ? '専門✅' : '専門❌'
    ].join(' ');

    console.log(`${index + 1}. ${isLikelyTest ? '🧪' : '🌿'} ${garden.name}`);
    console.log(`   住所: ${garden.address}`);
    console.log(`   電話: ${garden.phone || '未設定'}`);
    console.log(`   Web: ${garden.website_url || '未設定'}`);
    console.log(`   ${dataCompleteness}`);
    console.log(`   作成日: ${garden.created_at}`);
    console.log(`   ID: ${garden.id}`);
    
    if (isLikelyTest) {
      console.log('   ⚠️  テストデータの可能性あり');
    }
    console.log('');
  });

  // Summary
  const testLikeGardens = gardens.filter(g => 
    g.name.includes('テスト') ||
    g.name.includes('test') ||
    g.image_url?.includes('placeholder') ||
    g.phone?.includes('1234')
  );

  const realGardens = gardens.filter(g => 
    g.prefecture && 
    !g.image_url?.includes('placeholder') &&
    !g.name.includes('テスト')
  );

  console.log('📈 データ分析:');
  console.log(`   実在と思われる園: ${realGardens.length}件`);
  console.log(`   テスト的データ: ${testLikeGardens.length}件`);
  
  if (testLikeGardens.length > 0) {
    console.log('\n🧪 削除候補（テスト的データ）:');
    testLikeGardens.forEach(g => {
      console.log(`   • ${g.name} (${g.id})`);
    });
  }
}

checkTestData();