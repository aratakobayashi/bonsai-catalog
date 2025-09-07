# 盆栽コレクション

美しい盆栽をお探しの方のための商品カタログサイトです。Next.js + Supabase + Vercelで構築されたMVPサイトです。

## 🌸 特徴

- **商品一覧・検索**: カテゴリ、サイズ、価格帯、タグによる柔軟な検索・フィルタリング
- **商品詳細**: 詳細な商品情報とAmazonでの購入リンク
- **盆栽園紹介**: 信頼できる盆栽園の紹介ページ
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップに対応
- **SEO対応**: メタタグ、構造化データに対応

## 🛠 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **デプロイ**: Vercel
- **言語**: TypeScript
- **UI**: カスタムコンポーネント + Lucide React Icons

## 📁 プロジェクト構造

```
bonsai-catalog/
├── README.md                    # このファイル
├── package.json                 # 依存関係とスクリプト
├── next.config.js               # Next.js設定
├── tailwind.config.js           # TailwindCSS設定
├── postcss.config.js            # PostCSS設定
├── .gitignore                   # Git無視設定
├── .env.local.example           # 環境変数テンプレート
├── public/                      # 静的ファイル
├── src/
│   ├── app/                     # App Routerページ
│   │   ├── layout.tsx           # ルートレイアウト
│   │   ├── page.tsx             # ホームページ
│   │   ├── products/            # 商品関連ページ
│   │   └── gardens/             # 盆栽園ページ
│   ├── components/              # Reactコンポーネント
│   │   ├── ui/                  # 汎用UIコンポーネント
│   │   ├── features/            # 機能特化コンポーネント
│   │   └── layout/              # レイアウトコンポーネント
│   ├── lib/                     # ユーティリティライブラリ
│   └── types/                   # TypeScript型定義
└── supabase/                    # Supabaseファイル
    ├── migrations/              # データベースマイグレーション
    └── seed.sql                 # 初期データ
```

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/aratakobayashi/bonsai-catalog.git
cd bonsai-catalog
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPIキーを取得

### 4. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成：

```bash
cp .env.local.example .env.local
```

`.env.local`を編集してSupabaseの設定を追加：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. データベースのセットアップ

Supabaseの管理画面で以下を実行：

1. SQLエディタで`supabase/migrations/001_initial_schema.sql`の内容を実行
2. 続けて`supabase/seed.sql`の内容を実行（サンプルデータを挿入）

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📦 本番デプロイ (Vercel)

### 1. Vercelへのデプロイ

1. GitHubなどにリポジトリをpush
2. [Vercel](https://vercel.com)でアカウント作成
3. リポジトリをインポート
4. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. デプロイを実行

### 2. カスタムドメインの設定（オプション）

Vercelの管理画面からカスタムドメインを設定できます。

## 🎯 主要な機能

### 商品管理
- **商品一覧**: ページネーション対応の商品表示
- **検索機能**: 商品名・説明文での部分一致検索
- **フィルタリング**: カテゴリ、サイズ、価格帯、タグでの絞り込み
- **ソート**: 名前順、価格順、新着順

### データ構造
- **Products**: 商品情報（名前、説明、価格、カテゴリ、タグ、サイズ、画像、Amazonリンク）
- **Gardens**: 盆栽園情報（名前、住所、説明、画像、ウェブサイト、電話番号）

## 🛡 セキュリティ

- Row Level Security (RLS) を有効化
- 読み取り専用アクセス（匿名ユーザー）
- 環境変数による機密情報管理

## 📱 対応ブラウザ

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 🤝 貢献

1. フォークを作成
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. コミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 サポート

問題が発生した場合は、GitHubのIssuesページで報告してください。

---

**注意**: この商品カタログサイトは商品の販売は行いません。購入はAmazonで行われます。

---

## 📈 記事流入増加プロジェクト

### 🎯 プロジェクト目的
**記事経由のサイト流入数増加**を目的とし、既存WordPress記事（100本）を活用してSEO効果を最大化する。

### 📋 要件定義
- **コスト抑制**: 無料枠内での運用（microCMS + Vercel無料プラン）
- **SEO最適化**: Core Web Vitals向上、検索エンジン評価向上
- **既存記事活用**: WordPress記事100本の完全移行・最適化
- **新規記事効率化**: microCMSによる記事作成・管理の効率化

### 🛠️ 技術的打ち手
- **microCMS導入**: 記事管理システムとして無料CMS活用
- **記事コラムページ新規作成**: `/guides`セクションを商品サイトに統合
- **WordPress→microCMS移行**: 既存100記事の自動移行システム構築

### 📋 マイルストーン

#### Phase 1: 準備・検証（1-2週間）
- [ ] 独自ドメイン取得・設定
- [ ] WordPress REST API連携の技術検証
- [ ] Next.js記事ページの基本実装
- [ ] ヘッドレスWordPress設定

#### Phase 2: 統合実装（2-3週間）
- [ ] 記事一覧ページ開発（`/guides`）
- [ ] 記事詳細ページ開発（`/guides/[slug]`）
- [ ] 検索・フィルタ機能実装
- [ ] 記事→商品連携機能
- [ ] カテゴリー・タグシステム統合

#### Phase 3: 移行・最適化（1-2週間）
- [ ] 301リダイレクト設定（bonsai-guidebook.net → 新ドメイン）
- [ ] SEO設定移行
- [ ] sitemap.xml統合
- [ ] Core Web Vitals最適化

### 🔄 統合アーキテクチャ

```
統合後のサイト構成:
新ドメイン: bonsai-collection.com
├── /products     → 商品一覧・詳細 (Next.js)
├── /guides       → 記事コンテンツ (WordPress API)
├── /gardens      → 盆栽園情報
└── /             → 統合トップページ

記事管理フロー:
WordPress(管理) → REST API → Next.js(表示)
```

### 👤 役割分担

#### ユーザー側のタスク
- 🌐 **独自ドメイン取得・DNS設定** - 新ドメインでのサイト統合
- 📱 **microCMSアカウント作成** - 無料プランでの記事管理環境構築
- 📝 **既存記事の整理・確認** - 移行対象記事の品質チェック
- 🔍 **テスト・動作確認** - 移行後の記事表示・機能確認

#### 開発側のタスク  
- 🔄 **WordPress→microCMS移行システム** - 100記事の自動移行スクリプト開発
- 💻 **記事コラムページ開発** - `/guides`セクションの新規実装
- 🎨 **記事↔商品連携機能** - タグベースの関連商品表示システム
- ⚙️ **SEO最適化実装** - Core Web Vitals、構造化データ、サイトマップ最適化

### 📊 期待される効果
- **記事流入数**: 月間数千PV → **数万PV目標**
- **SEO効果**: Core Web Vitals最適化による検索順位向上
- **コンバージョン向上**: 記事 → 商品への自然な導線強化
- **運営効率化**: 一元管理による記事投稿・更新作業の効率化
- **コスト削減**: WordPress運用費用（年間6000-12000円）→ 完全無料

---

## 🗂️ 開発履歴・進捗

### 2025-01-09: UI拡張機能実装
- ✅ 商品一覧カード充実版（価格常時表示、難易度表示🌱🌿🌲、季節情報、特徴バッジ）
- ✅ 商品詳細ページ詳細情報追加（サイズ詳細、育成環境、季節の楽しみ）
- ✅ CTAボタン改善（オレンジ購入ボタン強調、詳細ボタンアウトライン化）
- ✅ 価格フィルター横並びレイアウト修正
- ✅ 新商品8件追加（合計12商品に拡充）

### データベース拡張
- ✅ UI拡張フィールド追加（difficulty_level, height_cm, bloom_months等）
- ✅ 商品データ自動分析・分類システム
- ✅ SEO対応メタデータ強化

### 技術的改善
- ✅ product-ui-helpers.ts: UI表示用ヘルパー関数群
- ✅ レスポンシブデザイン強化
- ✅ TypeScript型定義更新

### 次のステップ
1. 独自ドメイン取得・設定
2. WordPress API連携実装
3. 記事機能統合開発

---