import { createClient } from '@supabase/supabase-js';

// 正しいSupabase設定（本番環境）
const SUPABASE_URL = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateCategoriesToProduction() {
  console.log('🔄 本番環境：商品カテゴリを新分類に更新開始...\n');
  
  // 1. 現在のカテゴリ分布を確認
  const { data: beforeData, error: beforeError } = await supabase
    .from('products')
    .select('id, name, category');
  
  if (beforeError) {
    console.error('エラー:', beforeError);
    return;
  }
  
  const beforeCount = {};
  beforeData.forEach(item => {
    beforeCount[item.category] = (beforeCount[item.category] || 0) + 1;
  });
  
  console.log('📊 更新前のカテゴリ分布:');
  console.log('='.repeat(40));
  Object.entries(beforeCount).forEach(([category, count]) => {
    console.log(`${category}: ${count}件`);
  });
  
  // 2. カテゴリ更新マッピング
  const categoryMapping = {
    '松類': '松柏類',
    '針葉樹': '松柏類',  // 松柏類に統合
    '落葉樹': '雑木類', 
    '花木': '花もの'
  };
  
  console.log('\n🔧 カテゴリ更新中...');
  
  // 3. 各カテゴリを順番に更新
  for (const [oldCategory, newCategory] of Object.entries(categoryMapping)) {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        category: newCategory,
        updated_at: new Date().toISOString()
      })
      .eq('category', oldCategory);
    
    if (error) {
      console.error(`❌ ${oldCategory} → ${newCategory} 更新エラー:`, error);
    } else {
      const affectedCount = beforeCount[oldCategory] || 0;
      console.log(`✅ ${oldCategory} → ${newCategory} (${affectedCount}件) 更新完了`);
    }
  }
  
  // 4. 更新後のカテゴリ分布を確認
  const { data: afterData, error: afterError } = await supabase
    .from('products')
    .select('id, name, category')
    .order('category');
  
  if (afterError) {
    console.error('エラー:', afterError);
    return;
  }
  
  const afterCount = {};
  afterData.forEach(item => {
    afterCount[item.category] = (afterCount[item.category] || 0) + 1;
  });
  
  console.log('\n📊 更新後のカテゴリ分布:');
  console.log('='.repeat(40));
  Object.entries(afterCount).forEach(([category, count]) => {
    console.log(`${category}: ${count}件`);
  });
  
  // 5. 新カテゴリの商品例を表示
  console.log('\n📋 更新後の商品例:');
  const newCategories = ['松柏類', '雑木類', '花もの', '実もの', '草もの'];
  
  for (const category of newCategories) {
    const { data: examples } = await supabase
      .from('products')
      .select('name, price')
      .eq('category', category)
      .limit(2);
    
    if (examples && examples.length > 0) {
      console.log(`\n  ${category} (${afterCount[category] || 0}件):`);
      examples.forEach(product => {
        console.log(`    • ${product.name} ¥${product.price}`);
      });
    } else {
      console.log(`\n  ${category}: データなし`);
    }
  }
  
  console.log('\n✨ カテゴリ更新が完了しました！');
  console.log('🎯 フィルターで正しく新カテゴリが選択できるようになります。');
  
  process.exit(0);
}

updateCategoriesToProduction();