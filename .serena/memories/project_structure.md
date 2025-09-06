# プロジェクト構造

## ディレクトリ構成

```
bonsai-catalog/
├── README.md                    # プロジェクト説明
├── package.json                 # 依存関係とスクリプト
├── next.config.js               # Next.js設定
├── tailwind.config.js           # TailwindCSS設定
├── postcss.config.js            # PostCSS設定
├── tsconfig.json                # TypeScript設定
├── .gitignore                   # Git無視設定
├── .env.local.example           # 環境変数テンプレート
├── public/                      # 静的ファイル
├── src/
│   ├── app/                     # App Routerページ
│   │   ├── layout.tsx           # ルートレイアウト
│   │   ├── page.tsx             # ホームページ
│   │   ├── products/            # 商品関連ページ
│   │   ├── gardens/             # 盆栽園ページ
│   │   ├── contact/             # お問い合わせページ
│   │   ├── privacy/             # プライバシーポリシー
│   │   └── terms/               # 利用規約
│   ├── components/              # Reactコンポーネント
│   │   ├── ui/                  # 汎用UIコンポーネント
│   │   ├── features/            # 機能特化コンポーネント
│   │   └── layout/              # レイアウトコンポーネント
│   ├── hooks/                   # カスタムReactフック
│   ├── lib/                     # ユーティリティライブラリ
│   └── types/                   # TypeScript型定義
└── supabase/                    # Supabaseファイル
    ├── migrations/              # データベースマイグレーション
    └── seed.sql                 # 初期データ
```

## 主要ファイルの説明

### src/app/ (App Router)
- **layout.tsx**: 全ページ共通のレイアウト
- **page.tsx**: ホームページ
- **products/**: 商品一覧・詳細ページ
- **gardens/**: 盆栽園紹介ページ

### src/components/
- **ui/**: Button, Card, Input等の汎用UIコンポーネント
- **features/**: ProductCard, SearchBar等の機能特化コンポーネント
- **layout/**: Header, Footer, BottomNavigation等のレイアウト

### src/lib/
- **supabase.ts**: Supabaseクライアント設定
- **utils.ts**: 共通ユーティリティ関数
- **amazon-api.ts**: Amazon API関連