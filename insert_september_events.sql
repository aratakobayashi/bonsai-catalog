-- ===========================================
-- 2025年9月盆栽イベント追加用SQL
-- EVENT_DATA_MANAGEMENT.md準拠
-- ===========================================

-- 事前チェック：重複確認
SELECT title, venue_name, start_date
FROM events
WHERE title LIKE '%古典園芸%' OR venue_name LIKE '%川口緑化%';

-- メインイベント追加
INSERT INTO events (
  -- 必須項目
  title, slug, start_date, end_date, prefecture,
  types, price_type,

  -- 推奨項目
  venue_name, address, description,
  price_note, organizer_name,

  -- オプション項目
  official_url, garden_id, lat, lng,
  related_product_tags,

  -- システム項目
  created_at, updated_at
) VALUES (
  '秋の古典園芸植物展',
  'saitama-koten-engei-2025-09',
  '2025-09-20',
  '2025-09-21',
  '埼玉県',
  ARRAY['exhibition', 'sale'],
  'free',

  '川口緑化センター樹里安',
  '埼玉県川口市安行領家844-2',
  '蘭や盆栽、カンアオイ、万年青、ギボウシ、多肉植物などの古典園芸植物の展示・販売を行います。時間は9:00～17:00です。',
  '入場無料',
  'さいたま市古典植物愛好会',

  NULL,
  NULL,
  35.8236,
  139.7186,
  ARRAY['古典植物', '盆栽', '蘭', '多肉植物'],

  now(),
  now()
);

-- データ整合性チェック
SELECT title, venue_name, start_date, prefecture, types
FROM events
WHERE start_date >= '2025-09-01' AND start_date < '2025-10-01'
ORDER BY start_date;

-- 重複チェック
SELECT title, venue_name, start_date, COUNT(*)
FROM events
WHERE start_date >= '2025-09-20' AND start_date <= '2025-09-21'
GROUP BY title, venue_name, start_date
HAVING COUNT(*) > 1;