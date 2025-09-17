import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// 22商品のデータ
const products = [
  {
    name: '五葉松盆栽',
    price: 7980,
    category: '松柏類',
    description: '格調高い五葉松の本格盆栽。美しい樹形と繊細な針葉が特徴的で、初心者から上級者まで楽しめる人気の樹種です。',
    amazon_url: 'https://amzn.to/47Mtr25',
    image_url: 'https://m.media-amazon.com/images/I/41xHFoHUnoL._AC_.jpg',
    size_category: 'medium',
    difficulty_level: 2,
    tags: ['五葉松', '松柏類', '常緑樹', '人気'],
    height_cm: 25
  },
  {
    name: '盆栽素材 黒松ミニ 曲あり',
    price: 1573,
    category: '松柏類',
    description: '黒松の盆栽素材。曲がりのある幹が特徴的で、これから育てる楽しみがある素材盆栽です。初心者の練習にも最適。',
    amazon_url: 'https://amzn.to/3VTLTP4',
    image_url: 'https://m.media-amazon.com/images/I/31-Y6ykvRjL._AC_.jpg',
    size_category: 'mini',
    difficulty_level: 1,
    tags: ['黒松', '素材', 'ミニ盆栽', '初心者向け'],
    height_cm: 15
  },
  {
    name: 'さくら盆栽 (富士しだれ桜)',
    price: 7980,
    category: '花もの',
    description: '富士しだれ桜の美しい盆栽。春には優美な枝垂れ桜を楽しめ、四季の変化を感じられる逸品です。',
    amazon_url: 'https://amzn.to/47Iw7xP',
    image_url: 'https://m.media-amazon.com/images/I/71p4uqBx4eL._AC_SY879_.jpg',
    size_category: 'small',
    difficulty_level: 2,
    tags: ['桜', 'しだれ桜', '花もの', '春', '富士桜'],
    height_cm: 30,
    bloom_months: [3, 4]
  },
  {
    name: '桜盆栽',
    price: 5900,
    category: '花もの',
    description: '日本の春を代表する桜の盆栽。毎年美しい花を咲かせ、室内でも花見が楽しめます。',
    amazon_url: 'https://amzn.to/3VYNG5n',
    image_url: 'https://m.media-amazon.com/images/I/51hvgZ-X17L._AC_.jpg',
    size_category: 'small',
    difficulty_level: 2,
    tags: ['桜', '花もの', '春', '人気'],
    height_cm: 25,
    bloom_months: [3, 4]
  },
  {
    name: 'ソメイヨシノ盆栽 染井吉野桜',
    price: 5980,
    category: '花もの',
    description: '日本を代表する桜・ソメイヨシノの盆栽。淡いピンクの花が美しく、春の訪れを告げる風情ある一品。',
    amazon_url: 'https://amzn.to/3Vm4ByO',
    image_url: 'https://m.media-amazon.com/images/I/51cv1seDhSL._AC_.jpg',
    size_category: 'small',
    difficulty_level: 2,
    tags: ['ソメイヨシノ', '染井吉野', '桜', '花もの', '春'],
    height_cm: 25,
    bloom_months: [3, 4]
  },
  {
    name: 'こぼんさい 八重しだれ桜',
    price: 6980,
    category: '花もの',
    description: '八重咲きのしだれ桜盆栽。豪華な八重の花と優美な枝垂れが特徴的な小品盆栽です。',
    amazon_url: 'https://amzn.to/3IqprtS',
    image_url: 'https://m.media-amazon.com/images/I/51uO+z81qdL._AC_.jpg',
    size_category: 'small',
    difficulty_level: 2,
    tags: ['八重桜', 'しだれ桜', '花もの', '小品盆栽'],
    height_cm: 20,
    bloom_months: [3, 4]
  },
  {
    name: 'サルスベリ 百日紅',
    price: 5480,
    category: '花もの',
    description: '百日紅（サルスベリ）の盆栽。夏から秋にかけて長期間花を楽しめる、鮮やかな花色が魅力的な樹種。',
    amazon_url: 'https://amzn.to/3VRbesT',
    image_url: 'https://m.media-amazon.com/images/I/71VeM35xZyL._AC_SX679_.jpg',
    size_category: 'small',
    difficulty_level: 1,
    tags: ['サルスベリ', '百日紅', '花もの', '夏', '長期開花'],
    height_cm: 25,
    bloom_months: [7, 8, 9, 10]
  },
  {
    name: '藤盆栽',
    price: 6980,
    category: '花もの',
    description: '優雅な藤の花を楽しめる盆栽。垂れ下がる花房が美しく、日本の風情を感じさせます。',
    amazon_url: 'https://amzn.to/4mgxZ4j',
    image_url: 'https://m.media-amazon.com/images/I/51ZgrTktJnL._AC_.jpg',
    size_category: 'small',
    difficulty_level: 2,
    tags: ['藤', '花もの', '春', '垂れ花'],
    height_cm: 30,
    bloom_months: [4, 5]
  },
  {
    name: 'かわいい南国風な松盆栽',
    price: 3980,
    category: '松柏類',
    description: '南国風のユニークな樹形の松盆栽。個性的でモダンなインテリアにも映える現代的な盆栽です。',
    amazon_url: 'https://amzn.to/46kVrre',
    image_url: 'https://m.media-amazon.com/images/I/41CO1OTl3FL._AC_.jpg',
    size_category: 'small',
    difficulty_level: 1,
    tags: ['松', '南国風', 'モダン', 'インテリア'],
    height_cm: 20
  },
  {
    name: '吾妻五葉松【大巓性】',
    price: 8850,
    category: '松柏類',
    description: '吾妻五葉松の大巓性品種。葉が短く密で、コンパクトな樹形が特徴的な高級盆栽素材。',
    amazon_url: 'https://amzn.to/46jdyhi',
    image_url: 'https://m.media-amazon.com/images/I/81fG8QNjnTL._AC_SX679_.jpg',
    size_category: 'medium',
    difficulty_level: 3,
    tags: ['五葉松', '吾妻', '大巓性', '高級', '松柏類'],
    height_cm: 30
  },
  {
    name: '根上りの黒松',
    price: 21800,
    category: '松柏類',
    description: '根上り仕立ての黒松盆栽。露出した根が力強さを表現し、風格ある姿が魅力的な上級者向け作品。',
    amazon_url: 'https://amzn.to/48iOVUq',
    image_url: 'https://m.media-amazon.com/images/I/41YdtPOqMoL._AC_.jpg',
    size_category: 'medium',
    difficulty_level: 3,
    tags: ['黒松', '根上り', '高級', '上級者向け'],
    height_cm: 35
  },
  {
    name: '南天のミニ盆栽 くらま岩器風長方鉢',
    price: 3960,
    category: '実もの',
    description: '南天のミニ盆栽。縁起の良い赤い実をつけ、くらま岩器風の鉢が和の雰囲気を演出します。',
    amazon_url: 'https://amzn.to/46nSCFJ',
    image_url: 'https://m.media-amazon.com/images/I/91wRNkpPDFL._AC_SX679_.jpg',
    size_category: 'mini',
    difficulty_level: 1,
    tags: ['南天', '実もの', '縁起物', 'ミニ盆栽'],
    height_cm: 15,
    bloom_months: [11, 12, 1]
  },
  {
    name: 'しだれ梅盆栽 白色の八重咲き',
    price: 5500,
    category: '花もの',
    description: '白色八重咲きのしだれ梅盆栽。清楚な白い花と優美な枝垂れが美しい、早春の花を楽しめる盆栽。',
    amazon_url: 'https://amzn.to/4mgNfhx',
    image_url: 'https://m.media-amazon.com/images/I/51h8sFlrjjL._AC_.jpg',
    size_category: 'small',
    difficulty_level: 2,
    tags: ['梅', 'しだれ梅', '八重咲き', '白花', '花もの'],
    height_cm: 25,
    bloom_months: [1, 2, 3]
  },
  {
    name: '盆栽長寿梅',
    price: 4980,
    category: '花もの',
    description: '長寿梅の盆栽。縁起の良い名前と可愛らしい花が人気で、初心者にも育てやすい花もの盆栽。',
    amazon_url: 'https://amzn.to/3VnBevV',
    image_url: 'https://m.media-amazon.com/images/I/51e7ET6fgFL._AC_.jpg',
    size_category: 'small',
    difficulty_level: 1,
    tags: ['長寿梅', '花もの', '縁起物', '初心者向け'],
    height_cm: 20,
    bloom_months: [2, 3, 4]
  },
  {
    name: '一才藤 藤',
    price: 12100,
    category: '花もの',
    description: '一才藤の盆栽。若い樹でも花をつけやすい品種で、美しい藤の花房を楽しめる贅沢な一品。',
    amazon_url: 'https://amzn.to/4nzjbPi',
    image_url: 'https://m.media-amazon.com/images/I/81J0K1nqWOL._AC_SX679_.jpg',
    size_category: 'medium',
    difficulty_level: 2,
    tags: ['藤', '一才藤', '花もの', '豪華'],
    height_cm: 35,
    bloom_months: [4, 5]
  },
  {
    name: 'フジ 一才藤 春咲き花盆栽',
    price: 15800,
    category: '花もの',
    description: '春咲きの一才藤盆栽。優雅な花房と甘い香りが特徴的で、春の訪れを華やかに彩ります。',
    amazon_url: 'https://amzn.to/3Viiqyf',
    image_url: 'https://m.media-amazon.com/images/I/5177pTiM1wL._AC_.jpg',
    size_category: 'medium',
    difficulty_level: 2,
    tags: ['藤', '春咲き', '花もの', '香り'],
    height_cm: 40,
    bloom_months: [4, 5]
  },
  {
    name: '盆栽 藤 太幹 モダン盆栽 陶器鉢',
    price: 15340,
    category: '花もの',
    description: '太幹仕立ての藤盆栽。モダンな陶器鉢に植えられ、現代的な空間にも調和する洗練された作品。',
    amazon_url: 'https://amzn.to/4mnIoLv',
    image_url: 'https://m.media-amazon.com/images/I/41oVjHkIktL._AC_.jpg',
    size_category: 'medium',
    difficulty_level: 3,
    tags: ['藤', '太幹', 'モダン', '高級'],
    height_cm: 35,
    bloom_months: [4, 5]
  },
  {
    name: 'ミニ盆栽 鑑賞 紅葉 インテリアグリーン',
    price: 24200,
    category: '雑木類',
    description: '紅葉を楽しめる高級ミニ盆栽。四季の変化が美しく、インテリアグリーンとしても人気の逸品。',
    amazon_url: 'https://amzn.to/3Vln5iU',
    image_url: 'https://m.media-amazon.com/images/I/41kTmT8wkfL._AC_.jpg',
    size_category: 'mini',
    difficulty_level: 3,
    tags: ['紅葉', 'もみじ', '雑木類', '高級', 'インテリア'],
    height_cm: 20
  },
  {
    name: '吾妻五葉松【大巓性】',
    price: 31800,
    category: '松柏類',
    description: '最高級の吾妻五葉松大巓性。密な葉性と優美な樹形が特徴的な、コレクター向けの極上品。',
    amazon_url: 'https://amzn.to/4n3yGPD',
    image_url: 'https://m.media-amazon.com/images/I/81OiXen1blL._AC_SX679_.jpg',
    size_category: 'large',
    difficulty_level: 3,
    tags: ['五葉松', '吾妻', '大巓性', '最高級', '松柏類'],
    height_cm: 40
  },
  {
    name: '風月黒鉢 白土1個売',
    price: 5460,
    category: '草もの',
    description: '風月黒鉢に植えられた白土の草もの盆栽。シンプルで洗練された和の美しさを表現。',
    amazon_url: 'https://amzn.to/46nSQg3',
    image_url: 'https://m.media-amazon.com/images/I/71BZ8UZ3sHL._AC_SX679_.jpg',
    size_category: 'small',
    difficulty_level: 1,
    tags: ['草もの', '黒鉢', '白土', 'シンプル'],
    height_cm: 15
  },
  {
    name: '楡欅(ニレケヤキ) 5号 1個売り',
    price: 4980,
    category: '雑木類',
    description: '楡欅（ニレケヤキ）の盆栽。小さな葉と繊細な枝ぶりが特徴的で、四季の変化を楽しめる雑木盆栽。',
    amazon_url: 'https://amzn.to/4nsjtHC',
    image_url: 'https://m.media-amazon.com/images/I/61RW3RU25mL._AC_SX679_.jpg',
    size_category: 'small',
    difficulty_level: 2,
    tags: ['楡欅', 'ニレケヤキ', '雑木類', '落葉樹'],
    height_cm: 25
  },
  {
    name: 'りんご鉢植え 長寿りんご',
    price: 5980,
    category: '実もの',
    description: '長寿りんごの鉢植え盆栽。小さな実をつける姫りんごで、花も実も楽しめる実もの盆栽の人気種。',
    amazon_url: 'https://amzn.to/41ROL2A',
    image_url: 'https://m.media-amazon.com/images/I/51IV9eSkP5L._AC_.jpg',
    size_category: 'small',
    difficulty_level: 2,
    tags: ['りんご', '姫りんご', '実もの', '長寿', '花実両用'],
    height_cm: 30,
    bloom_months: [4, 5]
  }
];

async function addProducts() {
  console.log('🚀 22商品の登録を開始します...');
  console.log('='.repeat(50));

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const product of products) {
    try {
      // 重複チェック
      const { data: existing } = await supabase
        .from('products')
        .select('id, name')
        .eq('name', product.name)
        .single();

      if (existing) {
        console.log(`⚠️  既存: ${product.name}`);

        // 既存商品を更新
        const { error: updateError } = await supabase
          .from('products')
          .update({
            ...product,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          throw updateError;
        }
        console.log(`✅ 更新: ${product.name}`);
      } else {
        // 新規登録
        const { error: insertError } = await supabase
          .from('products')
          .insert([{
            ...product,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) {
          throw insertError;
        }
        console.log(`✅ 登録: ${product.name}`);
      }

      successCount++;
    } catch (error) {
      errorCount++;
      errors.push({ product: product.name, error: error.message });
      console.error(`❌ エラー: ${product.name}`, error.message);
    }
  }

  console.log('='.repeat(50));
  console.log(`📊 登録結果:`);
  console.log(`   成功: ${successCount}件`);
  console.log(`   失敗: ${errorCount}件`);

  if (errors.length > 0) {
    console.log('\n❌ エラー詳細:');
    errors.forEach(e => {
      console.log(`   - ${e.product}: ${e.error}`);
    });
  }

  console.log('\n✨ 商品登録処理が完了しました！');
}

// 実行
addProducts().catch(console.error);