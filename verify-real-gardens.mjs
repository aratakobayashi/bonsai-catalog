// Verify real bonsai gardens data insertion
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyGardens() {
  console.log('🌿 実在盆栽園データ確認中...\n');

  // Fetch all gardens
  const { data: gardens, error } = await supabase
    .from('gardens')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching gardens:', error.message);
    return;
  }

  console.log(`📊 登録された盆栽園: ${gardens.length}件\n`);

  // Group by prefecture
  const byPrefecture = {};
  gardens.forEach(garden => {
    const pref = garden.prefecture || '未設定';
    if (!byPrefecture[pref]) byPrefecture[pref] = [];
    byPrefecture[pref].push(garden);
  });

  console.log('🗾 都道府県別:');
  Object.entries(byPrefecture).forEach(([pref, list]) => {
    console.log(`\n  ${pref}: ${list.length}件`);
    list.forEach(garden => {
      const phone = garden.phone ? `📞${garden.phone}` : '';
      const website = garden.website_url ? '🌐' : '';
      const experience = garden.experience_programs ? '🎓' : '';
      const featured = garden.featured ? '⭐' : '';
      console.log(`    • ${garden.name} ${phone} ${website} ${experience} ${featured}`);
    });
  });

  // Statistics
  const stats = {
    withPhone: gardens.filter(g => g.phone).length,
    withWebsite: gardens.filter(g => g.website_url).length,
    withExperience: gardens.filter(g => g.experience_programs).length,
    withRating: gardens.filter(g => g.rating).length,
    featured: gardens.filter(g => g.featured).length,
    withOwner: gardens.filter(g => g.owner_name).length,
    withSpecialties: gardens.filter(g => g.specialties && g.specialties.length > 0).length
  };

  console.log('\n📈 データ充実度:');
  console.log(`   電話番号: ${stats.withPhone}/${gardens.length}件`);
  console.log(`   Webサイト: ${stats.withWebsite}/${gardens.length}件`);
  console.log(`   体験プログラム: ${stats.withExperience}/${gardens.length}件`);
  console.log(`   評価: ${stats.withRating}/${gardens.length}件`);
  console.log(`   注目園: ${stats.featured}/${gardens.length}件`);
  console.log(`   園主情報: ${stats.withOwner}/${gardens.length}件`);
  console.log(`   専門分野: ${stats.withSpecialties}/${gardens.length}件`);

  // Sample detailed garden
  console.log('\n🌸 サンプル詳細（春花園BONSAI美術館）:');
  const shunkaen = gardens.find(g => g.name === '春花園BONSAI美術館');
  if (shunkaen) {
    console.log(`   名前: ${shunkaen.name}`);
    console.log(`   住所: ${shunkaen.address}`);
    console.log(`   電話: ${shunkaen.phone}`);
    console.log(`   営業時間: ${shunkaen.business_hours}`);
    console.log(`   定休日: ${JSON.stringify(shunkaen.closed_days)}`);
    console.log(`   専門分野: ${JSON.stringify(shunkaen.specialties)}`);
    console.log(`   園主: ${shunkaen.owner_name}`);
    console.log(`   評価: ${shunkaen.rating}⭐ (${shunkaen.review_count}件)`);
  }
}

verifyGardens();