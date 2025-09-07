// Add products from tabular data with auto-categorization
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 自動分類ロジック（既存のamazon.tsから移植）
function categorizeProduct(name, description = '') {
  const text = (name + ' ' + description).toLowerCase();
  
  // 雑木類（ぞうきるい）- もみじ、欅、ブナなど
  if (text.includes('もみじ') || text.includes('楓') || text.includes('メープル') || text.includes('欅') || 
      text.includes('けやき') || text.includes('ブナ') || text.includes('ぶな')) {
    return '雑木類';
  }
  
  // 花もの（はなもの）- 桜、梅、ツツジなど
  if (text.includes('梅') || text.includes('桜') || text.includes('つつじ') || text.includes('椿') || 
      text.includes('さくら') || text.includes('うめ') || text.includes('つばき') || text.includes('藤') || 
      text.includes('ふじ') || text.includes('花') || text.includes('開花') || text.includes('富士桜') || 
      text.includes('寒桜')) {
    return '花もの';
  }
  
  // 松柏類（しょうはくるい）- 松、真柏、杜松など
  if (text.includes('松') || text.includes('パイン') || text.includes('真柏') || text.includes('杜松') || 
      text.includes('しんぱく') || text.includes('五葉松') || text.includes('黒松')) {
    return '松柏類';
  }
  
  // 実もの（みもの）- 柿、南天、ピラカンサなど
  if (text.includes('柿') || text.includes('南天') || text.includes('ピラカンサ') || text.includes('実') || 
      text.includes('果実') || text.includes('ベリー')) {
    return '実もの';
  }
  
  // 草もの（くさもの）- 山野草、苔など
  if (text.includes('苔') || text.includes('山野草') || text.includes('草') || text.includes('多肉') || 
      text.includes('観葉')) {
    return '草もの';
  }
  
  return '雑木類'; // デフォルト
}

function determineSizeCategory(name, description = '') {
  const text = (name + ' ' + description).toLowerCase();
  
  if (text.includes('ミニ') || text.includes('極小') || text.includes('手のひら')) return 'mini';
  if (text.includes('小品') || text.includes('小さい') || text.includes('卓上')) return 'small';
  if (text.includes('大品') || text.includes('大型') || text.includes('特大')) return 'large';
  if (text.includes('中品') || text.includes('中型')) return 'medium';
  
  return 'small'; // デフォルト（小品）
}

function generateTags(name, description = '') {
  const tags = [];
  const text = (name + ' ' + description).toLowerCase();
  
  // レベル判定
  if (text.includes('初心者') || text.includes('ビギナー') || text.includes('入門')) tags.push('初心者向け');
  if (text.includes('上級') || text.includes('プロ') || text.includes('専門')) tags.push('上級者向け');
  
  // 環境判定
  if (text.includes('室内') || text.includes('屋内')) tags.push('室内栽培可能');
  if (text.includes('屋外') || text.includes('外')) tags.push('屋外栽培');
  
  // 特徴判定
  if (text.includes('セット') || text.includes('キット')) tags.push('セット商品');
  if (text.includes('ギフト') || text.includes('プレゼント')) tags.push('ギフト対応');
  if (text.includes('季節') || text.includes('春') || text.includes('秋')) tags.push('季節楽しめる');
  
  // 植物種別
  if (text.includes('もみじ')) tags.push('もみじ');
  if (text.includes('桜')) tags.push('桜');
  if (text.includes('富士桜')) tags.push('富士桜');
  if (text.includes('寒桜')) tags.push('寒桜');
  
  // 鉢の特徴
  if (text.includes('瀬戸焼')) tags.push('瀬戸焼');
  if (text.includes('三彩')) tags.push('三彩鉢');
  
  return tags.length > 0 ? tags : ['盆栽'];
}

function generateDescription(name, category, tags) {
  const descriptions = {
    '雑木類': `美しい${name}です。四季を通じて楽しめる落葉樹で、特に春の新緑と秋の紅葉が魅力的です。`,
    '花もの': `華やかな${name}です。美しい花を楽しめる盆栽で、季節の移ろいを感じることができます。`,
    '松柏類': `格調高い${name}です。一年を通じて美しい緑を保つ常緑樹で、盆栽の代表的な樹種です。`,
    '実もの': `可愛らしい実を楽しめる${name}です。季節によって実の色や形の変化を楽しめます。`,
    '草もの': `風情ある${name}です。手軽に楽しめる草本植物で、盆栽入門にもおすすめです。`
  };
  
  let desc = descriptions[category] || `美しい${name}です。`;
  
  if (tags.includes('初心者向け')) desc += ' 初心者の方でも育てやすく、盆栽を始めたい方におすすめです。';
  if (tags.includes('セット商品')) desc += ' 必要なものが揃ったセット商品で、すぐに盆栽を始められます。';
  if (tags.includes('ギフト対応')) desc += ' ギフトとしても喜ばれる商品です。';
  if (tags.includes('室内栽培可能')) desc += ' 室内でも育てられるので、オフィスやリビングでも楽しめます。';
  
  return desc;
}

async function addProductsBatch() {
  console.log('🌱 商品データの一括登録開始...\n');
  
  // 提供されたデータ
  const productsData = [
    {
      name: '遊恵盆栽：山もみじ(瀬戸焼三彩鉢)',
      price: 4580,
      amazon_url: 'https://amzn.to/4m48rYa',
      image_url: 'https://m.media-amazon.com/images/I/41lGU6HUBhL._AC_.jpg'
    },
    {
      name: '遊恵盆栽 桜盆栽：富士桜(信濃寒桜)',
      price: 4980,
      amazon_url: 'https://amzn.to/4niiPws',
      image_url: 'https://m.media-amazon.com/images/I/51eDaPuy61L._AC_.jpg'
    }
  ];
  
  console.log('📊 処理対象商品:');
  productsData.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} - ¥${product.price}`);
  });
  
  console.log('\n🤖 自動分析・登録中...\n');
  
  const results = [];
  
  for (let i = 0; i < productsData.length; i++) {
    const product = productsData[i];
    
    // 自動分析
    const category = categorizeProduct(product.name);
    const size_category = determineSizeCategory(product.name);
    const tags = generateTags(product.name);
    const description = generateDescription(product.name, category, tags);
    
    // 季節・置き場所の判定
    let season = 'all_season';
    let location = 'indoor';
    
    if (product.name.includes('もみじ')) season = 'autumn';
    if (product.name.includes('桜')) season = 'spring';
    if (product.name.includes('屋外')) location = 'outdoor';
    
    const productData = {
      name: product.name,
      description: description,
      price: product.price,
      category: category,
      tags: tags,
      size_category: size_category,
      image_url: product.image_url,
      amazon_url: product.amazon_url,
      season: season,
      location: location
    };
    
    console.log(`✅ ${i + 1}. ${product.name}`);
    console.log(`   カテゴリ: ${category}`);
    console.log(`   サイズ: ${size_category}`);
    console.log(`   タグ: ${tags.join(', ')}`);
    console.log(`   説明: ${description.substring(0, 80)}...`);
    console.log('');
    
    // データベースに挿入
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select();
    
    if (error) {
      console.error(`❌ ${product.name} 登録エラー:`, error.message);
    } else {
      console.log(`🎉 ${product.name} 登録完了 - ID: ${data[0].id}`);
      results.push(data[0]);
    }
  }
  
  console.log(`\n📈 登録結果: ${results.length}/${productsData.length}件が成功しました`);
  
  // 登録後の確認
  const { data: allProducts, error: fetchError } = await supabase
    .from('products')
    .select('name, category, price')
    .order('created_at', { ascending: false });
    
  if (!fetchError) {
    console.log('\n📋 現在の全商品:');
    console.log('=' .repeat(50));
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.category}) - ¥${product.price}`);
    });
    console.log(`\n総商品数: ${allProducts.length}件`);
  }
}

addProductsBatch();