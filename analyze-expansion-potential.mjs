// Analyze expansion potential for garden data
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ptbowbqrykqwxuzivbdv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek');

async function analyzeExpansionPotential() {
  console.log('🔍 盆栽園データ拡張可能性分析\n');

  const { data: gardens, error } = await supabase
    .from('gardens')
    .select('*')
    .order('prefecture', { ascending: true });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`📊 現在の登録園数: ${gardens.length}件\n`);

  // Prefecture coverage analysis
  const prefectureCoverage = {};
  const allPrefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
    '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  gardens.forEach(garden => {
    const pref = garden.prefecture;
    if (!prefectureCoverage[pref]) prefectureCoverage[pref] = [];
    prefectureCoverage[pref].push(garden);
  });

  console.log('🗾 都道府県カバレッジ分析:');
  console.log(`   カバー済み: ${Object.keys(prefectureCoverage).length}/47都道府県 (${Math.round(Object.keys(prefectureCoverage).length / 47 * 100)}%)`);
  
  // Missing prefectures
  const missingPrefectures = allPrefectures.filter(pref => !prefectureCoverage[pref]);
  console.log(`\n❌ 未カバー都道府県 (${missingPrefectures.length}件):`);
  missingPrefectures.forEach(pref => {
    console.log(`   - ${pref}`);
  });

  // Sparse coverage analysis  
  console.log('\n📈 密度分析（1件のみの都道府県）:');
  const sparsePrefectures = Object.entries(prefectureCoverage)
    .filter(([pref, gardens]) => gardens.length === 1)
    .map(([pref, gardens]) => ({ pref, count: gardens.length }));
  
  sparsePrefectures.forEach(({ pref, count }) => {
    console.log(`   - ${pref}: ${count}件（拡張余地大）`);
  });

  // High density areas that could be expanded
  console.log('\n🏙️ 高密度エリア（さらに拡張可能）:');
  const highDensityAreas = Object.entries(prefectureCoverage)
    .filter(([pref, gardens]) => gardens.length >= 4)
    .sort((a, b) => b[1].length - a[1].length);
  
  highDensityAreas.forEach(([pref, gardens]) => {
    console.log(`   - ${pref}: ${gardens.length}件（盆栽文化が盛んな地域）`);
  });

  // Expansion potential assessment
  console.log('\n🎯 拡張可能性判定:');
  
  const totalMissingSlots = missingPrefectures.length * 2; // 未カバー都道府県に各2件
  const sparseExpansion = sparsePrefectures.length * 1; // 1件の県にさらに1件
  const highDensityExpansion = highDensityAreas.length * 2; // 高密度エリアにさらに2件
  
  const totalPotential = totalMissingSlots + sparseExpansion + highDensityExpansion;
  
  console.log(`   📍 未カバー県拡張: +${totalMissingSlots}件`);
  console.log(`   📍 希薄県拡張: +${sparseExpansion}件`);
  console.log(`   📍 高密度県拡張: +${highDensityExpansion}件`);
  console.log(`   ✨ 合計拡張可能性: +${totalPotential}件`);
  console.log(`   🎯 目標総数: ${gardens.length + totalPotential}件`);

  // Research difficulty assessment
  console.log('\n🔍 リサーチ難易度:');
  console.log('   ✅ 簡単: 大都市圏・盆栽有名地域の追加調査');
  console.log('   ⚠️  中程度: 地方都市の園芸店・造園業者');
  console.log('   ❌ 困難: 過疎地域・盆栽文化の薄い地域');

  console.log('\n💡 推奨アプローチ:');
  console.log('   1️⃣ Phase 9: 未カバー5県に重点投入（高知県・秋田県・山口県・長崎県・大分県）');
  console.log('   2️⃣ Phase 10: 希薄県の充実（富山県・山形県・福島県など）');
  console.log('   3️⃣ Phase 11: 高密度エリアの深掘り（東京都・神奈川県・愛知県など）');
}

analyzeExpansionPotential();