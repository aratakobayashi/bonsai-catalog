# 推奨コマンド

## 開発時に使用する主要コマンド

### 開発サーバー
```bash
npm run dev                      # 開発サーバーを起動 (localhost:3000)
```

### ビルド・本番
```bash
npm run build                    # 本番ビルドを作成
npm start                        # 本番サーバーを起動
```

### コード品質
```bash
npm run lint                     # ESLintでコードをチェック
npm run type-check               # TypeScriptの型チェック（noEmit）
```

### パッケージ管理
```bash
npm install                      # 依存関係をインストール
npm install <package>            # パッケージを追加
```

### 環境設定
```bash
cp .env.local.example .env.local # 環境変数ファイルを作成
```

## 開発ワークフロー

### タスク完了後に実行するコマンド
1. `npm run type-check` - 型エラーがないか確認
2. `npm run lint` - コードスタイルを確認
3. `npm run build` - ビルドエラーがないか確認

### トラブルシューティング
```bash
rm -rf .next && npm run dev      # Next.jsキャッシュをクリア
rm -rf node_modules && npm install  # node_modulesを再インストール
```