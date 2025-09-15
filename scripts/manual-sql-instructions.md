# Supabaseダッシュボードで実行するSQL

以下のSQL文をSupabaseダッシュボードのSQL Editorで順番に実行してください：

## 1. 記事カテゴリーテーブル作成

```sql
CREATE TABLE IF NOT EXISTS article_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(100),
  icon VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. 記事タグテーブル作成

```sql
CREATE TABLE IF NOT EXISTS article_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  color VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. 記事テーブル作成

```sql
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url VARCHAR(500),
  featured_image_alt VARCHAR(255),
  category_id UUID NOT NULL REFERENCES article_categories(id) ON DELETE RESTRICT,
  tag_ids UUID[] DEFAULT '{}',
  related_product_ids VARCHAR(255)[] DEFAULT '{}',
  seo_title VARCHAR(500),
  seo_description VARCHAR(500),
  reading_time INTEGER,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. インデックス作成

```sql
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_article_categories_slug ON article_categories(slug);
CREATE INDEX IF NOT EXISTS idx_article_tags_slug ON article_tags(slug);
```

## 5. updated_at自動更新関数とトリガー

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_categories_updated_at
    BEFORE UPDATE ON article_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_tags_updated_at
    BEFORE UPDATE ON article_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 6. RLS (Row Level Security) 設定

```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles are readable by everyone" ON articles FOR SELECT USING (true);
CREATE POLICY "Article categories are readable by everyone" ON article_categories FOR SELECT USING (true);
CREATE POLICY "Article tags are readable by everyone" ON article_tags FOR SELECT USING (true);

CREATE POLICY "Articles are manageable by authenticated users" ON articles
  FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Article categories are manageable by authenticated users" ON article_categories
  FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Article tags are manageable by authenticated users" ON article_tags
  FOR ALL USING (auth.uid() IS NOT NULL);
```

## 7. 初期カテゴリーデータ挿入

```sql
INSERT INTO article_categories (id, name, slug, description, color, icon) VALUES
  ('11111111-1111-1111-1111-111111111111', 'お手入れ・管理', 'care-bonsai', '盆栽の日常管理、水やり、剪定等の育て方ガイド', 'bg-green-100 text-green-800', '🌱'),
  ('22222222-2222-2222-2222-222222222222', 'はじめての盆栽', 'start-guide', '初心者向けの樹種選びや購入のポイント', 'bg-blue-100 text-blue-800', '🎯'),
  ('33333333-3333-3333-3333-333333333333', '種類別ガイド', 'kinds', '松柏類、雑木類、花もの等の種類別詳細ガイド', 'bg-emerald-100 text-emerald-800', '🌲'),
  ('44444444-4444-4444-4444-444444444444', 'イベント・展示', 'info', '盆栽展示会やイベント情報', 'bg-purple-100 text-purple-800', '🎪'),
  ('55555555-5555-5555-5555-555555555555', '道具・鉢の選び方', 'select', '盆栽道具や鉢の選び方ガイド', 'bg-yellow-100 text-yellow-800', '🛠️')
ON CONFLICT (slug) DO NOTHING;
```

## 8. 初期タグデータ挿入

```sql
INSERT INTO article_tags (name, slug, color) VALUES
  ('初心者', 'beginner', 'bg-blue-50 text-blue-700'),
  ('中級者', 'intermediate', 'bg-yellow-50 text-yellow-700'),
  ('上級者', 'advanced', 'bg-red-50 text-red-700'),
  ('もみじ', 'maple', 'bg-orange-50 text-orange-700'),
  ('松', 'pine', 'bg-green-50 text-green-700'),
  ('桜', 'sakura', 'bg-pink-50 text-pink-700'),
  ('水やり', 'watering', 'bg-cyan-50 text-cyan-700'),
  ('剪定', 'pruning', 'bg-lime-50 text-lime-700'),
  ('植え替え', 'repotting', 'bg-amber-50 text-amber-700'),
  ('肥料', 'fertilizer', 'bg-emerald-50 text-emerald-700'),
  ('病害虫', 'pest-disease', 'bg-rose-50 text-rose-700'),
  ('開花', 'flowering', 'bg-purple-50 text-purple-700'),
  ('紅葉', 'autumn-leaves', 'bg-orange-50 text-orange-700'),
  ('実もの', 'fruit-bearing', 'bg-red-50 text-red-700'),
  ('花もの', 'flowering-tree', 'bg-pink-50 text-pink-700'),
  ('雑木類', 'deciduous', 'bg-green-50 text-green-700'),
  ('松柏類', 'coniferous', 'bg-teal-50 text-teal-700'),
  ('年間管理', 'annual-care', 'bg-indigo-50 text-indigo-700'),
  ('道具', 'tools', 'bg-gray-50 text-gray-700'),
  ('鉢', 'pot', 'bg-stone-50 text-stone-700')
ON CONFLICT (slug) DO NOTHING;
```

## 実行手順

1. Supabaseダッシュボードにアクセス: https://supabase.com/dashboard/project/ptbowbqrykqwxuzivbdv
2. 左サイドバーから「SQL Editor」をクリック
3. 上記のSQL文を順番に実行（1つずつ、またはすべてまとめて）
4. 完了後、記事マイグレーションスクリプトを再実行

すべてのSQL文が成功したら、`npx tsx scripts/migrate-to-database.ts` を再実行してください。