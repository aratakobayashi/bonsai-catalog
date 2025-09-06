-- Insert comprehensive sample garden data
-- Migration: 003_insert_sample_gardens.sql

-- Insert 5 diverse sample gardens with rich data
INSERT INTO gardens (
  id, name, address, description, image_url, website_url, phone,
  prefecture, city, postal_code, latitude, longitude,
  business_hours, closed_days, specialties, established_year,
  owner_name, owner_message, access_info, parking_info,
  experience_programs, online_sales, rating, review_count, featured,
  additional_images, social_instagram
) VALUES 
-- 1. 松風盆栽園（京都・伝統的）
(
  gen_random_uuid(),
  '松風盆栽園',
  '京都府京都市右京区嵐山天龍寺造路町20-1',
  '嵐山の美しい自然に囲まれた100年の歴史を持つ伝統的な盆栽園。四季折々の美しい盆栽をお楽しみいただけます。',
  'https://example.com/matsukaze-main.jpg',
  'https://matsukaze-bonsai.kyoto',
  '075-861-0033',
  '京都府', '京都市', '616-8385',
  35.0116, 135.6761,
  '8:00-18:00（4-10月）、8:30-17:30（11-3月）',
  '["年末年始"]'::jsonb,
  '["松柏類", "花もの", "山野草", "古木"]'::jsonb,
  1923,
  '松本 和夫',
  '祖父の代から続く盆栽園です。伝統の技術と現代的なセンスを融合した作品作りを心がけています。',
  'JR嵯峨嵐山駅から徒歩12分、阪急嵐山駅から徒歩8分',
  '専用駐車場5台、大型バス駐車可',
  true, true, 4.8, 89, true,
  '["https://example.com/matsukaze-2.jpg", "https://example.com/matsukaze-3.jpg"]'::jsonb,
  'https://instagram.com/matsukaze_bonsai'
),

-- 2. 花桜園（東京・現代的）
(
  gen_random_uuid(),
  '花桜園',
  '東京都渋谷区代官山町18-6',
  '代官山の洗練された空間で楽しむ現代的な盆栽体験。初心者向けワークショップも充実。',
  'https://example.com/hanasaku-main.jpg',
  'https://hanasaku-en.tokyo',
  '03-3770-2180',
  '東京都', '渋谷区', '150-0034',
  35.6503, 139.6999,
  '10:00-19:00',
  '["月曜日"]'::jsonb,
  '["ミニ盆栽", "花もの", "創作盆栽", "苔玉"]'::jsonb,
  2018,
  '佐藤 美咲',
  'モダンな感性で盆栽の新しい可能性を追求しています。お気軽にお立ち寄りください。',
  'JR恵比寿駅東口から徒歩5分、東急東横線代官山駅から徒歩3分',
  'コインパーキング利用（提携割引あり）',
  true, true, 4.6, 156, true,
  '["https://example.com/hanasaku-2.jpg", "https://example.com/hanasaku-workshop.jpg"]'::jsonb,
  'https://instagram.com/hanasaku_daikanyama'
),

-- 3. 緑心盆栽園（大阪・専門店）
(
  gen_random_uuid(),
  '緑心盆栽園',
  '大阪府大阪市住吉区帝塚山東2-3-15',
  '松柏類専門の老舗盆栽園。樹齢100年を超える希少な名木も多数取り扱っております。',
  'https://example.com/ryokushin-main.jpg',
  'https://ryokushin-bonsai.osaka',
  '06-6672-8899',
  '大阪府', '大阪市', '558-0052',
  34.6095, 135.4974,
  '9:00-17:00',
  '["水曜日", "第2・4日曜日"]'::jsonb,
  '["松柏類", "真柏", "五葉松", "黒松"]'::jsonb,
  1952,
  '田村 健太郎',
  '松柏類一筋70年。本物の盆栽の素晴らしさをお伝えしたいと思っています。',
  '南海高野線「帝塚山駅」から徒歩7分',
  '専用駐車場2台',
  false, false, 4.9, 42, false,
  '["https://example.com/ryokushin-pine.jpg"]'::jsonb,
  null
),

-- 4. みどり工房（神奈川・体験重視）
(
  gen_random_uuid(),
  'みどり工房',
  '神奈川県鎌倉市長谷3-11-2',
  '鎌倉の古都で盆栽作りを学べる体験工房。観光の方にも大人気の手作り体験メニューが充実。',
  'https://example.com/midori-main.jpg',
  'https://midori-kobo.kamakura.jp',
  '0467-22-5544',
  '神奈川県', '鎌倉市', '248-0016',
  35.3106, 139.5366,
  '10:00-16:00',
  '["火曜日", "雨天時"]'::jsonb,
  '["体験教室", "ミニ盆栽", "苔玉", "季節の寄せ植え"]'::jsonb,
  2010,
  '山田 香織',
  '盆栽の楽しさをより多くの方に知っていただきたく、体験型の工房を始めました。',
  'JR横須賀線「鎌倉駅」東口からバス7分「長谷観音」下車徒歩2分',
  '近隣コインパーキング利用',
  true, true, 4.4, 203, false,
  '["https://example.com/midori-workshop.jpg", "https://example.com/midori-experience.jpg"]'::jsonb,
  'https://instagram.com/midori_kobo_kamakura'
),

-- 5. 雲松園（福岡・地方名店）
(
  gen_random_uuid(),
  '雲松園',
  '福岡県福岡市南区野間1-12-8',
  '九州の盆栽文化を支える地域密着型の盆栽園。地元の気候に適した品種を中心に取り扱い。',
  'https://example.com/unsho-main.jpg',
  null,
  '092-541-7788',
  '福岡県', '福岡市', '815-0041',
  33.5562, 130.4189,
  '9:30-18:30',
  '["第1・3日曜日"]'::jsonb,
  '["雑木類", "花もの", "実もの", "九州産植物"]'::jsonb,
  1978,
  '古賀 正明',
  '地域の皆様に愛され続けて45年。九州の自然を活かした盆栽作りが自慢です。',
  '西鉄天神大牟田線「高宮駅」から徒歩15分',
  '専用駐車場4台',
  true, false, 4.3, 67, false,
  '[]'::jsonb,
  null
);