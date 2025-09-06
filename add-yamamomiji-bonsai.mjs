import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 山もみじ盆栽の商品データ
 */
const yamamomijiProduct = {
  name: '山もみじの盆栽（藤久作手造り鉢）',
  description: '美しい山もみじの盆栽。春の新緑から秋の紅葉まで四季を通じて楽しめます。藤久作の手造り鉢付きで、高さ約25cm×幅10cmのコンパクトサイズ。室内でも育てやすく、初心者から上級者まで人気の品種です。',
  price: 8800, // Amazonの典型的な価格帯
  category: '落葉樹',
  tags: [
    '山もみじ',
    '紅葉',
    '落葉樹',
    '四季楽しめる',
    '藤久作',
    '手造り鉢',
    '中品',
    '室内栽培可能',
    '初心者向け',
    '春の新緑',
    '秋の紅葉',
    'ギフト対応'
  ],
  size_category: 'medium', // 高さ25cmなので中品
  image_url: '/products/yamamo-miji-bonsai.jpg',
  amazon_url: generateAffiliateUrl('https://www.amazon.co.jp/dp/B00BTS4O86')
};

/**
 * アフィリエイトURL生成
 */
function generateAffiliateUrl(originalUrl) {
  try {
    const url = new URL(originalUrl);
    // クリーンなURLに変換
    const cleanUrl = `https://www.amazon.co.jp/dp/B00BTS4O86`;
    const affiliateUrl = new URL(cleanUrl);
    
    // アフィリエイトパラメータを追加
    affiliateUrl.searchParams.set('tag', 'oshikatsucoll-22');
    affiliateUrl.searchParams.set('linkCode', 'as2');
    affiliateUrl.searchParams.set('camp', '247');
    affiliateUrl.searchParams.set('creative', '1211');
    
    return affiliateUrl.toString();
  } catch (error) {
    console.error('URL変換エラー:', error);
    return originalUrl;
  }
}

/**
 * 山もみじ盆栽を登録
 */
async function addYamamomijiBonsai() {
  console.log('🍁 山もみじ盆栽の登録開始');
  console.log('='.repeat(50));
  
  try {
    // 重複チェック
    const { data: existing } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', yamamomijiProduct.name)
      .single();
    
    if (existing) {
      console.log('⚠️  既に登録済みです:', existing.name);
      return;
    }
    
    // 新規登録
    console.log('💾 新規商品登録中...');
    console.log('商品名:', yamamomijiProduct.name);
    console.log('カテゴリ:', yamamomijiProduct.category);
    console.log('価格: ¥' + yamamomijiProduct.price.toLocaleString());
    console.log('サイズ:', yamamomijiProduct.size_category);
    console.log('タグ数:', yamamomijiProduct.tags.length);
    
    const { data, error } = await supabase
      .from('products')
      .insert([yamamomijiProduct])
      .select();
    
    if (error) {
      console.log('❌ 登録エラー:', error.message);
      return;
    }
    
    console.log('✅ 登録成功！');
    console.log('新規商品ID:', data[0].id);
    console.log('');
    
    // 登録後の確認
    const { data: allProducts } = await supabase
      .from('products')
      .select('name, category, price')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('📊 最新商品一覧（上位5件）:');
    allProducts.forEach((product, i) => {
      console.log(`${i + 1}. ${product.name}`);
      console.log(`   ${product.category} - ¥${product.price?.toLocaleString()}`);
    });
    
    console.log('');
    console.log('🌐 Vercelサイトで確認してください！');
    console.log('カテゴリ「落葉樹」または検索で「もみじ」');
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
}

// 実行
addYamamomijiBonsai().catch(console.error);