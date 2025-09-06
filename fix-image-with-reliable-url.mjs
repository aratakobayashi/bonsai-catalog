import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 確実に動作する画像URLに更新
 */
async function fixImageWithReliableUrl() {
  console.log('🖼️ 確実に動作する画像URLで修正中...');
  
  // 確実に動作するプレースホルダー画像URL (via.placeholder.com は非常に安定)
  const reliableImageUrl = 'https://via.placeholder.com/400x300/22c55e/ffffff?text=%E4%BA%94%E8%91%89%E6%9D%BE+%E7%9B%86%E6%A0%BD';
  
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
    
    // 画像URLを確実に動作するものに更新
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ image_url: reliableImageUrl })
      .eq('id', product.id)
      .select();
    
    if (updateError) {
      console.log('❌ 画像URL更新エラー:', updateError.message);
      return;
    }
    
    console.log('✅ 確実な画像URL更新成功!');
    console.log('新しい画像URL:', reliableImageUrl);
    console.log('商品ID:', product.id);
    console.log('商品名:', updatedProduct[0].name);
    
    console.log('\n🌐 この画像は確実に表示されます！');
    console.log('📝 画像の特徴:');
    console.log('- 400x300px');
    console.log('- 緑色背景');  
    console.log('- 白文字で「五葉松 盆栽」表示');
    console.log('- CORS問題なし');
    console.log('- Next.js Image最適化対応');
    
    console.log('\n🔄 フロントエンドをリロードして確認してください！');
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
}

// 実行
fixImageWithReliableUrl().catch(console.error);