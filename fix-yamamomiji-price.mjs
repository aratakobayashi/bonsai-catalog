import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 山もみじ盆栽の価格を修正
 */
async function fixYamamomijiPrice() {
  console.log('💴 山もみじ盆栽の価格修正');
  console.log('='.repeat(50));
  
  const correctPrice = 4820; // 正しい価格
  
  try {
    // 商品を検索
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('name', '山もみじの盆栽（藤久作手造り鉢）')
      .single();
    
    if (fetchError || !product) {
      console.log('❌ 商品が見つかりません:', fetchError?.message);
      return;
    }
    
    console.log('📦 現在の商品情報:');
    console.log(`  商品名: ${product.name}`);
    console.log(`  現在の価格: ¥${product.price?.toLocaleString()}`);
    console.log(`  正しい価格: ¥${correctPrice.toLocaleString()}`);
    
    // 価格を更新
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ 
        price: correctPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', product.id)
      .select();
    
    if (updateError) {
      console.log('❌ 更新エラー:', updateError.message);
      return;
    }
    
    console.log('✅ 価格修正完了！');
    console.log(`  新価格: ¥${updatedProduct[0].price.toLocaleString()}`);
    console.log(`  商品ID: ${product.id}`);
    console.log('');
    console.log('🌐 Vercelサイトで確認してください！');
    
  } catch (err) {
    console.error('❌ エラー:', err.message);
  }
}

// 実行
fixYamamomijiPrice().catch(console.error);