-- マイグレーション後に本番用のRLSポリシーを復元
-- マイグレーション完了後にこのスクリプトをSupabaseダッシュボードで実行してください

-- 一時的なポリシーを削除
DROP POLICY IF EXISTS "Temporary migration access for articles" ON articles;
DROP POLICY IF EXISTS "Temporary migration access for categories" ON article_categories;
DROP POLICY IF EXISTS "Temporary migration access for tags" ON article_tags;

-- 本番用のポリシーを復元
CREATE POLICY "Articles are manageable by authenticated users" ON articles
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Article categories are manageable by authenticated users" ON article_categories
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Article tags are manageable by authenticated users" ON article_tags
  FOR ALL USING (auth.uid() IS NOT NULL);