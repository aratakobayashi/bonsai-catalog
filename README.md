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

\`\`\`
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
\`\`\`

## 🚀 セットアップ手順

### 1. リポジトリのクローン

\`\`\`bash
git clone <repository-url>
cd bonsai-catalog
\`\`\`

### 2. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 3. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPIキーを取得

### 4. 環境変数の設定

\`.env.local.example\`をコピーして\`.env.local\`を作成：

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

\`.env.local\`を編集してSupabaseの設定を追加：

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 5. データベースのセットアップ

Supabaseの管理画面で以下を実行：

1. SQLエディタで\`supabase/migrations/001_initial_schema.sql\`の内容を実行
2. 続けて\`supabase/seed.sql\`の内容を実行（サンプルデータを挿入）

### 6. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📦 本番デプロイ (Vercel)

### 1. Vercelへのデプロイ

1. GitHubなどにリポジトリをpush
2. [Vercel](https://vercel.com)でアカウント作成
3. リポジトリをインポート
4. 環境変数を設定：
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
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
2. 機能ブランチを作成 (\`git checkout -b feature/AmazingFeature\`)
3. コミット (\`git commit -m 'Add some AmazingFeature'\`)
4. ブランチにプッシュ (\`git push origin feature/AmazingFeature\`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 サポート

問題が発生した場合は、GitHubのIssuesページで報告してください。

---

**注意**: この商品カタログサイトは商品の販売は行いません。購入はAmazonで行われます。