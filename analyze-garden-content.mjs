// Analyze garden data quality for detail pages
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ptbowbqrykqwxuzivbdv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek');

async function analyzeContentQuality() {
  console.log('📊 盆栽園データ品質分析（詳細ページ作成可否判定）\n');

  const { data: gardens, error } = await supabase
    .from('gardens')
    .select('*')
    .limit(10);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  let totalWords = 0;
  let hasWebsite = 0;
  let hasPhone = 0;
  let hasBusinessHours = 0;
  let hasSpecialties = 0;
  let hasExperience = 0;
  let hasParking = 0;

  console.log('🔍 サンプル10件の詳細情報:');
  gardens.forEach((garden, i) => {
    const wordCount = garden.description?.length || 0;
    totalWords += wordCount;
    
    if (garden.website_url) hasWebsite++;
    if (garden.phone) hasPhone++;
    if (garden.business_hours) hasBusinessHours++;
    if (garden.specialties?.length > 0) hasSpecialties++;
    if (garden.experience_programs) hasExperience++;
    if (garden.parking_info) hasParking++;

    console.log(`\n${i+1}. ${garden.name} (${garden.prefecture})`);
    console.log(`   📝 説明文: ${wordCount}文字`);
    console.log(`   🏷️  専門分野: ${garden.specialties?.length || 0}個 [${garden.specialties?.join(', ') || 'なし'}]`);
    console.log(`   🌐 公式サイト: ${garden.website_url ? '✅' : '❌'}`);
    console.log(`   📞 電話: ${garden.phone ? '✅ ' + garden.phone : '❌'}`);
    console.log(`   🕒 営業時間: ${garden.business_hours ? '✅ ' + garden.business_hours : '❌'}`);
    console.log(`   🚗 駐車場: ${garden.parking_info ? '✅ ' + garden.parking_info : '❌'}`);
    console.log(`   👥 体験: ${garden.experience_programs ? '✅' : '❌'}`);
  });

  // Summary
  console.log('\n📈 品質サマリー:');
  console.log(`   平均説明文字数: ${Math.round(totalWords / gardens.length)}文字`);
  console.log(`   公式サイト率: ${Math.round(hasWebsite / gardens.length * 100)}%`);
  console.log(`   電話番号率: ${Math.round(hasPhone / gardens.length * 100)}%`);
  console.log(`   営業時間率: ${Math.round(hasBusinessHours / gardens.length * 100)}%`);
  console.log(`   専門分野率: ${Math.round(hasSpecialties / gardens.length * 100)}%`);
  console.log(`   体験プログラム率: ${Math.round(hasExperience / gardens.length * 100)}%`);
  console.log(`   駐車場情報率: ${Math.round(hasParking / gardens.length * 100)}%`);

  // SEO assessment
  console.log('\n🎯 SEO品質判定:');
  const avgWords = totalWords / gardens.length;
  
  if (avgWords < 50) {
    console.log('   ❌ コンテンツ量不足 (平均50文字未満)');
    console.log('   💡 推奨: 説明文を150-300文字に拡張');
  } else if (avgWords < 100) {
    console.log('   ⚠️ コンテンツ量やや不足 (平均100文字未満)');
    console.log('   💡 推奨: もう少し詳細な説明が欲しい');
  } else {
    console.log('   ✅ コンテンツ量OK');
  }

  if (hasWebsite / gardens.length > 0.8) {
    console.log('   ✅ 外部リンク豊富（SEOプラス）');
  } else {
    console.log('   ⚠️ 外部リンクやや少ない');
  }

  console.log('\n🚀 詳細ページ作成判定:');
  if (avgWords > 80 && hasWebsite / gardens.length > 0.7) {
    console.log('   ✅ 作成推奨 - 十分な情報量とSEO価値あり');
  } else if (avgWords > 50) {
    console.log('   ⚠️ 条件付き推奨 - 情報補強すれば価値あり');
  } else {
    console.log('   ❌ 作成非推奨 - コンテンツ不足、SEO効果薄い');
  }
}

analyzeContentQuality();