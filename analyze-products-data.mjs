// Analyze current products data structure and content
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeProductsData() {
  console.log('🛍️ 盆栽商品データの詳細分析...\n');

  // 全商品データを取得
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`📊 総商品数: ${products.length}件\n`);

  // データ構造の分析
  if (products.length > 0) {
    const sampleProduct = products[0];
    console.log('📋 データベースカラム構造:');
    console.log('=' .repeat(50));
    Object.keys(sampleProduct).forEach(key => {
      const value = sampleProduct[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      const sampleValue = type === 'string' && value.length > 50 
        ? value.substring(0, 50) + '...' 
        : value;
      console.log(`  ${key}: ${type} - ${sampleValue}`);
    });
  }

  // カテゴリ別分析
  const byCategory = {};
  const bySizeCategory = {};
  const priceRanges = { under3000: 0, '3000-10000': 0, '10000-30000': 0, over30000: 0 };
  
  products.forEach(product => {
    // カテゴリ別
    const cat = product.category || '未設定';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    
    // サイズ別
    const size = product.size_category || '未設定';
    bySizeCategory[size] = (bySizeCategory[size] || 0) + 1;
    
    // 価格帯別
    const price = product.price || 0;
    if (price < 3000) priceRanges.under3000++;
    else if (price < 10000) priceRanges['3000-10000']++;
    else if (price < 30000) priceRanges['10000-30000']++;
    else priceRanges.over30000++;
  });

  console.log('\n🏷️ カテゴリ別分布:');
  console.log('=' .repeat(30));
  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}件`);
  });

  console.log('\n📏 サイズ別分布:');
  console.log('=' .repeat(30));
  Object.entries(bySizeCategory).forEach(([size, count]) => {
    console.log(`  ${size}: ${count}件`);
  });

  console.log('\n💰 価格帯別分布:');
  console.log('=' .repeat(30));
  console.log(`  3,000円未満: ${priceRanges.under3000}件`);
  console.log(`  3,000-10,000円: ${priceRanges['3000-10000']}件`);
  console.log(`  10,000-30,000円: ${priceRanges['10000-30000']}件`);
  console.log(`  30,000円以上: ${priceRanges.over30000}件`);

  // データ品質分析
  console.log('\n📈 データ品質分析:');
  console.log('=' .repeat(30));
  const withDescription = products.filter(p => p.description && p.description.trim().length > 0).length;
  const withImageUrl = products.filter(p => p.image_url && p.image_url.trim().length > 0).length;
  const withTags = products.filter(p => p.tags && Array.isArray(p.tags) && p.tags.length > 0).length;
  const withSizeCategory = products.filter(p => p.size_category && p.size_category !== 'unknown').length;
  
  console.log(`  説明文あり: ${withDescription}/${products.length}件 (${Math.round(withDescription/products.length*100)}%)`);
  console.log(`  画像URLあり: ${withImageUrl}/${products.length}件 (${Math.round(withImageUrl/products.length*100)}%)`);
  console.log(`  タグあり: ${withTags}/${products.length}件 (${Math.round(withTags/products.length*100)}%)`);
  console.log(`  サイズ設定済み: ${withSizeCategory}/${products.length}件 (${Math.round(withSizeCategory/products.length*100)}%)`);

  // Amazon URL分析
  console.log('\n🔗 Amazon URL分析:');
  console.log('=' .repeat(30));
  const amazonUrls = products.map(p => p.amazon_url).filter(url => url);
  console.log(`  Amazon URLあり: ${amazonUrls.length}/${products.length}件`);
  
  // 商品の具体例を表示
  console.log('\n🎋 商品例（最新3件）:');
  console.log('=' .repeat(50));
  products.slice(0, 3).forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   カテゴリ: ${product.category} | サイズ: ${product.size_category} | 価格: ¥${product.price}`);
    console.log(`   タグ: ${Array.isArray(product.tags) ? product.tags.join(', ') : 'なし'}`);
    console.log(`   説明: ${product.description ? product.description.substring(0, 100) + '...' : 'なし'}`);
    console.log('');
  });

  // データ拡張の提案
  console.log('🚀 データ拡張の現状評価:');
  console.log('=' .repeat(40));
  console.log(`📊 現在の商品数: ${products.length}件`);
  console.log(`🎯 推奨商品数: 50-100件（ECサイトとしての充実度）`);
  console.log(`📈 拡張必要数: ${Math.max(0, 50 - products.length)}件`);
  
  if (products.length < 50) {
    console.log('\n⚠️  商品数が不足しています。以下のカテゴリで拡張推奨:');
    Object.entries(byCategory).forEach(([category, count]) => {
      if (count < 10) {
        console.log(`   • ${category}: ${count}件 → 10件以上推奨`);
      }
    });
  }
}

analyzeProductsData();