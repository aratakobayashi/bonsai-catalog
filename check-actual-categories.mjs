// 実際のデータベースカテゴリー確認
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActualCategories() {
  try {
    console.log('🔍 実際のデータベースカテゴリー確認...\n');
    
    const { data, error } = await supabase
      .from('products')
      .select('name, category');

    if (error) {
      console.error('❌ エラー:', error.message);
      return;
    }

    const categoryCount = {};
    data?.forEach(product => {
      const category = product.category;
      if (categoryCount[category]) {
        categoryCount[category].count++;
        categoryCount[category].products.push(product.name);
      } else {
        categoryCount[category] = { count: 1, products: [product.name] };
      }
    });

    console.log('📊 実際のカテゴリー別商品:');
    console.log('========================================');
    
    Object.keys(categoryCount).sort().forEach(category => {
      console.log(`\n【${category}】: ${categoryCount[category].count}商品`);
      categoryCount[category].products.forEach(name => {
        console.log(`  ✓ ${name}`);
      });
    });

    console.log(`\n📋 合計: ${Object.keys(categoryCount).length}カテゴリー, ${data?.length || 0}商品`);

    // 正しいカテゴリー分類との比較
    console.log('\n\n🎯 正しい盆栽カテゴリー分類:');
    console.log('================================');
    console.log('1. 松柏類 (松、真柏、杜松など)');
    console.log('2. 雑木類 (もみじ、欅、ブナなど)');
    console.log('3. 花もの (桜、梅、ツツジなど)');
    console.log('4. 実もの (柿、南天、ピラカンサなど)');
    console.log('5. 草もの (山野草、苔、多肉植物など)');

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

checkActualCategories();