import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * データベースの現在状態をデバッグ
 */
async function debugDatabaseState() {
  console.log('🔍 データベース状態のデバッグ');
  console.log('='.repeat(50));
  
  try {
    // 全商品を取得
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ データベースエラー:', error.message);
      return;
    }
    
    console.log(`📊 総商品数: ${products.length}件`);
    console.log('');
    
    // 各商品の詳細情報を表示
    products.forEach((product, index) => {
      console.log(`[${index + 1}] ${product.name}`);
      console.log(`  ID: ${product.id}`);
      console.log(`  カテゴリ: ${product.category}`);
      console.log(`  価格: ¥${product.price?.toLocaleString() || 'N/A'}`);
      console.log(`  画像URL: ${product.image_url}`);
      console.log(`  Amazon URL: ${product.amazon_url}`);
      console.log(`  作成日: ${product.created_at}`);
      console.log(`  更新日: ${product.updated_at}`);
      console.log('  ---');
    });
    
    // 特に五葉松商品を詳しくチェック
    const goyomatsu = products.find(p => p.name.includes('五葉松'));
    
    if (goyomatsu) {
      console.log('🌲 五葉松商品の詳細分析:');
      console.log(`  商品名: ${goyomatsu.name}`);
      console.log(`  画像URL: ${goyomatsu.image_url}`);
      console.log(`  URLタイプ: ${getImageUrlType(goyomatsu.image_url)}`);
      console.log(`  サイズカテゴリ: ${goyomatsu.size_category}`);
      console.log(`  タグ数: ${goyomatsu.tags?.length || 0}`);
      console.log(`  タグ: ${JSON.stringify(goyomatsu.tags)}`);
    } else {
      console.log('⚠️  五葉松商品が見つかりません');
    }
    
    // 画像URL統計
    console.log('\n📈 画像URL統計:');
    const urlTypes = {};
    products.forEach(p => {
      const type = getImageUrlType(p.image_url);
      urlTypes[type] = (urlTypes[type] || 0) + 1;
    });
    
    Object.entries(urlTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}件`);
    });
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err.message);
  }
}

function getImageUrlType(url) {
  if (!url) return 'なし';
  if (url.startsWith('/')) return 'ローカル静的ファイル';
  if (url.includes('amazon.com') || url.includes('media-amazon')) return 'Amazon直接';
  if (url.includes('unsplash.com')) return 'Unsplash';
  if (url.includes('placeholder.com')) return 'プレースホルダー';
  return 'その他外部';
}

// 実行
debugDatabaseState().catch(console.error);