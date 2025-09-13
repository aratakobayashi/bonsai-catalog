// 13商品の正しいデータで復元するスクリプト
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 提供された正しい13商品データ
const correctProductData = [
  {
    name: 'ミニ盆栽：糸魚川真柏（曲・3年生）*（瀬戸焼白緑釉掛け丸深鉢）',
    price: 3970,
    amazon_url: 'https://amzn.to/3VDW0HC',
    image_url: 'https://m.media-amazon.com/images/I/51E5pGTA+KL._AC_.jpg',
    category: '松柏類'
  },
  {
    name: '一才藤（小・萬古焼みどり深鉢）',
    price: 3980,
    amazon_url: 'https://amzn.to/3V1XPy3',
    image_url: 'https://m.media-amazon.com/images/I/51Sg2Bvz6jL._AC_.jpg',
    category: '花もの'
  },
  {
    name: 'ハナカイドウ盆栽',
    price: 6980,
    amazon_url: 'https://amzn.to/46m7TIt',
    image_url: 'https://m.media-amazon.com/images/I/41-XBvRhWaL._AC_.jpg',
    category: '花もの'
  },
  {
    name: 'ミニ盆栽 七福南天南天ボンサイ',
    price: 3980,
    amazon_url: 'https://amzn.to/4gcVXfy',
    image_url: 'https://m.media-amazon.com/images/I/61JpP5dScwL._AC_SX679_.jpg',
    category: '実もの'
  },
  {
    name: '姫りんごちゃん(信楽焼青銅中深丸鉢)',
    price: 4780,
    amazon_url: 'https://amzn.to/3VBomlT',
    image_url: 'https://m.media-amazon.com/images/I/41atUKZzgHL._AC_.jpg',
    category: '実もの'
  },
  {
    name: 'ミニ盆栽：寒椿(黒色緑縁瀬戸焼小鉢)',
    price: 3480,
    amazon_url: 'https://amzn.to/4njrGho',
    image_url: 'https://m.media-amazon.com/images/I/51nBRcpIjLL._AC_.jpg',
    category: '花もの'
  },
  {
    name: '白梅盆栽',
    price: 5980,
    amazon_url: 'https://amzn.to/4mS4QOf',
    image_url: 'https://m.media-amazon.com/images/I/41eVXk8yuWL._AC_.jpg',
    category: '花もの'
  },
  {
    name: '皐月 ミニ盆栽',
    price: 3200,
    amazon_url: 'https://amzn.to/4ggzFJQ',
    image_url: 'https://m.media-amazon.com/images/I/61aPrlUDvGL._AC_SX679_.jpg',
    category: '花もの'
  },
  {
    name: '出猩々もみじ(信楽焼鉢)',
    price: 3780,
    amazon_url: 'https://amzn.to/42dH0DZ',
    image_url: 'https://m.media-amazon.com/images/I/41axWV1pL8L._AC_.jpg',
    category: '雑木類'
  },
  {
    name: 'ミニ盆栽：長寿梅(信楽焼藍色鉢）',
    price: 3480,
    amazon_url: 'https://amzn.to/4m7mZWN',
    image_url: 'https://m.media-amazon.com/images/I/41G4wlwJr0L._AC_.jpg',
    category: '花もの'
  },
  {
    name: '睡蓮木・五葉松寄せ(瀬戸焼変形鉢)',
    price: 7920,
    amazon_url: 'https://amzn.to/464hIJH',
    image_url: 'https://m.media-amazon.com/images/I/51MDB6+H+ML._AC_.jpg',
    category: '松柏類'
  },
  {
    name: '桜盆栽の寄せ植え桜 桜並木',
    price: 12000,
    amazon_url: 'https://amzn.to/3JQfhTB',
    image_url: 'https://m.media-amazon.com/images/I/5180mtPmUhL._AC_.jpg',
    category: '花もの'
  },
  {
    name: '四国五葉松盆栽 松のぼんさい',
    price: 11000,
    amazon_url: 'https://amzn.to/46aH4pp',
    image_url: 'https://m.media-amazon.com/images/I/41QMRrUvQHL._AC_.jpg',
    category: '松柏類'
  }
];

// 間違って登録した商品名とのマッピング
const nameMapping = {
  'ミニ盆栽：長寿梅（信楽焼小鉢）': 'ミニ盆栽：糸魚川真柏（曲・3年生）*（瀬戸焼白緑釉掛け丸深鉢）',
  'ミニ盆栽 もみじ 紅葉 秋 和風 癒し インテリア': '一才藤（小・萬古焼みどり深鉢）',
  'ミニ盆栽 サツキ つつじ': 'ハナカイドウ盆栽',
  '盆栽 ミニ 松 初心者 セット': 'ミニ盆栽 七福南天南天ボンサイ',
  'ミニ盆栽 欅（ケヤキ）和風 秋 紅葉': '姫りんごちゃん(信楽焼青銅中深丸鉢)',
  'ミニ盆栽 南天 実もの 縁起物': 'ミニ盆栽：寒椿(黒色緑縁瀬戸焼小鉢)',
  'ミニ盆栽 山野草 苔 自然風': '白梅盆栽',
  '盆栽 桜 一才桜 花見 春': '皐月 ミニ盆栽',
  'ミニ盆栽 真柏（シンパク）針葉樹': '出猩々もみじ(信楽焼鉢)',
  'ミニ盆栽 ピラカンサ 実もの 橙色実': 'ミニ盆栽：長寿梅(信楽焼藍色鉢）',
  'ミニ盆栽 多肉植物 サボテン 草もの': '睡蓮木・五葉松寄せ(瀬戸焼変形鉢)',
  'ミニ盆栽 ブナ 新緑 落葉樹': '桜盆栽の寄せ植え桜 桜並木',
  'ミニ盆栽 五葉松 高級 松柏類': '四国五葉松盆栽 松のぼんさい'
};

async function restoreCorrectData() {
  try {
    console.log('🔧 正しいデータで復元開始...\\n');
    
    console.log('❌ 削除する間違った13商品:');
    const wrongNames = Object.keys(nameMapping);
    wrongNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    
    console.log('\\n✅ 正しく登録する13商品:');
    correctProductData.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   価格: ¥${product.price.toLocaleString()}`);
      console.log(`   画像: ${product.image_url}`);
      console.log(`   カテゴリー: ${product.category}`);
      console.log('');
    });

    // Step 1: 間違った商品を削除
    console.log('🗑️  間違った商品を削除中...');
    for (const wrongName of wrongNames) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('name', wrongName);
      
      if (error) {
        console.error(`❌ 削除失敗: ${wrongName} - ${error.message}`);
      } else {
        console.log(`✅ 削除完了: ${wrongName}`);
      }
    }

    // Step 2: 正しいデータで新規登録
    console.log('\\n📝 正しいデータで新規登録中...');
    let successCount = 0;
    let errorCount = 0;

    for (const [index, product] of correctProductData.entries()) {
      try {
        // 基本データに追加フィールドを設定
        const completeProduct = {
          ...product,
          description: `${product.name}。${product.category}の美しい盆栽です。`,
          size_category: 'mini',
          difficulty_level: 1,
          tags: [product.category, '盆栽', 'ミニ'],
          height_cm: 20,
          bloom_months: product.category === '花もの' ? [3, 4, 5] : []
        };

        console.log(`[${index + 1}/13] 登録中: ${product.name}`);
        
        const { data, error } = await supabase
          .from('products')
          .insert([completeProduct])
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

    console.log('\\n🎉 データ復元完了！');
    console.log('==================');
    console.log(`✅ 登録成功: ${successCount}商品`);
    console.log(`❌ 登録失敗: ${errorCount}商品`);

    if (successCount > 0) {
      console.log('\\n📊 正しい画像URLが設定されました:');
      correctProductData.forEach(product => {
        console.log(`✅ ${product.name}`);
        console.log(`   画像: ${product.image_url}`);
      });
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('🔄 盆栽カタログ - 正しいデータ復元');
console.log('===============================');
restoreCorrectData();