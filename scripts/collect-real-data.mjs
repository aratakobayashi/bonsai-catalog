// Real bonsai garden data collection script
import { createClient } from '@supabase/supabase-js';

// Google Places API would be ideal for this, but here's a manual collection approach
const realBonsaiGardens = [
  // 大宮盆栽村エリア
  {
    name: '藤樹園',
    address: '埼玉県さいたま市北区盆栽町',
    description: 'かえで通りの石畳の道沿いにある松柏盆栽の名園。中品盆栽に力を入れている。',
    prefecture: '埼玉県',
    city: 'さいたま市',
    business_hours: '9:00-17:00',
    closed_days: ['木曜日'],
    specialties: ['松柏盆栽', '中品盆栽'],
    area: '大宮盆栽村',
    established_year: null, // 要調査
    access_info: '東武野田線大宮公園駅から徒歩5分'
  },
  
  {
    name: '清香園',
    address: '埼玉県さいたま市北区盆栽町',
    description: '盆栽の作り方・育て方を学べる彩花盆栽教室も開催している盆栽園。',
    prefecture: '埼玉県',
    city: 'さいたま市',
    website_url: 'https://www.seikouen.cc/',
    business_hours: '9:00-17:00',
    closed_days: ['木曜日'],
    specialties: ['盆栽教室', '育て方指導'],
    area: '大宮盆栽村'
  },

  // 東京エリア
  {
    name: '春花園BONSAI美術館',
    address: '〒132-0001 東京都江戸川区新堀1-29-16',
    description: '世界的に有名な盆栽師小林國雄氏の盆栽園。美術館も併設している。',
    prefecture: '東京都',
    city: '江戸川区',
    postal_code: '132-0001',
    website_url: 'https://kunio-kobayashi.com/',
    business_hours: '10:00-17:00',
    specialties: ['名木', '盆栽美術館', '国際的'],
    owner_name: '小林國雄',
    featured: true,
    rating: 4.8, // 推定
    experience_programs: true
  },

  // 大阪エリア  
  {
    name: '養庄園',
    address: '大阪府池田市',
    description: '大阪屈指の品揃えを誇る盆栽園。併設カフェKIBE KITCHENも人気。',
    prefecture: '大阪府',
    city: '池田市',
    business_hours: '平日 9:30-17:00、土日祝 8:30-19:00',
    specialties: ['豊富な品揃え', 'カフェ併設'],
    closed_days: ['無休'],
    featured: true,
    additional_services: ['カフェKIBE KITCHEN']
  }
];

// データ収集戦略
const dataCollectionStrategy = {
  phase1: {
    target: '有名園・アクセス良好園',
    count: 10,
    sources: ['公式サイト', 'Googleマップ', '観光サイト'],
    timeframe: '1-2週間'
  },
  
  phase2: {
    target: '地域の代表的盆栽園',
    count: 30,
    sources: ['地域ポータル', '電話取材', 'SNS'],
    timeframe: '1ヶ月'
  },
  
  phase3: {
    target: '全国網羅',
    count: 100,
    sources: ['業界団体', 'API', 'クラウドソーシング'],
    timeframe: '2-3ヶ月'
  }
};

console.log('🌿 盆栽園データ収集戦略');
console.log('サンプル収集済み:', realBonsaiGardens.length, '園');
console.log('収集戦略:', JSON.stringify(dataCollectionStrategy, null, 2));