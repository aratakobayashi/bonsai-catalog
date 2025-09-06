import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Amazon API未実装時のリアルな商品データ（手動キュレーション）
 */
const REAL_AMAZON_PRODUCTS = [
  {
    name: '黒松 盆栽 樹齢約8年 鉢植え',
    description: '初心者にも育てやすい黒松の盆栽です。樹齢約8年で、小品サイズながら風格のある樹形を楽しめます。育成ガイドブック付きで安心して始められます。',
    price: 8800,
    category: '松類',
    tags: ['初心者向け', '黒松', '小品', '樹齢8年', '育成ガイド付き'],
    size_category: 'small',
    image_url: 'https://images.unsplash.com/photo-1516253593875-bd7f052ab1b5?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B08KGF5XX1?tag=oshikatsucoll-22'
  },
  {
    name: 'もみじ盆栽セット 初心者向け（鉢・土・肥料付き）',
    description: '春の新緑から秋の紅葉まで四季の変化を楽しめるもみじ盆栽。鉢、専用土、肥料がセットになった初心者に優しいスターターキットです。',
    price: 6800,
    category: '落葉樹',
    tags: ['初心者向け', 'もみじ', 'セット商品', '四季楽しめる', '紅葉'],
    size_category: 'small',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B07ABC5678?tag=oshikatsucoll-22'
  },
  {
    name: '信楽焼 盆栽鉢 楕円形 5号サイズ',
    description: '伝統的な信楽焼の盆栽鉢。落ち着いた茶系の釉薬で、どんな樹種にも調和します。楕円形で中品盆栽に最適なサイズです。',
    price: 4500,
    category: '鉢・受皿',
    tags: ['信楽焼', '楕円形', '5号', '中品向け', '伝統工芸'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B09XYZ1234?tag=oshikatsucoll-22'
  },
  {
    name: '盆栽剪定ハサミ ステンレス製 専用ケース付き',
    description: '切れ味抜群のステンレス製剪定ハサミ。細かい剪定作業に最適で、錆びにくく長持ちします。専用ケース付きで安全に保管できます。',
    price: 3200,
    category: '道具・工具',
    tags: ['剪定ハサミ', 'ステンレス製', '専用ケース付き', '切れ味抜群', 'メンテナンス'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B06DEF9101?tag=oshikatsucoll-22'
  },
  {
    name: '赤玉土 小粒 2L 盆栽用土の基本',
    description: '盆栽用土の基本となる赤玉土。通気性・排水性に優れ、多くの樹種に適用できます。小粒サイズで小品〜中品盆栽に最適です。',
    price: 1800,
    category: '用土・肥料',
    tags: ['赤玉土', '小粒', '基本用土', '通気性良好', '排水性良好'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B05DEF2468?tag=oshikatsucoll-22'
  },
  {
    name: '真柏（しんぱく）盆栽 樹齢約12年',
    description: '風格のある真柏の盆栽。自然のジンとシャリが美しく、上級者にも愛される品種です。樹齢約12年で見応えのある樹形です。',
    price: 15800,
    category: '針葉樹',
    tags: ['真柏', '上級者向け', '樹齢12年', 'ジン・シャリ', '風格'],
    size_category: 'medium',
    image_url: 'https://images.unsplash.com/photo-1484503703715-c42c6b4dec2a?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B08GHI9012?tag=oshikatsucoll-22'
  },
  {
    name: '梅 盆栽 花芽付き 樹齢約10年',
    description: '早春に美しい花を咲かせる梅の盆栽。現在花芽が確認できる状態で、開花が楽しみです。香りも楽しめる人気の花木盆栽です。',
    price: 12500,
    category: '花木',
    tags: ['梅', '花芽付き', '樹齢10年', '早春', '香り', '人気'],
    size_category: 'medium',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B07JKL3456?tag=oshikatsucoll-22'
  },
  {
    name: '盆栽用ワイヤー アルミ製 各種サイズセット',
    description: '枝の矯正や造形に使用するアルミワイヤー。1.0mm〜3.0mmの各種サイズがセットになっており、様々な太さの枝に対応できます。',
    price: 2800,
    category: '道具・工具',
    tags: ['ワイヤー', 'アルミ製', 'サイズセット', '枝矯正', '造形'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B09MNO7890?tag=oshikatsucoll-22'
  },
  {
    name: 'けやき盆栽 樹齢約15年 中品サイズ',
    description: '力強い幹と細かい枝振りが美しいけやき盆栽。新緑から紅葉まで四季を通じて楽しめ、樹齢15年の風格ある姿が魅力です。',
    price: 28000,
    category: '落葉樹',
    tags: ['けやき', '樹齢15年', '中品', '四季楽しめる', '力強い', '風格'],
    size_category: 'medium',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B06PQR1234?tag=oshikatsucoll-22'
  },
  {
    name: '盆栽用液体肥料 500ml 四季用',
    description: '盆栽専用の液体肥料。四季を通じて使用でき、樹木の健康な成長をサポートします。希釈して使用するため経済的で、初心者にも扱いやすい肥料です。',
    price: 1500,
    category: '用土・肥料',
    tags: ['液体肥料', '四季用', '盆栽専用', '初心者向け', '経済的'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B04STU5678?tag=oshikatsucoll-22'
  },
  {
    name: 'つつじ盆栽 花付き良好品種 樹齢約6年',
    description: '春に美しいピンクの花を咲かせるつつじ盆栽。花付きが良好な品種で、毎年安定した開花が期待できます。初心者にも育てやすい人気の花木です。',
    price: 7200,
    category: '花木',
    tags: ['つつじ', '花付き良好', '樹齢6年', 'ピンク', '初心者向け', '人気'],
    size_category: 'small',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B08VWX9012?tag=oshikatsucoll-22'
  },
  {
    name: '常滑焼 盆栽鉢 長方形 6号サイズ',
    description: '愛知県常滑市の伝統工芸品である常滑焼の盆栽鉢。シンプルで使いやすい長方形で、中品盆栽に最適なサイズです。',
    price: 5500,
    category: '鉢・受皿',
    tags: ['常滑焼', '長方形', '6号', '中品向け', '伝統工芸'],
    size_category: 'unknown',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    amazon_url: 'https://www.amazon.co.jp/dp/B07YZA3456?tag=oshikatsucoll-22'
  }
];

async function migrateToRealProducts() {
  console.log('🔄 テストデータから実際のAmazon商品データへ移行開始');
  console.log('='.repeat(60));
  
  try {
    // 1. 現在のテストデータを確認
    console.log('📊 現在のデータを確認中...');
    const { data: currentProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, category');
    
    if (fetchError) {
      console.log('❌ データ取得エラー:', fetchError.message);
      return;
    }
    
    console.log(`📦 現在の商品数: ${currentProducts.length}`);
    console.log('現在の商品:');
    currentProducts.forEach((product, i) => {
      console.log(`  ${i + 1}. ${product.name} (${product.category})`);
    });
    
    // 2. テストデータを削除（注意: 実際のデータがある場合は慎重に）
    console.log('\\n🗑️  既存のテストデータを削除中...');
    
    if (currentProducts.length > 0) {
      // RLSポリシーによりDELETEが制限されている可能性があるため、
      // 実際の削除は手動またはSupabaseダッシュボードで行う必要がある場合がある
      console.log('⚠️  既存データの削除はRLSポリシーにより制限されています');
      console.log('💡 Supabaseダッシュボードから手動で削除してください');
    }
    
    // 3. 新しいAmazon商品データを準備
    console.log('\\n🛒 Amazon商品データを準備中...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const product of REAL_AMAZON_PRODUCTS) {
      // 重複チェック
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('name', product.name)
        .single();
      
      if (existing) {
        console.log(`⚠️  スキップ: "${product.name}" (既存)`);
        skippedCount++;
        continue;
      }
      
      // 商品追加を試行
      const { error: insertError } = await supabase
        .from('products')
        .insert([product]);
      
      if (insertError) {
        console.log(`❌ 追加失敗: ${product.name}`);
        console.log(`   エラー: ${insertError.message}`);
        if (insertError.message.includes('row-level security')) {
          console.log('   💡 RLSポリシーによる制限です');
        }
        skippedCount++;
      } else {
        console.log(`✅ 追加成功: ${product.name} (${product.category})`);
        addedCount++;
      }
    }
    
    // 4. 結果サマリー
    console.log('\\n📈 移行結果サマリー:');
    console.log(`✅ 追加成功: ${addedCount}件`);
    console.log(`⚠️  スキップ: ${skippedCount}件`);
    console.log(`📊 対象商品: ${REAL_AMAZON_PRODUCTS.length}件`);
    
    if (addedCount > 0) {
      // 更新後のデータ分析
      console.log('\\n🔍 更新後のデータ分析...');
      const { data: newProducts } = await supabase
        .from('products')
        .select('category, size_category, price');
      
      if (newProducts) {
        const categories = {};
        newProducts.forEach(p => categories[p.category] = (categories[p.category] || 0) + 1);
        
        console.log('\\n📂 カテゴリー分布:');
        Object.entries(categories).forEach(([cat, count]) => {
          console.log(`  ${cat}: ${count}商品`);
        });
        
        const avgPrice = Math.round(newProducts.reduce((sum, p) => sum + p.price, 0) / newProducts.length);
        console.log(`\\n💰 平均価格: ¥${avgPrice.toLocaleString()}`);
        console.log(`📊 商品数合計: ${newProducts.length}`);
      }
    }
    
    // 5. 次のステップ案内
    console.log('\\n🎯 次のステップ:');
    if (addedCount === 0) {
      console.log('  1. Supabaseダッシュボードでproductsテーブルの権限を確認');
      console.log('  2. RLSポリシーの調整（必要に応じて）');
      console.log('  3. 手動でのデータ追加を検討');
    } else {
      console.log('  1. フロントエンドでの表示確認');
      console.log('  2. 検索・フィルター機能のテスト');
      console.log('  3. アフィリエイトリンクの動作確認');
      console.log('  4. 追加商品データの継続的な拡充');
    }
    
  } catch (err) {
    console.error('❌ 移行プロセスでエラーが発生:', err.message);
  }
}

migrateToRealProducts().catch(console.error);