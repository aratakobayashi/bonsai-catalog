// 商品名ベースの画像URL照合システム
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 提供された正しい商品データ（商品名をキーとして画像URL照合）
const correctImageMappings = [
  {
    name: 'ミニ盆栽：糸魚川真柏（曲・3年生）*（瀬戸焼白緑釉掛け丸深鉢）',
    price: 3970,
    affiliateUrl: 'https://amzn.to/3VDW0HC',
    imageUrl: 'https://m.media-amazon.com/images/I/51E5pGTA+KL._AC_.jpg'
  },
  {
    name: '一才藤（小・萬古焼みどり深鉢）',
    price: 3980,
    affiliateUrl: 'https://amzn.to/3V1XPy3',
    imageUrl: 'https://m.media-amazon.com/images/I/51Sg2Bvz6jL._AC_.jpg'
  },
  {
    name: 'ハナカイドウ盆栽',
    price: 6980,
    affiliateUrl: 'https://amzn.to/46m7TIt',
    imageUrl: 'https://m.media-amazon.com/images/I/41-XBvRhWaL._AC_.jpg'
  },
  {
    name: 'ミニ盆栽 七福南天南天ボンサイ',
    price: 3980,
    affiliateUrl: 'https://amzn.to/4gcVXfy',
    imageUrl: 'https://m.media-amazon.com/images/I/61JpP5dScwL._AC_SX679_.jpg'
  },
  {
    name: '姫りんごちゃん(信楽焼青銅中深丸鉢)',
    price: 4780,
    affiliateUrl: 'https://amzn.to/3VBomlT',
    imageUrl: 'https://m.media-amazon.com/images/I/41atUKZzgHL._AC_.jpg'
  },
  {
    name: 'ミニ盆栽：寒椿(黒色緑縁瀬戸焼小鉢)',
    price: 3480,
    affiliateUrl: 'https://amzn.to/4njrGho',
    imageUrl: 'https://m.media-amazon.com/images/I/51nBRcpIjLL._AC_.jpg'
  },
  {
    name: '白梅盆栽',
    price: 5980,
    affiliateUrl: 'https://amzn.to/4mS4QOf',
    imageUrl: 'https://m.media-amazon.com/images/I/41eVXk8yuWL._AC_.jpg'
  },
  {
    name: '皐月 ミニ盆栽',
    price: 3200,
    affiliateUrl: 'https://amzn.to/4ggzFJQ',
    imageUrl: 'https://m.media-amazon.com/images/I/61aPrlUDvGL._AC_SX679_.jpg'
  },
  {
    name: '出猩々もみじ(信楽焼鉢)',
    price: 3780,
    affiliateUrl: 'https://amzn.to/42dH0DZ',
    imageUrl: 'https://m.media-amazon.com/images/I/41axWV1pL8L._AC_.jpg'
  },
  {
    name: 'ミニ盆栽：長寿梅(信楽焼藍色鉢）',
    price: 3480,
    affiliateUrl: 'https://amzn.to/4m7mZWN',
    imageUrl: 'https://m.media-amazon.com/images/I/41G4wlwJr0L._AC_.jpg'
  },
  {
    name: '睡蓮木・五葉松寄せ(瀬戸焼変形鉢)',
    price: 7920,
    affiliateUrl: 'https://amzn.to/464hIJH',
    imageUrl: 'https://m.media-amazon.com/images/I/51MDB6+H+ML._AC_.jpg'
  },
  {
    name: '桜盆栽の寄せ植え桜 桜並木',
    price: 12000,
    affiliateUrl: 'https://amzn.to/3JQfhTB',
    imageUrl: 'https://m.media-amazon.com/images/I/5180mtPmUhL._AC_.jpg'
  },
  {
    name: '四国五葉松盆栽 松のぼんさい',
    price: 11000,
    affiliateUrl: 'https://amzn.to/46aH4pp',
    imageUrl: 'https://m.media-amazon.com/images/I/41QMRrUvQHL._AC_.jpg'
  }
];

async function matchImagesByName() {
  try {
    console.log('📝 商品名ベース画像URL照合開始...\\n');
    
    console.log(`📊 正しい商品データ: ${correctImageMappings.length}件\\n`);
    
    // Unsplashプレースホルダーを使用している商品を取得
    const { data: unsplashProducts, error } = await supabase
      .from('products')
      .select('id, name, price, amazon_url, image_url')
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
      console.log(`   価格: ¥${product.price.toLocaleString()}`);
      console.log(`   現在の画像: Unsplashプレースホルダー`);
      console.log('');
    });
    
    let matchCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    
    console.log('📝 商品名照合実行:');
    console.log('==================');
    
    for (const product of unsplashProducts) {
      try {
        // 商品名で正確に照合
        const matchedMapping = correctImageMappings.find(mapping => 
          mapping.name === product.name
        );
        
        if (matchedMapping) {
          matchCount++;
          console.log(`\\n✅ 照合成功: ${product.name}`);
          console.log(`   DB価格: ¥${product.price.toLocaleString()}`);
          console.log(`   正規価格: ¥${matchedMapping.price.toLocaleString()}`);
          console.log(`   新画像URL: ${matchedMapping.imageUrl}`);
          
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
          console.log(`   → 正規商品データに該当なし`);
        }
        
      } catch (productError) {
        console.error(`❌ ${product.name} 処理エラー:`, productError.message);
        errorCount++;
      }
    }
    
    console.log('\\n🎉 照合処理完了！');
    console.log('==================');
    console.log(`📝 照合成功: ${matchCount}商品`);
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
      console.log(`🖼️  Unsplash画像: ${finalStats.unsplash}商品 ${finalStats.unsplash === 0 ? '🎉 完全解決！' : ''}`);
      console.log(`❌ 無効画像: ${finalStats.invalid}商品`);
      
      if (finalStats.unsplash === 0) {
        console.log('\\n🎊 おめでとうございます！');
        console.log('すべてのUnsplashプレースホルダーが正しいAmazon画像に修正されました！');
      }
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('📝 商品名ベース画像URL照合システム');
console.log('=================================');
matchImagesByName();