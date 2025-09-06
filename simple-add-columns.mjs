import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 既存の商品データにseasonとlocationを追加してテスト
 */
async function testAddSeasonLocation() {
  console.log('🧪 season・location カラムのテスト');
  console.log('='.repeat(50));
  
  try {
    // まず既存の商品データを確認
    console.log('📦 既存商品データ確認中...');
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .limit(3);

    if (fetchError) {
      console.log('❌ 商品データ取得エラー:', fetchError.message);
      return;
    }

    console.log(`✅ 商品データ取得完了: ${products?.length}件`);
    
    if (products && products.length > 0) {
      console.log('\n📋 サンプル商品:');
      products.forEach(p => {
        console.log(`  - ${p.name}`);
        console.log(`    カテゴリ: ${p.category}`);
        console.log(`    タグ: ${p.tags?.join(', ') || 'なし'}`);
        console.log(`    説明: ${p.description?.substring(0, 50)}...`);
        console.log('');
      });

      // 試しに最初の商品にseasonとlocationを追加してみる
      console.log('🔧 テスト: season・locationカラム追加...');
      const testProduct = products[0];
      
      const { data: updateResult, error: updateError } = await supabase
        .from('products')
        .update({ 
          season: 'autumn',  // 秋
          location: 'outdoor'  // 屋外
        })
        .eq('id', testProduct.id)
        .select();

      if (updateError) {
        console.log('❌ カラムが存在しないため更新失敗:', updateError.message);
        console.log('💡 Supabaseダッシュボードで手動でカラムを追加する必要があります');
        
        console.log('\n📝 【Supabaseダッシュボードでの手順】');
        console.log('1. https://supabase.com/dashboard に移動');
        console.log('2. プロジェクトを選択');
        console.log('3. Table Editor > products テーブルを選択');
        console.log('4. "+ Add column" をクリック');
        console.log('5. カラム追加:');
        console.log('   - Name: season, Type: text, Default value: NULL');
        console.log('   - Name: location, Type: text, Default value: NULL');
        console.log('6. "Save" をクリック');
        
      } else {
        console.log('✅ season・location更新成功!', updateResult);
      }
    }

  } catch (err) {
    console.error('❌ エラー:', err.message);
  }
}

// 実行
testAddSeasonLocation().catch(console.error);