# 🛒 Amazon商品統合・アフィリエイト実装計画

## 📊 現状確認
- **テストデータ**: 8商品（仮想商品）
- **検索機能**: 完全実装済み
- **データベース**: Amazon対応スキーマ完備

## 🎯 実装目標

### 1. Amazon Product Advertising API統合
```
目的: 実際のAmazon商品データを取得
必要: Amazon Associate ID, API credentials
```

### 2. 商品データ自動取得・変換システム
```
Amazon商品 → 我々のDB構造に変換 → 検索インデックス化
```

### 3. アフィリエイトリンク最適化
```
Amazon Associate ID組み込み → 収益追跡
```

## 🔧 技術実装ステップ

### Phase 1: Amazon API準備
- [ ] Amazon Associate Program登録
- [ ] Product Advertising API申請
- [ ] 認証情報の設定

### Phase 2: データ取得システム
- [ ] Amazon API client実装
- [ ] 商品検索・取得ロジック
- [ ] データ変換・正規化

### Phase 3: 検索最適化
- [ ] 全文検索インデックス
- [ ] タグ自動生成
- [ ] カテゴリー自動分類

### Phase 4: アフィリエイト統合
- [ ] Associate IDリンク生成
- [ ] クリック追跡
- [ ] 収益レポート

## 📝 具体的実装内容

### Amazon商品データ取得
```javascript
// 盆栽関連商品の検索クエリ例
const searchQueries = [
  '盆栽 松',
  '盆栽 もみじ', 
  '盆栽鉢',
  '盆栽 道具',
  '盆栽 用土'
];
```

### データ変換ロジック
```javascript
// Amazon商品 → 我々のスキーマ
const convertAmazonProduct = (amazonProduct) => ({
  name: amazonProduct.Title,
  description: amazonProduct.Features?.join(' '),
  price: amazonProduct.Price?.Amount,
  category: categorizeProduct(amazonProduct),
  tags: generateTags(amazonProduct),
  size_category: determineSizeCategory(amazonProduct),
  image_url: amazonProduct.Images?.Primary?.Large?.URL,
  amazon_url: generateAffiliateURL(amazonProduct.DetailPageURL)
});
```

### 検索インデックス強化
```sql
-- 全文検索インデックス（日本語対応）
CREATE INDEX idx_products_fulltext 
ON products USING GIN(
  to_tsvector('japanese', name || ' ' || description)
);

-- タグ検索最適化
CREATE INDEX idx_products_tags_gin 
ON products USING GIN(tags);
```

## 🔍 検索機能向上計画

### 1. カテゴリー自動分類
```javascript
const categorizeProduct = (amazonProduct) => {
  const title = amazonProduct.Title.toLowerCase();
  if (title.includes('松')) return '松類';
  if (title.includes('もみじ') || title.includes('楓')) return '落葉樹';
  if (title.includes('鉢')) return '鉢・受皿';
  if (title.includes('土')) return '用土・肥料';
  if (title.includes('ハサミ') || title.includes('道具')) return '道具・工具';
  return '盆栽樹木';
};
```

### 2. タグ自動生成
```javascript
const generateTags = (amazonProduct) => {
  const tags = [];
  const text = amazonProduct.Title + ' ' + amazonProduct.Features?.join(' ');
  
  // レベル判定
  if (text.includes('初心者')) tags.push('初心者向け');
  if (text.includes('上級') || text.includes('プロ')) tags.push('上級者向け');
  
  // 特徴抽出
  if (text.includes('花')) tags.push('花');
  if (text.includes('紅葉')) tags.push('紅葉');
  
  return tags;
};
```

### 3. アフィリエイトURL生成
```javascript
const generateAffiliateURL = (originalURL, associateID = 'your-associate-id') => {
  const url = new URL(originalURL);
  url.searchParams.set('tag', associateID);
  return url.toString();
};
```

## 💰 アフィリエイト戦略

### 1. Associate ID設定
- 環境変数で管理: `AMAZON_ASSOCIATE_ID`
- 地域別ID対応（.co.jp, .com等）

### 2. 収益追跡
```javascript
// クリック追跡
const trackAffiliateClick = (productId, amazonUrl) => {
  // Google Analytics / カスタム追跡
  gtag('event', 'affiliate_click', {
    product_id: productId,
    amazon_url: amazonUrl,
    timestamp: Date.now()
  });
};
```

### 3. パフォーマンス最適化
- 商品ページのCVR向上
- 関連商品推薦
- 価格変動通知

## 🚀 実装優先度

### 🔴 最優先（今週）
1. Amazon Associate Program申請
2. Product Advertising API申請
3. テストデータのクリーンアップ

### 🟡 高優先（来週）
1. API統合実装
2. 商品データ取得・変換
3. アフィリエイトリンク実装

### 🟢 中優先（今月）
1. 検索インデックス最適化
2. 自動カテゴリー分類
3. 収益追跡システム

## 📋 成功指標

### 短期（1週間）
- [ ] Amazon API接続成功
- [ ] 実商品10件取得・登録
- [ ] アフィリエイトリンク動作確認

### 中期（1ヶ月）
- [ ] 商品データ100件以上
- [ ] 検索精度90%以上
- [ ] 最初のアフィリエイト収益

### 長期（3ヶ月）
- [ ] 商品データ500件以上
- [ ] 月次収益安定化
- [ ] SEO最適化完了

---
**次のアクション**: Amazon Associate Program & API申請を最優先で実行