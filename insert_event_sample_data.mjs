import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

async function insertEventSampleData() {
  try {
    console.log('🎋 イベントサンプルデータ挿入開始');
    console.log('====================================\n');

    // サンプルイベントデータ
    const events = [
      {
        title: '第98回国風盆栽展',
        slug: 'kokufu-bonsai-exhibition-2025',
        start_date: '2025-02-06',
        end_date: '2025-02-10',
        prefecture: '東京都',
        venue_name: '東京都美術館',
        address: '東京都台東区上野公園8-36',
        lat: 35.7177,
        lng: 139.7731,
        types: ['exhibition'],
        price_type: 'paid',
        price_note: '一般 1,000円、高校・大学生 500円、中学生以下無料',
        organizer_name: '日本盆栽協会',
        official_url: 'https://www.nihon-bonsai.jp/kokufu/',
        description: '盆栽界最高峰の展示会。全国から選ばれた名品約500点を展示。著名作家の作品や古典盆栽の傑作を一堂に鑑賞できる貴重な機会です。'
      },
      {
        title: '大宮盆栽まつり 2025',
        slug: 'omiya-bonsai-festival-2025',
        start_date: '2025-05-03',
        end_date: '2025-05-05',
        prefecture: '埼玉県',
        venue_name: '大宮公園',
        address: '埼玉県さいたま市大宮区高鼻町4',
        lat: 35.9167,
        lng: 139.6333,
        types: ['exhibition', 'sale', 'workshop'],
        price_type: 'free',
        organizer_name: 'さいたま市',
        official_url: 'https://www.omiya-bonsai.com/matsuri/',
        description: '盆栽の聖地・大宮で開催される最大級の盆栽イベント。即売会、体験教室、デモンストレーションなど盛りだくさんの内容です。'
      },
      {
        title: '春の山野草と盆栽展',
        slug: 'spring-wildflower-bonsai-2025',
        start_date: '2025-03-15',
        end_date: '2025-03-17',
        prefecture: '京都府',
        venue_name: '京都府立植物園',
        address: '京都府京都市左京区下鴨半木町',
        lat: 35.0467,
        lng: 135.7644,
        types: ['exhibition', 'sale'],
        price_type: 'paid',
        price_note: '入園料込み 一般 200円',
        organizer_name: '京都盆栽会',
        description: '春の訪れを告げる山野草と盆栽の美しいコラボレーション展。桜や梅など季節の花物盆栽を中心に展示します。'
      },
      {
        title: '初心者向け盆栽教室「はじめての盆栽」',
        slug: 'beginner-bonsai-class-2025-spring',
        start_date: '2025-04-12',
        end_date: '2025-04-12',
        prefecture: '神奈川県',
        venue_name: '横浜市民ギャラリー',
        address: '神奈川県横浜市西区宮崎町26-1',
        lat: 35.4522,
        lng: 139.6178,
        types: ['workshop', 'lecture'],
        price_type: 'paid',
        price_note: '参加費 3,000円（材料費込み）',
        organizer_name: '横浜盆栽愛好会',
        description: '盆栽初心者向けの実践教室。基本的な手入れ方法から植え替えまで、実際に作業をしながら学べます。'
      },
      {
        title: '秋の紅葉盆栽展示会',
        slug: 'autumn-maple-bonsai-exhibition-2025',
        start_date: '2025-11-10',
        end_date: '2025-11-15',
        prefecture: '愛知県',
        venue_name: '名古屋市園芸センター',
        address: '愛知県名古屋市港区春田野2-3204',
        lat: 35.1278,
        lng: 136.8333,
        types: ['exhibition'],
        price_type: 'free',
        organizer_name: '中部盆栽連盟',
        description: '秋の美しい紅葉を楽しめる盆栽の展示会。モミジ、ケヤキなど落葉樹の見事な紅葉をお楽しみください。'
      },
      {
        title: '盆栽即売市 新春特別セール',
        slug: 'bonsai-market-new-year-2025',
        start_date: '2025-01-15',
        end_date: '2025-01-16',
        prefecture: '大阪府',
        venue_name: '大阪城公園 西の丸庭園',
        address: '大阪府大阪市中央区大阪城2',
        lat: 34.6867,
        lng: 135.5256,
        types: ['sale'],
        price_type: 'free',
        organizer_name: '関西盆栽商組合',
        description: '新年恒例の盆栽即売市。お手頃価格の初心者向けから本格的な作品まで、幅広い品揃えでお待ちしています。'
      },
      {
        title: '夏の涼感盆栽とコケ玉作り',
        slug: 'summer-cool-bonsai-kokedama-2025',
        start_date: '2025-07-20',
        end_date: '2025-07-21',
        prefecture: '福岡県',
        venue_name: '福岡市植物園',
        address: '福岡県福岡市中央区小笹5-1-1',
        lat: 33.5667,
        lng: 130.3833,
        types: ['workshop', 'exhibition'],
        price_type: 'paid',
        price_note: '体験料 2,500円、見学のみ 300円',
        organizer_name: '九州盆栽研究会',
        description: '暑い夏にぴったりの涼感演出盆栽とコケ玉作りの体験イベント。水石との組み合わせも学べます。'
      },
      {
        title: '盆栽技術講習会「剪定と針金かけ」',
        slug: 'bonsai-technique-pruning-wiring-2025',
        start_date: '2025-06-08',
        end_date: '2025-06-08',
        prefecture: '兵庫県',
        venue_name: '神戸市立森林植物園',
        address: '兵庫県神戸市北区山田町上谷上字長尾1-2',
        lat: 34.7833,
        lng: 135.1167,
        types: ['lecture', 'workshop'],
        price_type: 'paid',
        price_note: '受講料 4,000円',
        organizer_name: '兵庫県盆栽連合会',
        description: '中級者向けの技術講習会。プロの盆栽師による剪定技術と針金かけの実演・指導を行います。'
      }
    ];

    // イベントデータを挿入
    const { data: insertedEvents, error: eventsError } = await supabase
      .from('events')
      .insert(events)
      .select();

    if (eventsError) {
      console.error('❌ イベント挿入エラー:', eventsError);
      return;
    }

    console.log('✅ イベントデータ挿入完了');
    console.log(`📊 挿入件数: ${insertedEvents?.length}件\n`);

    // 挿入されたイベントを表示
    insertedEvents?.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   📅 ${event.start_date} - ${event.end_date}`);
      console.log(`   📍 ${event.prefecture} ${event.venue_name}`);
      console.log(`   🏷️ ${event.types.join(', ')}`);
      console.log(`   💰 ${event.price_type === 'free' ? '無料' : '有料'}`);
      console.log(`   🆔 ${event.id}`);
      console.log('');
    });

    console.log('🎉 イベント機能用サンプルデータの挿入が完了しました！');

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

insertEventSampleData();