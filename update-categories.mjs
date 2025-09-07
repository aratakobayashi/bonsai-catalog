import { createClient } from '@supabase/supabase-js';

// Supabase設定を直接記載（本番環境の値を使用）
const SUPABASE_URL = 'https://awaarykghpylggygkiyp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3YWFyeWtnaHB5bGdneWdraXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3OTE0MDksImV4cCI6MjA2NzM2NzQwOX0.J1dXm0eHB8RaqT_UnOI_zY7q1UyTaV4lLJtQT6EHhOE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateCategories() {
  console.log('🔄 商品カテゴリを新分類に更新開始...\n');
  
  // 1. 現在のカテゴリ分布を確認
  const { data: beforeData, error: beforeError } = await supabase
    .from('products')
    .select('category');
  
  if (beforeError) {
    console.error('エラー:', beforeError);
    return;
  }
  
  const beforeCount = {};
  beforeData.forEach(item => {
    beforeCount[item.category] = (beforeCount[item.category] || 0) + 1;
  });
  
  console.log('📊 更新前のカテゴリ分布:');
  console.log('=' .repeat(40));
  Object.entries(beforeCount).forEach(([category, count]) => {
    console.log(`${category}: ${count}件`);
  });
  
  // 2. カテゴリ更新を実行
  console.log('\n🔧 カテゴリ更新中...');
  
  const updates = [
    { old: '松類', new: '松柏類' },
    { old: '針葉樹', new: '松柏類' },
    { old: '落葉樹', new: '雑木類' },
    { old: '花木', new: '花もの' }
  ];
  
  for (const update of updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        category: update.new,
        updated_at: new Date().toISOString()
      })
      .eq('category', update.old);
    
    if (error) {
      console.error(`❌ ${update.old} → ${update.new} 更新エラー:`, error);
    } else {
      console.log(`✅ ${update.old} → ${update.new} 更新完了`);
    }
  }
  
  // 3. 更新後のカテゴリ分布を確認
  const { data: afterData, error: afterError } = await supabase
    .from('products')
    .select('category');
  
  if (afterError) {
    console.error('エラー:', afterError);
    return;
  }
  
  const afterCount = {};
  afterData.forEach(item => {
    afterCount[item.category] = (afterCount[item.category] || 0) + 1;
  });
  
  console.log('\n📊 更新後のカテゴリ分布:');
  console.log('=' .repeat(40));
  Object.entries(afterCount).forEach(([category, count]) => {
    console.log(`${category}: ${count}件`);
  });
  
  console.log('\n✨ カテゴリ更新が完了しました！');
  console.log('商品一覧ページのフィルターに新しいカテゴリが反映されるはずです。');
  
  process.exit(0);
}

updateCategories();