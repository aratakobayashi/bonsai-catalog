-- 🗑️ テストデータ削除クエリ（Supabaseダッシュボード用）
-- 2025/9/5に作成された8件のテストデータを削除します

-- 削除前確認：対象データを表示
SELECT 
  id, 
  name, 
  category, 
  price, 
  created_at::date as 作成日
FROM products 
WHERE created_at::date = '2025-09-05'
ORDER BY name;

-- 上記で8件表示されることを確認してから、以下を実行：

-- ⚠️ 削除実行（8件のテストデータ）
DELETE FROM products 
WHERE created_at::date = '2025-09-05';

-- 削除後確認：残存データを表示
SELECT 
  id, 
  name, 
  category, 
  price, 
  created_at::date as 作成日
FROM products 
ORDER BY created_at;

-- 期待結果：2件（五葉松 小品盆栽、山もみじの盆栽）