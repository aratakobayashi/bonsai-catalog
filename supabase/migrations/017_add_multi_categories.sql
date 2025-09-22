-- マルチカテゴリー対応のためのマイグレーション

-- 1. articlesテーブルにcategoriesカラムを追加
ALTER TABLE articles ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]';

-- 2. 既存の重複カテゴリーを削除（重複データのクリーンアップ）
DELETE FROM article_categories
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
    FROM article_categories
  ) t WHERE t.rn > 1
);

-- 3. 新しい9カテゴリーシステムでカテゴリーを再作成
DELETE FROM article_categories;

INSERT INTO article_categories (id, name, slug, description, color, icon) VALUES
  ('11111111-1111-1111-1111-111111111111', 'はじめての盆栽', 'beginner', '初心者向けの基本知識、選び方、入門ガイド', 'bg-green-100 text-green-800', '🌱'),
  ('22222222-2222-2222-2222-222222222222', '科学的管理法', 'scientific', '水分生理学、微生物、ホルモン制御など高度な技術', 'bg-purple-100 text-purple-800', '🧪'),
  ('33333333-3333-3333-3333-333333333333', '樹種別ガイド', 'species', '各樹種の詳細な育成法と特性解説', 'bg-emerald-100 text-emerald-800', '🌲'),
  ('44444444-4444-4444-4444-444444444444', '基本のお手入れ', 'basic-care', '水やり、剪定、植え替えなど日常管理', 'bg-blue-100 text-blue-800', '⚒️'),
  ('55555555-5555-5555-5555-555555555555', '国際・文化', 'international', '盆栽外交、各国事情、歴史・文化比較', 'bg-indigo-100 text-indigo-800', '🌍'),
  ('66666666-6666-6666-6666-666666666666', 'イベント・コミュニティ', 'events', '展示会、クラブ活動、コンテスト情報', 'bg-pink-100 text-pink-800', '🎪'),
  ('77777777-7777-7777-7777-777777777777', '購入・体験ガイド', 'shopping', '園芸店比較、体験プログラム、道具選び', 'bg-yellow-100 text-yellow-800', '🛒'),
  ('88888888-8888-8888-8888-888888888888', '楽しみ方', 'enjoyment', '撮影テクニック、茶道との融合、鑑賞方法', 'bg-orange-100 text-orange-800', '📸'),
  ('99999999-9999-9999-9999-999999999999', 'トラブル解決', 'troubleshooting', '日当たり悪い場所、室内栽培、病害虫対策', 'bg-red-100 text-red-800', '🔧')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon;

-- 4. 既存記事のcategory_idをデフォルトカテゴリーに設定（データが存在しない場合）
UPDATE articles
SET category_id = '11111111-1111-1111-1111-111111111111'
WHERE category_id IS NULL OR category_id = '';

-- 5. 既存記事のcategoriesフィールドを初期化（後で手動で設定）
UPDATE articles
SET categories = CASE
  WHEN category_id = '11111111-1111-1111-1111-111111111111' THEN '["beginner"]'::jsonb
  WHEN category_id = '22222222-2222-2222-2222-222222222222' THEN '["scientific"]'::jsonb
  WHEN category_id = '33333333-3333-3333-3333-333333333333' THEN '["species"]'::jsonb
  WHEN category_id = '44444444-4444-4444-4444-444444444444' THEN '["basic-care"]'::jsonb
  WHEN category_id = '55555555-5555-5555-5555-555555555555' THEN '["international"]'::jsonb
  WHEN category_id = '66666666-6666-6666-6666-666666666666' THEN '["events"]'::jsonb
  WHEN category_id = '77777777-7777-7777-7777-777777777777' THEN '["shopping"]'::jsonb
  WHEN category_id = '88888888-8888-8888-8888-888888888888' THEN '["enjoyment"]'::jsonb
  WHEN category_id = '99999999-9999-9999-9999-999999999999' THEN '["troubleshooting"]'::jsonb
  ELSE '["beginner"]'::jsonb
END
WHERE categories = '[]'::jsonb OR categories IS NULL;

-- 6. インデックスを追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_articles_categories ON articles USING GIN (categories);