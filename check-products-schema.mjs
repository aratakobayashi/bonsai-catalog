// Productsテーブル構造確認スクリプト
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductsSchema() {
  try {
    console.log('🔍 products テーブル構造確認中...\n');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ エラー:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('📋 利用可能なカラム:');
      Object.keys(data[0]).forEach(key => {
        const value = data[0][key];
        const type = typeof value;
        const isArray = Array.isArray(value);
        console.log(`   ✅ ${key}: ${type}${isArray ? ' (array)' : ''}`);
      });

      console.log('\n📊 サンプル商品データ:');
      console.log(`   商品名: ${data[0].name}`);
      console.log(`   価格: ${data[0].price}`);
      console.log(`   カテゴリー: ${data[0].category || 'なし'}`);
      console.log(`   タグ: ${data[0].tags || 'なし'}`);
    } else {
      console.log('⚠️  商品データが見つかりません');
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

checkProductsSchema();