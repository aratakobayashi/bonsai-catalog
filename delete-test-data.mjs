// Delete test data products safely
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// テストデータのIDリスト（2025/9/5 23:29:34に作成された8件）
const testDataIds = [
  '650e8400-e29b-41d4-a716-446655440007', // つつじ花盆栽
  '650e8400-e29b-41d4-a716-446655440003', // さくらんぼ盆栽
  '650e8400-e29b-41d4-a716-446655440001', // 黒松の小品盆栽
  '650e8400-e29b-41d4-a716-446655440006', // 五葉松盆栽
  '650e8400-e29b-41d4-a716-446655440004', // ミニ真柏盆栽セット
  '650e8400-e29b-41d4-a716-446655440005', // 欅（ケヤキ）大型盆栽
  '650e8400-e29b-41d4-a716-446655440008', // イチョウ盆栽
  '650e8400-e29b-41d4-a716-446655440002', // もみじ盆栽（紅葉）
];

async function deleteTestData() {
  console.log('🗑️  テストデータの削除を開始...\n');

  // 削除前に対象データを確認
  console.log('📋 削除対象の確認:');
  for (let i = 0; i < testDataIds.length; i++) {
    const id = testDataIds[i];
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, category, price')
      .eq('id', id)
      .single();

    if (error) {
      console.log(`❌ ID ${id}: 商品が見つかりません`);
    } else {
      console.log(`✅ ${i + 1}. ${product.name} (${product.category} - ¥${product.price})`);
    }
  }

  console.log('\n🔄 削除実行中...\n');

  // 一つずつ安全に削除
  let deletedCount = 0;
  for (let i = 0; i < testDataIds.length; i++) {
    const id = testDataIds[i];
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`❌ 削除失敗 [${i + 1}/${testDataIds.length}]: ${error.message}`);
    } else {
      deletedCount++;
      console.log(`✅ 削除完了 [${i + 1}/${testDataIds.length}]: ID ${id}`);
    }
  }

  // 削除結果の確認
  console.log(`\n📊 削除結果: ${deletedCount}/${testDataIds.length}件が削除されました\n`);

  // 残存データの確認
  const { data: remainingProducts, error: fetchError } = await supabase
    .from('products')
    .select('id, name, category, price, created_at')
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('❌ 残存データ取得エラー:', fetchError.message);
  } else {
    console.log('✅ 削除後の残存データ:');
    console.log('=' .repeat(50));
    if (remainingProducts.length === 0) {
      console.log('   データなし');
    } else {
      remainingProducts.forEach((product, index) => {
        const createdDate = new Date(product.created_at).toLocaleDateString('ja-JP');
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   カテゴリ: ${product.category} | 価格: ¥${product.price}`);
        console.log(`   作成日: ${createdDate}`);
        console.log('');
      });
    }
    
    console.log(`📈 現在の商品数: ${remainingProducts.length}件`);
    console.log('\n🎉 テストデータの削除が完了しました！');
    console.log('💡 これから新しい商品データの追加を相談できます。');
  }
}

deleteTestData();