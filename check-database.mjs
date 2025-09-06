import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

async function checkDatabase() {
  console.log('🔍 データベース構造確認中...');

  // まずは任意のクエリで接続確認
  try {
    const { data, error } = await supabase.from('products').select('count').single();
    console.log('✅ Supabase接続成功');
    if (error) {
      console.log('⚠️  productsテーブルが存在しません:', error.message);
      console.log('\n📋 次のステップ:');
      console.log('1. Supabaseダッシュボードでproductsテーブルを作成');
      console.log('2. または、マイグレーションスクリプトを実行');
      console.log('3. 初期データの投入');
    }
  } catch (err) {
    console.log('❌ 接続エラー:', err.message);
  }

  // 他に存在するテーブルがあるか確認してみましょう
  console.log('\n🔍 利用可能なテーブル確認...');
  try {
    // よくあるテーブル名で確認
    const possibleTables = ['users', 'profiles', 'items', 'bonsai', 'catalog'];
    
    for (const table of possibleTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
          console.log('✅ テーブル見つかりました:', table);
        }
      } catch (e) {
        // テーブルが存在しない場合は無視
      }
    }
  } catch (err) {
    console.log('テーブル確認中にエラー:', err.message);
  }
}

checkDatabase().catch(console.error);