import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

async function analyzeProducts() {
  console.log('🔍 現在の商品データ分析...');

  // 全商品数を取得
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('エラー:', error);
    process.exit(1);
  }

  console.log('📊 商品データ概要:');
  console.log('- 総商品数:', products?.length || 0);

  if (products && products.length > 0) {
    // カテゴリ分析
    const categories = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📂 カテゴリ別商品数:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log('  -', cat + ':', count + '個');
    });

    // サイズカテゴリ分析
    const sizes = products.reduce((acc, p) => {
      acc[p.size_category] = (acc[p.size_category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📏 サイズ別商品数:');
    Object.entries(sizes).forEach(([size, count]) => {
      console.log('  -', size + ':', count + '個');
    });

    // 価格帯分析
    const prices = products.map(p => p.price).sort((a, b) => a - b);
    console.log('\n💰 価格帯:');
    console.log('  - 最低価格: ¥' + prices[0]?.toLocaleString());
    console.log('  - 最高価格: ¥' + prices[prices.length - 1]?.toLocaleString());
    console.log('  - 平均価格: ¥' + Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)?.toLocaleString());

    // タグ分析
    const allTags = products.flatMap(p => p.tags || []);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n🏷️  人気タグ TOP5:');
    Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([tag, count]) => {
        console.log('  -', tag + ':', count + '回使用');
      });

    // 最初の3商品をサンプル表示
    console.log('\n📋 サンプル商品:');
    products.slice(0, 3).forEach((p, i) => {
      console.log('  ' + (i+1) + '.', p.name);
      console.log('     カテゴリ:', p.category);
      console.log('     価格: ¥' + p.price?.toLocaleString());
      console.log('     サイズ:', p.size_category);
      console.log('     タグ:', p.tags?.join(', ') || 'なし');
      console.log('');
    });

    // フィルター機能の有効性分析
    console.log('\n🔍 フィルター機能分析:');
    console.log('  - カテゴリフィルター:', Object.keys(categories).length, '種類で有効');
    console.log('  - サイズフィルター:', Object.keys(sizes).length, '種類で有効'); 
    console.log('  - タグフィルター:', Object.keys(tagCounts).length, '種類のタグあり');
    
    // 価格範囲フィルターの分析
    const priceRanges = {
      '0-5000': products.filter(p => p.price <= 5000).length,
      '5001-15000': products.filter(p => p.price > 5000 && p.price <= 15000).length,
      '15001-30000': products.filter(p => p.price > 15000 && p.price <= 30000).length,
      '30001-50000': products.filter(p => p.price > 30000 && p.price <= 50000).length,
      '50001+': products.filter(p => p.price > 50000).length,
    };
    
    console.log('  - 価格帯分布:');
    Object.entries(priceRanges).forEach(([range, count]) => {
      if (count > 0) {
        console.log('    ¥' + range + ':', count + '個');
      }
    });

  } else {
    console.log('⚠️  商品データが見つかりません');
  }
}

analyzeProducts().catch(console.error);