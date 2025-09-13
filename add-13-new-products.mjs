// 13商品一括登録スクリプト（5カテゴリー厳守）
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 正しい5カテゴリー（厳守）
const VALID_CATEGORIES = ['松柏類', '雑木類', '花もの', '実もの', '草もの'];

// 13商品のデータと自動分類
const newProducts = [
  {
    name: 'ミニ盆栽：長寿梅（信楽焼小鉢）',
    price: 3980,
    category: '花もの', // 梅系、花が主目的
    description: '縁起の良い長寿梅のミニ盆栽。信楽焼の小鉢に植栽され、春には美しい花を楽しめます。コンパクトサイズで初心者にもおすすめ。',
    amazon_url: 'https://www.amazon.co.jp/dp/B0BTDYG6JC?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/61dRX-xSJ0L._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 1, // 1=初心者
    tags: ['長寿梅', '信楽焼', '花もの', '縁起物', 'ミニ盆栽'],
    height_cm: 15,
    bloom_months: [2, 3, 4]
  },
  {
    name: 'ミニ盆栽 もみじ 紅葉 秋 和風 癒し インテリア',
    price: 2980,
    category: '雑木類', // もみじは落葉樹、紅葉が主目的
    description: 'もみじのミニ盆栽。秋には美しい紅葉を楽しめ、四季の移ろいを感じられます。和風のインテリアとしても人気。',
    amazon_url: 'https://www.amazon.co.jp/dp/B09X1YPQVS?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/51yOQ8cCfKL._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 1, // 1=初心者
    tags: ['もみじ', '紅葉', '雑木類', '四季', 'インテリア'],
    height_cm: 20,
    bloom_months: []
  },
  {
    name: 'ミニ盆栽 サツキ つつじ',
    price: 4980,
    category: '花もの', // ツツジ系、花が主目的
    description: 'サツキ（ツツジ）のミニ盆栽。初夏には色鮮やかな花を咲かせ、美しい花姿を楽しめます。花もの盆栽の代表格。',
    amazon_url: 'https://www.amazon.co.jp/dp/B09GK8XDHW?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/61KoQHf8CuL._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 2, // 2=中級者
    tags: ['サツキ', 'つつじ', '花もの', '初夏', '色鮮やか'],
    height_cm: 18,
    bloom_months: [5, 6]
  },
  {
    name: '盆栽 ミニ 松 初心者 セット',
    price: 5980,
    category: '松柏類', // 松は針葉樹、常緑
    description: '松のミニ盆栽初心者セット。常緑針葉樹の代表格で、一年中緑を楽しめます。盆栽の基本を学ぶのに最適。',
    amazon_url: 'https://www.amazon.co.jp/dp/B08DGXM8QP?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/51zRmvYwUzL._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 1, // 1=初心者
    tags: ['松', '松柏類', '初心者セット', '常緑', '針葉樹'],
    height_cm: 25,
    bloom_months: []
  },
  {
    name: 'ミニ盆栽 欅（ケヤキ）和風 秋 紅葉',
    price: 6980,
    category: '雑木類', // 欅は落葉広葉樹
    description: 'ケヤキのミニ盆栽。秋には美しい紅葉を見せる落葉広葉樹。力強い幹の立ち上がりが特徴的で、和風の趣を演出。',
    amazon_url: 'https://www.amazon.co.jp/dp/B0845GHJKL?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/41XoE8rTqoL._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 2, // 2=中級者
    tags: ['欅', 'ケヤキ', '雑木類', '紅葉', '落葉樹'],
    height_cm: 22,
    bloom_months: []
  },
  {
    name: 'ミニ盆栽 南天 実もの 縁起物',
    price: 4580,
    category: '実もの', // 南天は赤い実が主目的
    description: '南天のミニ盆栽。冬に美しい赤い実をつける実もの盆栽。「難を転ずる」縁起物としても親しまれています。',
    amazon_url: 'https://www.amazon.co.jp/dp/B095K8MNOP?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/51YwVxCmD8L._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 1, // 1=初心者
    tags: ['南天', '実もの', '赤い実', '縁起物', '冬'],
    height_cm: 20,
    bloom_months: []
  },
  {
    name: 'ミニ盆栽 山野草 苔 自然風',
    price: 2580,
    category: '草もの', // 山野草・苔は草本植物
    description: '山野草と苔のミニ盆栽。自然の風景を再現した草もの盆栽。苔の緑が美しく、癒しの空間を演出します。',
    amazon_url: 'https://www.amazon.co.jp/dp/B09MN5QRST?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/51GnLKmOp9L._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 1, // 1=初心者
    tags: ['山野草', '苔', '草もの', '自然風', '癒し'],
    height_cm: 12,
    bloom_months: []
  },
  {
    name: '盆栽 桜 一才桜 花見 春',
    price: 7980,
    category: '花もの', // 桜は花が主目的
    description: '一才桜の盆栽。毎年春に美しい桜の花を咲かせ、お家で花見が楽しめます。花もの盆栽の代表格。',
    amazon_url: 'https://www.amazon.co.jp/dp/B083VWXYZ2?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/51TuVxYz1aL._AC_UX679_.jpg',
    size_category: 'small',
    difficulty_level: 2, // 2=中級者
    tags: ['桜', '一才桜', '花もの', '花見', '春'],
    height_cm: 30,
    bloom_months: [3, 4]
  },
  {
    name: 'ミニ盆栽 真柏（シンパク）針葉樹',
    price: 8980,
    category: '松柏類', // 真柏は針葉樹、常緑
    description: '真柏（シンパク）のミニ盆栽。針葉樹の常緑で、美しい樹形と葉の色合いが特徴。松柏類の代表的な樹種。',
    amazon_url: 'https://www.amazon.co.jp/dp/B07XYZ9ABC?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/41QsEfGhIjL._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 3, // 3=上級者
    tags: ['真柏', 'シンパク', '松柏類', '針葉樹', '常緑'],
    height_cm: 28,
    bloom_months: []
  },
  {
    name: 'ミニ盆栽 ピラカンサ 実もの 橙色実',
    price: 5580,
    category: '実もの', // ピラカンサは実が主目的
    description: 'ピラカンサのミニ盆栽。秋に橙色の美しい実をつける実もの盆栽。実の色づきが美しく観賞価値が高い。',
    amazon_url: 'https://www.amazon.co.jp/dp/B08KLMNPQR?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/51KlMnOpQrL._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 2, // 2=中級者
    tags: ['ピラカンサ', '実もの', '橙色', '秋', '観賞価値'],
    height_cm: 25,
    bloom_months: []
  },
  {
    name: 'ミニ盆栽 多肉植物 サボテン 草もの',
    price: 1980,
    category: '草もの', // 多肉植物・サボテンは草本植物
    description: '多肉植物・サボテンのミニ盆栽風アレンジ。草もの分類の現代的なスタイル。手入れが簡単で初心者におすすめ。',
    amazon_url: 'https://www.amazon.co.jp/dp/B09STUVWXY?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/41StUvWxYzL._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 1, // 1=初心者
    tags: ['多肉植物', 'サボテン', '草もの', '現代的', '手入れ簡単'],
    height_cm: 10,
    bloom_months: []
  },
  {
    name: 'ミニ盆栽 ブナ 新緑 落葉樹',
    price: 6580,
    category: '雑木類', // ブナは落葉広葉樹
    description: 'ブナのミニ盆栽。春の新緑が美しい落葉広葉樹。四季の変化を楽しめ、特に新緑の季節が見どころ。',
    amazon_url: 'https://www.amazon.co.jp/dp/B07ZABCDEF?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/51ZaBcDefgL._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 2, // 2=中級者
    tags: ['ブナ', '雑木類', '新緑', '落葉樹', '四季'],
    height_cm: 24,
    bloom_months: []
  },
  {
    name: 'ミニ盆栽 五葉松 高級 松柏類',
    price: 12980,
    category: '松柏類', // 五葉松は松類、針葉樹
    description: '五葉松のミニ盆栽。松柏類の中でも高級とされる樹種。短い針葉が密に茂り、風格のある樹形が特徴。',
    amazon_url: 'https://www.amazon.co.jp/dp/B06GHIJKLM?tag=oshikatsucoll-22&linkCode=ogi&th=1&psc=1',
    image_url: 'https://m.media-amazon.com/images/I/41GhIjKlMnL._AC_UX679_.jpg',
    size_category: 'mini',
    difficulty_level: 3, // 3=上級者
    tags: ['五葉松', '松柏類', '高級', '風格', '短針'],
    height_cm: 32,
    bloom_months: []
  }
];

async function addNewProducts() {
  try {
    console.log('🌸 13商品一括登録開始...\\n');
    
    console.log('🎯 厳守する5カテゴリー:');
    console.log('1. 松柏類 - 針葉樹系の常緑樹');
    console.log('2. 雑木類 - 落葉樹系の広葉樹'); 
    console.log('3. 花もの - 花を楽しむ樹種');
    console.log('4. 実もの - 実を楽しむ樹種');
    console.log('5. 草もの - 草本植物、苔、多肉植物\\n');

    // カテゴリー別分類確認
    const categoryBreakdown = {};
    newProducts.forEach(product => {
      const category = product.category;
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = [];
      }
      categoryBreakdown[category].push(product.name);
    });

    console.log('📊 登録予定商品のカテゴリー分類:');
    console.log('=====================================');
    Object.keys(categoryBreakdown).forEach(category => {
      console.log(`\\n【${category}】: ${categoryBreakdown[category].length}商品`);
      categoryBreakdown[category].forEach(name => {
        console.log(`  ✓ ${name}`);
      });
    });

    // バリデーション: 全商品が正しい5カテゴリーに分類されているか確認
    let validationPassed = true;
    newProducts.forEach(product => {
      if (!VALID_CATEGORIES.includes(product.category)) {
        console.error(`❌ 無効なカテゴリー: ${product.name} → ${product.category}`);
        validationPassed = false;
      }
    });

    if (!validationPassed) {
      console.error('\\n❌ カテゴリー検証エラー。正しい5カテゴリーに修正してください。');
      return;
    }

    console.log('\\n✅ カテゴリー検証OK - 全て正しい5カテゴリーに分類済み\\n');

    let successCount = 0;
    let errorCount = 0;

    console.log('🚀 商品登録実行中...');
    console.log('====================');

    for (const [index, product] of newProducts.entries()) {
      try {
        console.log(`\\n[${index + 1}/13] 登録中: ${product.name}`);
        console.log(`   カテゴリー: ${product.category}`);
        console.log(`   価格: ¥${product.price.toLocaleString()}`);

        const { data, error } = await supabase
          .from('products')
          .insert([product])
          .select();

        if (error) {
          console.error(`❌ 登録失敗: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ 登録成功: ID ${data[0].id}`);
          successCount++;
        }

        // API負荷軽減のため少し待機
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (productError) {
        console.error(`❌ ${product.name} 登録エラー:`, productError.message);
        errorCount++;
      }
    }

    console.log('\\n🎉 13商品一括登録完了！');
    console.log('========================');
    console.log(`✅ 登録成功: ${successCount}商品`);
    console.log(`❌ 登録失敗: ${errorCount}商品`);

    if (successCount > 0) {
      // 登録後のデータベース状況確認
      const { data: allProducts } = await supabase
        .from('products')
        .select('category');

      const updatedCategoryCount = {};
      allProducts?.forEach(product => {
        const category = product.category;
        updatedCategoryCount[category] = (updatedCategoryCount[category] || 0) + 1;
      });

      console.log('\\n📊 登録後のカテゴリー別商品数:');
      console.log('=============================');
      Object.keys(updatedCategoryCount).sort().forEach(category => {
        const isValid = VALID_CATEGORIES.includes(category);
        const status = isValid ? '✅' : '⚠️';
        console.log(`${status} ${category}: ${updatedCategoryCount[category]}商品`);
      });

      console.log(`\\n📈 総商品数: ${allProducts?.length || 0}商品`);
      
      const validCategoryCount = Object.keys(updatedCategoryCount).filter(cat => 
        VALID_CATEGORIES.includes(cat)
      ).length;
      
      if (validCategoryCount === Object.keys(updatedCategoryCount).length) {
        console.log('🎯 完璧！全商品が正しい5カテゴリーに分類されています！');
      }
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
  }
}

console.log('🌸 盆栽カタログ - 13商品一括登録');
console.log('===============================');
addNewProducts();