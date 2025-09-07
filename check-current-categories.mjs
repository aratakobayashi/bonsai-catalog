import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// .env.localから環境変数を読み込む
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  envVars.VITE_SUPABASE_URL,
  envVars.VITE_SUPABASE_ANON_KEY
);

async function checkCategories() {
  console.log('📊 現在の商品カテゴリを確認中...\n');
  
  // 全商品のカテゴリを取得
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, category')
    .order('category');
  
  if (error) {
    console.error('エラー:', error);
    return;
  }
  
  // カテゴリ別に集計
  const categoryCount = {};
  products.forEach(product => {
    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
  });
  
  console.log('🏷️ カテゴリ別商品数:');
  console.log('=' .repeat(40));
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`${category}: ${count}件`);
  });
  
  console.log('\n📝 カテゴリ変換マッピング:');
  console.log('=' .repeat(40));
  console.log('松類 → 松柏類');
  console.log('落葉樹 → 雑木類');
  console.log('花木 → 花もの');
  console.log('針葉樹 → 松柏類（松柏類に統合）');
  console.log('その他 → 草もの');
  
  // 変換後の予想
  console.log('\n🔄 変換後の予想:');
  console.log('=' .repeat(40));
  const newCategories = {
    '松柏類': (categoryCount['松類'] || 0) + (categoryCount['針葉樹'] || 0),
    '雑木類': categoryCount['落葉樹'] || 0,
    '花もの': categoryCount['花木'] || 0,
    '実もの': 0, // 新規カテゴリ
    '草もの': 0  // 新規カテゴリ
  };
  
  Object.entries(newCategories).forEach(([category, count]) => {
    console.log(`${category}: ${count}件`);
  });
  
  process.exit(0);
}

checkCategories();