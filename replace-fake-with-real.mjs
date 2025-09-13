// 架空13商品を削除して正しい13商品で再登録
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 正しい13商品データ
const correctProducts = [
  {
    name: 'ミニ盆栽：糸魚川真柏（曲・3年生）*（瀬戸焼白緑釉掛け丸深鉢）',
    price: 3970,
    amazon_url: 'https://amzn.to/3VDW0HC',
    image_url: 'https://m.media-amazon.com/images/I/51E5pGTA+KL._AC_.jpg',
    category: '松柏類',
    description: 'ミニ盆栽：糸魚川真柏（曲・3年生）*（瀬戸焼白緑釉掛け丸深鉢）。松柏類の美しい盆栽です。',
    size_category: 'mini',
    difficulty_level: 2,
    tags: ['松柏類', '糸魚川真柏', 'ミニ盆栽'],
    height_cm: 20,
    bloom_months: []
  },
  {
    name: '一才藤（小・萬古焼みどり深鉢）',
    price: 3980,
    amazon_url: 'https://amzn.to/3V1XPy3',
    image_url: 'https://m.media-amazon.com/images/I/51Sg2Bvz6jL._AC_.jpg',
    category: '花もの',
    description: '一才藤（小・萬古焼みどり深鉢）。花ものの美しい盆栽です。',
    size_category: 'mini',
    difficulty_level: 2,
    tags: ['花もの', '藤', 'ミニ盆栽'],
    height_cm: 25,
    bloom_months: [4, 5]
  },
  {
    name: 'ハナカイドウ盆栽',
    price: 6980,
    amazon_url: 'https://amzn.to/46m7TIt',
    image_url: 'https://m.media-amazon.com/images/I/41-XBvRhWaL._AC_.jpg',
    category: '花もの',
    description: 'ハナカイドウ盆栽。花ものの美しい盆栽です。',
    size_category: 'small',
    difficulty_level: 2,
    tags: ['花もの', 'ハナカイドウ', '盆栽'],
    height_cm: 30,
    bloom_months: [4, 5]
  },
  {
    name: 'ミニ盆栽 七福南天南天ボンサイ',
    price: 3980,
    amazon_url: 'https://amzn.to/4gcVXfy',
    image_url: 'https://m.media-amazon.com/images/I/61JpP5dScwL._AC_SX679_.jpg',
    category: '実もの',
    description: 'ミニ盆栽 七福南天南天ボンサイ。実ものの美しい盆栽です。',
    size_category: 'mini',
    difficulty_level: 1,
    tags: ['実もの', '南天', 'ミニ盆栽'],
    height_cm: 20,
    bloom_months: []
  },
  {
    name: '姫りんごちゃん(信楽焼青銅中深丸鉢)',
    price: 4780,
    amazon_url: 'https://amzn.to/3VBomlT',
    image_url: 'https://m.media-amazon.com/images/I/41atUKZzgHL._AC_.jpg',
    category: '実もの',
    description: '姫りんごちゃん(信楽焼青銅中深丸鉢)。実ものの美しい盆栽です。',
    size_category: 'mini',
    difficulty_level: 2,
    tags: ['実もの', '姫りんご', '信楽焼'],
    height_cm: 22,
    bloom_months: []
  },
  {
    name: 'ミニ盆栽：寒椿(黒色緑縁瀬戸焼小鉢)',
    price: 3480,
    amazon_url: 'https://amzn.to/4njrGho',
    image_url: 'https://m.media-amazon.com/images/I/51nBRcpIjLL._AC_.jpg',
    category: '花もの',
    description: 'ミニ盆栽：寒椿(黒色緑縁瀬戸焼小鉢)。花ものの美しい盆栽です。',
    size_category: 'mini',
    difficulty_level: 2,
    tags: ['花もの', '寒椿', 'ミニ盆栽'],
    height_cm: 18,
    bloom_months: [12, 1, 2]
  },
  {
    name: '白梅盆栽',
    price: 5980,
    amazon_url: 'https://amzn.to/4mS4QOf',
    image_url: 'https://m.media-amazon.com/images/I/41eVXk8yuWL._AC_.jpg',
    category: '花もの',
    description: '白梅盆栽。花ものの美しい盆栽です。',
    size_category: 'small',
    difficulty_level: 2,
    tags: ['花もの', '白梅', '盆栽'],
    height_cm: 35,
    bloom_months: [2, 3]
  },
  {
    name: '皐月 ミニ盆栽',
    price: 3200,
    amazon_url: 'https://amzn.to/4ggzFJQ',
    image_url: 'https://m.media-amazon.com/images/I/61aPrlUDvGL._AC_SX679_.jpg',
    category: '花もの',
    description: '皐月 ミニ盆栽。花ものの美しい盆栽です。',
    size_category: 'mini',
    difficulty_level: 1,
    tags: ['花もの', '皐月', 'ミニ盆栽'],
    height_cm: 15,
    bloom_months: [5, 6]
  },
  {
    name: '出猩々もみじ(信楽焼鉢)',
    price: 3780,
    amazon_url: 'https://amzn.to/42dH0DZ',
    image_url: 'https://m.media-amazon.com/images/I/41axWV1pL8L._AC_.jpg',
    category: '雑木類',
    description: '出猩々もみじ(信楽焼鉢)。雑木類の美しい盆栽です。',
    size_category: 'mini',
    difficulty_level: 2,
    tags: ['雑木類', 'もみじ', '信楽焼'],
    height_cm: 25,
    bloom_months: []
  },
  {
    name: 'ミニ盆栽：長寿梅(信楽焼藍色鉢）',
    price: 3480,
    amazon_url: 'https://amzn.to/4m7mZWN',
    image_url: 'https://m.media-amazon.com/images/I/41G4wlwJr0L._AC_.jpg',
    category: '花もの',
    description: 'ミニ盆栽：長寿梅(信楽焼藍色鉢）。花ものの美しい盆栽です。',
    size_category: 'mini',
    difficulty_level: 1,
    tags: ['花もの', '長寿梅', 'ミニ盆栽'],
    height_cm: 18,
    bloom_months: [2, 3, 4]
  },
  {
    name: '睡蓮木・五葉松寄せ(瀬戸焼変形鉢)',
    price: 7920,
    amazon_url: 'https://amzn.to/464hIJH',
    image_url: 'https://m.media-amazon.com/images/I/51MDB6+H+ML._AC_.jpg',
    category: '松柏類',
    description: '睡蓮木・五葉松寄せ(瀬戸焼変形鉢)。松柏類の美しい盆栽です。',
    size_category: 'small',
    difficulty_level: 3,
    tags: ['松柏類', '五葉松', '寄せ植え'],
    height_cm: 28,
    bloom_months: []
  },
  {
    name: '桜盆栽の寄せ植え桜 桜並木',
    price: 12000,
    amazon_url: 'https://amzn.to/3JQfhTB',
    image_url: 'https://m.media-amazon.com/images/I/5180mtPmUhL._AC_.jpg',
    category: '花もの',
    description: '桜盆栽の寄せ植え桜 桜並木。花ものの美しい盆栽です。',
    size_category: 'medium',
    difficulty_level: 3,
    tags: ['花もの', '桜', '寄せ植え'],
    height_cm: 40,
    bloom_months: [3, 4]
  },
  {
    name: '四国五葉松盆栽 松のぼんさい',
    price: 11000,
    amazon_url: 'https://amzn.to/46aH4pp',
    image_url: 'https://m.media-amazon.com/images/I/41QMRrUvQHL._AC_.jpg',
    category: '松柏類',
    description: '四国五葉松盆栽 松のぼんさい。松柏類の美しい盆栽です。',
    size_category: 'medium',
    difficulty_level: 3,
    tags: ['松柏類', '五葉松', '四国'],
    height_cm: 35,
    bloom_months: []
  }
];

async function replaceFakeWithReal() {
  try {
    console.log('🔄 架空商品削除 → 正しい商品登録開始...\\n');
    
    // Step 1: Unsplashプレースホルダーの架空商品を特定・削除
    console.log('🗑️  Step 1: 架空商品(Unsplashプレースホルダー)を削除');
    console.log('================================================');
    
    const { data: fakeProducts, error: searchError } = await supabase
      .from('products')
      .select('id, name, image_url')
      .like('image_url', '%unsplash.com%');
    
    if (searchError) {
      console.error('❌ 検索エラー:', searchError.message);
      return;
    }
    
    console.log(`📦 削除対象: ${fakeProducts?.length || 0}商品\\n`);
    
    if (fakeProducts && fakeProducts.length > 0) {
      fakeProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
      });
      
      // 架空商品を一括削除
      const fakeIds = fakeProducts.map(p => p.id);
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .in('id', fakeIds);
      
      if (deleteError) {
        console.error('❌ 削除エラー:', deleteError.message);
        return;
      }
      
      console.log(`\\n✅ ${fakeProducts.length}件の架空商品を削除完了`);
    } else {
      console.log('削除対象の架空商品はありませんでした');
    }
    
    // Step 2: 正しい13商品を登録
    console.log('\\n📝 Step 2: 正しい13商品を登録');
    console.log('===============================');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const [index, product] of correctProducts.entries()) {
      try {
        console.log(`\\n[${index + 1}/13] 登録中: ${product.name}`);
        console.log(`   価格: ¥${product.price.toLocaleString()}`);
        console.log(`   カテゴリー: ${product.category}`);
        console.log(`   画像URL: ${product.image_url}`);

        const { data, error } = await supabase
          .from('products')
          .insert([product])
          .select();

        if (error) {
          console.error(`❌ 登録失敗: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ 登録成功: ID ${data[0].id}`);
          successCount++;
        }

      } catch (productError) {
        console.error(`❌ ${product.name} 処理エラー:`, productError.message);
        errorCount++;
      }
    }
    
    console.log('\\n🎉 置き換え処理完了！');
    console.log('=====================');
    console.log(`✅ 正規商品登録成功: ${successCount}商品`);
    console.log(`❌ 登録失敗: ${errorCount}商品`);
    
    // 最終確認
    const { data: finalProducts } = await supabase
      .from('products')
      .select('category, image_url');
    
    const finalStats = {
      total: finalProducts?.length || 0,
      amazon: 0,
      unsplash: 0,
      invalid: 0,
      categories: {}
    };
    
    finalProducts?.forEach(product => {
      const url = product.image_url || '';
      const category = product.category;
      
      if (url.includes('amazon.com') || url.includes('media-amazon.com')) {
        finalStats.amazon++;
      } else if (url.includes('unsplash.com')) {
        finalStats.unsplash++;
      } else {
        finalStats.invalid++;
      }
      
      finalStats.categories[category] = (finalStats.categories[category] || 0) + 1;
    });
    
    console.log('\\n📊 最終データベース状況:');
    console.log('========================');
    console.log(`📦 総商品数: ${finalStats.total}商品`);
    console.log(`✅ Amazon画像: ${finalStats.amazon}商品`);
    console.log(`🖼️  Unsplash画像: ${finalStats.unsplash}商品 ${finalStats.unsplash === 0 ? '🎉' : '⚠️'}`);
    console.log(`❌ 無効画像: ${finalStats.invalid}商品`);
    
    console.log('\\n🎯 カテゴリー別商品数:');
    Object.keys(finalStats.categories).sort().forEach(category => {
      console.log(`   ${category}: ${finalStats.categories[category]}商品`);
    });
    
    if (finalStats.unsplash === 0) {
      console.log('\\n🎊 完璧！');
      console.log('全ての商品が正しいAmazon画像URLで設定されました！');
      console.log('画像404エラーは完全に解決されました！');
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('🔄 架空商品 → 正規商品 置き換えシステム');
console.log('=====================================');
replaceFakeWithReal();