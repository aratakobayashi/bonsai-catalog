// 無効な画像URLを修正するスクリプト
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// プレースホルダー画像URL（無料のストック写真）
const PLACEHOLDER_IMAGES = {
  '松柏類': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
  '雑木類': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
  '花もの': 'https://images.unsplash.com/photo-1461353049862-a17a424ca2a4?w=400&h=400&fit=crop',
  '実もの': 'https://images.unsplash.com/photo-1574781330855-d0db6cc78e4b?w=400&h=400&fit=crop',
  '草もの': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=400&fit=crop'
};

async function fixImageUrls() {
  try {
    console.log('🔧 無効な画像URL修正開始...\\n');
    
    // 今日追加した商品を特定（新規登録商品）
    const today = new Date().toISOString().split('T')[0];
    
    const { data: newProducts, error } = await supabase
      .from('products')
      .select('id, name, category, image_url')
      .gte('created_at', today + 'T00:00:00');

    if (error) {
      console.error('❌ エラー:', error.message);
      return;
    }

    if (!newProducts || newProducts.length === 0) {
      console.log('今日追加された商品が見つかりません。全商品をチェックします...');
      
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, category, image_url');
        
      // 明らかに架空のURLパターンをチェック
      const invalidProducts = allProducts?.filter(product => 
        product.image_url.includes('_AC_UX679_') && 
        !product.image_url.startsWith('https://m.media-amazon.com/images/I/')
      ) || [];
      
      console.log(`架空URL商品数: ${invalidProducts.length}商品`);
      newProducts = invalidProducts;
    }

    console.log(`📊 修正対象商品: ${newProducts?.length || 0}商品\\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of newProducts || []) {
      try {
        const placeholderUrl = PLACEHOLDER_IMAGES[product.category] || PLACEHOLDER_IMAGES['松柏類'];
        
        console.log(`🖼️  修正中: ${product.name}`);
        console.log(`   カテゴリー: ${product.category}`);
        console.log(`   旧URL: ${product.image_url}`);
        console.log(`   新URL: ${placeholderUrl}`);

        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: placeholderUrl })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ 更新失敗: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`✅ 更新成功`);
          successCount++;
        }
        console.log('');

      } catch (productError) {
        console.error(`❌ ${product.name} 処理エラー:`, productError.message);
        errorCount++;
      }
    }

    console.log('🎉 画像URL修正完了！');
    console.log('====================');
    console.log(`✅ 修正成功: ${successCount}商品`);
    console.log(`❌ 修正失敗: ${errorCount}商品`);
    
    if (successCount > 0) {
      console.log('\\n🖼️  使用したプレースホルダー画像:');
      Object.keys(PLACEHOLDER_IMAGES).forEach(category => {
        console.log(`   ${category}: Unsplash高品質画像`);
      });
      console.log('\\n💡 今後は実際のAmazon商品画像URLを使用してください');
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('🖼️  盆栽カタログ - 画像URL修正');
console.log('===============================');
fixImageUrls();