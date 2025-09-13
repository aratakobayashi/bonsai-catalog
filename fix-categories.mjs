// 盆栽カテゴリー5分類統一スクリプト
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 正しい5カテゴリー（厳守）
const CORRECT_CATEGORIES = {
  '松柏類': '松、真柏、杜松、五葉松など',
  '雑木類': 'もみじ、欅、ブナなど',
  '花もの': '桜、梅、ツツジなど',
  '実もの': '柿、南天、ピラカンサなど',
  '草もの': '山野草、苔、多肉植物など'
};

// カテゴリー修正マッピング
const CATEGORY_FIXES = [
  { wrong: '松類', correct: '松柏類', reason: '松類は松柏類に統合' },
  { wrong: '花木', correct: '花もの', reason: '花木は花ものに統合' },
  { wrong: '針葉樹', correct: '松柏類', reason: '針葉樹は松柏類に統合' }
];

async function fixCategories() {
  try {
    console.log('🔧 盆栽カテゴリー5分類統一開始...\n');
    
    console.log('🎯 正しい5カテゴリー:');
    Object.keys(CORRECT_CATEGORIES).forEach((cat, index) => {
      console.log(`${index + 1}. ${cat} - ${CORRECT_CATEGORIES[cat]}`);
    });
    console.log('');

    let totalFixed = 0;

    for (const fix of CATEGORY_FIXES) {
      console.log(`📝 修正中: "${fix.wrong}" → "${fix.correct}"`);
      console.log(`   理由: ${fix.reason}`);

      // 該当商品を検索
      const { data: products, error: searchError } = await supabase
        .from('products')
        .select('id, name, category')
        .eq('category', fix.wrong);

      if (searchError) {
        console.error(`❌ 検索エラー (${fix.wrong}):`, searchError.message);
        continue;
      }

      if (!products || products.length === 0) {
        console.log(`   ✅ "${fix.wrong}"カテゴリーの商品は見つかりませんでした`);
        continue;
      }

      console.log(`   📦 対象商品: ${products.length}件`);
      products.forEach(p => console.log(`      - ${p.name}`));

      // カテゴリー更新
      const { error: updateError } = await supabase
        .from('products')
        .update({ category: fix.correct })
        .eq('category', fix.wrong);

      if (updateError) {
        console.error(`❌ 更新エラー (${fix.wrong}):`, updateError.message);
      } else {
        console.log(`   ✅ ${products.length}件の商品を "${fix.correct}" に更新`);
        totalFixed += products.length;
      }
      console.log('');
    }

    // 修正結果確認
    console.log('📊 修正後のカテゴリー確認:');
    console.log('===============================');

    const { data: allProducts } = await supabase
      .from('products')
      .select('name, category');

    const categoryCount = {};
    allProducts?.forEach(product => {
      const category = product.category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const sortedCategories = Object.keys(categoryCount).sort();
    sortedCategories.forEach(category => {
      const isCorrect = Object.keys(CORRECT_CATEGORIES).includes(category);
      const status = isCorrect ? '✅' : '⚠️ ';
      console.log(`${status} ${category}: ${categoryCount[category]}商品`);
    });

    console.log(`\n🎉 カテゴリー統一完了!`);
    console.log(`✅ 修正済み商品数: ${totalFixed}件`);
    console.log(`📋 カテゴリー数: ${sortedCategories.length}種類`);
    
    const correctCount = sortedCategories.filter(cat => 
      Object.keys(CORRECT_CATEGORIES).includes(cat)
    ).length;
    
    if (correctCount === 5 && sortedCategories.length === 5) {
      console.log(`🎯 完璧！正しい5カテゴリーに統一されました！`);
    } else if (sortedCategories.length > 5) {
      console.log(`⚠️  まだ不正なカテゴリーが残っています。手動確認が必要です。`);
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('🌸 盆栽カテゴリー統一スクリプト');
console.log('================================');
fixCategories();