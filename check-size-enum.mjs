// サイズカテゴリーのENUM値確認
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSizeEnum() {
  try {
    console.log('🔍 既存商品のサイズカテゴリー確認...\n');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('name, size_category');

    if (error) {
      console.error('❌ エラー:', error.message);
      return;
    }

    const sizeCategories = {};
    products?.forEach(product => {
      const size = product.size_category;
      if (!sizeCategories[size]) {
        sizeCategories[size] = [];
      }
      sizeCategories[size].push(product.name);
    });

    console.log('📊 既存のサイズカテゴリー:');
    console.log('========================');
    Object.keys(sizeCategories).sort().forEach(size => {
      console.log(`✅ "${size}": ${sizeCategories[size].length}商品`);
      sizeCategories[size].forEach(name => {
        console.log(`   - ${name}`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

checkSizeEnum();