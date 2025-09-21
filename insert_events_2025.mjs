import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const events2025 = [
  {
    title: "第98回国風盆栽展（前期）",
    slug: "kokufu-bonsai-ten-2025-zenki",
    start_date: "2025-02-08",
    end_date: "2025-02-11",
    types: ["exhibition"],
    price_type: "paid",
    prefecture: "東京都",
    venue_name: "東京都美術館",
    address: "東京都台東区上野公園8-36",
    lat: 35.7177,
    lng: 139.7731,
    description: "日本で最もレベルと格調の高い盆栽展として、海外でも広く知られている伝統ある展覧会です。前期展示では盆栽、水石、盆栽関連工芸品などが展示されます。",
    organizer_name: "一般社団法人 日本盆栽協会",
    price_note: "1000円（前後期共通券1500円）協会会員証の提示で無料",
    official_url: "https://bonsai-kyokai.or.jp/event.html",
    related_product_tags: ["松柏類", "雑木類", "花もの", "実もの"]
  },

  {
    title: "第98回国風盆栽展（後期）",
    slug: "kokufu-bonsai-ten-2025-kouki",
    start_date: "2025-02-13",
    end_date: "2025-02-16",
    types: ["exhibition"],
    price_type: "paid",
    prefecture: "東京都",
    venue_name: "東京都美術館",
    address: "東京都台東区上野公園8-36",
    lat: 35.7177,
    lng: 139.7731,
    description: "日本で最もレベルと格調の高い盆栽展として、海外でも広く知られている伝統ある展覧会です。後期展示では前期とは異なる作品群が展示されます。",
    organizer_name: "一般社団法人 日本盆栽協会",
    price_note: "1000円（前後期共通券1500円）協会会員証の提示で無料",
    official_url: "https://bonsai-kyokai.or.jp/event.html",
    related_product_tags: ["松柏類", "雑木類", "花もの", "実もの"]
  },

  {
    title: "立春盆栽大市",
    slug: "risshun-bonsai-ichiba-2025",
    start_date: "2025-02-08",
    end_date: "2025-02-16",
    types: ["sale"],
    price_type: "free",
    prefecture: "東京都",
    venue_name: "上野グリーンクラブ",
    address: "東京都台東区上野公園内",
    description: "国風盆栽展と同時開催される盆栽市。全国から集まった優良な盆栽や盆栽用品、関連書籍などが販売されます。プレオープンは2月7日13時から17時まで。",
    organizer_name: "上野グリーンクラブ",
    price_note: "入場無料",
    related_product_tags: ["初心者向け", "ミニ盆栽", "盆栽道具"]
  },

  {
    title: "第50回雅風展",
    slug: "gafuu-ten-50th-2025",
    start_date: "2025-01-10",
    end_date: "2025-01-12",
    types: ["exhibition"],
    price_type: "paid",
    prefecture: "京都府",
    venue_name: "京都市勧業館みやこめっせ",
    address: "京都府京都市左京区岡崎成勝寺町9-1",
    description: "記念すべき第50回を迎える雅風展。小品盆栽の美しさを堪能できる関西地方最大級の展覧会です。約50席、250点の小品盆栽が展示されます。",
    organizer_name: "全日本小品盆栽協会",
    related_product_tags: ["ミニ盆栽", "小品盆栽"]
  },

  {
    title: "第37回九州雅展",
    slug: "kyushu-miyabi-ten-37th-2025",
    start_date: "2025-02-28",
    end_date: "2025-03-02",
    types: ["exhibition"],
    price_type: "paid",
    prefecture: "熊本県",
    venue_name: "フードパル熊本",
    address: "熊本県熊本市北区貢町581-2",
    description: "九州地方最大級の小品盆栽展覧会。地域の特色を活かした盆栽作品が多数展示され、即売も行われます。",
    organizer_name: "全日本小品盆栽協会",
    related_product_tags: ["ミニ盆栽", "小品盆栽"]
  },

  {
    title: "第33回春雅展",
    slug: "haru-miyabi-ten-33rd-2025",
    start_date: "2025-03-28",
    end_date: "2025-03-30",
    types: ["exhibition"],
    price_type: "paid",
    prefecture: "大阪府",
    venue_name: "花みずき館（水の館ホール）",
    address: "大阪府大阪市鶴見区緑地公園2-163",
    description: "春の小品盆栽展覧会。新緑の季節にふさわしい美しい盆栽作品が展示されます。関西地方の愛好家による力作が並びます。",
    organizer_name: "全日本小品盆栽協会",
    related_product_tags: ["ミニ盆栽", "小品盆栽", "花もの"]
  },

  {
    title: "第14回東海雅展",
    slug: "tokai-miyabi-ten-14th-2025",
    start_date: "2025-02-22",
    end_date: "2025-02-24",
    types: ["exhibition"],
    price_type: "paid",
    prefecture: "愛知県",
    venue_name: "庄内緑地グリーンプラザ",
    address: "愛知県名古屋市西区山田町大字上小田井字敷地3527",
    description: "東海地方の小品盆栽展覧会。地域の盆栽愛好家による作品が展示され、技術交流も行われます。",
    organizer_name: "全日本小品盆栽協会",
    related_product_tags: ["ミニ盆栽", "小品盆栽"]
  },

  {
    title: "秋雅展",
    slug: "aki-miyabi-ten-2025",
    start_date: "2025-11-01",
    end_date: "2025-11-03",
    types: ["exhibition"],
    price_type: "paid",
    prefecture: "東京都",
    venue_name: "未定",
    address: "東京都内",
    description: "秋の小品盆栽展覧会。紅葉の美しさを表現した盆栽作品が展示されます。年間を通じての小品盆栽の集大成的な展覧会です。",
    organizer_name: "全日本小品盆栽協会",
    related_product_tags: ["ミニ盆栽", "小品盆栽", "実もの"]
  },

  {
    title: "彩花盆栽教室（定期開催）",
    slug: "saika-bonsai-kyoshitsu-2025",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    types: ["workshop"],
    price_type: "paid",
    prefecture: "東京都",
    venue_name: "彩花盆栽教室各会場",
    address: "東京都・埼玉県内8拠点",
    description: "創業170年の清香園4代目家元の山田香織が主宰する盆栽教室。3000名を超える生徒様が参加した実績があります。初心者から上級者まで対応。",
    organizer_name: "彩花盆栽教室",
    official_url: "https://saikabonsai-class.com/",
    related_product_tags: ["初心者向け", "盆栽道具"]
  },

  {
    title: "上野グリーンクラブ盆栽教室",
    slug: "ueno-green-club-kyoshitsu-2025",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    types: ["workshop"],
    price_type: "paid",
    prefecture: "東京都",
    venue_name: "上野グリーンクラブ",
    address: "東京都台東区上野公園内",
    description: "女性でも気軽に楽しめる初心者中心の盆栽教室。季節の盆栽素材の植えつけや剪定・針金整枝などを実施。月に1回開催。",
    organizer_name: "上野グリーンクラブ",
    related_product_tags: ["初心者向け", "盆栽道具"]
  }
]

async function insertEvents() {
  console.log('Starting to insert events...')

  for (const event of events2025) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()

      if (error) {
        console.error(`Error inserting event ${event.title}:`, error)
      } else {
        console.log(`✅ Successfully inserted: ${event.title}`)
      }
    } catch (err) {
      console.error(`Unexpected error inserting ${event.title}:`, err)
    }
  }

  console.log('Finished inserting events!')
}

insertEvents()