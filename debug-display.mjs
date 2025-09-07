// Debug display issue
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ptbowbqrykqwxuzivbdv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek');

async function debugDisplay() {
  console.log('🔍 本番サイト表示問題をデバッグ中...\n');

  // 本番サイトと同じクエリで確認
  const { data, error } = await supabase
    .from('gardens')
    .select('*')
    .order('created_at', { ascending: false });  // 本番と同じソート

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 created_atの降順でソートした結果: ${data.length}件`);
  
  console.log('\n🏆 最初の5件（本番サイトで表示される最初の園）:');
  data.slice(0, 5).forEach((garden, i) => {
    const date = new Date(garden.created_at).toLocaleString();
    console.log(`  ${i+1}. ${garden.name} (${garden.prefecture}) - ${date}`);
  });

  console.log('\n🎯 24番目の園（本番サイトの最後）:');
  if (data[23]) {
    const date = new Date(data[23].created_at).toLocaleString();
    console.log(`  24. ${data[23].name} (${data[23].prefecture}) - ${date}`);
  }

  console.log('\n❌ 25番目以降（本番サイトで表示されない園）:');
  data.slice(24, 34).forEach((garden, i) => {
    const date = new Date(garden.created_at).toLocaleString();
    console.log(`  ${i+25}. ${garden.name} (${garden.prefecture}) - ${date}`);
  });

  // Check for NULL created_at values
  const nullCreatedAt = data.filter(g => !g.created_at);
  if (nullCreatedAt.length > 0) {
    console.log(`\n⚠️  created_atがNULLの園: ${nullCreatedAt.length}件`);
    nullCreatedAt.forEach(garden => {
      console.log(`    - ${garden.name} (${garden.prefecture})`);
    });
  }

  // Check for very old dates that might not display
  const oldDates = data.filter(g => g.created_at && new Date(g.created_at) < new Date('2024-01-01'));
  if (oldDates.length > 0) {
    console.log(`\n📅 2024年以前のデータ: ${oldDates.length}件`);
  }

  console.log('\n🔍 可能な原因:');
  console.log('   1. Vercelデプロイが古い状態');
  console.log('   2. 本番環境とローカル環境のSupabase接続設定違い');
  console.log('   3. JavaScriptエラーで途中レンダリング停止');
  console.log('   4. ブラウザのメモリ制限でレンダリング中断');
}

debugDisplay();