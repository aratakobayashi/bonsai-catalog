// 新規商品データ一括登録スクリプト
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 新商品データ
const newProducts = [
  {
    name: '遊恵盆栽：特選清姫もみじ(瀬戸焼青鉢)',
    price: 9900,
    amazon_url: 'https://amzn.to/41DxV7w',
    image_url: 'https://m.media-amazon.com/images/I/51MbBfSVpHL._AC_.jpg'
  },
  {
    name: 'ミニ盆栽：三河黒松（瀬戸焼)',
    price: 3580,
    amazon_url: 'https://amzn.to/46oN6E5',
    image_url: 'https://m.media-amazon.com/images/I/515gQ4OEJQL._AC_.jpg'
  },
  {
    name: '遊恵盆栽 ミニ盆栽：長寿梅(瀬戸焼三彩鉢)',
    price: 3480,
    amazon_url: 'https://amzn.to/4mQPEAP',
    image_url: 'https://m.media-amazon.com/images/I/61-loxrp0sL._AC_.jpg'
  },
  {
    name: '盆栽妙 はじめてでも育てやすい五葉松 丸小鉢',
    price: 6980,
    amazon_url: 'https://amzn.to/47s6ocM',
    image_url: 'https://m.media-amazon.com/images/I/71x66VfHKHL._AC_SX679_.jpg'
  },
  {
    name: '盆栽妙 ミニ長寿梅 久庵手作りつぼ鉢',
    price: 5980,
    amazon_url: 'https://amzn.to/3HP9bT4',
    image_url: 'https://m.media-amazon.com/images/I/71tgtk9Ni9L._AC_SX679_.jpg'
  },
  {
    name: '藤盆栽ギフト 鉢花 藤盆栽',
    price: 6980,
    amazon_url: 'https://amzn.to/4m5QCYS',
    image_url: 'https://m.media-amazon.com/images/I/51Cj1lPmrdL._AC_.jpg'
  },
  {
    name: '枝ぶりの良い五葉松の盆栽',
    price: 13200,
    amazon_url: 'https://amzn.to/4m9knbd',
    image_url: 'https://m.media-amazon.com/images/I/61nyA2CsadL._AC_SY879_.jpg'
  },
  {
    name: '桜・五葉松寄せ植え(青長角縁付鉢)鉢植え',
    price: 8980,
    amazon_url: 'https://amzn.to/3VAc4do',
    image_url: 'https://m.media-amazon.com/images/I/519-ay-9lCL._AC_.jpg'
  }
];

// 商品分析・自動分類ロジック
function analyzeAndEnhanceProduct(product) {
  const name = product.name.toLowerCase();
  
  // カテゴリ判定
  let category = '雑木類';
  if (name.includes('松') || name.includes('五葉松') || name.includes('黒松')) {
    category = '松柏類';
  } else if (name.includes('桜') || name.includes('梅') || name.includes('藤')) {
    category = '花もの';
  } else if (name.includes('もみじ') || name.includes('楓')) {
    category = '雑木類';
  }
  
  // サイズ判定
  let size_category = 'small';
  if (name.includes('ミニ') || product.price <= 4000) {
    size_category = 'mini';
  } else if (product.price >= 10000) {
    size_category = 'medium';
  }
  
  // 高さ推定
  let height_cm = size_category === 'mini' ? 12 : size_category === 'small' ? 18 : 25;
  let width_cm = Math.round(height_cm * 0.8);
  let pot_diameter_cm = Math.round(height_cm * 0.6);
  
  // 難易度判定
  let difficulty_level = 2; // デフォルト：中級者向け
  if (name.includes('はじめて') || name.includes('育てやすい')) {
    difficulty_level = 1; // 初心者OK
  } else if (name.includes('特選') || category === '松柏類') {
    difficulty_level = 2; // 中級者向け
  }
  
  // タグ生成
  const tags = [];
  if (name.includes('ミニ')) tags.push('ミニサイズ');
  if (name.includes('ギフト')) tags.push('ギフト向け');
  if (name.includes('瀬戸焼')) tags.push('瀬戸焼鉢');
  if (name.includes('寄せ植え')) tags.push('寄せ植え');
  if (name.includes('育てやすい')) tags.push('初心者向け');
  if (name.includes('特選')) tags.push('厳選品');
  
  // 基本説明文生成
  let description = `${product.name}は`;
  if (category === '松柏類') {
    description += '風格ある松の美しい盆栽です。';
  } else if (category === '花もの') {
    description += '季節の花を楽しめる美しい盆栽です。';
  } else {
    description += '美しい樹形を楽しめる盆栽です。';
  }
  
  if (difficulty_level === 1) {
    description += '初心者の方にもおすすめの育てやすい品種です。';
  }
  
  // 季節情報
  let bloom_months = [];
  let foliage_months = [];
  
  if (name.includes('桜')) {
    bloom_months = [3, 4];
  } else if (name.includes('梅')) {
    bloom_months = [2, 3];
  } else if (name.includes('藤')) {
    bloom_months = [4, 5];
  }
  
  if (name.includes('もみじ')) {
    foliage_months = [10, 11];
  }
  
  return {
    ...product,
    category,
    size_category,
    tags,
    description,
    // UI拡張フィールド
    difficulty_level,
    height_cm,
    width_cm,
    pot_diameter_cm,
    care_frequency: difficulty_level === 1 ? 'weekly' : 'when_dry',
    sunlight_requirement: category === '松柏類' ? 'full_sun' : 'partial_shade',
    watering_frequency: 'when_dry',
    bloom_months,
    foliage_months,
    indoor_suitable: size_category === 'mini',
    gift_suitable: tags.includes('ギフト向け') || category === '花もの',
    beginner_friendly: difficulty_level === 1
  };
}

async function addNewBatchProducts() {
  console.log('🌸 新商品データ一括登録開始...\n');
  
  let successCount = 0;
  const results = [];
  
  for (let i = 0; i < newProducts.length; i++) {
    const rawProduct = newProducts[i];
    const enhancedProduct = analyzeAndEnhanceProduct(rawProduct);
    
    console.log(`📝 ${i + 1}. ${enhancedProduct.name}`);
    console.log(`   💰 価格: ¥${enhancedProduct.price.toLocaleString()}`);
    console.log(`   📂 カテゴリ: ${enhancedProduct.category}`);
    console.log(`   📏 サイズ: ${enhancedProduct.size_category} (${enhancedProduct.height_cm}cm)`);
    console.log(`   🎯 難易度: ${enhancedProduct.difficulty_level === 1 ? '🌱 初心者OK' : enhancedProduct.difficulty_level === 2 ? '🌿 中級者向け' : '🌲 上級者向け'}`);
    console.log(`   🏷️  タグ: ${enhancedProduct.tags.join(', ')}`);
    if (enhancedProduct.bloom_months.length > 0) {
      console.log(`   🌸 開花: ${enhancedProduct.bloom_months.join('-')}月`);
    }
    if (enhancedProduct.foliage_months.length > 0) {
      console.log(`   🍂 紅葉: ${enhancedProduct.foliage_months.join('-')}月`);
    }
    
    // データベースに挿入
    const { data, error } = await supabase
      .from('products')
      .insert([enhancedProduct])
      .select()
      .single();
      
    if (error) {
      console.log(`   ❌ 登録エラー: ${error.message}`);
      results.push({ product: enhancedProduct.name, success: false, error: error.message });
    } else {
      console.log(`   ✅ 登録完了 (ID: ${data.id})`);
      successCount++;
      results.push({ product: enhancedProduct.name, success: true, id: data.id });
    }
    console.log('');
  }
  
  console.log(`🎉 登録完了: ${successCount}/${newProducts.length}件が成功\n`);
  
  // 結果サマリー
  console.log('📊 登録結果サマリー:');
  console.log('=' .repeat(60));
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ ${result.product}`);
    } else {
      console.log(`❌ ${result.product} - ${result.error}`);
    }
  });
  
  // データベース確認
  console.log('\n🔍 データベース確認...');
  const { data: allProducts, error: fetchError } = await supabase
    .from('products')
    .select('name, category, size_category, price, difficulty_level')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (!fetchError && allProducts) {
    console.log('\n📋 最新登録商品（上位10件）:');
    console.log('-'.repeat(60));
    allProducts.forEach((product, index) => {
      const difficulty = product.difficulty_level === 1 ? '🌱' : product.difficulty_level === 2 ? '🌿' : '🌲';
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ${product.category} | ${product.size_category} | ¥${product.price.toLocaleString()} | ${difficulty}`);
    });
  }
}

addNewBatchProducts();