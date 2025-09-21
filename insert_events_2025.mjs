import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const events2025 = [
  {
    title: "第98回国風盆栽展（前期）",
    slug: "kokufu-bonsai-ten-2025-zenki",
    start_date: "2025-02-08",
    end_date: "2025-02-11",
    event_types: ["exhibition"],
    price_type: "paid",
    prefecture: "東京都",
    venue_name: "東京都美術館",
    address: "東京都台東区上野公園8-36",
    description: "日本で最もレベルと格調の高い盆栽展として、海外でも広く知られている伝統ある展覧会です。前期展示。",
    organizer: "一般社団法人 日本盆栽協会",
    entry_fee: "1000円（前後期共通券1500円）",
    opening_hours: "9:30-17:30（入場は17:00まで）",
    website: "https://bonsai-kyokai.or.jp/event.html"
  },

  {
    title: "第98回国風盆栽展（後期）",
    slug: "kokufu-bonsai-ten-2025-kouki",
    start_date: "2025-02-13",
    end_date: "2025-02-16",
    event_types: ["exhibition"],
    price_type: "paid",
    prefecture: "東京都",
    venue_name: "東京都美術館",
    address: "東京都台東区上野公園8-36",
    description: "日本で最もレベルと格調の高い盆栽展として、海外でも広く知られている伝統ある展覧会です。後期展示。",
    organizer: "一般社団法人 日本盆栽協会",
    entry_fee: "1000円（前後期共通券1500円）",
    opening_hours: "9:30-17:30（入場は17:00まで、最終日は15:30まで）",
    website: "https://bonsai-kyokai.or.jp/event.html"
  },

  {
    title: "立春盆栽大市",
    slug: "risshun-bonsai-ichiba-2025",
    start_date: "2025-02-08",
    end_date: "2025-02-16",
    event_types: ["sale"],
    price_type: "free",
    prefecture: "東京都",
    venue_name: "上野グリーンクラブ",
    address: "東京都台東区上野",
    description: "国風盆栽展と同時開催される盆栽市。多くの盆栽や盆栽用品が販売されます。プレオープンは2月7日13時から。",
    organizer: "上野グリーンクラブ",
    entry_fee: "入場無料",
    opening_hours: "9:00-17:00（最終日16:00まで、12日は休館日）"
  },

  {
    title: "第50回雅風展",
    slug: "gafuu-ten-50th-2025",
    start_date: "2025-01-10",
    end_date: "2025-01-12",
    event_types: ["exhibition"],
    price_type: "paid",
    prefecture: "京都府",
    venue_name: "京都市勧業館みやこめっせ",
    address: "京都府京都市左京区岡崎成勝寺町9-1",
    description: "記念すべき第50回を迎える雅風展。小品盆栽の美しさを堪能できる展覧会です。",
    opening_hours: "9:30-16:30（最終日15:30まで）"
  },

  {
    title: "第37回九州雅展",
    slug: "kyushu-miyabi-ten-37th-2025",
    start_date: "2025-02-28",
    end_date: "2025-03-02",
    event_types: ["exhibition"],
    price_type: "paid",
    prefecture: "熊本県",
    venue_name: "フードパル熊本",
    address: "熊本県熊本市北区貢町581-2",
    description: "九州地方最大級の盆栽展覧会。地域の特色を活かした盆栽作品が多数展示されます。",
    opening_hours: "9:30-16:30（最終日15:00まで）"
  },

  {
    title: "第33回春雅展",
    slug: "haru-miyabi-ten-33rd-2025",
    start_date: "2025-03-28",
    end_date: "2025-03-30",
    event_types: ["exhibition"],
    price_type: "paid",
    prefecture: "大阪府",
    venue_name: "花みずき館（水の館ホール）",
    address: "大阪府大阪市鶴見区緑地公園2-163",
    description: "春の盆栽展覧会。新緑の季節にふさわしい美しい盆栽作品が展示されます。",
    opening_hours: "9:30-16:00（最終日15:30まで）"
  },

  {
    title: "第14回東海雅展",
    slug: "tokai-miyabi-ten-14th-2025",
    start_date: "2025-02-22",
    end_date: "2025-02-24",
    event_types: ["exhibition"],
    price_type: "paid",
    prefecture: "愛知県",
    venue_name: "庄内緑地グリーンプラザ",
    address: "愛知県名古屋市西区山田町大字上小田井字敷地3527",
    description: "東海地方の盆栽展覧会。地域の盆栽愛好家による作品が展示されます。",
    opening_hours: "9:15-16:00"
  },

  {
    title: "秋雅展",
    slug: "aki-miyabi-ten-2025",
    start_date: "2025-11-01",
    end_date: "2025-11-03",
    event_types: ["exhibition"],
    price_type: "paid",
    prefecture: "東京都",
    venue_name: "未定",
    address: "東京都内",
    description: "秋の盆栽展覧会。紅葉の美しさを表現した盆栽作品が展示されます。",
    opening_hours: "10:00-17:00（最終日16:00まで）"
  },

  // ワークショップ・教室系イベント
  {
    title: "彩花盆栽教室（定期開催）",
    slug: "saika-bonsai-kyoshitsu-2025",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    event_types: ["workshop"],
    price_type: "paid",
    prefecture: "東京都",
    venue_name: "彩花盆栽教室各会場",
    address: "東京都・埼玉県内8拠点",
    description: "創業170年の清香園4代目家元の山田香織が主宰する盆栽教室。3000名を超える生徒様が参加した実績があります。",
    organizer: "彩花盆栽教室",
    website: "https://saikabonsai-class.com/"
  },

  {
    title: "上野グリーンクラブ盆栽教室",
    slug: "ueno-green-club-kyoshitsu-2025",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    event_types: ["workshop"],
    price_type: "paid",
    prefecture: "東京都",
    venue_name: "上野グリーンクラブ",
    address: "東京都台東区上野",
    description: "女性でも気軽に楽しめる初心者中心の盆栽教室。季節の盆栽素材の植えつけや剪定・針金整枝などを実施。",
    organizer: "上野グリーンクラブ"
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