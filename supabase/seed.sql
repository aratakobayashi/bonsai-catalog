-- Insert sample gardens
INSERT INTO gardens (id, name, address, description, image_url, website_url, phone) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    '東京盆栽園',
    '東京都世田谷区深沢1-2-3',
    '創業50年の老舗盆栽園。初心者から上級者まで幅広く対応し、丁寧な育て方指導も行っております。四季折々の美しい盆栽を取り揃えています。',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    'https://example-bonsai-garden.com',
    '03-1234-5678'
),
(
    '550e8400-e29b-41d4-a716-446655440002', 
    '京都和風盆栽',
    '京都府京都市右京区嵯峨野1-4-5',
    '京都の伝統を受け継ぐ盆栽園。特に松や楓の盆栽に定評があり、和の美しさを追求した作品を多数展示販売しています。',
    'https://images.unsplash.com/photo-1580561205311-b2af6ea3f2ba?w=800',
    'https://kyoto-bonsai.com',
    '075-987-6543'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '大阪緑樹園',
    '大阪府大阪市住吉区長居1-6-7', 
    '関西最大級の盆栽専門店。豊富な品揃えと手頃な価格で、盆栽愛好家から高い支持を得ています。定期的に盆栽教室も開催中。',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
    'https://osaka-ryokujuen.com',
    '06-2345-6789'
);

-- Insert sample products
INSERT INTO products (id, name, description, price, category, tags, size_category, image_url, amazon_url) VALUES
(
    '650e8400-e29b-41d4-a716-446655440001',
    '黒松の小品盆栽',
    '樹齢約15年の黒松盆栽です。丁寧に手入れされた美しい樹形で、初心者の方にもおすすめです。鉢は信楽焼の上品な茶色で、和室にも洋室にも合います。',
    12000,
    '松類',
    '["初心者向け", "和風", "常緑"]',
    'small',
    'https://m.media-amazon.com/images/I/71abc123def.jpg',
    'https://www.amazon.co.jp/dp/B08EXAMPLE1'
),
(
    '650e8400-e29b-41d4-a716-446655440002',
    'もみじ盆栽（紅葉）',
    '秋には美しい紅葉が楽しめるもみじの盆栽です。春の新緑から秋の紅葉まで四季を通じて変化を楽しめます。樹高約20cmの手頃なサイズです。',
    18500,
    '落葉樹',
    '["紅葉", "四季", "中級者向け"]',
    'medium',
    'https://m.media-amazon.com/images/I/81def456ghi.jpg', 
    'https://www.amazon.co.jp/dp/B08EXAMPLE2'
),
(
    '650e8400-e29b-41d4-a716-446655440003',
    'さくらんぼ盆栽',
    '春には可愛らしい桜の花を咲かせ、夏には小さな実をつけるさくらんぼの盆栽です。花と実の両方を楽しめる人気の品種です。',
    25000,
    '花木',
    '["花", "実", "春", "人気"]',
    'medium',
    'https://m.media-amazon.com/images/I/91ghi789jkl.jpg',
    'https://www.amazon.co.jp/dp/B08EXAMPLE3'
),
(
    '650e8400-e29b-41d4-a716-446655440004',
    'ミニ真柏盆栽セット',
    '手のひらサイズの可愛い真柏盆栽です。育成キットと説明書付きで、盆栽を始めたい方にピッタリ。オフィスのデスクにも置けるコンパクトサイズです。',
    3800,
    '針葉樹',
    '["ミニ", "初心者", "セット", "オフィス"]',
    'mini',
    'https://m.media-amazon.com/images/I/61jkl012mno.jpg',
    'https://www.amazon.co.jp/dp/B08EXAMPLE4'
),
(
    '650e8400-e29b-41d4-a716-446655440005',
    '欅（ケヤキ）大型盆栽',
    '樹齢30年を超える立派な欅の盆栽です。雄大な樹形と美しい幹肌が魅力的。上級者向けの本格的な作品で、玄関や床の間に最適です。',
    85000,
    '落葉樹',
    '["上級者", "大型", "格式", "玄関"]',
    'large',
    'https://m.media-amazon.com/images/I/71mno345pqr.jpg',
    'https://www.amazon.co.jp/dp/B08EXAMPLE5'
),
(
    '650e8400-e29b-41d4-a716-446655440006', 
    '五葉松盆栽',
    '気品ある五葉松の盆栽です。針葉が短く密生し、優雅な樹形を持っています。松の中でも特に人気が高く、贈り物にも最適です。',
    42000,
    '松類',
    '["高級", "贈り物", "優雅", "人気"]',
    'medium',
    'https://m.media-amazon.com/images/I/81pqr678stu.jpg',
    'https://www.amazon.co.jp/dp/B08EXAMPLE6'
),
(
    '650e8400-e29b-41d4-a716-446655440007',
    'つつじ花盆栽',
    '春に美しいピンクの花を咲かせるつつじの盆栽です。開花期間が長く、花付きも良好。初心者でも比較的育てやすい品種です。',
    15800,
    '花木',
    '["花", "ピンク", "春", "育てやすい"]',
    'small',
    'https://m.media-amazon.com/images/I/71stu901vwx.jpg',
    'https://www.amazon.co.jp/dp/B08EXAMPLE7'
),
(
    '650e8400-e29b-41d4-a716-446655440008',
    'イチョウ盆栽',
    '秋には見事な黄葉を見せるイチョウの盆栽です。扇形の葉が特徴的で、樹形も美しく整っています。長寿の象徴として縁起の良い樹種です。',
    32000,
    '落葉樹',
    '["黄葉", "秋", "縁起", "特徴的"]',
    'medium',
    'https://m.media-amazon.com/images/I/91vwx234yzb.jpg',
    'https://www.amazon.co.jp/dp/B08EXAMPLE8'
);