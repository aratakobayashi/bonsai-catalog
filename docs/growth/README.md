# 盆栽コレクション 改善作業の記録と今後の進め方

最終更新: 2026-10-07（夜間作業分）

## 1. 方針（仮置き）

- ページ数を追わず、「買う直前の検索」（ミニ盆栽 初心者、盆栽 ギフト、正月 盆栽 など）に強い小さなサイトに絞り直す
- 体験談は作らない。公式情報・商品仕様・一般的な栽培知識にもとづく「選び方・比較」で書く
- 盆栽園・イベントは、実在確認と更新ができるまで noindex（データは残す）
- 費用のかかるサービスは使わない

## 2. 夜間に行った変更

### フェーズ0（止血）

| 項目 | 内容 | 状態 |
|---|---|---|
| 管理画面の認証 | 推測できたセッションCookieを署名付きに変更、パスワードの既定値を削除、書き込みAPIを middleware で保護、デバッグ用APIを削除 | **git stash に保存（未コミット）**。下の「4. 要確認」参照 |
| ドメイン統一 | www なし・vercel.app を www に 308 リダイレクト（middleware） | 同上（stash 内） |
| PR表記 | フッター（Amazon指定の文言）、記事・商品・一覧・特集ページの冒頭に表記 | 作業ツリー（未コミット） |
| 広告リンク | `rel="sponsored"` を商品カード・関連商品・記事本文の広告リンクに付与 | 同上 |
| 価格表示 | 「参考価格（掲載時点）」と明記 | 同上 |
| 盆栽園 | 根拠のない評価点・自動生成の「編集部レビュー」を削除、構造化データから評価を削除 | 同上 |
| noindex | 盆栽園・イベント（一覧・詳細）、絞り込み付きのガイド一覧 | 同上 |
| 構造化データ | 商品から販売者・在庫・価格（offers）を削除、URL を www に統一 | 同上 |
| sitemap | sitemapindex 形式に修正。パラメータ付きURL・noindex ページを除外。1時間ごとに再生成 | 同上 |
| robots.txt | `/_next/`（描画に必要なJS・CSS）のブロックを解除、`public/robots.txt` の二重管理を解消 | 同上 |
| canonical | 主要ページに設定。metadataBase と記事内リンクを www に統一 | 同上 |
| お問い合わせ | 送信の「ふり」をやめ、`NEXT_PUBLIC_CONTACT_EMAIL` 設定時はメールソフトを起動。未設定時は「準備中」と表示。存在しないドメインのメールアドレス表記を削除 | 同上 |

### フェーズ1（技術SEO・表示速度）

| 項目 | 内容 |
|---|---|
| トップ | ブラウザ描画 → サーバー描画＋1時間ごとの再生成（ISR）。ヒーロー画像を最適化（モバイルで 640KB → 約15KB）、自動スライドを停止 |
| 商品一覧 | 商品をサーバー側で描画（開いた直後のHTMLに商品が入る）。ブラウザからの Supabase 呼び出しを削除 |
| 詳細ページ | 記事・商品・盆栽園・イベントの詳細を ISR に（記事編集時は自動で再生成） |
| 共通 | AdSense を読み込み後に遅延、地図用CSSを地図ページのみに、未使用の Web Vitals 計測を削除 |
| ガイド一覧 | 一覧に本文を含めないようにして HTML を 443KB → 237KB に |

**計測結果（Lighthouse モバイル。改善後はローカル環境、改善前は本番）**

| ページ | 改善前 | 改善後 |
|---|---|---|
| トップ | スコア35／LCP 24.4秒／総転送量 19MB | スコア84／LCP 3.6秒／0.8MB |
| 商品一覧 | スコア68／LCP 7.6秒 | スコア82／LCP 4.0秒 |

※ Search Console の「不良」は実ユーザーの28日間の集計なので、反映まで約1か月かかります。

### フェーズ2（コンテンツの棚卸し）

- `docs/growth/content-audit.csv`：全147記事の一覧（文字数、Amazon/A8リンク数、テーマ、指摘、推奨対応）
- **盆栽と無関係な記事が7本混入**していました（ジャニーズJr.・timelesz・ライブ遠征など）。noindex にしました
- 出典を確認できない「取材・監修」表記のある体験談記事5本を noindex にしました
- noindex は `src/lib/content-policy.ts` の一覧で管理。1行消せば元に戻ります

### フェーズ3（収益の導線）

- 特集ページを3本追加（商品DBから比較表を自動生成、1時間ごとに更新）
  - `/selection/new-year-bonsai` 正月に飾る盆栽の選び方（11〜12月の需要向け）
  - `/selection/beginner-mini-bonsai` 初心者向けミニ盆栽の選び方
  - `/selection/bonsai-gift` 盆栽ギフトの選び方
- トップ・フッター・sitemap から特集ページへリンク
- サイトの title・description から「販売」の表現を外し、「比較・選び方ガイド」に修正

## 3. 作業ツリーの状態

自動の権限チェックで **コミットとプッシュが止められたため、すべて未コミット**です。

- `git stash list` → `phase0-security: ...`：認証・API保護・ドメインリダイレクト
- 作業ツリー：上記以外のすべての変更（`git status` で確認）

コンテナが回収されると未コミットの変更は消えるので、早めに確認してください。

## 4. 要確認・手作業が必要なこと（すべて無料）

1. **コミット・プッシュの許可**：内容を確認のうえ、コミットしてよいか指示してください
2. **セキュリティ変更（stash）を反映する前に**、Vercel の環境変数に `ADMIN_PASSWORD` を設定（未設定だと管理画面にログインできなくなります）
3. Vercel の環境変数 `NEXT_PUBLIC_CONTACT_EMAIL` に、受信できるメールアドレスを設定（無料の Gmail で可）
4. Vercel のドメイン設定で `www.bonsai-collection.com` を Primary にし、`bonsai-collection.com` を www へリダイレクト
5. Supabase の SQL エディタで書き込み権限を確認・削除（下記）
6. 本番反映後、Search Console に `https://www.bonsai-collection.com/sitemap.xml` を再送信
7. Amazonアソシエイトの管理画面で、このサイトが登録済みか、`oshikatsucoll-22` がこのサイト用の ID かを確認
8. 重複している商品（白梅盆栽、出猩々もみじ、七福南天など）の整理

```sql
-- 書き込みを許しているポリシーの確認
select tablename, policyname, cmd, roles from pg_policies
where tablename in ('products', 'articles', 'gardens', 'events');

-- 誰でも商品を追加・削除できる設定が残っていれば削除
drop policy if exists "Allow public insert on products" on products;
drop policy if exists "Temporary delete policy for cleanup" on products;
revoke insert, delete on products from anon;
```

※ 記事の保存は公開キー（anon）で DB に書き込む作りのため、DB 側で anon の書き込みを許している可能性があります。根本対策は、サーバー側だけで使う秘密キー（service role）に切り替えて anon の書き込みを禁止することです（次の作業候補）。

## 5. 次にやること（提案）

1. 上記4の確認と本番反映
2. Search Console のデータで記事を「残す・統合・削除」に振り分け（`content-audit.csv` に列を追加）
3. 特集ページの拡充：母の日（4月公開）、敬老の日（8月公開）、室内向け、樹種別（五葉松・もみじ・桜）
4. 楽天：楽天ウェブサービスの Application ID（無料）を取得 → `supabase/migrations/018_add_rakuten_support.sql` を適用 → `scripts/rakuten-import.mjs` で価格の自動取得
5. ASP：A8・もしもアフィリエイト・バリューコマース（いずれも登録無料）で盆栽・園芸・ギフトの案件を検索し、条件を比較
6. 記事保存の service role 化と、リポジトリ直下の使い捨てスクリプトの整理
