import { createClient } from '@supabase/supabase-js';

async function analyzeProducts() {
  const supabase = createClient(
    'https://awaarykghpylggygkiyp.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3YWFyeWtnaHB5bGdneWdraXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3OTE0MDksImV4cCI6MjA2NzM2NzQwOX0.J1dXm0eHB8RaqT_UnOI_zY7q1UyTaV4lLJtQT6EHhOE'
  );

  console.log('📦 商品データベース分析...');
  
  // 総商品数取得
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  console.log(`総商品数: ${count}個`);

  // カテゴリ別分析
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, tags, price')
    .limit(20);

  if (products) {
    const categories = {};
    products.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    console.log('\n📊 カテゴリ別商品数:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`- ${cat}: ${count}個`);
    });

    console.log('\n🏷️ 商品例:');
    products.slice(0, 10).forEach(p => {
      console.log(`- ${p.name} (${p.category}) - ¥${p.price?.toLocaleString() || 'N/A'}`);
    });
  }
}

analyzeProducts().catch(console.error);