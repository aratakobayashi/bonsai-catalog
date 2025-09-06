import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Amazon商品URLから商品情報を手動で抽出・整理
 */
async function extractAmazonProduct() {
  console.log('🔍 Amazon商品情報抽出・盆栽特化データ変換テスト');
  console.log('='.repeat(60));
  
  // 提供されたAmazon商品の情報（手動で抽出）
  const amazonUrl = 'https://www.amazon.co.jp/%E5%B0%8F%E5%93%81%E7%9B%86%E6%A0%BD%EF%BC%9A%E4%BA%94%E8%91%89%E6%9D%BE-%E7%80%AC%E6%88%B8%E7%84%BC%E5%B0%8F%E9%89%A2-%E5%8F%97%E3%81%91%E7%9A%BF%E4%BB%98%E3%81%8D-%E9%89%A2%E6%A4%8D%E3%81%88%E7%A5%9D%E3%81%84-%E3%83%97%E3%83%AC%E3%82%BC%E3%83%B3%E3%83%88%E3%81%AB%E3%82%82bonsai/dp/B00D9IOKXI';
  
  // Amazon商品情報（実際のスクレイピングの代わりに手動で情報を整理）
  const rawAmazonData = {
    title: '小品盆栽：五葉松 瀬戸焼小鉢 受け皿付き 鉢植え祝い プレゼントにもbonsai',
    asin: 'B00D9IOKXI',
    price: '¥3,980', // 例の価格
    description: '五葉松の小品盆栽です。瀬戸焼の小鉢に植えられており、受け皿付きでギフトにも最適です。初心者にも育てやすく、室内でも楽しめます。',
    images: {
      primary: 'https://images.unsplash.com/photo-1516253593875-bd7f052ab1b5?w=400' // プレースホルダー画像
    },
    features: [
      '五葉松の小品盆栽',
      '瀬戸焼小鉢使用',
      '受け皿付き',
      'ギフト包装可能',
      '初心者向け'
    ]
  };
  
  console.log('📦 Amazon商品データ取得:');
  console.log(`タイトル: ${rawAmazonData.title}`);
  console.log(`価格: ${rawAmazonData.price}`);
  console.log(`ASIN: ${rawAmazonData.asin}`);
  
  // 🌱 盆栽特化データに変換
  console.log('\\n🌱 盆栽特化データ変換中...');
  
  const convertedProduct = {
    name: '五葉松 小品盆栽（瀬戸焼鉢）',
    description: '格調高い五葉松の小品盆栽。瀬戸焼の上品な小鉢に植えられており、受け皿も付属しています。初心者にも育てやすく、贈り物としても人気です。室内での栽培も可能で、年間を通して美しい針葉を楽しめます。',
    price: 3980, // 数値に変換
    category: '松類', // 盆栽特化カテゴリ
    tags: [
      '五葉松',
      '小品盆栽',
      '初心者向け',
      '瀬戸焼',
      '受け皿付き',
      'ギフト対応',
      '室内栽培可能',
      '常緑樹',
      'プレゼント'
    ],
    size_category: 'small', // 小品盆栽なのでsmall
    image_url: rawAmazonData.images.primary,
    amazon_url: generateAffiliateURL(amazonUrl)
  };
  
  console.log('✅ 変換完了:');
  console.log(`商品名: ${convertedProduct.name}`);
  console.log(`カテゴリ: ${convertedProduct.category}`);
  console.log(`サイズ: ${convertedProduct.size_category}`);
  console.log(`価格: ¥${convertedProduct.price.toLocaleString()}`);
  console.log(`タグ数: ${convertedProduct.tags.length}個`);
  console.log(`タグ: ${convertedProduct.tags.join(', ')}`);
  
  // 🔄 データベース登録テスト
  console.log('\\n💾 Supabaseデータベース登録テスト...');
  
  try {
    // 重複チェック
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('name', convertedProduct.name)
      .single();
    
    if (existing) {
      console.log('⚠️  既に登録済みの商品です');
      return;
    }
    
    // 新規登録
    const { data, error } = await supabase
      .from('products')
      .insert([convertedProduct])
      .select();
    
    if (error) {
      console.log('❌ データベース登録エラー:', error.message);
      
      if (error.message.includes('row-level security')) {
        console.log('💡 RLSポリシーの制限です');
        console.log('📋 代替案: Supabaseダッシュボードから手動登録');
        console.log('\\n📝 登録用データ:');
        console.log(JSON.stringify(convertedProduct, null, 2));
      }
    } else {
      console.log('✅ データベース登録成功!');
      console.log('新規商品ID:', data[0].id);
      
      // 登録後の確認
      const { data: allProducts } = await supabase
        .from('products')
        .select('name, category, size_category')
        .order('created_at', { ascending: false });
      
      console.log('\\n📊 現在の商品一覧:');
      allProducts.forEach((product, i) => {
        console.log(`${i + 1}. ${product.name} (${product.category}/${product.size_category})`);
      });
    }
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
  
  // 🎯 次のステップ案内
  console.log('\\n🎯 次のステップ:');
  console.log('1. フロントエンドでの表示確認');
  console.log('2. 検索・フィルター機能のテスト');
  console.log('3. アフィリエイトリンクの動作確認');
  console.log('4. 他の商品カテゴリーでのテスト');
}

/**
 * アフィリエイトURL生成
 */
function generateAffiliateURL(originalUrl) {
  try {
    const url = new URL(originalUrl);
    
    // 既存のtagパラメータを削除
    url.searchParams.delete('tag');
    
    // 我々のAssociate IDを設定
    url.searchParams.set('tag', 'oshikatsucoll-22');
    url.searchParams.set('linkCode', 'as2');
    url.searchParams.set('camp', '247');
    url.searchParams.set('creative', '1211');
    
    return url.toString();
  } catch (error) {
    console.error('URL変換エラー:', error);
    return originalUrl;
  }
}

// 実行
extractAmazonProduct().catch(console.error);