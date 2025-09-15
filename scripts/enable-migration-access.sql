-- 一時的にマイグレーション用のRLSポリシーを追加
-- このスクリプトをSupabaseダッシュボードで実行してください

-- 既存のポリシーを削除（一時的）
DROP POLICY IF EXISTS "Articles are manageable by authenticated users" ON articles;
DROP POLICY IF EXISTS "Article categories are manageable by authenticated users" ON article_categories;
DROP POLICY IF EXISTS "Article tags are manageable by authenticated users" ON article_tags;

-- 一時的にすべてのユーザーが挿入・更新・削除可能にする
CREATE POLICY "Temporary migration access for articles" ON articles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Temporary migration access for categories" ON article_categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Temporary migration access for tags" ON article_tags
  FOR ALL USING (true) WITH CHECK (true);