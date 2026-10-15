# 毎日の作業（GitHub Actions：.github/workflows/daily-sync.yml）

- 5日に1回（毎月1・6・11・16・21・26・31日）の 4:00（日本時間）に楽天の商品を Supabase に同期し、Cloudflare Pages のデプロイフックを呼んでサイトを作り直す。
- 手動で動かすときは、GitHub の Actions → daily-sync → Run workflow で作業を選ぶ。
  - sync：楽天の同期と作り直し
  - rebuild：作り直しだけ（記事を直したあとなど。main に push したときは Cloudflare が自動で作り直す）
  - gardens / events：src/data の盆栽園・イベントの確認結果を Supabase に反映して作り直す（旧：管理画面の「反映」ボタン）
- 手元で試すとき：`.env.local` に鍵を入れて `npm run sync:rakuten`、`npm run apply:data -- gardens`
