import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 現在の商品データ構造と検索条件を分析
 */
async function analyzeCurrentSearchStructure() {
  console.log('🔍 現在の盆栽商品データ構造分析');
  console.log('='.repeat(60));
  
  try {
    // 全商品データを取得
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ データベースエラー:', error.message);
      return;
    }
    
    console.log(`📊 総商品数: ${products.length}件\n`);
    
    // 1. データベースカラム構造
    console.log('📋 【現在のデータベースカラム構造】');
    console.log('='.repeat(40));
    const sampleProduct = products[0];
    Object.keys(sampleProduct).forEach(key => {
      const value = sampleProduct[key];
      const type = typeof value;
      const example = type === 'string' && value.length > 30 ? value.substring(0, 30) + '...' : value;
      console.log(`${key.padEnd(15)} | ${type.padEnd(8)} | ${example}`);
    });
    
    // 2. カテゴリ分布
    console.log('\n🏷️  【カテゴリ分布】');
    console.log('='.repeat(40));
    const categoryCount = {};
    products.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`${category.padEnd(20)} | ${count}件`);
      });
    
    // 3. 価格分布
    console.log('\n💰 【価格分布】');
    console.log('='.repeat(40));
    const prices = products.map(p => p.price).filter(p => p > 0).sort((a, b) => a - b);
    const priceRanges = {
      '〜3,000円': prices.filter(p => p <= 3000).length,
      '3,001〜5,000円': prices.filter(p => p > 3000 && p <= 5000).length,
      '5,001〜10,000円': prices.filter(p => p > 5000 && p <= 10000).length,
      '10,001〜20,000円': prices.filter(p => p > 10000 && p <= 20000).length,
      '20,001〜50,000円': prices.filter(p => p > 20000 && p <= 50000).length,
      '50,001円〜': prices.filter(p => p > 50000).length,
    };
    Object.entries(priceRanges).forEach(([range, count]) => {
      console.log(`${range.padEnd(20)} | ${count}件`);
    });
    console.log(`最安値: ¥${Math.min(...prices).toLocaleString()}`);
    console.log(`最高値: ¥${Math.max(...prices).toLocaleString()}`);
    console.log(`平均価格: ¥${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length).toLocaleString()}`);
    
    // 4. サイズ分布
    console.log('\n📏 【サイズ分布】');
    console.log('='.repeat(40));
    const sizeCount = {};
    products.forEach(p => {
      sizeCount[p.size_category] = (sizeCount[p.size_category] || 0) + 1;
    });
    Object.entries(sizeCount).forEach(([size, count]) => {
      console.log(`${size.padEnd(20)} | ${count}件`);
    });
    
    // 5. タグ分析
    console.log('\n🏷️  【タグ分析（上位20位）】');
    console.log('='.repeat(40));
    const allTags = {};
    products.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(tag => {
          allTags[tag] = (allTags[tag] || 0) + 1;
        });
      }
    });
    Object.entries(allTags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .forEach(([tag, count]) => {
        console.log(`${tag.padEnd(20)} | ${count}件`);
      });
    
    // 6. 現在の検索・フィルター条件
    console.log('\n🔍 【現在実装されている検索条件】');
    console.log('='.repeat(40));
    console.log('✅ カテゴリフィルター:', Object.keys(categoryCount).join(', '));
    console.log('✅ 価格範囲フィルター: 実装可能');
    console.log('✅ サイズフィルター:', Object.keys(sizeCount).join(', '));
    console.log('✅ タグ検索: 実装済み');
    console.log('✅ キーワード検索: 商品名・説明文対象');
    
    // 7. 盆栽ユーザー視点での改善提案
    console.log('\n💡 【盆栽ユーザー視点での検索条件改善案】');
    console.log('='.repeat(40));
    
    console.log('\n【現在のデータから自動判定可能な検索条件】');
    console.log('🌸 季節性:');
    const seasonalTags = Object.keys(allTags).filter(tag => 
      ['春', '夏', '秋', '冬', '花', '紅葉', '実', '四季'].some(season => tag.includes(season))
    );
    console.log('  -', seasonalTags.join(', '));
    
    console.log('🎯 レベル別:');
    const levelTags = Object.keys(allTags).filter(tag => 
      ['初心者', '中級', '上級', 'プロ'].some(level => tag.includes(level))
    );
    console.log('  -', levelTags.join(', '));
    
    console.log('🎁 用途別:');
    const usageTags = Object.keys(allTags).filter(tag => 
      ['ギフト', 'プレゼント', '贈答', '観賞', '学習'].some(usage => tag.includes(usage))
    );
    console.log('  -', usageTags.join(', '));
    
    console.log('\n【追加実装を検討すべき検索条件】');
    console.log('❓ 樹齢: データなし（商品説明から抽出可能）');
    console.log('❓ 樹形スタイル: データなし（直幹、模様木、懸崖など）');
    console.log('❓ 育てやすさ: データなし（耐寒性、耐暑性など）');
    console.log('❓ 置き場所: データなし（室内、屋外、半日陰など）');
    console.log('❓ 開花時期: データなし（春、夏、秋）');
    
  } catch (err) {
    console.error('❌ エラー:', err.message);
  }
}

// 実行
analyzeCurrentSearchStructure().catch(console.error);