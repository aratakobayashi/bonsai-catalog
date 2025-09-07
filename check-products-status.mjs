// Check current bonsai products data status
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductsStatus() {
  console.log('🛍️ 現在の盆栽商品データ状況確認...\n');

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`📊 現在の商品数: ${products.length}件\n`);

  if (products.length === 0) {
    console.log('⚠️  商品データがまだありません。');
    return;
  }

  // Category analysis
  const byCategory = {};
  products.forEach(product => {
    const cat = product.category || '未設定';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(product);
  });

  console.log('🏷️ カテゴリ別現状:');
  Object.entries(byCategory).forEach(([category, list]) => {
    console.log(`\n  ${category}: ${list.length}件`);
    list.slice(0, 3).forEach(product => {
      console.log(`    • ${product.name} ¥${product.price}`);
    });
    if (list.length > 3) {
      console.log(`    ... (他${list.length - 3}件)`);
    }
  });

  console.log('\n📋 カテゴリ変換が必要かどうか:');
  const oldCategories = ['松類', '針葉樹', '落葉樹', '花木'];
  const newCategories = ['松柏類', '雑木類', '花もの', '実もの', '草もの'];
  
  const hasOldCategories = oldCategories.some(cat => byCategory[cat]);
  const hasNewCategories = newCategories.some(cat => byCategory[cat]);

  if (hasOldCategories && !hasNewCategories) {
    console.log('   🔄 旧カテゴリが使用されています。新カテゴリへの更新が必要です。');
  } else if (hasNewCategories && !hasOldCategories) {
    console.log('   ✅ 既に新カテゴリが使用されています。');
  } else if (hasOldCategories && hasNewCategories) {
    console.log('   ⚠️  旧・新両方のカテゴリが混在しています。統一が必要です。');
  } else {
    console.log('   ❓ その他のカテゴリが使用されています。');
  }
}

checkProductsStatus();