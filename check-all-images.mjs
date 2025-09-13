// 全商品の画像URL状況確認
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllImages() {
  try {
    console.log('🔍 全商品の画像URL状況確認...\\n');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, image_url, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ エラー:', error.message);
      return;
    }

    console.log(`📊 総商品数: ${products?.length || 0}商品\\n`);

    // 画像URL別に分類
    const imageCategories = {
      unsplash: [],
      amazon: [],
      invalid: [],
      empty: []
    };

    products?.forEach(product => {
      const url = product.image_url || '';
      
      if (!url || url.trim() === '') {
        imageCategories.empty.push(product);
      } else if (url.includes('unsplash.com')) {
        imageCategories.unsplash.push(product);
      } else if (url.includes('amazon.com') || url.includes('media-amazon.com')) {
        imageCategories.amazon.push(product);
      } else {
        imageCategories.invalid.push(product);
      }
    });

    console.log('📊 画像URL分類結果:');
    console.log('==================');
    
    console.log(`\\n🖼️  Unsplash プレースホルダー: ${imageCategories.unsplash.length}商品`);
    imageCategories.unsplash.forEach(p => {
      console.log(`   ❌ ${p.name}`);
      console.log(`      URL: ${p.image_url}`);
    });

    console.log(`\\n📸 Amazon画像: ${imageCategories.amazon.length}商品`);
    imageCategories.amazon.forEach(p => {
      console.log(`   ✅ ${p.name}`);
      console.log(`      URL: ${p.image_url}`);
    });

    console.log(`\\n⚠️  無効URL: ${imageCategories.invalid.length}商品`);
    imageCategories.invalid.forEach(p => {
      console.log(`   ❌ ${p.name}`);
      console.log(`      URL: ${p.image_url}`);
    });

    console.log(`\\n❌ 空のURL: ${imageCategories.empty.length}商品`);
    imageCategories.empty.forEach(p => {
      console.log(`   ❌ ${p.name}`);
    });

    console.log('\\n🔧 問題の原因:');
    console.log('=============');
    console.log('fix-image-urls.mjs で28商品全てをUnsplashプレースホルダーに置き換え');
    console.log('→ 元々正常だったAmazon画像URLも上書きしてしまった');
    
    console.log('\\n💡 解決策:');
    console.log('========');
    console.log('1. 元のAmazon画像URLを持つ商品を特定');
    console.log('2. 正しいAmazon画像URLで復元');
    console.log('3. 今回追加した13商品は既に正しいURL設定済み');

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('🖼️  全商品画像URL確認');
console.log('====================');
checkAllImages();