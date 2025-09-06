// Verify test data cleanup
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCleanup() {
  console.log('🧹 テストデータ削除後の確認...\n');

  const { data: gardens, error } = await supabase
    .from('gardens')
    .select('*')
    .order('prefecture', { ascending: true });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`📊 残存盆栽園: ${gardens.length}件\n`);

  // Group by prefecture
  const byPrefecture = {};
  gardens.forEach(garden => {
    const pref = garden.prefecture || '未設定';
    if (!byPrefecture[pref]) byPrefecture[pref] = [];
    byPrefecture[pref].push(garden);
  });

  console.log('🗾 都道府県別データ:');
  Object.entries(byPrefecture).forEach(([pref, list]) => {
    console.log(`\n  ${pref}: ${list.length}件`);
    list.forEach(garden => {
      const phone = garden.phone ? `📞${garden.phone}` : '📞未設定';
      const website = garden.website_url ? '🌐' : '';
      const experience = garden.experience_programs ? '🎓' : '';
      const featured = garden.featured ? '⭐' : '';
      console.log(`    • ${garden.name} ${phone} ${website} ${experience} ${featured}`);
    });
  });

  // Check for remaining test-like data
  const remaining = gardens.filter(g => !g.prefecture);
  if (remaining.length > 0) {
    console.log(`\n⚠️  都道府県未設定が${remaining.length}件残っています:`);
    remaining.forEach(g => console.log(`   • ${g.name}`));
  } else {
    console.log('\n✅ 都道府県未設定のテストデータは正常に削除されました');
  }

  // Summary stats
  const stats = {
    total: gardens.length,
    withPhone: gardens.filter(g => g.phone).length,
    withWebsite: gardens.filter(g => g.website_url).length,
    withExperience: gardens.filter(g => g.experience_programs).length,
    featured: gardens.filter(g => g.featured).length,
    saitama: gardens.filter(g => g.prefecture === '埼玉県').length,
    kagawa: gardens.filter(g => g.prefecture === '香川県').length,
    tokyo: gardens.filter(g => g.prefecture === '東京都').length
  };

  console.log('\n📈 クリーンアップ後統計:');
  console.log(`   総数: ${stats.total}件`);
  console.log(`   埼玉県: ${stats.saitama}件 (大宮盆栽村)`);
  console.log(`   香川県: ${stats.kagawa}件 (松盆栽産地)`);
  console.log(`   東京都: ${stats.tokyo}件 (春花園など)`);
  console.log(`   電話番号: ${stats.withPhone}件`);
  console.log(`   Webサイト: ${stats.withWebsite}件`);
  console.log(`   体験プログラム: ${stats.withExperience}件`);
  console.log(`   注目園: ${stats.featured}件`);
}

verifyCleanup();