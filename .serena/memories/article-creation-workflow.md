# 記事作成ワークフロー - 再発防止版

## アーキテクチャ理解
- **記事データソース**: Supabaseデータベース（NOT Markdownファイル）
- **読み込み関数**: `src/lib/database/articles.ts`の`getArticleBySlug`
- **画像管理**: アイキャッチ(/images/articles/) + 商品画像(Amazon URL)

## 新規記事作成手順

### 1. 記事データ準備
```javascript
// Supabaseへの記事データ投入例
const articleData = {
  slug: 'article-XX',
  title: '記事タイトル',
  content: '記事内容（Amazon商品画像URL含む）',
  featured_image_url: '/images/articles/article-XX-img-1.png',
  category_id: 'カテゴリID',
  status: 'published'
}
```

### 2. 画像配置
- **アイキャッチ**: `/images/articles/article-XX-img-1.png`に配置
- **商品画像**: 記事内容にAmazon URLを直接記述

### 3. データベース更新
```bash
# 記事データをSupabaseに投入
node -e "記事データ更新スクリプト"
```

### 4. 確認事項
- [ ] Supabaseデータベースに記事が正しく保存
- [ ] Amazon商品画像URLが記事内容に含まれている
- [ ] アイキャッチ画像パスが正しく設定
- [ ] 本番サイトで画像が正しく表示

## トラブルシューティング

### 画像が表示されない場合
1. Supabaseデータベースの記事内容を確認
2. Amazon画像URLの形式チェック
3. キャッシュクリアのためのデプロイ実行
4. ブラウザキャッシュクリア

### データベース直接更新コマンド例
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 記事更新
await supabase.from('articles').update({ 
  content: '更新内容',
  featured_image_url: '/images/articles/article-XX-img-1.png'
}).eq('slug', 'article-XX');
```

## 重要な注意点
- **Markdownファイルは参考用のみ**（実際の表示には使用されない）
- **必ずSupabaseデータベースを更新する**
- **画像の役割分担を守る**（アイキャッチ vs 商品画像）