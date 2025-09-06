import { createClient } from '@supabase/supabase-js';

// RLSポリシー回避のため、可能なアプローチを試す
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

// 複数のアプローチを試すための設定
const approaches = [
  {
    name: 'Standard Anon Client',
    client: createClient(supabaseUrl, supabaseAnonKey)
  },
  // 他のアプローチも必要に応じて追加可能
];

/**
 * 五葉松商品データ
 */
const goyomatsuProduct = {
  name: '五葉松 小品盆栽（瀬戸焼鉢）',
  description: '格調高い五葉松の小品盆栽。瀬戸焼の上品な小鉢に植えられており、受け皿も付属しています。初心者にも育てやすく、贈り物としても人気です。室内での栽培も可能で、年間を通して美しい針葉を楽しめます。',
  price: 3980,
  category: '松類',
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
  size_category: 'small',
  image_url: 'https://images.unsplash.com/photo-1516253593875-bd7f052ab1b5?w=400',
  amazon_url: 'https://www.amazon.co.jp/%E5%B0%8F%E5%93%81%E7%9B%86%E6%A0%BD%EF%BC%9A%E4%BA%94%E8%91%89%E6%9D%BE-%E7%80%AC%E6%88%B8%E7%84%BC%E5%B0%8F%E9%89%A2-%E5%8F%97%E3%81%91%E7%9A%BF%E4%BB%98%E3%81%8D-%E9%89%A2%E6%A4%8D%E3%81%88%E7%A5%9D%E3%81%84-%E3%83%97%E3%83%AC%E3%82%BC%E3%83%B3%E3%83%88%E3%81%AB%E3%82%82bonsai/dp/B00D9IOKXI?tag=oshikatsucoll-22&linkCode=as2&camp=247&creative=1211'
};

async function autoRegisterProduct() {
  console.log('🚀 自動商品登録システム起動');
  console.log('='.repeat(50));
  
  for (const approach of approaches) {
    console.log(`\\n📝 ${approach.name} でのテスト...`);
    
    try {
      // 1. データベース接続確認
      const { data: testData, error: testError } = await approach.client
        .from('products')
        .select('count')
        .single();
      
      if (testError) {
        console.log(`❌ 接続エラー: ${testError.message}`);
        continue;
      }
      
      console.log('✅ データベース接続成功');
      
      // 2. 重複チェック
      const { data: existing } = await approach.client
        .from('products')
        .select('id, name')
        .eq('name', goyomatsuProduct.name)
        .single();
      
      if (existing) {
        console.log('⚠️  商品は既に登録済みです:', existing.name);
        console.log('🔄 既存商品を更新しますか？');
        
        // 既存商品の更新を試行
        const { data: updateData, error: updateError } = await approach.client
          .from('products')
          .update(goyomatsuProduct)
          .eq('id', existing.id)
          .select();
        
        if (updateError) {
          console.log(`❌ 更新エラー: ${updateError.message}`);
        } else {
          console.log('✅ 商品情報を更新しました！');
          return { success: true, method: 'update', data: updateData };
        }
      } else {
        // 3. 新規登録を試行
        console.log('💾 新規商品登録を試行...');
        
        const { data: insertData, error: insertError } = await approach.client
          .from('products')
          .insert([goyomatsuProduct])
          .select();
        
        if (insertError) {
          console.log(`❌ 登録エラー: ${insertError.message}`);
          
          // エラーの詳細分析
          if (insertError.message.includes('row-level security')) {
            console.log('💡 RLSポリシーによる制限');
          } else if (insertError.message.includes('permission')) {
            console.log('💡 権限不足の問題');
          } else {
            console.log('💡 その他のデータベースエラー');
          }
        } else {
          console.log('🎉 新規商品登録成功！');
          console.log('新商品ID:', insertData[0].id);
          return { success: true, method: 'insert', data: insertData };
        }
      }
      
    } catch (err) {
      console.log(`❌ 予期しないエラー (${approach.name}):`, err.message);
    }
  }
  
  // 全てのアプローチが失敗した場合の代替案
  console.log('\\n🔧 代替登録方法:');
  console.log('1. Supabaseダッシュボードでの手動登録');
  console.log('2. RLSポリシーの一時無効化');
  console.log('3. サービスロールキーの使用');
  
  // SQLクエリも出力
  console.log('\\n📝 手動登録用SQLクエリ:');
  console.log(`INSERT INTO products (name, description, price, category, tags, size_category, image_url, amazon_url) VALUES (
    '${goyomatsuProduct.name}',
    '${goyomatsuProduct.description}',
    ${goyomatsuProduct.price},
    '${goyomatsuProduct.category}',
    '${JSON.stringify(goyomatsuProduct.tags)}',
    '${goyomatsuProduct.size_category}',
    '${goyomatsuProduct.image_url}',
    '${goyomatsuProduct.amazon_url}'
  );`);
  
  return { success: false, reason: 'RLS_POLICY_RESTRICTION' };
}

// 実行
autoRegisterProduct()
  .then(result => {
    if (result.success) {
      console.log('\\n🎉 自動登録完了！');
      console.log('次のステップ: フロントエンドでの確認');
    } else {
      console.log('\\n⚠️  自動登録は制限されています');
      console.log('手動での対応が必要です');
    }
  })
  .catch(console.error);