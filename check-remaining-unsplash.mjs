// 残っているUnsplash画像商品の確認
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRemainingUnsplash() {
  try {
    console.log('🔍 残っているUnsplash画像商品確認...\\n');
    
    const { data: unsplashProducts, error } = await supabase
      .from('products')
      .select('id, name, price, amazon_url, image_url, created_at')
      .like('image_url', '%unsplash.com%')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ エラー:', error.message);
      return;
    }
    
    console.log(`📊 Unsplash画像商品: ${unsplashProducts?.length || 0}件\\n`);
    
    if (!unsplashProducts || unsplashProducts.length === 0) {
      console.log('✅ Unsplash画像の商品はありません！');
      return;
    }
    
    console.log('📋 残っているUnsplash画像商品一覧:');
    console.log('===================================');
    
    unsplashProducts.forEach((product, index) => {
      console.log(`\\n${index + 1}. ${product.name}`);
      console.log(`   価格: ¥${product.price.toLocaleString()}`);
      console.log(`   作成日: ${new Date(product.created_at).toLocaleDateString('ja-JP')}`);
      console.log(`   アフィリエイトURL: ${product.amazon_url || 'なし'}`);
      console.log(`   画像URL: ${product.image_url}`);
    });
    
    console.log('\\n\\n🤔 判断基準:');
    console.log('============');
    console.log('✅ 削除してOK: 架空商品（テスト用商品名、無効なアフィリエイトURL）');
    console.log('⚠️  要確認: 実商品（実際の商品名、有効なアフィリエイトURL）');
    console.log('\\n💡 実商品の場合は画像URLの修正が必要');
    console.log('   架空商品の場合は削除が適切');
    
    // 有効なAmazonアフィリエイトURLパターンをチェック
    const validAffiliateCount = unsplashProducts.filter(p => 
      p.amazon_url && (p.amazon_url.includes('amzn.to') || p.amazon_url.includes('amazon.co.jp'))
    ).length;
    
    console.log(`\\n📊 分析結果:`);
    console.log(`   有効なアフィリエイトURL: ${validAffiliateCount}商品`);
    console.log(`   無効・なし: ${unsplashProducts.length - validAffiliateCount}商品`);
    
    if (validAffiliateCount === 0) {
      console.log('\\n✅ 推奨: 全て削除（架空商品と思われる）');
    } else {
      console.log('\\n⚠️  推奨: 個別確認必要（実商品が混在している可能性）');
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('🔍 残存Unsplash画像商品確認');
console.log('==========================');
checkRemainingUnsplash();