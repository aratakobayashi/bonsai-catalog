-- 商品テーブルにseason（季節）とlocation（置き場所）カラムを追加

-- season カラムを追加（春、夏、秋、冬、四季）
ALTER TABLE products 
ADD COLUMN season VARCHAR(20) DEFAULT NULL;

-- location カラムを追加（室内、屋外、半日陰）
ALTER TABLE products 
ADD COLUMN location VARCHAR(20) DEFAULT NULL;

-- インデックスを追加してフィルタリングを高速化
CREATE INDEX idx_products_season ON products(season);
CREATE INDEX idx_products_location ON products(location);

-- 確認用のクエリ
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;