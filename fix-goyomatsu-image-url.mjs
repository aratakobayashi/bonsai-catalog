import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 五葉松商品の画像URLを正確にローカルファイルパスに更新
 */
async function fixGoyomatsuImageUrl() {
  console.log('🔧 五葉松商品の画像URL修正中...');
  console.log('='.repeat(50));
  
  // 正確な商品ID（デバッグで確認済み）
  const productId = '9858bd55-6d3e-406b-a3be-5db66fd23d38';
  const localImageUrl = '/products/goyomatsu-bonsai.jpg';
  
  try {
    // 商品を正確なIDで検索
    console.log(`🔍 商品ID ${productId} を検索中...`);
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (fetchError || !product) {
      console.log('❌ 商品が見つかりません:', fetchError?.message);
      return;
    }
    
    console.log('✅ 商品を発見:');
    console.log(`  商品名: ${product.name}`);
    console.log(`  現在の画像URL: ${product.image_url}`);
    console.log(`  カテゴリ: ${product.category}`);
    console.log('');
    
    // 画像URLを正確に更新
    console.log(`🔄 画像URLを更新中: ${localImageUrl}`);
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ 
        image_url: localImageUrl,
        updated_at: new Date().toISOString() // 明示的に更新時刻を設定
      })
      .eq('id', productId)
      .select('*');
    
    if (updateError) {
      console.log('❌ 更新エラー:', updateError.message);
      return;
    }
    
    if (!updatedProduct || updatedProduct.length === 0) {
      console.log('❌ 更新された商品データが返されませんでした');
      return;
    }
    
    console.log('✅ 画像URL更新成功！');
    console.log('');
    console.log('📊 更新後の商品情報:');
    console.log(`  商品名: ${updatedProduct[0].name}`);
    console.log(`  新しい画像URL: ${updatedProduct[0].image_url}`);
    console.log(`  更新日時: ${updatedProduct[0].updated_at}`);
    console.log('');
    
    // ローカルファイル確認
    console.log('🖼️ ローカル画像ファイル情報:');
    console.log(`  ファイルパス: public${localImageUrl}`);
    console.log(`  公開URL: ${localImageUrl}`);
    console.log(`  これでNext.js Image最適化が正常に動作します`);
    
    // 確認クエリ
    console.log('\n🔍 更新確認のため再度検索...');
    const { data: confirmProduct } = await supabase
      .from('products')
      .select('id, name, image_url, updated_at')
      .eq('id', productId)
      .single();
    
    if (confirmProduct) {
      console.log('✅ 確認成功:');
      console.log(`  画像URL: ${confirmProduct.image_url}`);
      console.log(`  更新確認完了`);
    }
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
}

// 実行
fixGoyomatsuImageUrl().catch(console.error);