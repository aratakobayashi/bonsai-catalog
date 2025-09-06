# コードスタイル・規約

## TypeScript設定
- **Strict mode**: 有効
- **Target**: ES2017
- **Module resolution**: bundler
- **Path mapping**: `@/*` → `./src/*`

## コーディング規約

### ファイル・ディレクトリ命名
- **コンポーネント**: PascalCase (例: `ProductCard.tsx`)
- **ページ**: kebab-case (例: `page.tsx`)
- **ユーティリティ**: camelCase (例: `utils.ts`)
- **型定義**: PascalCase (例: `Product`, `Garden`)

### コンポーネント設計
- **Props型**: `ComponentNameProps` の形式
- **デフォルトエクスポート**: コンポーネントは基本的にdefault export
- **インポート**: `@/` エイリアスを使用

### スタイリング
- **Tailwind CSS**: 基本的なスタイリング
- **clsx + tailwind-merge**: 条件付きクラス名の管理
- **レスポンシブ**: モバイルファースト設計

### データ取得
- **Supabase**: データベースアクセス
- **サーバーコンポーネント**: データ取得は可能な限りサーバー側で実行
- **クライアントコンポーネント**: インタラクティブな機能のみ

### ユーティリティ関数
- **src/lib/utils.ts**: 汎用ユーティリティ
- **formatPrice**: 価格フォーマット
- **getSizeCategoryLabel**: サイズカテゴリラベル
- **cn**: クラス名結合（clsx + tailwind-merge）

## プロジェクト固有の規約

### Amazon連携
- **アフィリエイトリンク**: Amazon Associatesプログラム使用
- **商品データ**: Supabaseで管理、外部APIは未使用

### SEO対応
- **メタデータ**: Next.js App Routerのmetadata API使用
- **構造化データ**: 商品・組織情報でJSON-LD使用