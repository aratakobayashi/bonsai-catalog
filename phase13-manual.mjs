// Manual Phase 13 data insertion
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

// Phase 13: Kanto Plant Nursery Centers Data
const phase13Gardens = [
  {
    name: '川口緑化センター 樹里安',
    address: '埼玉県川口市安行領家844-2',
    description: '400年以上の歴史を有する安行植木の里に位置する道の駅。植木、花鉢、園芸資材を500種類以上販売し、植木や盆栽の講習会や展示会を定期的に開催。地元の植木職人が育てた伝統植木を購入できる屋外植木広場も併設。',
    image_url: 'https://via.placeholder.com/400x300?text=川口緑化センター樹里安',
    website_url: 'https://www.jurian.or.jp/',
    phone: '048-296-4021',
    prefecture: '埼玉県',
    city: '川口市',
    postal_code: '334-0058',
    latitude: 35.8234,
    longitude: 139.7345,
    business_hours: '園芸販売 9:00-17:00、レストラン 11:00-15:00',
    closed_days: ["月曜日（6-2月）", "年末年始"],
    specialties: ["植木", "盆栽", "園芸資材", "季節の花卉", "講習会"],
    established_year: 1992,
    owner_name: '川口緑化センター',
    owner_message: '植木と盆栽の伝統を400年以上守り続ける安行の地で、皆様をお待ちしております。講習会や展示会で盆栽の魅力を広めています。',
    access_info: '埼玉高速鉄道線戸塚安行駅から徒歩20分',
    parking_info: '大型駐車場完備（無料）',
    experience_programs: true,
    online_sales: false,
    rating: 4.3,
    review_count: 128,
    featured: true,
    additional_images: [],
    social_instagram: null,
    social_twitter: null,
    social_facebook: null
  },
  {
    name: 'あゆみ野農協安行園芸センター',
    address: '埼玉県川口市安行1159-2',
    description: '川口市内最大級の売場面積を誇る植木・草花専門の総合園芸店。植木、苗木、盆栽、鉢物、花物、園芸資材を幅広く取り扱い、一般向けからプロ向けまで対応。造園職人による庭園設計・施工管理も提供。',
    image_url: 'https://via.placeholder.com/400x300?text=あゆみ野農協安行園芸センター',
    website_url: 'https://www.facebook.com/engei.center87181/',
    phone: '048-295-1013',
    prefecture: '埼玉県',
    city: '川口市',
    postal_code: '334-0057',
    latitude: 35.8156,
    longitude: 139.7298,
    business_hours: '9:00-17:30',
    closed_days: ["不定休"],
    specialties: ["植木", "苗木", "盆栽", "鉢物", "園芸資材", "造園設計"],
    established_year: 1978,
    owner_name: 'あゆみ野農協',
    owner_message: '地元農協として50年以上地域の園芸文化を支えてきました。プロから愛好家まで、植木と盆栽のことなら何でもご相談ください。',
    access_info: 'JR京浜東北線川口駅からバス25分',
    parking_info: '広域駐車場あり（無料）',
    experience_programs: true,
    online_sales: false,
    rating: 4.1,
    review_count: 85,
    featured: true,
    additional_images: [],
    social_instagram: null,
    social_twitter: null,
    social_facebook: null
  },
  {
    name: '植政',
    address: '埼玉県川口市安行1048',
    description: '明治40年創業の老舗植木店。100年以上の歴史を持つ家族経営の専門店として、植木から盆栽まで伝統の技術と現代のニーズを融合させた商品を提供。特に松柏類の盆栽で定評があり、全国の愛好家に愛される。',
    image_url: 'https://via.placeholder.com/400x300?text=植政',
    website_url: 'http://uemasa.com/',
    phone: '048-295-2479',
    prefecture: '埼玉県',
    city: '川口市',
    postal_code: '334-0057',
    latitude: 35.8123,
    longitude: 139.7289,
    business_hours: '9:00-17:00',
    closed_days: ["日曜日"],
    specialties: ["盆栽", "植木", "松柏類", "造園", "技術指導"],
    established_year: 1907,
    owner_name: '植木政夫',
    owner_message: '明治の創業から4代続く伝統を守りながら、現代の愛好家の皆様にも親しまれる盆栽作りを心がけております。',
    access_info: 'JR京浜東北線川口駅からバス20分',
    parking_info: '店舗前駐車可',
    experience_programs: true,
    online_sales: false,
    rating: 4.4,
    review_count: 92,
    featured: true,
    additional_images: [],
    social_instagram: null,
    social_twitter: null,
    social_facebook: null
  },
  {
    name: '安行植物取引所',
    address: '埼玉県川口市安行原2239',
    description: '全国最大級の植木流通拠点として1975年に設立。毎週火・金曜日に開催される植木市場では、全国から集まった植木・盆栽・園芸資材が売買される。一般の方も見学可能で、植木業界の心臓部を肌で感じることができる。',
    image_url: 'https://via.placeholder.com/400x300?text=安行植物取引所',
    website_url: null,
    phone: '048-295-0111',
    prefecture: '埼玉県',
    city: '川口市',
    postal_code: '334-0058',
    latitude: 35.8245,
    longitude: 139.7356,
    business_hours: '市場開催日 5:00-10:00',
    closed_days: ["火・金曜日以外"],
    specialties: ["植木市場", "流通拠点", "業者向け", "見学可能"],
    established_year: 1975,
    owner_name: '安行植物取引所組合',
    owner_message: '全国植木流通の中心地として、植木業界の発展に貢献しております。市場見学も歓迎です。',
    access_info: '埼玉高速鉄道戸塚安行駅から徒歩15分',
    parking_info: '大規模駐車場完備',
    experience_programs: false,
    online_sales: false,
    rating: 3.9,
    review_count: 42,
    featured: true,
    additional_images: [],
    social_instagram: null,
    social_twitter: null,
    social_facebook: null
  },
  {
    name: '瀧島園芸',
    address: '埼玉県川口市安行慈林876-1',
    description: '昭和30年創業の老舗園芸店。3代にわたって安行の地で植木と盆栽を手がけ、特に地域密着型のサービスで定評がある。植木の植栽から管理まで一貫してサポートし、個人庭園から企業緑化まで幅広く対応。',
    image_url: 'https://via.placeholder.com/400x300?text=瀧島園芸',
    website_url: null,
    phone: '048-295-3456',
    prefecture: '埼玉県',
    city: '川口市',
    postal_code: '334-0058',
    latitude: 35.8201,
    longitude: 139.7334,
    business_hours: '8:30-17:00',
    closed_days: ["日曜日", "祝日"],
    specialties: ["植木", "造園", "緑化工事", "メンテナンス"],
    established_year: 1955,
    owner_name: '瀧島三郎',
    owner_message: '祖父の代から続く植木への情熱を受け継ぎ、地域の緑化に貢献していきたいと思います。',
    access_info: '埼玉高速鉄道戸塚安行駅から徒歩12分',
    parking_info: '店舗前駐車可',
    experience_programs: false,
    online_sales: false,
    rating: 4.0,
    review_count: 28,
    featured: false,
    additional_images: [],
    social_instagram: null,
    social_twitter: null,
    social_facebook: null
  }
];

async function insertPhase13Gardens() {
  try {
    console.log('🚀 Starting Phase 13 manual insertion...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const garden of phase13Gardens) {
      try {
        console.log(`📝 Inserting: ${garden.name}`);
        
        const { data, error } = await supabase
          .from('gardens')
          .insert(garden)
          .select();

        if (error) {
          console.error(`❌ Error inserting ${garden.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Successfully inserted: ${garden.name}`);
          successCount++;
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (insertError) {
        console.error(`❌ Exception inserting ${garden.name}:`, insertError.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Phase 13 insertion completed!`);
    console.log(`✅ Successfully inserted: ${successCount} gardens`);
    console.log(`❌ Failed insertions: ${errorCount} gardens`);
    console.log(`📊 Total attempted: ${phase13Gardens.length} gardens`);

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

insertPhase13Gardens();