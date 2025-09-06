import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import https from 'https';
import path from 'path';

// Supabase設定
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Amazon商品URLのリスト
 * ここに追加したい商品のURLを貼り付けてください
 */
const AMAZON_PRODUCTS = [
  {
    url: 'https://www.amazon.co.jp/dp/商品ID1',
    name: '商品名',
    description: '商品説明',
    price: 0,
    category: '松類', // 松類/落葉樹/花木/針葉樹/鉢・受皿/道具・工具/用土・肥料
    size_category: 'small', // mini/small/medium/large/unknown
    imageUrl: '画像URL（後で取得）'
  },
  // ここに商品を追加
];

/**
 * 商品カテゴリを自動判定
 */
function categorizeProduct(name, description = '') {
  const text = (name + ' ' + description).toLowerCase();
  
  if (text.includes('松') || text.includes('パイン')) return '松類';
  if (text.includes('もみじ') || text.includes('楓')) return '落葉樹';
  if (text.includes('梅') || text.includes('桜') || text.includes('つつじ')) return '花木';
  if (text.includes('真柏') || text.includes('杉')) return '針葉樹';
  if (text.includes('鉢')) return '鉢・受皿';
  if (text.includes('ハサミ') || text.includes('道具')) return '道具・工具';
  if (text.includes('土') || text.includes('肥料')) return '用土・肥料';
  
  return '盆栽樹木';
}

/**
 * タグを自動生成
 */
function generateTags(name, description = '') {
  const tags = new Set();
  const text = (name + ' ' + description).toLowerCase();
  
  // レベル
  if (text.includes('初心者')) tags.add('初心者向け');
  if (text.includes('プロ') || text.includes('上級')) tags.add('上級者向け');
  
  // 特徴
  if (text.includes('花')) tags.add('花');
  if (text.includes('実')) tags.add('実');
  if (text.includes('紅葉')) tags.add('紅葉');
  if (text.includes('常緑')) tags.add('常緑');
  
  // サイズ
  if (text.includes('ミニ') || text.includes('小品')) tags.add('小品');
  if (text.includes('中品')) tags.add('中品');
  if (text.includes('大品')) tags.add('大品');
  
  // 用途
  if (text.includes('ギフト') || text.includes('プレゼント')) tags.add('贈答用');
  
  return Array.from(tags);
}

/**
 * アフィリエイトURLを生成
 */
function generateAffiliateUrl(amazonUrl) {
  try {
    const url = new URL(amazonUrl);
    url.searchParams.set('tag', 'oshikatsucoll-22');
    url.searchParams.set('linkCode', 'as2');
    url.searchParams.set('camp', '247');
    url.searchParams.set('creative', '1211');
    return url.toString();
  } catch {
    return amazonUrl;
  }
}

/**
 * 画像をダウンロード
 */
async function downloadImage(imageUrl, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join('public/products', filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(`/products/${filename}`);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

/**
 * バッチで商品を追加
 */
async function batchAddProducts() {
  console.log('🚀 商品バッチ登録開始');
  console.log('='.repeat(50));
  
  let successCount = 0;
  let failCount = 0;
  
  for (const product of AMAZON_PRODUCTS) {
    try {
      console.log(`\n📦 処理中: ${product.name}`);
      
      // 重複チェック
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('name', product.name)
        .single();
      
      if (existing) {
        console.log('⚠️  既に登録済み');
        continue;
      }
      
      // 画像処理（URLが提供されている場合）
      let localImageUrl = '/products/placeholder.jpg';
      if (product.imageUrl && product.imageUrl !== '画像URL（後で取得）') {
        try {
          const filename = `${product.name.replace(/[^a-zA-Z0-9]/g, '-')}.jpg`;
          localImageUrl = await downloadImage(product.imageUrl, filename);
          console.log('✅ 画像ダウンロード完了');
        } catch (err) {
          console.log('⚠️  画像ダウンロード失敗、プレースホルダー使用');
        }
      }
      
      // 商品データ準備
      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category || categorizeProduct(product.name, product.description),
        tags: generateTags(product.name, product.description),
        size_category: product.size_category || 'medium',
        image_url: localImageUrl,
        amazon_url: generateAffiliateUrl(product.url)
      };
      
      // データベースに登録
      const { error } = await supabase
        .from('products')
        .insert([productData]);
      
      if (error) {
        console.log('❌ 登録失敗:', error.message);
        failCount++;
      } else {
        console.log('✅ 登録成功');
        successCount++;
      }
      
    } catch (err) {
      console.error('❌ エラー:', err.message);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 登録結果:');
  console.log(`✅ 成功: ${successCount}件`);
  console.log(`❌ 失敗: ${failCount}件`);
  console.log(`📦 合計: ${AMAZON_PRODUCTS.length}件`);
}

// 実行
batchAddProducts().catch(console.error);