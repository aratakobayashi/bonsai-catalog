// Clean approach: Backup real data and identify what needs to be preserved
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanProductsData() {
  console.log('🔍 実際のデータを特定して保護します...\n');

  // 全商品を取得
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  // 実際のデータ（9/6以降に作成されたもの）を特定
  const realProducts = products.filter(product => {
    const createdDate = new Date(product.created_at);
    const cutoffDate = new Date('2025-09-06');
    return createdDate >= cutoffDate;
  });

  // テストデータを特定
  const testProducts = products.filter(product => {
    const createdDate = new Date(product.created_at);
    const cutoffDate = new Date('2025-09-06');
    return createdDate < cutoffDate;
  });

  console.log('✅ 保護対象の実際のデータ:');
  console.log('=' .repeat(50));
  realProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   カテゴリ: ${product.category} | 価格: ¥${product.price}`);
    console.log(`   作成: ${new Date(product.created_at).toLocaleString('ja-JP')}`);
    console.log('');
  });

  console.log('🧪 削除予定のテストデータ:');
  console.log('=' .repeat(50));
  testProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   カテゴリ: ${product.category} | 価格: ¥${product.price}`);
  });

  console.log(`\n📊 現状:`);
  console.log(`   実際のデータ: ${realProducts.length}件`);
  console.log(`   テストデータ: ${testProducts.length}件`);
  console.log(`   総計: ${products.length}件`);

  console.log('\n💡 次のステップ:');
  console.log('   1. Supabaseダッシュボードで手動削除');
  console.log('   2. または、管理者権限でSQL実行');
  console.log('   3. 実際のデータが2件残ることを確認');
  
  // 実際のデータをJSONファイルとして保存（バックアップ）
  const fs = await import('fs');
  fs.writeFileSync('real-products-backup.json', JSON.stringify(realProducts, null, 2));
  console.log('   4. ✅ 実際のデータをreal-products-backup.jsonにバックアップ済み');
}

cleanProductsData();