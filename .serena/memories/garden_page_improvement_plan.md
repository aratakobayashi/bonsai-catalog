# 盆栽園ページ改善計画

## 📊 現状分析

### 現在の実装
- **ファイル**: `/src/app/gardens/page.tsx`
- **データソース**: Supabase `gardens` テーブル
- **機能**: 基本的な一覧表示のみ

### 現在のGarden型定義
```typescript
interface Garden {
  id: string
  name: string
  address: string
  description: string
  image_url?: string
  website_url?: string
  phone?: string
  created_at: string
  updated_at: string
}
```

## 🚩 特定した問題点

### 1. 機能面の不足
- ❌ 検索・フィルタリング機能がない
- ❌ 地域・専門分野での絞り込み不可
- ❌ お気に入り・比較機能がない
- ❌ 詳細ページが存在しない

### 2. データ不足
- ❌ 営業時間・定休日情報がない
- ❌ 専門分野・得意分野の情報がない
- ❌ レビュー・評価システムがない
- ❌ 詳細な位置情報・アクセス情報が不足

### 3. ユーザビリティ問題
- ❌ カード情報が限定的で比較困難
- ❌ 連絡・訪問のための情報が不足
- ❌ モバイル体験が最適化されていない

### 4. デザイン・UX課題
- ❌ 単調なレイアウト
- ❌ 盆栽園の個性・特色を表現しきれていない
- ❌ ユーザーエンゲージメントが低い

## 🎯 改善戦略・実装計画

### Phase 1: データ構造強化 🏗️

#### 拡張Garden型定義
```typescript
interface Garden {
  // 既存フィールド
  id: string
  name: string
  address: string
  description: string
  image_url?: string
  website_url?: string
  phone?: string
  created_at: string
  updated_at: string
  
  // 新規追加フィールド
  prefecture?: string           // 都道府県
  city?: string                // 市区町村
  postal_code?: string         // 郵便番号
  latitude?: number            // 緯度
  longitude?: number           // 経度
  business_hours?: string      // 営業時間
  closed_days?: string[]       // 定休日
  specialties?: string[]       // 専門分野（松類、花木、山野草等）
  established_year?: number    // 創業年
  owner_name?: string         // 園主名
  owner_message?: string      // 園主からのメッセージ
  access_info?: string        // アクセス情報
  parking_info?: string       // 駐車場情報
  experience_programs?: boolean // 体験教室の有無
  online_sales?: boolean       // オンライン販売対応
  rating?: number             // 評価（1-5）
  review_count?: number       // レビュー数
  featured?: boolean          // 注目園フラグ
  images?: string[]           // 追加画像
  social_links?: {            // SNSリンク
    instagram?: string
    twitter?: string  
    facebook?: string
  }
}
```

#### DBマイグレーション必要項目
- 新規カラム追加
- インデックス設定（prefecture, specialties, featured等）

### Phase 2: 機能強化 ⚙️

#### 2.1 検索・フィルター機能
- **地域フィルター**: 都道府県・市区町村選択
- **専門分野フィルター**: 松類、花木、山野草、盆器等
- **サービスフィルター**: 体験教室、オンライン販売、駐車場等
- **評価フィルター**: 星評価による絞り込み
- **営業状況フィルター**: 営業中、定休日等

#### 2.2 詳細ページ作成 (`/gardens/[id]`)
```
📁 src/app/gardens/[id]/
  ├── page.tsx        # 詳細ページ
  └── components/     # 詳細ページ専用コンポーネント
      ├── GardenHero.tsx
      ├── GardenInfo.tsx
      ├── GardenGallery.tsx
      ├── GardenMap.tsx
      └── GardenReviews.tsx
```

#### 2.3 高機能コンポーネント
- **GardenCard**: 現在より詳細な情報表示
- **GardenFilter**: 高度な検索・フィルター
- **GardenMap**: Google Maps統合
- **ReviewSystem**: レビュー・評価システム

### Phase 3: UX向上 🎨

#### 3.1 レイアウト改善
- **特集園セクション**: featured=trueの園をハイライト
- **専門分野別セクション**: 松類専門、花木専門等
- **地域別表示**: 都道府県ごとのタブ表示
- **レスポンシブグリッド**: モバイル最適化

#### 3.2 ユーザーエンゲージメント
- **お気に入り機能**: ローカルストレージ活用
- **比較機能**: 複数園の比較表示
- **園主メッセージ**: 人柄を感じられるコンテンツ
- **季節のおすすめ**: 時期に応じた情報表示

#### 3.3 アクセシビリティ
- **キーボードナビゲーション**: 完全対応
- **スクリーンリーダー**: 適切なaria属性
- **カラーコントラスト**: WCAG準拠

## 🚀 実装優先度

### 🔴 最優先（即座に実装）
1. **検索・フィルター基本機能** - ユーザビリティ向上
2. **詳細ページ作成** - 情報不足解消
3. **データ構造拡張** - 必要情報の追加

### 🟡 高優先（来週実装）
4. **地図統合** - 位置情報表示
5. **レビューシステム** - 信頼性向上
6. **レスポンシブ改善** - モバイル体験向上

### 🟢 中優先（今月実装）
7. **お気に入り・比較機能** - ユーザーエンゲージメント
8. **SNS統合** - 情報の充実
9. **管理者機能** - コンテンツ管理効率化

## 📊 期待される効果

### ユーザー体験向上
- **検索効率**: 地域・専門分野での絞り込みが可能
- **情報充実**: 訪問前に必要な情報を取得可能
- **信頼性向上**: レビュー・評価による品質保証

### ビジネス効果
- **コンバージョン向上**: 詳細情報による訪問促進
- **リピート率向上**: お気に入り・比較機能による再訪
- **SEO効果**: 地域・専門分野での検索対応

## 📋 次のアクションアイテム

### 技術準備
1. **データベース設計**: 新規テーブル・カラム設計
2. **API設計**: 検索・フィルター用エンドポイント
3. **コンポーネント設計**: 再利用可能なコンポーネント群

### データ準備
4. **既存データ拡張**: 営業時間・専門分野等の情報収集
5. **画像素材**: 各園の魅力的な画像収集
6. **テストデータ**: 開発用サンプルデータ作成

**🎯 総評**: 現在のシンプルな一覧表示から、検索・詳細・レビューを備えた包括的な盆栽園情報プラットフォームへの発展が必要。ユーザビリティとビジネス価値の両方を大幅に向上可能。