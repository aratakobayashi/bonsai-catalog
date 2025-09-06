import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * アフィリエイトトラッキングの確認
 */
async function verifyAffiliateTracking() {
  console.log('🔍 アフィリエイトトラッキング確認');
  console.log('='.repeat(50));
  
  try {
    // 五葉松商品を取得
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('name', '五葉松 小品盆栽（瀬戸焼鉢）')
      .single();
    
    if (!product) {
      console.log('❌ 五葉松商品が見つかりません');
      return;
    }
    
    console.log('📦 商品情報:');
    console.log(`  商品名: ${product.name}`);
    console.log(`  Amazon URL: ${product.amazon_url}`);
    console.log('');
    
    // URLからパラメータを解析
    const url = new URL(product.amazon_url);
    const params = url.searchParams;
    
    console.log('🔗 アフィリエイトパラメータ:');
    console.log(`  tag: ${params.get('tag') || '❌ なし'}`);
    console.log(`  linkCode: ${params.get('linkCode') || '❌ なし'}`);
    console.log(`  camp: ${params.get('camp') || '❌ なし'}`);
    console.log(`  creative: ${params.get('creative') || '❌ なし'}`);
    console.log('');
    
    // トラッキングが正しく設定されているか判定
    const hasTag = params.get('tag') === 'oshikatsucoll-22';
    const hasLinkCode = params.get('linkCode') === 'as2';
    
    if (hasTag && hasLinkCode) {
      console.log('✅ アフィリエイトトラッキングは正しく設定されています！');
      console.log('');
      console.log('📊 クリック計測の確認方法:');
      console.log('1. Amazon Associateダッシュボードにログイン');
      console.log('2. レポート → サマリーレポート');
      console.log('3. "クリック数" の欄を確認');
      console.log('   （反映まで最大24時間かかる場合があります）');
      console.log('');
      console.log('💡 即座に確認する方法:');
      console.log('1. ブラウザのシークレット/プライベートモードで商品ページを開く');
      console.log('2. "Amazonで購入"ボタンをクリック');
      console.log('3. Amazonページで URL を確認');
      console.log('4. URLに "tag=oshikatsucoll-22" が含まれていればOK');
    } else {
      console.log('❌ アフィリエイトトラッキングに問題があります');
      if (!hasTag) console.log('  - Associate IDが設定されていません');
      if (!hasLinkCode) console.log('  - linkCodeが設定されていません');
    }
    
    console.log('');
    console.log('🎯 テスト用URL（ブラウザで開いて確認）:');
    console.log(product.amazon_url);
    
  } catch (err) {
    console.error('❌ エラー:', err.message);
  }
}

// 実行
verifyAffiliateTracking().catch(console.error);