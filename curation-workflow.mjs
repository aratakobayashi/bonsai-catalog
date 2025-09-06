import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 高品質な商品データを手動キュレーションするためのワークフロー
const additionalProducts = [
  {
    name: '信楽焼 盆栽鉢 楕円形',
    description: '伝統的な信楽焼の盆栽鉢。落ち着いた茶系の釉薬で、どんな樹種にも調和します。楕円形で中品盆栽に最適。',
    price: 6800,
    category: '鉢・受皿',
    tags: ['信楽焼', '楕円形', '中品', '和風', '陶器'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    amazon_url: 'https://amazon.co.jp/example-shigaraki-pot'
  },
  {
    name: 'けやき盆栽（樹齢20年）',
    description: '風格のある欅の盆栽。力強い幹と細かい枝振りが美しく、新緑から紅葉まで四季を通じて楽しめます。',
    price: 35000,
    category: '落葉樹',
    tags: ['けやき', '樹齢20年', '上級者向け', '四季楽しめる', '力強い'],
    size_category: 'medium',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    amazon_url: 'https://amazon.co.jp/example-keyaki'
  },
  {
    name: '盆栽用ジョウロ（真鮮製）',
    description: '細かい水やりに最適な盆栽専用ジョウロ。職人手作りの銅製で、水の出方が繊細にコントロールできます。',
    price: 8900,
    category: '道具・工具',
    tags: ['ジョウロ', '真鮮製', '銅製', '手作り', '水やり'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    amazon_url: 'https://amazon.co.jp/example-watering-can'
  },
  {
    name: 'つつじ盆栽（花付き良好）',
    description: '春の開花が美しいつつじ盆栽。花付きが良好で、ピンクの可憐な花が楽しめます。初心者にも育てやすい品種。',
    price: 7200,
    category: '花木',
    tags: ['つつじ', '花付き良好', 'ピンク', '春', '初心者向け'],
    size_category: 'small',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    amazon_url: 'https://amazon.co.jp/example-azalea'
  },
  {
    name: '盆栽用化粧砂（白砂）',
    description: '盆栽の表面を美しく仕上げる化粧砂。白い細砂で清潔感があり、樹の美しさを引き立てます。',
    price: 1200,
    category: '用土・肥料',
    tags: ['化粧砂', '白砂', '表面仕上げ', '清潔感', '装飾'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    amazon_url: 'https://amazon.co.jp/example-white-sand'
  },
  {
    name: 'いちい（一位）中品盆栽',
    description: '格調高いいちいの中品盆栽。深緑の針葉と赤い実が特徴的で、年間を通して観賞価値の高い逸品です。',
    price: 28000,
    category: '針葉樹',
    tags: ['いちい', '格調高い', '赤い実', '深緑', '年間観賞'],
    size_category: 'medium',
    image_url: 'https://images.unsplash.com/photo-1484503703715-c42c6b4dec2a?w=400',
    amazon_url: 'https://amazon.co.jp/example-ichii'
  },
  {
    name: '盆栽剪定ワイヤー（アルミ製）',
    description: '枝の矯正や造形に使用するアルミワイヤー。適度な硬さで扱いやすく、多サイズセットで様々な枝に対応。',
    price: 2800,
    category: '道具・工具',
    tags: ['ワイヤー', 'アルミ製', '枝矯正', '造形', 'セット'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    amazon_url: 'https://amazon.co.jp/example-wire-set'
  },
  {
    name: '白梅盆栽（蕾付き）',
    description: '早春に美しい白い花を咲かせる梅の盆栽。現在蕾が付いており、開花が楽しみな状態です。香りも楽しめます。',
    price: 16500,
    category: '花木',
    tags: ['白梅', '蕾付き', '早春', '白い花', '香り'],
    size_category: 'medium',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    amazon_url: 'https://amazon.co.jp/example-white-plum'
  },
  {
    name: '赤松大品盆栽（樹齢40年）',
    description: '圧巻の存在感を持つ赤松大品盆栽。樹齢40年の風格ある姿は、盆栽愛好家憧れの逸品。展示会レベルの品質。',
    price: 120000,
    category: '松類',
    tags: ['赤松', '大品', '樹齢40年', '展示会レベル', '風格'],
    size_category: 'large',
    image_url: 'https://images.unsplash.com/photo-1516253593875-bd7f052ab1b5?w=400',
    amazon_url: 'https://amazon.co.jp/example-large-akamatsu'
  },
  {
    name: '盆栽育成ライト（LED）',
    description: '室内での盆栽育成に最適なLEDライト。植物の成長に必要な波長を効率的に照射し、年間を通した室内栽培をサポート。',
    price: 12800,
    category: '道具・工具',
    tags: ['LEDライト', '室内育成', '植物育成', '効率的', '年間使用'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    amazon_url: 'https://amazon.co.jp/example-led-light'
  }
];

async function curateProducts() {
  console.log('🎯 手動キュレーション ワークフロー開始');
  console.log('='.repeat(50));
  
  try {
    // 現在の商品データを分析
    const { data: currentProducts, error } = await supabase
      .from('products')
      .select('category, size_category, price, tags');
    
    if (error) {
      console.log('❌ データベースアクセスエラー:', error.message);
      return;
    }
    
    console.log('📊 現在のデータ分析:');
    console.log(`📦 総商品数: ${currentProducts.length}`);
    
    // カテゴリー分析
    const categories = {};
    const sizeCounts = {};
    let totalPrice = 0;
    const allTags = [];
    
    currentProducts.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
      sizeCounts[product.size_category] = (sizeCounts[product.size_category] || 0) + 1;
      totalPrice += product.price;
      if (Array.isArray(product.tags)) {
        allTags.push(...product.tags);
      }
    });
    
    console.log('📂 既存カテゴリー分布:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}個`);
    });
    
    console.log(`💰 平均価格: ¥${Math.round(totalPrice / currentProducts.length).toLocaleString()}`);
    console.log(`🏷️  総タグ数: ${new Set(allTags).size}種類`);
    
    console.log('\\n✅ キュレーションの品質基準:');
    console.log('  • カテゴリーバランスの向上');
    console.log('  • 価格帯の多様化');  
    console.log('  • 検索性を高めるタグ付け');
    console.log('  • 画像品質の統一');
    console.log('  • 商品説明の詳細化');
    
    // 新商品追加
    console.log('\\n🌱 新商品追加中...');
    let addedCount = 0;
    
    for (const product of additionalProducts) {
      // 重複チェック
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('name', product.name)
        .single();
      
      if (existing) {
        console.log(`⚠️  スキップ: "${product.name}" (既存)`);
        continue;
      }
      
      const { error: insertError } = await supabase
        .from('products')
        .insert([product]);
      
      if (insertError) {
        console.log(`❌ 追加失敗: ${product.name} - ${insertError.message}`);
      } else {
        console.log(`✅ 追加成功: ${product.name} (${product.category})`);
        addedCount++;
      }
    }
    
    console.log('\\n🎉 キュレーション完了!');
    console.log(`📈 ${addedCount}個の新商品を追加`);
    
    // 更新後の分析
    const { data: updatedProducts } = await supabase
      .from('products')
      .select('category, size_category, price, tags');
    
    const newCategories = {};
    updatedProducts.forEach(product => {
      newCategories[product.category] = (newCategories[product.category] || 0) + 1;
    });
    
    console.log('\\n📊 更新後のカテゴリー分布:');
    Object.entries(newCategories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}個`);
    });
    
    console.log('\\n🔍 検索・フィルター機能向上のポイント:');
    console.log('  ✓ カテゴリーの多様性増加');
    console.log('  ✓ 価格帯の幅広いカバー');
    console.log('  ✓ タグベース検索の精度向上');
    console.log('  ✓ サイズ別フィルタリング対応');
    
  } catch (err) {
    console.error('❌ キュレーションエラー:', err.message);
  }
}

curateProducts().catch(console.error);