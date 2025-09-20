# 新規記事作成完全ガイド

## 🚨 作業開始前の必読事項

### アーキテクチャの理解
- **記事データソース**: Supabaseデータベースのarticlesテーブル
- **Markdownファイルの役割**: 参考・バックアップのみ（表示には使用されない）
- **読み込み処理**: `src/lib/database/articles.ts`の`getArticleBySlug`関数

### 画像管理体系
```
アイキャッチ画像: /images/articles/article-XX-img-1.png (ユーザー提供)
商品画像: Amazon商品画像URL (データベース管理)
```

## 📝 新規記事作成手順

### 1. 事前確認
- [ ] 記事スラッグの決定 (例: article-45, article-46...)
- [ ] 関連商品のSupabase product IDsの特定
- [ ] アイキャッチ画像ファイルの準備確認

### 2. 記事内容作成
```markdown
# 記事構成テンプレート
## はじめに
## 基本的な特徴・魅力
## 育て方・管理方法
## おすすめ商品紹介 (Amazon商品画像付き)
## まとめ
```

### 3. 商品画像の取得方法
```javascript
// 商品IDから画像URLを取得
const { data } = await supabase
  .from('products')
  .select('id, name, price, image_url')
  .in('id', ['商品ID1', '商品ID2', ...]);

// 記事内で使用するマークダウン形式
![商品名](商品のimage_url)
```

### 4. データベース投入
```javascript
const articleData = {
  slug: 'article-XX',
  title: '記事タイトル',
  excerpt: '記事の要約',
  content: '記事本文（Amazon商品画像URL含む）',
  featured_image_url: '/images/articles/article-XX-img-1.png',
  category_id: 'カテゴリID',
  related_product_ids: ['商品ID1', '商品ID2'],
  status: 'published',
  published_at: new Date().toISOString()
};

await supabase.from('articles').insert(articleData);
```

### 5. 確認作業
- [ ] Supabaseデータベースに記事が正しく保存されているか
- [ ] Amazon商品画像URLが記事内容に含まれているか
- [ ] アイキャッチ画像パスが正しく設定されているか
- [ ] 本番サイトで記事が正しく表示されるか
- [ ] 商品画像が実際のAmazon画像で表示されるか

## 🛠️ よく使用するデータベース操作

### 記事一覧確認
```javascript
const { data } = await supabase
  .from('articles')
  .select('slug, title, status')
  .order('created_at', { ascending: false })
  .limit(10);
```

### 商品情報確認
```javascript
// 特定樹種の商品を検索
const { data } = await supabase
  .from('products')
  .select('id, name, price, image_url')
  .ilike('name', '%松%')
  .order('price');
```

### 記事更新
```javascript
await supabase
  .from('articles')
  .update({ 
    content: '更新された記事内容',
    updated_at: new Date().toISOString()
  })
  .eq('slug', 'article-XX');
```

## 🚨 トラブルシューティング

### 画像が表示されない場合
1. **Supabaseデータベースの記事内容を確認**
   ```javascript
   const { data } = await supabase
     .from('articles')
     .select('content, featured_image_url')
     .eq('slug', 'article-XX');
   ```

2. **Amazon画像URLの形式確認**
   - 正しい形式: `https://m.media-amazon.com/images/I/...`
   - 商品image_urlが正しく設定されているか確認

3. **キャッシュクリア**
   ```bash
   git commit --allow-empty -m "Cache clear for article-XX"
   git push
   ```

### よくある間違い
❌ Markdownファイルのみ更新してデータベース未更新
❌ アイキャッチ画像にAmazon URLを使用
❌ 商品画像に/images/articles/パスを使用
❌ データベース更新後の確認を怠る

## 📋 作業チェックリスト

### 記事作成時
- [ ] 記事スラッグが一意で適切
- [ ] 関連商品IDsが正しく設定
- [ ] Amazon商品画像URLが記事内容に含まれている
- [ ] アイキャッチ画像が/images/articles/に配置済み
- [ ] Supabaseデータベースに正しく保存
- [ ] 本番サイトで表示確認

### デプロイ後
- [ ] 記事ページが正しく表示される
- [ ] アイキャッチ画像が表示される
- [ ] 商品画像がAmazon画像で表示される
- [ ] 関連商品セクションが動作する
- [ ] SEOメタデータが適切に設定

## 🎯 品質基準

### 記事内容
- 7000文字以上の詳細な内容
- 実用的で具体的な情報
- 初心者から上級者まで対応
- 季節別・段階別の管理方法

### 商品紹介
- 3-5個の関連商品を紹介
- 価格帯の異なる選択肢を提供
- 実際のAmazon商品画像を使用
- 商品の特徴を詳しく説明

### SEO対策
- タイトルにキーワードを含める
- メタディスクリプションを最適化
- 構造化データを適切に設定
- 内部リンクを効果的に配置

## 🔄 継続的改善

### 記事公開後の作業
- ユーザーフィードバックの収集
- 検索順位の監視
- 商品リンクの更新チェック
- 季節に応じた内容の更新