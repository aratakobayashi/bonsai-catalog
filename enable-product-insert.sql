-- 商品自動登録を有効にするためのRLSポリシー追加

-- 1. 匿名ユーザーによるproductsテーブルへのINSERT権限を追加
CREATE POLICY "Allow public insert on products" ON products
    FOR INSERT WITH CHECK (true);

-- 2. 匿名ユーザーにINSERT権限を付与
GRANT INSERT ON products TO anon;

-- 3. 確認用クエリ
-- SELECT * FROM pg_policies WHERE tablename = 'products';