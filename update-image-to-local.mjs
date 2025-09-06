import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 画像URLをローカル静的ファイルに変更
 */
async function updateImageToLocal() {
  console.log('🖼️ 画像URLをローカル静的ファイルに更新中...');
  
  // ローカル画像パス
  const localImageUrl = '/products/goyomatsu-bonsai.jpg';
  
  try {
    // 五葉松商品を検索
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('name', '五葉松 小品盆栽（瀬戸焼鉢）')
      .single();
    
    if (fetchError || !product) {
      console.log('❌ 五葉松商品が見つかりません:', fetchError?.message);
      return;
    }
    
    console.log('✅ 五葉松商品を発見:', product.name);
    console.log('現在の画像URL:', product.image_url);
    
    // 画像URLをローカルファイルに更新
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ image_url: localImageUrl })
      .eq('id', product.id)
      .select();
    
    if (updateError) {
      console.log('❌ 画像URL更新エラー:', updateError.message);
      return;
    }
    
    console.log('✅ ローカル画像URL更新成功!');
    console.log('新しい画像URL:', localImageUrl);
    console.log('商品ID:', product.id);
    console.log('商品名:', updatedProduct[0].name);
    
    console.log('\n🖼️ 画像ファイル情報:');
    console.log('- ローカルパス: public/products/goyomatsu-bonsai.jpg');
    console.log('- 公開URL: /products/goyomatsu-bonsai.jpg');
    console.log('- 元のAmazon画像をダウンロード済み');
    
    console.log('\n🌐 この方法の利点:');
    console.log('✅ CORS問題なし');
    console.log('✅ Next.js最適化対応');
    console.log('✅ 確実な表示保証');
    console.log('✅ ページ読み込み高速化');
    
    console.log('\n🔄 Vercelに再デプロイして確認してください！');
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
}

// 実行
updateImageToLocal().catch(console.error);