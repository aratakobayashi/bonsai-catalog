// アフィリエイトリンク照合による画像URL復元システム
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 提供されたアフィリエイトリンク + 画像リンクペア
const affiliateImageMappings = [
  // 最初のバッチ
  { affiliateUrl: 'https://amzn.to/41DxV7w', imageUrl: 'https://m.media-amazon.com/images/I/51MbBfSVpHL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/46oN6E5', imageUrl: 'https://m.media-amazon.com/images/I/515gQ4OEJQL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/4mQPEAP', imageUrl: 'https://m.media-amazon.com/images/I/61-loxrp0sL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/47s6ocM', imageUrl: 'https://m.media-amazon.com/images/I/71x66VfHKHL._AC_SX679_.jpg' },
  { affiliateUrl: 'https://amzn.to/3HP9bT4', imageUrl: 'https://m.media-amazon.com/images/I/71tgtk9Ni9L._AC_SX679_.jpg' },
  { affiliateUrl: 'https://amzn.to/4m5QCYS', imageUrl: 'https://m.media-amazon.com/images/I/51Cj1lPmrdL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/4m9knbd', imageUrl: 'https://m.media-amazon.com/images/I/61nyA2CsadL._AC_SY879_.jpg' },
  { affiliateUrl: 'https://amzn.to/3VAc4do', imageUrl: 'https://m.media-amazon.com/images/I/519-ay-9lCL._AC_.jpg' },
  
  // 最新の13商品バッチ
  { affiliateUrl: 'https://amzn.to/3VDW0HC', imageUrl: 'https://m.media-amazon.com/images/I/51E5pGTA+KL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/3V1XPy3', imageUrl: 'https://m.media-amazon.com/images/I/51Sg2Bvz6jL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/46m7TIt', imageUrl: 'https://m.media-amazon.com/images/I/41-XBvRhWaL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/4gcVXfy', imageUrl: 'https://m.media-amazon.com/images/I/61JpP5dScwL._AC_SX679_.jpg' },
  { affiliateUrl: 'https://amzn.to/3VBomlT', imageUrl: 'https://m.media-amazon.com/images/I/41atUKZzgHL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/4njrGho', imageUrl: 'https://m.media-amazon.com/images/I/51nBRcpIjLL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/4mS4QOf', imageUrl: 'https://m.media-amazon.com/images/I/41eVXk8yuWL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/4ggzFJQ', imageUrl: 'https://m.media-amazon.com/images/I/61aPrlUDvGL._AC_SX679_.jpg' },
  { affiliateUrl: 'https://amzn.to/42dH0DZ', imageUrl: 'https://m.media-amazon.com/images/I/41axWV1pL8L._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/4m7mZWN', imageUrl: 'https://m.media-amazon.com/images/I/41G4wlwJr0L._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/464hIJH', imageUrl: 'https://m.media-amazon.com/images/I/51MDB6+H+ML._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/3JQfhTB', imageUrl: 'https://m.media-amazon.com/images/I/5180mtPmUhL._AC_.jpg' },
  { affiliateUrl: 'https://amzn.to/46aH4pp', imageUrl: 'https://m.media-amazon.com/images/I/41QMRrUvQHL._AC_.jpg' }
];

async function matchAffiliateImages() {
  try {
    console.log('🔗 アフィリエイトリンク照合システム開始...\\n');
    
    if (affiliateImageMappings.length === 0) {
      console.log('⚠️  アフィリエイトリンク一覧が設定されていません');
      console.log('\\n📋 設定方法:');
      console.log('1. 提供されたアフィリエイトリンク + 画像リンク一覧をスクリプトに貼り付け');
      console.log('2. 以下の形式で affiliateImageMappings 配列に追加:');
      console.log('   { affiliateUrl: "https://amzn.to/xxx", imageUrl: "https://m.media-amazon.com/images/I/xxx.jpg" }');
      console.log('\\n💡 準備ができたら再実行してください');
      return;
    }
    
    console.log(`📊 提供されたマッピング: ${affiliateImageMappings.length}件\\n`);
    
    // Unsplashプレースホルダーを使用している商品を取得
    const { data: unsplashProducts, error } = await supabase
      .from('products')
      .select('id, name, amazon_url, image_url')
      .like('image_url', '%unsplash.com%');
    
    if (error) {
      console.error('❌ データ取得エラー:', error.message);
      return;
    }
    
    console.log(`🖼️  Unsplashプレースホルダー商品: ${unsplashProducts?.length || 0}件\\n`);
    
    if (!unsplashProducts || unsplashProducts.length === 0) {
      console.log('✅ Unsplashプレースホルダーの商品はありません');
      return;
    }
    
    console.log('🔍 照合対象商品:');
    console.log('================');
    unsplashProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   アフィリエイトURL: ${product.amazon_url}`);
      console.log(`   現在の画像: ${product.image_url}`);
      console.log('');
    });
    
    let matchCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    
    console.log('🔗 アフィリエイトリンク照合実行:');
    console.log('==============================');
    
    for (const product of unsplashProducts) {
      try {
        const productAffiliateUrl = product.amazon_url;
        
        // アフィリエイトURLで照合
        const matchedMapping = affiliateImageMappings.find(mapping => 
          mapping.affiliateUrl === productAffiliateUrl
        );
        
        if (matchedMapping) {
          matchCount++;
          console.log(`\\n✅ 照合成功: ${product.name}`);
          console.log(`   アフィリエイトURL: ${productAffiliateUrl}`);
          console.log(`   新しい画像URL: ${matchedMapping.imageUrl}`);
          
          // 画像URLを更新
          const { error: updateError } = await supabase
            .from('products')
            .update({ image_url: matchedMapping.imageUrl })
            .eq('id', product.id);
          
          if (updateError) {
            console.error(`   ❌ 更新エラー: ${updateError.message}`);
            errorCount++;
          } else {
            console.log(`   🎉 画像URL更新完了`);
            updateCount++;
          }
        } else {
          console.log(`\\n⚠️  照合なし: ${product.name}`);
          console.log(`   アフィリエイトURL: ${productAffiliateUrl}`);
          console.log(`   → マッピング一覧に該当なし`);
        }
        
      } catch (productError) {
        console.error(`❌ ${product.name} 処理エラー:`, productError.message);
        errorCount++;
      }
    }
    
    console.log('\\n🎉 照合処理完了！');
    console.log('==================');
    console.log(`🔗 照合成功: ${matchCount}商品`);
    console.log(`✅ 更新成功: ${updateCount}商品`);
    console.log(`❌ エラー: ${errorCount}商品`);
    console.log(`⚠️  照合なし: ${unsplashProducts.length - matchCount}商品`);
    
    if (updateCount > 0) {
      // 最終確認
      const { data: finalCheck } = await supabase
        .from('products')
        .select('image_url');
      
      const finalStats = {
        amazon: 0,
        unsplash: 0,
        invalid: 0
      };
      
      finalCheck?.forEach(product => {
        const url = product.image_url || '';
        if (url.includes('amazon.com') || url.includes('media-amazon.com')) {
          finalStats.amazon++;
        } else if (url.includes('unsplash.com')) {
          finalStats.unsplash++;
        } else {
          finalStats.invalid++;
        }
      });
      
      console.log('\\n📊 最終画像URL状況:');
      console.log('===================');
      console.log(`✅ Amazon画像: ${finalStats.amazon}商品`);
      console.log(`🖼️  Unsplash画像: ${finalStats.unsplash}商品`);
      console.log(`❌ 無効画像: ${finalStats.invalid}商品`);
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('🔗 アフィリエイトリンク照合システム');
console.log('==================================');
matchAffiliateImages();