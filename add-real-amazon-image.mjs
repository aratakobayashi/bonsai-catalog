import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Amazon商品の実際の画像URLを手動で設定
 * 
 * 手順:
 * 1. Amazon商品ページ（https://www.amazon.co.jp/dp/B00D9IOKXI）にアクセス
 * 2. 商品画像を右クリック → 「画像アドレスをコピー」
 * 3. 下記のamazonImageUrlに貼り付け
 * 4. このスクリプトを実行
 */
async function addRealAmazonImage() {
  console.log('🖼️ Amazon商品の実際の画像URLを設定...');
  
  // ここに実際のAmazon画像URLを貼り付けてください
  // 例: 'https://m.media-amazon.com/images/I/71abc123def.jpg' 
  const amazonImageUrl = 'https://m.media-amazon.com/images/I/51ZGxT6Gb0L._AC_.jpg';
  
  if (amazonImageUrl === 'PASTE_AMAZON_IMAGE_URL_HERE') {
    console.log('❌ Amazon商品ページから画像URLをコピーして設定してください！');
    console.log('');
    console.log('📋 手順:');
    console.log('1. https://www.amazon.co.jp/dp/B00D9IOKXI にアクセス');
    console.log('2. 商品画像を右クリック → 「画像アドレスをコピー」');
    console.log('3. このスクリプトのamazonImageUrl変数に貼り付け');
    console.log('4. スクリプトを再実行');
    console.log('');
    console.log('💡 または、Next.jsのnext.config.jsにAmazonドメインを追加する方法もあります');
    return;
  }
  
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
    
    // 画像URLを実際のAmazon画像に更新
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ image_url: amazonImageUrl })
      .eq('id', product.id)
      .select();
    
    if (updateError) {
      console.log('❌ 画像URL更新エラー:', updateError.message);
      return;
    }
    
    console.log('✅ Amazon実画像URL更新成功!');
    console.log('新しい画像URL:', amazonImageUrl);
    console.log('商品ID:', product.id);
    
    console.log('');
    console.log('⚠️  Next.jsの画像最適化でエラーが出る場合:');
    console.log('next.config.js に Amazon ドメインを追加する必要があります');
    console.log('');
    console.log('🔄 フロントエンドをリロードして確認してください！');
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
}

// 実行
addRealAmazonImage().catch(console.error);