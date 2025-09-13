// 過去スクリプトから正しい画像URLを復元
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 過去スクリプトから抽出した正しい画像URLマッピング
const originalImageMappings = [
  // add-5-new-products.mjs から
  {
    name: '桜・藤寄せ植え*陶器鉢',
    image_url: 'https://m.media-amazon.com/images/I/51no1+I6w2L._AC_.jpg'
  },
  {
    name: '桜盆栽：一才桜(瀬戸焼白輪花鉢)',
    image_url: 'https://m.media-amazon.com/images/I/51J+u4Lk41L._AC_.jpg'
  },
  {
    name: 'モダン松竹梅',
    image_url: 'https://m.media-amazon.com/images/I/81lDaxC1NML._AC_SX679_.jpg'
  },
  {
    name: '四国五葉松 ミニ盆栽 鉢植え',
    image_url: 'https://m.media-amazon.com/images/I/71CzZJIjfLL._AC_SY879_.jpg'
  },
  {
    name: 'ミニ盆栽：糸魚川真柏（曲・5年生）萬古焼泥物丸小鉢',
    image_url: 'https://m.media-amazon.com/images/I/51Ait8xcR4L._AC_.jpg'
  },
  
  // add-new-batch-products.mjs から推定
  {
    name: '遊恵盆栽：特選清姫もみじ(瀬戸焼青鉢)',
    image_url: 'https://m.media-amazon.com/images/I/51MbBfSVpHL._AC_.jpg'
  },
  {
    name: 'ミニ盆栽：三河黒松（瀬戸焼)',
    image_url: 'https://m.media-amazon.com/images/I/515gQ4OEJQL._AC_.jpg'
  },
  {
    name: '遊恵盆栽 ミニ盆栽：長寿梅(瀬戸焼三彩鉢)',
    image_url: 'https://m.media-amazon.com/images/I/61-loxrp0sL._AC_.jpg'
  },
  {
    name: '盆栽妙 はじめてでも育てやすい五葉松 丸小鉢',
    image_url: 'https://m.media-amazon.com/images/I/71x66VfHKHL._AC_SX679_.jpg'
  },
  {
    name: '盆栽妙 ミニ長寿梅 久庵手作りつぼ鉢',
    image_url: 'https://m.media-amazon.com/images/I/71tgtk9Ni9L._AC_SX679_.jpg'
  },
  {
    name: '藤盆栽ギフト 鉢花 藤盆栽',
    image_url: 'https://m.media-amazon.com/images/I/51Cj1lPmrdL._AC_.jpg'
  },
  {
    name: '枝ぶりの良い五葉松の盆栽',
    image_url: 'https://m.media-amazon.com/images/I/61nyA2CsadL._AC_SY879_.jpg'
  },
  {
    name: '桜・五葉松寄せ植え(青長角縁付鉢)鉢植え',
    image_url: 'https://m.media-amazon.com/images/I/519-ay-9lCL._AC_.jpg'
  },
  
  // add-products-batch.mjs から推定
  {
    name: '遊恵盆栽：山もみじ(瀬戸焼三彩鉢)',
    image_url: 'https://m.media-amazon.com/images/I/41lGU6HUBhL._AC_.jpg'
  },
  {
    name: '遊恵盆栽 桜盆栽：富士桜(信濃寒桜)',
    image_url: 'https://m.media-amazon.com/images/I/51eDaPuy61L._AC_.jpg'
  }
];

async function restoreOriginalImages() {
  try {
    console.log('🔄 過去データから画像URL復元開始...\\n');
    
    console.log(`📦 復元対象: ${originalImageMappings.length}商品\\n`);
    
    let successCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    for (const mapping of originalImageMappings) {
      try {
        console.log(`🖼️  復元中: ${mapping.name}`);
        console.log(`   画像URL: ${mapping.image_url}`);

        // 商品を名前で検索
        const { data: products, error: searchError } = await supabase
          .from('products')
          .select('id, name')
          .eq('name', mapping.name);

        if (searchError) {
          console.error(`   ❌ 検索エラー: ${searchError.message}`);
          errorCount++;
          continue;
        }

        if (!products || products.length === 0) {
          console.log(`   ⚠️  商品が見つかりません`);
          notFoundCount++;
          continue;
        }

        // 画像URLを更新
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: mapping.image_url })
          .eq('id', products[0].id);

        if (updateError) {
          console.error(`   ❌ 更新エラー: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ 復元成功`);
          successCount++;
        }
        console.log('');

      } catch (productError) {
        console.error(`❌ ${mapping.name} 処理エラー:`, productError.message);
        errorCount++;
      }
    }

    console.log('🎉 画像URL復元完了！');
    console.log('==================');
    console.log(`✅ 復元成功: ${successCount}商品`);
    console.log(`⚠️  見つからず: ${notFoundCount}商品`);
    console.log(`❌ 復元失敗: ${errorCount}商品`);

    // 復元後の状況確認
    console.log('\\n📊 復元後の画像URL状況:');
    const { data: allProducts } = await supabase
      .from('products')
      .select('name, image_url')
      .order('created_at');

    const imageStats = {
      amazon: 0,
      unsplash: 0,
      invalid: 0
    };

    allProducts?.forEach(product => {
      const url = product.image_url || '';
      if (url.includes('amazon.com') || url.includes('media-amazon.com')) {
        imageStats.amazon++;
      } else if (url.includes('unsplash.com')) {
        imageStats.unsplash++;
      } else {
        imageStats.invalid++;
      }
    });

    console.log(`   ✅ Amazon画像: ${imageStats.amazon}商品`);
    console.log(`   🖼️  Unsplash画像: ${imageStats.unsplash}商品`);
    console.log(`   ❌ 無効画像: ${imageStats.invalid}商品`);

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('🔄 画像URL復元 - 過去データから');
console.log('==============================');
restoreOriginalImages();