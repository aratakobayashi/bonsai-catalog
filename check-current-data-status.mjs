// Check current real bonsai gardens data status and expansion potential
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeCurrentData() {
  console.log('🌿 現在の盆栽園データ状況分析...\n');

  const { data: gardens, error } = await supabase
    .from('gardens')
    .select('*')
    .order('prefecture', { ascending: true });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`📊 現在の登録園数: ${gardens.length}件\n`);

  // Prefecture analysis
  const byPrefecture = {};
  gardens.forEach(garden => {
    const pref = garden.prefecture || '未設定';
    if (!byPrefecture[pref]) byPrefecture[pref] = [];
    byPrefecture[pref].push(garden);
  });

  console.log('🗾 都道府県別現状:');
  Object.entries(byPrefecture).forEach(([pref, list]) => {
    console.log(`\n  ${pref}: ${list.length}件`);
    list.forEach(garden => {
      const phone = garden.phone ? '📞' : '❌';
      const website = garden.website_url ? '🌐' : '❌';
      const experience = garden.experience_programs ? '🎓' : '❌';
      const featured = garden.featured ? '⭐' : '';
      console.log(`    • ${garden.name} ${phone}${website}${experience} ${featured}`);
    });
  });

  // Data quality analysis
  const stats = {
    total: gardens.length,
    withPhone: gardens.filter(g => g.phone).length,
    withWebsite: gardens.filter(g => g.website_url).length,
    withExperience: gardens.filter(g => g.experience_programs).length,
    featured: gardens.filter(g => g.featured).length,
    withSpecialties: gardens.filter(g => g.specialties && g.specialties.length > 0).length,
    withOwner: gardens.filter(g => g.owner_name).length,
    withEstablishedYear: gardens.filter(g => g.established_year).length
  };

  console.log('\n📈 データ充実度:');
  console.log(`   電話番号: ${stats.withPhone}/${stats.total}件 (${Math.round(stats.withPhone/stats.total*100)}%)`);
  console.log(`   Webサイト: ${stats.withWebsite}/${stats.total}件 (${Math.round(stats.withWebsite/stats.total*100)}%)`);
  console.log(`   体験プログラム: ${stats.withExperience}/${stats.total}件 (${Math.round(stats.withExperience/stats.total*100)}%)`);
  console.log(`   注目園: ${stats.featured}/${stats.total}件 (${Math.round(stats.featured/stats.total*100)}%)`);
  console.log(`   専門分野: ${stats.withSpecialties}/${stats.total}件 (${Math.round(stats.withSpecialties/stats.total*100)}%)`);
  console.log(`   園主情報: ${stats.withOwner}/${stats.total}件 (${Math.round(stats.withOwner/stats.total*100)}%)`);
  console.log(`   創業年: ${stats.withEstablishedYear}/${stats.total}件 (${Math.round(stats.withEstablishedYear/stats.total*100)}%)`);

  // Expansion potential analysis
  console.log('\n🚀 拡張ポテンシャル分析:');
  
  // Known major bonsai areas not yet covered
  const majorBonsaiAreas = [
    { prefecture: '福岡県', area: '久留米市', info: '植物生産地・桜・梅盆栽' },
    { prefecture: '愛知県', area: '春日井市', info: '東海地区の盆栽産地' },
    { prefecture: '群馬県', area: '前橋市', info: '関東の盆栽生産地' },
    { prefecture: '岐阜県', area: '各務原市', info: '中部地区の盆栽園' },
    { prefecture: '静岡県', area: '浜松市', info: '東海の盆栽文化' },
    { prefecture: '京都府', area: '京都市', info: '伝統的な盆栽文化' },
    { prefecture: '大阪府', area: '池田市・堺市', info: '関西の盆栽園' },
    { prefecture: '兵庫県', area: '神戸市', info: '関西圏の盆栽文化' },
    { prefecture: '広島県', area: '福山市', info: '中国地方の盆栽' },
    { prefecture: '北海道', area: '札幌市', info: '北海道の盆栽園' }
  ];

  const coveredPrefectures = Object.keys(byPrefecture);
  const uncoveredAreas = majorBonsaiAreas.filter(area => 
    !coveredPrefectures.includes(area.prefecture)
  );

  console.log('\n🎯 未開拓の主要エリア:');
  uncoveredAreas.forEach(area => {
    console.log(`   • ${area.prefecture} ${area.area} - ${area.info}`);
  });

  // Expansion suggestions
  console.log('\n💡 拡張提案:');
  
  if (byPrefecture['埼玉県'] && byPrefecture['埼玉県'].length === 5) {
    console.log('   ✅ 埼玉県（大宮盆栽村）: 5園 - 十分な coverage');
  }
  
  if (byPrefecture['香川県'] && byPrefecture['香川県'].length === 4) {
    console.log('   ✅ 香川県（松盆栽産地）: 4園 - 良好な coverage');
    console.log('   🔍 香川県追加候補: さぬき市、観音寺市の盆栽園');
  }
  
  if (byPrefecture['東京都'] && byPrefecture['東京都'].length === 1) {
    console.log('   ⚡ 東京都: 1園のみ - 拡張余地大');
    console.log('   🔍 東京都追加候補: 江戸川区、足立区、練馬区の盆栽園');
  }

  console.log('\n📋 次のフェーズ推奨:');
  console.log('   🥇 Priority 1: 福岡県久留米市 (植物生産の聖地)');
  console.log('   🥈 Priority 2: 愛知県春日井市 (東海地区代表)');
  console.log('   🥉 Priority 3: 京都府京都市 (伝統文化)');
  console.log('   📍 地域バランス: 関西・中部・九州への展開');

  console.log('\n🎯 目標設定案:');
  console.log('   📈 短期目標: 15-20園 (現在の1.5-2倍)');
  console.log('   📈 中期目標: 30-50園 (全国主要エリアカバー)');
  console.log('   📈 長期目標: 100園+ (地域密着型サービス)');
}

analyzeCurrentData();