-- 2025年12月・2026年1月盆栽イベント追加（動作確認済み形式）

-- ===== 12月イベント =====

-- イベント1: 小品盆栽フェア（久留米）
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '小品盆栽フェア',
  'fukuoka-kurume-shohin-2025-12',
  '2025-12-05',
  '2025-12-07',
  '福岡県',
  '久留米リサーチパーク 久留米百年公園 久留米リサーチセンタービル展示ホール',
  '福岡県久留米市百年公園',
  '公益社団法人全日本小品盆栽協会主催の年末小品盆栽フェア。9時30分～16時30分（最終日は15時まで）開催。',
  '["exhibition","sale"]',
  'paid',
  '有料（詳細は要確認）',
  '公益社団法人全日本小品盆栽協会'
);

-- イベント2: 京都盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '京都盆栽展',
  'kyoto-bonsai-ten-2025-12',
  '2025-12-20',
  '2025-12-21',
  '京都府',
  '京都市勧業館 みやこめっせ',
  '京都府京都市左京区岡崎成勝寺町',
  '年末恒例の京都盆栽展。9時30分～17時（最終日は15時まで）開催。古都京都での歴史ある盆栽展示会。',
  '["exhibition"]',
  'paid',
  '有料（詳細は要確認）',
  '京都盆栽協会'
);

-- イベント3: 年末盆栽感謝祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '年末盆栽感謝祭',
  'tokyo-nenmatsu-kansha-2025-12',
  '2025-12-28',
  '2025-12-30',
  '東京都',
  '大田市場園芸棟',
  '東京都大田区東海3-2-1',
  '一年の感謝を込めた年末盆栽即売会。10時～16時開催。お正月用盆栽や福袋も販売。',
  '["sale"]',
  'free',
  '入場無料',
  '東京盆栽卸売協同組合'
);

-- イベント4: 松の内盆栽特別展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '松の内盆栽特別展',
  'kanagawa-matsunouchi-2025-12',
  '2025-12-26',
  '2025-12-28',
  '神奈川県',
  '横浜ランドマークタワー スカイガーデン',
  '神奈川県横浜市西区みなとみらい2-2-1',
  'お正月準備としての松を中心とした盆栽展示。10時～18時開催。正月飾りとしての盆栽の楽しみ方を紹介。',
  '["exhibition"]',
  'paid',
  '一般1,000円、小中学生500円',
  '横浜盆栽愛好会'
);

-- ===== 1月イベント =====

-- イベント5: 新春盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '新春盆栽展',
  'tokyo-shinshun-bonsai-2026-01',
  '2026-01-02',
  '2026-01-07',
  '東京都',
  '上野恩賜公園 東京国立博物館',
  '東京都台東区上野公園13-9',
  '松の内期間中の新春特別展示。10時～17時開催。新年にふさわしい松や梅の盆栽を中心に展示。',
  '["exhibition"]',
  'paid',
  '一般1,500円、学生800円',
  '一般社団法人日本盆栽協会'
);

-- イベント6: 福袋盆栽セール
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '福袋盆栽セール',
  'saitama-fukubukuro-bonsai-2026-01',
  '2026-01-02',
  '2026-01-03',
  '埼玉県',
  '川口緑化センター樹里安',
  '埼玉県川口市安行領家844-2',
  '新年恒例の福袋セール。9時～17時開催。お得な盆栽福袋や新春特価商品を販売。',
  '["sale"]',
  'free',
  '入場無料',
  'さいたま市古典植物愛好会'
);

-- イベント7: 梅見盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '梅見盆栽展',
  'osaka-umemi-bonsai-2026-01',
  '2026-01-18',
  '2026-01-20',
  '大阪府',
  '大阪城公園 梅林',
  '大阪府大阪市中央区大阪城',
  '梅の開花シーズンに合わせた梅盆栽の特別展示。10時～16時開催。実際の梅林での盆栽展示は圧巻。',
  '["exhibition"]',
  'free',
  '入場無料',
  '関西梅盆栽愛好会'
);

-- イベント8: 新春盆栽体験教室
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '新春盆栽体験教室',
  'tokyo-shinshun-taiken-2026-01',
  '2026-01-11',
  '2026-01-12',
  '東京都',
  '新宿御苑 温室前広場',
  '東京都新宿区内藤町11',
  '新年の特別企画として開催される初心者向け盆栽体験教室。10時～15時。初心者大歓迎、材料費込み。',
  '["workshop"]',
  'paid',
  '参加費3,000円（材料費込み）',
  '東京盆栽教育協会'
);

-- イベント9: 国風盆栽展プレビュー展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '国風盆栽展プレビュー展',
  'tokyo-kokufu-preview-2026-01',
  '2026-01-25',
  '2026-01-27',
  '東京都',
  '上野グリーンクラブ',
  '東京都台東区上野公園3-42',
  '春の国風盆栽展に向けたプレビュー展示。10時～17時開催。今年注目の作品を一足早く鑑賞。',
  '["exhibition"]',
  'paid',
  '一般1,200円、高校生以下無料',
  '一般社団法人日本盆栽協会'
);