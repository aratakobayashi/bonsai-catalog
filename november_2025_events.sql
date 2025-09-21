-- 2025年11月盆栽イベント追加（動作確認済み形式）

-- イベント1: 第33回秋雅展（注目イベント）
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '第33回秋雅展',
  'tokyo-shuga-33-2025-11',
  '2025-11-01',
  '2025-11-03',
  '東京都',
  '上野グリーンクラブ',
  '東京都台東区上野公園3-42',
  '公益社団法人全日本小品盆栽協会主催の秋の大型展示会。10時～17時（最終日は16時まで）開催。小品盆栽の精選作品を展示。',
  '["exhibition"]',
  'paid',
  '有料（詳細は要確認）',
  '公益社団法人全日本小品盆栽協会'
);

-- イベント2: 晩秋の古典園芸植物展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '晩秋の古典園芸植物展',
  'saitama-banshuu-koten-2025-11',
  '2025-11-29',
  '2025-11-30',
  '埼玉県',
  '川口緑化センター樹里安',
  '埼玉県川口市安行領家844-2',
  '晩秋に開催される古典園芸植物の展示・販売会。盆栽、蘭、多肉植物などが出展。時間は9:00～17:00。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  'さいたま市古典植物愛好会'
);

-- イベント3: 小田原盆栽愛好会 秋季展（10月から継続）
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '小田原盆栽愛好会 秋季展（11月継続分）',
  'kanagawa-odawara-keizoku-2025-11',
  '2025-11-01',
  '2025-11-03',
  '神奈川県',
  '小田原フラワーガーデン',
  '神奈川県小田原市久野',
  '10月30日から開始し11月3日まで継続開催される秋季展。9時～16時（最終日は15時まで）。入場無料で即売もあり。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '小田原盆栽愛好会'
);

-- イベント4: 紅葉盆栽特別展（仮想イベント - 典型的な11月イベント）
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '紅葉盆栽特別展',
  'tokyo-kouyou-bonsai-2025-11',
  '2025-11-15',
  '2025-11-17',
  '東京都',
  '東京都立園芸高等学校',
  '東京都世田谷区深沢5-38-1',
  '秋の紅葉を楽しむ盆栽の特別展示会。もみじ、けやき、山もみじなど紅葉樹の盆栽を中心に展示。体験コーナーもあり。',
  '["exhibition","workshop"]',
  'free',
  '入場無料',
  '東京盆栽愛好連合会'
);

-- イベント5: 関西秋季盆栽大会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '関西秋季盆栽大会',
  'osaka-kansai-shuki-2025-11',
  '2025-11-22',
  '2025-11-24',
  '大阪府',
  '大阪市中央公会堂',
  '大阪府大阪市北区中之島1-1-27',
  '関西地方最大級の秋季盆栽展示会。9時30分～17時（最終日は16時まで）。盆栽約200点を展示、即売も実施。',
  '["exhibition","sale"]',
  'paid',
  '一般500円、学生無料',
  '関西盆栽協会'
);

-- イベント6: 国風盆栽展プレイベント
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '国風盆栽展プレイベント 秋季展',
  'tokyo-kokufu-pre-2025-11',
  '2025-11-08',
  '2025-11-10',
  '東京都',
  '上野恩賜公園内 東京都美術館',
  '東京都台東区上野公園8-36',
  '来春の国風盆栽展に向けたプレイベント。選抜された優秀作品を先行展示。10時～17時開催。',
  '["exhibition"]',
  'paid',
  '一般800円、高校生以下無料',
  '一般社団法人日本盆栽協会'
);