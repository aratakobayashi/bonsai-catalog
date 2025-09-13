// 5商品一括登録スクリプト
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 5商品データ（自動分析・カテゴリー分類済み）
const newProducts = [
  {
    name: '桜・藤寄せ植え*陶器鉢',
    description: '桜と藤の美しい寄せ植え盆栽。春の代表的な花木を陶器鉢で優雅に演出。開花時期には桜のピンクと藤の紫が見事なコントラストを描く季節感豊かな作品。',
    price: 5980,
    category: '花木',
    size_category: 'small',
    image_url: 'https://m.media-amazon.com/images/I/51no1+I6w2L._AC_.jpg',
    amazon_url: 'https://amzn.to/4nkNI3s',
    tags: ['桜', '藤', '寄せ植え', '陶器鉢', '花木', '春', '開花'],
    difficulty_level: 2,
    season: 'spring',
    location: 'outdoor',
    height_cm: 25,
    width_cm: 25,
    pot_diameter_cm: 15,
    care_frequency: 'weekly',
    sunlight_requirement: 'full_sun',
    watering_frequency: '2-3_days',
    bloom_months: [4, 5],
    foliage_months: [3, 4, 5, 10, 11],
    indoor_suitable: false,
    gift_suitable: true,
    beginner_friendly: false
  },
  {
    name: '桜盆栽：一才桜(瀬戸焼白輪花鉢)',
    description: '瀬戸焼の白輪花鉢に植えられた一才桜の盆栽。コンパクトながら毎年美しい花を咲かせる品種で、初心者にも育てやすい。白い鉢が桜の淡いピンクを際立たせる上品な仕上がり。',
    price: 3970,
    category: '花木',
    size_category: 'mini',
    image_url: 'https://m.media-amazon.com/images/I/51J+u4Lk41L._AC_.jpg',
    amazon_url: 'https://amzn.to/3V79885',
    tags: ['桜', '一才桜', '瀬戸焼', '白輪花鉢', 'ミニ盆栽', '開花', '初心者'],
    difficulty_level: 1,
    season: 'spring',
    location: 'outdoor',
    height_cm: 15,
    width_cm: 15,
    pot_diameter_cm: 10,
    care_frequency: 'weekly',
    sunlight_requirement: 'full_sun',
    watering_frequency: 'daily',
    bloom_months: [3, 4],
    foliage_months: [3, 4, 5, 10, 11],
    indoor_suitable: false,
    gift_suitable: true,
    beginner_friendly: true
  },
  {
    name: 'モダン松竹梅',
    description: '松・竹・梅を組み合わせた縁起の良いモダンスタイルの盆栽セット。日本の伝統的な吉祥の象徴を現代的にアレンジ。新年の飾りや贈り物としても最適な、格調高い作品。',
    price: 12000,
    category: '松類',
    size_category: 'medium',
    image_url: 'https://m.media-amazon.com/images/I/81lDaxC1NML._AC_SX679_.jpg',
    amazon_url: 'https://amzn.to/4m2VNbW',
    tags: ['松', '竹', '梅', '松竹梅', 'モダン', '縁起物', '贈り物', '正月'],
    difficulty_level: 2,
    season: 'all_seasons',
    location: 'outdoor',
    height_cm: 35,
    width_cm: 30,
    pot_diameter_cm: 20,
    care_frequency: 'weekly',
    sunlight_requirement: 'full_sun',
    watering_frequency: '2-3_days',
    bloom_months: [1, 2, 3],
    foliage_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    indoor_suitable: false,
    gift_suitable: true,
    beginner_friendly: false
  },
  {
    name: '四国五葉松 ミニ盆栽 鉢植え',
    description: '四国産の五葉松を使用したミニ盆栽。五葉松特有の短い針葉と力強い幹肌が魅力的。コンパクトサイズながら風格のある樹形で、松類盆栽の入門にも適している。',
    price: 9680,
    category: '松類',
    size_category: 'mini',
    image_url: 'https://m.media-amazon.com/images/I/71CzZJIjfLL._AC_SY879_.jpg',
    amazon_url: 'https://amzn.to/465dIZp',
    tags: ['五葉松', '四国', 'ミニ盆栽', '松類', '針葉樹', '風格', '入門'],
    difficulty_level: 2,
    season: 'all_seasons',
    location: 'outdoor',
    height_cm: 20,
    width_cm: 18,
    pot_diameter_cm: 12,
    care_frequency: 'weekly',
    sunlight_requirement: 'full_sun',
    watering_frequency: '2-3_days',
    bloom_months: [],
    foliage_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    indoor_suitable: false,
    gift_suitable: true,
    beginner_friendly: false
  },
  {
    name: 'ミニ盆栽：糸魚川真柏（曲・5年生）萬古焼泥物丸小鉢',
    description: '糸魚川産の真柏を使用した5年生のミニ盆栽。美しい曲がりと萬古焼の泥物丸小鉢の組み合わせが絶妙。真柏特有の細かい葉性と優美な樹形で、上級者にも愛される品種。',
    price: 4280,
    category: '針葉樹',
    size_category: 'mini',
    image_url: 'https://m.media-amazon.com/images/I/51Ait8xcR4L._AC_.jpg',
    amazon_url: 'https://amzn.to/3V5cnNd',
    tags: ['真柏', '糸魚川', '萬古焼', '泥物', '曲', '5年生', 'ミニ盆栽'],
    difficulty_level: 3,
    season: 'all_seasons',
    location: 'outdoor',
    height_cm: 18,
    width_cm: 16,
    pot_diameter_cm: 10,
    care_frequency: 'twice_weekly',
    sunlight_requirement: 'full_sun',
    watering_frequency: 'daily',
    bloom_months: [],
    foliage_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    indoor_suitable: false,
    gift_suitable: false,
    beginner_friendly: false
  }
];

async function insertNewProducts() {
  try {
    console.log('🌸 5商品の一括登録を開始します...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const product of newProducts) {
      try {
        console.log(`📝 登録中: ${product.name}`);
        
        const { data, error } = await supabase
          .from('products')
          .insert(product)
          .select();

        if (error) {
          console.error(`❌ エラー - ${product.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ 成功 - ${product.name} (¥${product.price.toLocaleString()})`);
          successCount++;
        }
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (insertError) {
        console.error(`❌ 例外エラー - ${product.name}:`, insertError.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 5商品登録処理完了!`);
    console.log(`✅ 成功: ${successCount}商品`);
    console.log(`❌ 失敗: ${errorCount}商品`);
    console.log(`📊 合計処理: ${newProducts.length}商品`);
    
    if (successCount > 0) {
      console.log('\n🌟 登録成功商品:');
      console.log('- 桜・藤寄せ植え (¥5,980) - 春の花木');
      console.log('- 一才桜 (¥3,970) - 初心者向け');
      console.log('- モダン松竹梅 (¥12,000) - 縁起物');
      console.log('- 四国五葉松 (¥9,680) - 松類');
      console.log('- 糸魚川真柏 (¥4,280) - 上級者向け');
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

// 商品データ詳細表示
console.log('📋 登録予定商品データ詳細:');
console.log('=====================================');

newProducts.forEach((product, index) => {
  console.log(`${index + 1}. ${product.name}`);
  console.log(`   価格: ¥${product.price.toLocaleString()}`);
  console.log(`   カテゴリー: ${product.category}`);
  console.log(`   サイズ: ${product.size}`);
  console.log(`   難易度: ${product.difficulty_level}`);
  console.log(`   季節: ${product.season}`);
  console.log(`   タグ: ${product.tags.join(', ')}`);
  console.log(`   Amazon URL: ${product.amazon_url}`);
  console.log('');
});

console.log('🚀 登録処理を開始します...\n');

insertNewProducts();