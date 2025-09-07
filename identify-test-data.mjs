// Identify test data among products
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function identifyTestData() {
  console.log('🔍 テストデータの特定中...\n');

  // 作成日時順で全商品を取得
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, created_at, updated_at, price, category')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`📊 全商品数: ${products.length}件\n`);
  console.log('📅 作成日時順の商品リスト:');
  console.log('=' .repeat(80));

  products.forEach((product, index) => {
    const createdDate = new Date(product.created_at).toLocaleString('ja-JP');
    const updatedDate = new Date(product.updated_at).toLocaleString('ja-JP');
    const isOld = index < 8; // 最初の8件をテストデータと仮定
    const marker = isOld ? '🧪 [TEST]' : '✅ [REAL]';
    
    console.log(`${index + 1}. ${marker} ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   カテゴリ: ${product.category} | 価格: ¥${product.price}`);
    console.log(`   作成: ${createdDate}`);
    console.log(`   更新: ${updatedDate}`);
    console.log('');
  });

  // テストデータ（最初の8件）の詳細
  const testDataProducts = products.slice(0, 8);
  const realDataProducts = products.slice(8);

  console.log('🧪 削除対象のテストデータ（最初の8件）:');
  console.log('=' .repeat(50));
  testDataProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} (${product.category} - ¥${product.price})`);
  });

  console.log('\n✅ 残す実際のデータ（新しい2件）:');
  console.log('=' .repeat(50));
  realDataProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} (${product.category} - ¥${product.price})`);
  });

  console.log(`\n📋 削除後の状況予想:`);
  console.log(`   削除対象: ${testDataProducts.length}件`);
  console.log(`   残存予定: ${realDataProducts.length}件`);
  
  // 削除実行の確認メッセージ
  console.log('\n⚠️  確認事項:');
  console.log('   上記の8件がテストデータで間違いないか確認してください。');
  console.log('   問題なければ削除スクリプトを実行します。');
}

identifyTestData();