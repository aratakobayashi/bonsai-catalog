// Update existing products with enhanced UI data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 商品分析ロジック
function analyzeProductForUIData(product) {
  const name = product.name.toLowerCase();
  const category = product.category;
  
  // サイズ推定
  let height_cm = 20, width_cm = 15, pot_diameter_cm = 12; // デフォルト
  
  if (product.size_category === 'mini') {
    height_cm = 8; width_cm = 6; pot_diameter_cm = 8;
  } else if (product.size_category === 'small') {
    height_cm = 15; width_cm = 12; pot_diameter_cm = 10;
  } else if (product.size_category === 'medium') {
    height_cm = 25; width_cm = 18; pot_diameter_cm = 15;
  } else if (product.size_category === 'large') {
    height_cm = 40; width_cm = 30; pot_diameter_cm = 20;
  }
  
  // 商品名に含まれる情報から調整
  if (name.includes('大型') || name.includes('特大')) {
    height_cm += 10; width_cm += 5;
  }
  if (name.includes('ミニ') || name.includes('極小')) {
    height_cm = Math.min(height_cm, 10);
    width_cm = Math.min(width_cm, 8);
  }
  
  // 難易度判定
  let difficulty_level = 2; // デフォルト：普通
  if (name.includes('初心者') || category === '草もの') {
    difficulty_level = 1; // 簡単
  }
  if (name.includes('上級') || category === '実もの') {
    difficulty_level = 3; // 難しい
  }
  
  // 開花月の判定
  let bloom_months = [];
  if (category === '花もの') {
    if (name.includes('桜') || name.includes('富士桜') || name.includes('寒桜')) {
      bloom_months = [3, 4]; // 3-4月
    } else if (name.includes('梅')) {
      bloom_months = [2, 3]; // 2-3月
    } else if (name.includes('つつじ')) {
      bloom_months = [4, 5]; // 4-5月
    } else {
      bloom_months = [4, 5]; // デフォルト
    }
  }
  
  // 紅葉月の判定
  let foliage_months = [];
  if (category === '雑木類') {
    if (name.includes('もみじ') || name.includes('楓')) {
      foliage_months = [10, 11]; // 10-11月
    } else if (name.includes('イチョウ')) {
      foliage_months = [11, 12]; // 11-12月
    } else {
      foliage_months = [10, 11]; // デフォルト
    }
  }
  
  // 日照条件
  let sunlight_requirement = 'partial_shade'; // デフォルト
  if (category === '松柏類') {
    sunlight_requirement = 'full_sun'; // 松類は日向
  } else if (category === '草もの') {
    sunlight_requirement = 'shade'; // 草ものは日陰OK
  }
  
  // その他の判定
  const indoor_suitable = !name.includes('屋外') && (product.size_category === 'mini' || product.size_category === 'small');
  const gift_suitable = name.includes('ギフト') || name.includes('プレゼント') || category === '花もの';
  const beginner_friendly = difficulty_level === 1 || name.includes('初心者') || name.includes('セット');
  
  return {
    difficulty_level,
    height_cm,
    width_cm,
    pot_diameter_cm,
    care_frequency: difficulty_level === 1 ? 'weekly' : 'when_dry',
    sunlight_requirement,
    watering_frequency: 'when_dry',
    bloom_months,
    foliage_months,
    indoor_suitable,
    gift_suitable,
    beginner_friendly
  };
}

async function updateExistingProducts() {
  console.log('🎨 既存商品のUI拡張データ更新開始...\n');
  
  // 既存商品を取得
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('❌ 商品取得エラー:', error.message);
    return;
  }
  
  console.log(`📊 更新対象商品数: ${products.length}件\n`);
  
  let successCount = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const uiData = analyzeProductForUIData(product);
    
    console.log(`🔄 ${i + 1}. ${product.name}`);
    console.log(`   サイズ: ${uiData.height_cm}×${uiData.width_cm}cm`);
    console.log(`   難易度: ${uiData.difficulty_level === 1 ? '★☆☆ 簡単' : uiData.difficulty_level === 2 ? '★★☆ 普通' : '★★★ 難しい'}`);
    console.log(`   室内OK: ${uiData.indoor_suitable ? 'Yes' : 'No'}`);
    console.log(`   初心者向け: ${uiData.beginner_friendly ? 'Yes' : 'No'}`);
    if (uiData.bloom_months.length > 0) {
      console.log(`   開花月: ${uiData.bloom_months.join('-')}月`);
    }
    if (uiData.foliage_months.length > 0) {
      console.log(`   紅葉月: ${uiData.foliage_months.join('-')}月`);
    }
    
    // データベース更新
    const { error: updateError } = await supabase
      .from('products')
      .update(uiData)
      .eq('id', product.id);
      
    if (updateError) {
      console.error(`   ❌ 更新エラー: ${updateError.message}`);
    } else {
      console.log(`   ✅ 更新完了`);
      successCount++;
    }
    console.log('');
  }
  
  console.log(`🎉 更新完了: ${successCount}/${products.length}件が成功`);
  console.log('\n📋 更新されたデータの確認...');
  
  // 更新後のデータ確認
  const { data: updatedProducts, error: fetchError } = await supabase
    .from('products')
    .select('name, difficulty_level, height_cm, indoor_suitable, beginner_friendly, bloom_months, foliage_months')
    .order('name');
    
  if (!fetchError && updatedProducts) {
    console.log('\n📊 更新後のデータ:');
    console.log('=' .repeat(80));
    updatedProducts.forEach(product => {
      const difficulty = product.difficulty_level === 1 ? '★☆☆' : product.difficulty_level === 2 ? '★★☆' : '★★★';
      const features = [];
      if (product.indoor_suitable) features.push('🏠室内OK');
      if (product.beginner_friendly) features.push('👶初心者向け');
      if (product.bloom_months && product.bloom_months.length > 0) features.push(`🌸${product.bloom_months.join('-')}月開花`);
      if (product.foliage_months && product.foliage_months.length > 0) features.push(`🍂${product.foliage_months.join('-')}月紅葉`);
      
      console.log(`${product.name} (${product.height_cm}cm)`);
      console.log(`  難易度: ${difficulty} | 特徴: ${features.join(' ')}`);
    });
  }
}

updateExistingProducts();