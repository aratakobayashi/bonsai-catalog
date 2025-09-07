// Check current database status
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ptbowbqrykqwxuzivbdv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek');

async function checkDatabase() {
  console.log('🌿 現在のデータベース状況を確認中...\n');

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
    list.forEach((garden, index) => {
      console.log(`    ${index + 1}. ${garden.name}`);
    });
  });

  // Show creation timestamps for recent entries
  console.log('\n📅 最新の登録園（直近10件）:');
  const recentGardens = [...gardens]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  recentGardens.forEach((garden, index) => {
    const date = new Date(garden.created_at).toLocaleString('ja-JP');
    console.log(`  ${index + 1}. ${garden.name} (${garden.prefecture}) - ${date}`);
  });

  // Check if any RLS restrictions
  console.log('\n🔐 RLS（Row Level Security）チェック:');
  const { data: publicData, error: publicError } = await supabase
    .from('gardens')
    .select('count')
    .single();
    
  if (publicError) {
    console.log('   ⚠️ パブリックアクセスでエラーあり:', publicError.message);
  } else {
    console.log('   ✅ パブリックアクセス正常');
  }
}

checkDatabase();