// 商品登録結果検証スクリプト
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyProducts() {
  try {
    console.log('🔍 商品データベース検証中...\n');

    // 全商品数確認
    const { data: allProducts, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (countError) {
      console.error('❌ エラー:', countError.message);
      return;
    }

    console.log(`📊 総商品数: ${allProducts?.length || 0}商品\n`);

    // 新規追加商品の確認
    const newProductNames = [
      '桜・藤寄せ植え*陶器鉢',
      '桜盆栽：一才桜(瀬戸焼白輪花鉢)',
      'モダン松竹梅',
      '四国五葉松 ミニ盆栽 鉢植え',
      'ミニ盆栽：糸魚川真柏（曲・5年生）萬古焼泥物丸小鉢'
    ];

    console.log('🌸 新規追加商品確認:');
    console.log('=================================');

    for (const productName of newProductNames) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('name', productName)
        .single();

      if (product) {
        console.log(`✅ ${product.name}`);
        console.log(`   価格: ¥${product.price.toLocaleString()}`);
        console.log(`   カテゴリー: ${product.category}`);
        console.log(`   サイズ: ${product.size_category}`);
        console.log(`   難易度: ${product.difficulty_level}`);
        console.log(`   タグ数: ${product.tags?.length || 0}個`);
        console.log(`   Amazon URL: ${product.amazon_url ? '✅' : '❌'}`);
        console.log('');
      } else {
        console.log(`❌ ${productName} - 見つかりません`);
      }
    }

    // カテゴリー別集計
    const categoryCount = {};
    allProducts?.forEach(product => {
      const category = product.category || 'その他';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    console.log('📊 カテゴリー別商品数:');
    console.log('=========================');
    Object.keys(categoryCount).sort().forEach(category => {
      console.log(`   ${category}: ${categoryCount[category]}商品`);
    });

    // 価格帯分析
    const prices = allProducts?.map(p => p.price).filter(p => p > 0) || [];
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

      console.log('\n💰 価格帯分析:');
      console.log('================');
      console.log(`   最低価格: ¥${minPrice.toLocaleString()}`);
      console.log(`   最高価格: ¥${maxPrice.toLocaleString()}`);
      console.log(`   平均価格: ¥${avgPrice.toLocaleString()}`);
    }

    console.log('\n🎉 データベース検証完了！');

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

verifyProducts();