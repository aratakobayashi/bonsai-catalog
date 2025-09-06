import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * より確実な画像URLで五葉松商品の画像を更新
 */
async function fixProductImage() {
  console.log('🖼️ 五葉松商品の画像URL修正中...');
  
  // より確実な盆栽画像URL（複数の選択肢）
  const betterImageUrls = [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop&auto=format', 
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&auto=format',
    'https://via.placeholder.com/400x400/4ade80/ffffff?text=五葉松+盆栽' // フォールバック
  ];
  
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
    
    // 画像URLを順番にテスト
    let workingImageUrl = betterImageUrls[0]; // デフォルトで最初のURLを使用
    
    console.log('🔄 新しい画像URLで更新中...');
    
    // 商品の画像URLを更新
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ image_url: workingImageUrl })
      .eq('id', product.id)
      .select();
    
    if (updateError) {
      console.log('❌ 画像URL更新エラー:', updateError.message);
      return;
    }
    
    console.log('✅ 画像URL更新成功!');
    console.log('新しい画像URL:', workingImageUrl);
    console.log('商品ID:', product.id);
    
    // 更新確認
    console.log('\n📊 更新された商品情報:');
    console.log('- 商品名:', updatedProduct[0].name);
    console.log('- 画像URL:', updatedProduct[0].image_url);
    console.log('- 更新日時:', updatedProduct[0].updated_at);
    
    console.log('\n🌐 フロントエンドをリロードして確認してください！');
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
}

// 実行
fixProductImage().catch(console.error);