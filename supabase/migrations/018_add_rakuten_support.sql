-- 楽天商品サポート追加
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS rakuten_url TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'amazon';

-- sourceカラムのインデックス
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);

COMMENT ON COLUMN products.rakuten_url IS '楽天アフィリエイトURL';
COMMENT ON COLUMN products.source IS '商品ソース: amazon / rakuten';
