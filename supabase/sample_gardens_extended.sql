-- Sample data for extended gardens table
-- Run this after applying the 002_extend_gardens_table.sql migration

-- Insert comprehensive garden data with new fields
INSERT INTO gardens (
    name, address, description, image_url, website_url, phone,
    prefecture, city, postal_code, latitude, longitude,
    business_hours, closed_days, specialties, established_year,
    owner_name, owner_message, access_info, parking_info,
    experience_programs, online_sales, rating, review_count, featured,
    additional_images, social_instagram, social_twitter
) VALUES 
(
    '松風盆栽園',
    '東京都豊島区池袋2-45-12',
    '創業60年の伝統ある盆栽園です。特に黒松と赤松を得意とし、初心者から上級者まで幅広く対応いたします。月に一度の盆栽教室も開催しており、基礎から丁寧に指導いたします。',
    'https://example.com/matsukaze_main.jpg',
    'https://matsukaze-bonsai.com',
    '03-1234-5678',
    '東京都', '豊島区', '170-0014', 35.7295, 139.7096,
    '平日 9:00-18:00 / 土日 9:00-17:00', 
    '["火曜日", "年末年始"]'::jsonb,
    '["松類", "古典盆栽", "初心者向け"]'::jsonb,
    1964,
    '田中一郎',
    '盆栽の魅力は、小さな鉢の中に大自然の美しさを表現できることです。一緒に盆栽の世界を楽しみましょう。',
    'JR池袋駅東口より徒歩8分。東京メトロ有楽町線東池袋駅より徒歩5分。',
    '店舗前に2台分の駐車スペースあり（要予約）',
    true, false, 4.6, 127, true,
    '["https://example.com/matsukaze_1.jpg", "https://example.com/matsukaze_2.jpg"]'::jsonb,
    'https://instagram.com/matsukaze_bonsai',
    'https://twitter.com/matsukaze_bonsai'
),
(
    '花桜園',
    '京都府京都市右京区嵯峨天龍寺芒ノ馬場町3-5',
    '京都嵯峨野に位置する花木専門の盆栽園。特に桜、梅、ツツジなどの花物盆栽を専門としています。季節ごとの美しい花を楽しめる盆栽を多数取り揃えております。',
    'https://example.com/kasagi_main.jpg',
    'https://kasagi-bonsai.kyoto',
    '075-111-2222',
    '京都府', '京都市右京区', '616-8385', 35.0158, 135.6706,
    '9:00-17:00', 
    '["月曜日", "祝日"]'::jsonb,
    '["花木", "現代盆栽"]'::jsonb,
    1952,
    '山田花子',
    '花物盆栽の美しさは、四季折々に見せる表情の変化にあります。お客様に最適な一鉢をご提案いたします。',
    'JR嵯峨嵐山駅より徒歩12分。阪急嵐山線嵐山駅より徒歩15分。',
    '近隣にコインパーキングあり',
    true, true, 4.8, 89, true,
    '["https://example.com/kasagi_1.jpg", "https://example.com/kasagi_2.jpg"]'::jsonb,
    'https://instagram.com/kasagi_bonsai',
    null
),
(
    'みどり盆栽工房',
    '埼玉県さいたま市北区盆栽町2-136',
    '大宮の盆栽村に位置する現代的な盆栽園。伝統的な技法を大切にしながらも、現代のライフスタイルに合う盆栽を提案しています。オンラインショップも充実。',
    'https://example.com/midori_main.jpg',
    'https://midori-bonsai.com',
    '048-123-4567',
    '埼玉県', 'さいたま市北区', '331-0804', 35.9312, 139.6226,
    '10:00-18:00', 
    '["水曜日"]'::jsonb,
    '["落葉樹", "現代盆栽", "初心者向け"]'::jsonb,
    1998,
    '鈴木太郎',
    '盆栽は難しいものではありません。現代の住環境に合わせた盆栽ライフをサポートします。',
    'JR宇都宮線土呂駅より徒歩5分。大宮盆栽美術館すぐそば。',
    '専用駐車場5台完備',
    true, true, 4.4, 203, false,
    '["https://example.com/midori_1.jpg"]'::jsonb,
    'https://instagram.com/midori_koubou',
    'https://twitter.com/midori_bonsai'
),
(
    '山野草の里',
    '長野県諏訪市湖岸通り4-8-15',
    '諏訪湖畔の自然豊かな環境で、山野草を中心とした盆栽を育てています。地元の山から採取した自然な山野草を使った作品が自慢です。',
    'https://example.com/yamano_main.jpg',
    'https://yamano-sato.com',
    '0266-55-7788',
    '長野県', '諏訪市', '392-0027', 36.0444, 138.1147,
    '9:00-16:00', 
    '["木曜日", "冬期休業（12-2月）"]'::jsonb,
    '["山野草", "上級者向け"]'::jsonb,
    1981,
    '佐藤みどり',
    '山野草の持つ自然の美しさを盆栽で表現しています。四季を通じて楽しめる山野草の魅力をお伝えします。',
    'JR中央本線上諏訪駅よりタクシー10分。中央自動車道諏訪ICより車で15分。',
    '無料駐車場10台完備',
    false, false, 4.2, 34, false,
    '[]'::jsonb,
    null,
    null
),
(
    'ツール＆ポット専門店 匠',
    '愛知県名古屋市中区栄3-2-8',
    '盆栽道具と盆器の専門店です。国内外の優れた盆栽鋏、針金、肥料から、作家物の盆器まで幅広く取り扱っています。道具選びのご相談もお気軽に。',
    'https://example.com/takumi_main.jpg',
    'https://takumi-tools.com',
    '052-222-3333',
    '愛知県', '名古屋市中区', '460-0008', 35.1681, 136.9066,
    '平日 10:00-19:00 / 土日 10:00-18:00', 
    '["月曜日"]'::jsonb,
    '["道具", "盆器"]'::jsonb,
    2001,
    '高橋職人',
    '良い道具は良い盆栽を作ります。お客様の技術レベルに合った最適な道具をご提案いたします。',
    '地下鉄栄駅より徒歩3分。名鉄栄町駅より徒歩5分。',
    '近隣のコインパーキングをご利用ください',
    false, true, 4.7, 156, false,
    '["https://example.com/takumi_1.jpg", "https://example.com/takumi_2.jpg"]'::jsonb,
    'https://instagram.com/takumi_tools',
    null
);

-- Update some existing gardens if any exist (sample update)
-- UPDATE gardens SET 
--     prefecture = '東京都',
--     specialties = '["松類", "初心者向け"]'::jsonb,
--     featured = true
-- WHERE name LIKE '%sample%' OR name LIKE '%test%';

-- Verify the inserted data
SELECT 
    name,
    prefecture,
    specialties,
    rating,
    featured,
    experience_programs,
    online_sales
FROM gardens 
ORDER BY created_at DESC;