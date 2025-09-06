import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// Initial products data for manual curation
const initialProducts = [
  {
    name: '黒松の苗木（小品盆栽用）',
    description: '初心者にも育てやすい黒松の小品盆栽用苗木。樹形が美しく、盆栽の基本を学ぶのに最適です。',
    price: 2800,
    category: '松類',
    tags: ['初心者向け', '小品盆栽', '黒松', '常緑樹'],
    size_category: 'mini',
    image_url: 'https://images.unsplash.com/photo-1516253593875-bd7f052ab1b5?w=400',
    amazon_url: 'https://amazon.co.jp/example-kuromatsu'
  },
  {
    name: '赤松盆栽（中品）',
    description: '樹齢約15年の赤松盆栽。枝張りがよく、美しい樹形を楽しめます。中級者におすすめ。',
    price: 15800,
    category: '松類',
    tags: ['中級者向け', '中品盆栽', '赤松', '常緑樹'],
    size_category: 'medium',
    image_url: 'https://images.unsplash.com/photo-1565543089-1a1fc423d3bd?w=400',
    amazon_url: 'https://amazon.co.jp/example-akamatsu'
  },
  {
    name: 'もみじ盆栽セット（初心者用）',
    description: '春の新緑から秋の紅葉まで四季を楽しめるもみじ盆栽。鉢、土、肥料がセットになった初心者向けキット。',
    price: 4200,
    category: '落葉樹',
    tags: ['初心者向け', 'セット商品', 'もみじ', '四季楽しめる'],
    size_category: 'small',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    amazon_url: 'https://amazon.co.jp/example-momiji-set'
  },
  {
    name: '真柏（しんぱく）小品',
    description: '風格のある真柏の小品盆栽。ジンやシャリの自然な美しさが魅力的な逸品です。',
    price: 8900,
    category: '柏・槙類',
    tags: ['上級者向け', '小品盆栽', '真柏', 'ジン・シャリ'],
    size_category: 'small',
    image_url: 'https://images.unsplash.com/photo-1484503703715-c42c6b4dec2a?w=400',
    amazon_url: 'https://amazon.co.jp/example-shinpaku'
  },
  {
    name: '盆栽用土セット（基本3種）',
    description: '赤玉土、桐生砂、腐葉土の基本3種セット。様々な樹種に対応できる万能配合用土です。',
    price: 1500,
    category: '用土・肥料',
    tags: ['用土', 'セット商品', '基本', '万能'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    amazon_url: 'https://amazon.co.jp/example-soil-set'
  },
  {
    name: '盆栽鉢（長方形・5号）',
    description: 'シンプルで使いやすい長方形の盆栽鉢。小～中品盆栽に最適なサイズです。',
    price: 3200,
    category: '鉢・受皿',
    tags: ['盆栽鉢', '長方形', '5号', 'シンプル'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    amazon_url: 'https://amazon.co.jp/example-pot-rectangular'
  },
  {
    name: '盆栽剪定ハサミ（ステンレス製）',
    description: '切れ味抜群のステンレス製剪定ハサミ。細かい作業に最適で、メンテナンスも簡単です。',
    price: 2400,
    category: '道具・工具',
    tags: ['剪定ハサミ', 'ステンレス', '道具', 'メンテナンス'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    amazon_url: 'https://amazon.co.jp/example-scissors'
  },
  {
    name: '五葉松盆栽（大品）',
    description: '迫力のある五葉松の大品盆栽。樹齢約30年、格調高い樹形が魅力的な上級者向け作品。',
    price: 58000,
    category: '松類',
    tags: ['上級者向け', '大品盆栽', '五葉松', '高級品'],
    size_category: 'large',
    image_url: 'https://images.unsplash.com/photo-1516253593875-bd7f052ab1b5?w=400',
    amazon_url: 'https://amazon.co.jp/example-goyomatsu'
  }
];

async function addInitialProducts() {
  console.log('🌱 初期商品データを追加中...');
  
  try {
    // まず既存の商品数を確認
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ 商品テーブルへのアクセスエラー:', countError.message);
      console.log('💡 Supabaseダッシュボードでテーブルが作成されているか確認してください');
      return;
    }
    
    console.log(`📊 現在の商品数: ${count}`);
    
    if (count > 0) {
      console.log('✅ 既に商品データが存在します。追加をスキップします。');
      return;
    }
    
    // 商品を1つずつ追加
    console.log('💾 新規商品を追加中...');
    const results = [];
    
    for (const product of initialProducts) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();
      
      if (error) {
        console.log(`❌ 商品追加エラー (${product.name}):`, error.message);
      } else {
        console.log(`✅ 追加完了: ${product.name}`);
        results.push(data[0]);
      }
    }
    
    console.log(`🎉 ${results.length}/${initialProducts.length} 商品を追加しました！`);
    
    // カテゴリー別統計を表示
    const categories = {};
    results.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    
    console.log('\n📈 追加された商品のカテゴリー別統計:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}商品`);
    });
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
}

addInitialProducts().catch(console.error);