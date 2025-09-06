import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeSearchFunctionality() {
  console.log('🔍 盆栽カタログ検索機能 最適化分析');
  console.log('='.repeat(60));
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ データベースエラー:', error.message);
      return;
    }
    
    console.log(`📊 現在のデータベース状況: ${products.length} 商品`);
    
    // 1. カテゴリー分析
    console.log('\\n1️⃣  カテゴリーフィルター分析:');
    const categories = {};
    products.forEach(p => categories[p.category] = (categories[p.category] || 0) + 1);
    
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count], i) => {
        const status = count >= 3 ? '✅' : count >= 2 ? '⚠️ ' : '❌';
        console.log(`   ${status} ${cat}: ${count}商品 ${count < 3 ? '(要追加)' : ''}`);
      });
    
    // 2. 価格帯分析
    console.log('\\n2️⃣  価格帯フィルター分析:');
    const prices = products.map(p => p.price).sort((a, b) => a - b);
    const priceRanges = [
      { label: '〜¥5,000', min: 0, max: 5000 },
      { label: '¥5,001〜¥15,000', min: 5001, max: 15000 },
      { label: '¥15,001〜¥30,000', min: 15001, max: 30000 },
      { label: '¥30,001〜¥50,000', min: 30001, max: 50000 },
      { label: '¥50,001〜', min: 50001, max: Infinity }
    ];
    
    priceRanges.forEach(range => {
      const count = products.filter(p => p.price >= range.min && p.price <= range.max).length;
      const status = count >= 2 ? '✅' : count >= 1 ? '⚠️ ' : '❌';
      console.log(`   ${status} ${range.label}: ${count}商品`);
    });
    
    console.log(`   📈 価格幅: ¥${prices[0].toLocaleString()} 〜 ¥${prices[prices.length-1].toLocaleString()}`);
    
    // 3. サイズカテゴリー分析
    console.log('\\n3️⃣  サイズフィルター分析:');
    const sizes = {};
    products.forEach(p => sizes[p.size_category] = (sizes[p.size_category] || 0) + 1);
    
    ['mini', 'small', 'medium', 'large'].forEach(size => {
      const count = sizes[size] || 0;
      const status = count >= 2 ? '✅' : count >= 1 ? '⚠️ ' : '❌';
      console.log(`   ${status} ${size}: ${count}商品 ${count === 0 ? '(未登録)' : ''}`);
    });
    
    // 4. タグ検索分析
    console.log('\\n4️⃣  タグベース検索分析:');
    const allTags = [];
    products.forEach(p => {
      if (Array.isArray(p.tags)) allTags.push(...p.tags);
    });
    
    const tagCounts = {};
    allTags.forEach(tag => tagCounts[tag] = (tagCounts[tag] || 0) + 1);
    
    const popularTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log('   🏆 人気タグ TOP10:');
    popularTags.forEach(([tag, count], i) => {
      console.log(`   ${i+1}. "${tag}": ${count}回使用`);
    });
    
    console.log(`   📝 総タグ種類: ${Object.keys(tagCounts).length}種類`);
    console.log(`   📊 タグ使用率: 平均${(allTags.length / products.length).toFixed(1)}個/商品`);
    
    // 5. 検索クエリ想定分析
    console.log('\\n5️⃣  検索クエリ対応分析:');
    const searchTests = [
      { query: '松', expect: 'name/description containing 松' },
      { query: '初心者', expect: 'tag containing 初心者向け' },
      { query: '花', expect: 'category 花木 or tag containing 花' },
      { query: '小品', expect: 'size mini/small or description containing 小品' },
      { query: '盆栽鉢', expect: 'category 鉢 or name containing 鉢' }
    ];
    
    for (const test of searchTests) {
      const nameMatches = products.filter(p => 
        p.name.includes(test.query) || 
        (p.description && p.description.includes(test.query))
      ).length;
      
      const tagMatches = products.filter(p => 
        p.tags && p.tags.some(tag => tag.includes(test.query))
      ).length;
      
      const total = nameMatches + tagMatches;
      const status = total >= 2 ? '✅' : total >= 1 ? '⚠️ ' : '❌';
      console.log(`   ${status} "${test.query}": ${total}件ヒット (名前/説明:${nameMatches}, タグ:${tagMatches})`);
    }
    
    // 6. データ品質評価
    console.log('\\n6️⃣  データ品質評価:');
    const qualityMetrics = {
      hasDescription: products.filter(p => p.description && p.description.length > 20).length,
      hasImageUrl: products.filter(p => p.image_url && p.image_url.length > 0).length,
      hasMultipleTags: products.filter(p => p.tags && p.tags.length >= 3).length,
      hasSizeCategory: products.filter(p => p.size_category && p.size_category !== 'unknown').length
    };
    
    console.log(`   📝 詳細説明あり: ${qualityMetrics.hasDescription}/${products.length} (${(qualityMetrics.hasDescription/products.length*100).toFixed(1)}%)`);
    console.log(`   🖼️  画像URLあり: ${qualityMetrics.hasImageUrl}/${products.length} (${(qualityMetrics.hasImageUrl/products.length*100).toFixed(1)}%)`);
    console.log(`   🏷️  充実タグ(3+): ${qualityMetrics.hasMultipleTags}/${products.length} (${(qualityMetrics.hasMultipleTags/products.length*100).toFixed(1)}%)`);
    console.log(`   📏 サイズ分類済: ${qualityMetrics.hasSizeCategory}/${products.length} (${(qualityMetrics.hasSizeCategory/products.length*100).toFixed(1)}%)`);
    
    // 7. 改善提案
    console.log('\\n7️⃣  検索機能向上のための改善提案:');
    console.log('\\n   🎯 優先度高:');
    if (Object.keys(categories).length < 6) {
      console.log('   • カテゴリーの多様化（目標: 6種類以上）');
    }
    if (products.length < 20) {
      console.log('   • 商品数の増加（目標: 20商品以上）');
    }
    if (qualityMetrics.hasMultipleTags < products.length * 0.8) {
      console.log('   • タグ付けの充実化（3個以上/商品）');
    }
    
    console.log('\\n   📊 優先度中:');
    console.log('   • 価格帯バランスの最適化');
    console.log('   • サイズカテゴリーの完全設定');
    console.log('   • 検索キーワードの拡充');
    
    console.log('\\n   🔧 優先度低:');
    console.log('   • 画像品質の統一');
    console.log('   • 商品説明の標準化');
    console.log('   • SEO対応キーワード');
    
    // 8. 現在のフィルター機能有効性
    console.log('\\n8️⃣  現在のフィルター機能有効性:');
    const effectiveness = {
      category: Object.keys(categories).length >= 4 ? 'Good' : 'Needs Improvement',
      price: priceRanges.filter(r => products.filter(p => p.price >= r.min && p.price <= r.max).length > 0).length >= 4 ? 'Good' : 'Needs Improvement',
      size: Object.keys(sizes).filter(s => s !== 'unknown').length >= 3 ? 'Good' : 'Needs Improvement',
      search: Object.keys(tagCounts).length >= 20 ? 'Good' : 'Needs Improvement'
    };
    
    console.log(`   📂 カテゴリーフィルター: ${effectiveness.category}`);
    console.log(`   💰 価格フィルター: ${effectiveness.price}`);
    console.log(`   📏 サイズフィルター: ${effectiveness.size}`);
    console.log(`   🔍 テキスト検索: ${effectiveness.search}`);
    
    const overallScore = Object.values(effectiveness).filter(v => v === 'Good').length;
    console.log(`\\n   🏆 総合評価: ${overallScore}/4 (${overallScore >= 3 ? '良好' : overallScore >= 2 ? '改善必要' : '大幅改善必要'})`);
    
  } catch (err) {
    console.error('❌ 分析エラー:', err.message);
  }
}

analyzeSearchFunctionality().catch(console.error);