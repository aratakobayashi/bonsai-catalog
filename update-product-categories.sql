-- 商品カテゴリを新しい分類に更新するSQL
-- 実行前に必ずバックアップを取ってください

-- 1. 現在のカテゴリ分布を確認
SELECT category, COUNT(*) as count 
FROM products 
GROUP BY category 
ORDER BY category;

-- 2. カテゴリを新分類に更新
BEGIN;

-- 松類 → 松柏類
UPDATE products 
SET category = '松柏類',
    updated_at = NOW()
WHERE category = '松類';

-- 針葉樹 → 松柏類（松柏類に統合）
UPDATE products 
SET category = '松柏類',
    updated_at = NOW()
WHERE category = '針葉樹';

-- 落葉樹 → 雑木類
UPDATE products 
SET category = '雑木類',
    updated_at = NOW()
WHERE category = '落葉樹';

-- 花木 → 花もの
UPDATE products 
SET category = '花もの',
    updated_at = NOW()
WHERE category = '花木';

-- その他のカテゴリがある場合は草ものに分類
UPDATE products 
SET category = '草もの',
    updated_at = NOW()
WHERE category NOT IN ('松柏類', '雑木類', '花もの', '実もの', '草もの');

COMMIT;

-- 3. 更新後のカテゴリ分布を確認
SELECT category, COUNT(*) as count 
FROM products 
GROUP BY category 
ORDER BY category;

-- 4. 商品の具体例を確認（各カテゴリから3件ずつ）
SELECT category, name, price 
FROM products 
WHERE category = '松柏類' 
LIMIT 3;

SELECT category, name, price 
FROM products 
WHERE category = '雑木類' 
LIMIT 3;

SELECT category, name, price 
FROM products 
WHERE category = '花もの' 
LIMIT 3;

SELECT category, name, price 
FROM products 
WHERE category = '実もの' 
LIMIT 3;

SELECT category, name, price 
FROM products 
WHERE category = '草もの' 
LIMIT 3;