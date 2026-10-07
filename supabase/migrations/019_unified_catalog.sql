-- 019: Amazon と楽天の商品を1つの products テーブルで扱うための拡張
-- Supabase の SQL Editor で、このファイルの内容をそのまま実行してください（何度実行しても安全です）

-- 楽天の商品は Amazon の URL を持たないため必須を外す
ALTER TABLE products ALTER COLUMN amazon_url DROP NOT NULL;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'amazon',      -- amazon / rakuten
  ADD COLUMN IF NOT EXISTS rakuten_url TEXT,                            -- 楽天アフィリエイトURL
  ADD COLUMN IF NOT EXISTS external_id TEXT,                            -- 楽天の itemCode
  ADD COLUMN IF NOT EXISTS shop_name TEXT,
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'tree',   -- tree / kokedama / pot / soil / tool / wire / fertilizer / seed / other
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_average NUMERIC(3, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN,
  ADD COLUMN IF NOT EXISTS affiliate_rate NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,     -- 販売終了などで同期に出てこなくなったら false
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_category TEXT;                          -- 取得元のカテゴリ（src/lib/shop-categories.ts の slug）

-- 同じ楽天の商品を重複登録しないための一意制約（external_id が NULL の Amazon 商品は対象外）
CREATE UNIQUE INDEX IF NOT EXISTS products_source_external_id_key ON products (source, external_id);
CREATE INDEX IF NOT EXISTS idx_products_source ON products (source);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active);

-- 誰でも（公開キーで）商品を追加・削除できる設定が残っていれば削除する。
-- 書き込みはサーバー側の秘密キー（service role）だけで行う
DROP POLICY IF EXISTS "Allow public insert on products" ON products;
DROP POLICY IF EXISTS "Temporary delete policy for cleanup" ON products;
REVOKE INSERT, UPDATE, DELETE ON products FROM anon;
