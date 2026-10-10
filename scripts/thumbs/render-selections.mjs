// 特集のサムネイル（1200×630、写真＋特集名）を作る
//   REPO_ROOT=<リポジトリ> node render-selections.mjs [slug …]   … 省略時は写真のあるすべての特集
// 写真は public/images/selections/photos/<slug>.jpg、名前と一言は src/lib/selections*.ts の shortTitle・tagline。
// 書き出し先は public/images/selections/thumbs/<slug>.jpg。playwright-core のある作業用フォルダにコピーして実行する（scripts/thumbs/render.mjs と同じ）
import { chromium } from 'playwright-core'
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'fs'
import path from 'path'

const ROOT = process.env.REPO_ROOT || path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const PHOTOS = path.join(ROOT, 'public/images/selections/photos')
const OUT = path.join(ROOT, 'public/images/selections/thumbs')

// 特集の定義ファイルから slug・shortTitle・tagline を読む
function selections() {
  const result = {}
  for (const file of ['src/lib/selections.ts', 'src/lib/selections-extra.ts']) {
    const text = readFileSync(path.join(ROOT, file), 'utf8')
    for (const m of text.matchAll(/slug: '([a-z0-9-]+)',[\s\S]*?shortTitle: '([^']+)',\s*tagline: '([^']+)'/g)) {
      result[m[1]] = { title: m[2], tagline: m[3] }
    }
  }
  return result
}

const escape = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function html(photoFile, { title, tagline }) {
  const photo = 'data:image/jpeg;base64,' + readFileSync(photoFile).toString('base64')
  const size = title.length <= 8 ? '76px' : title.length <= 10 ? '68px' : '60px'
  return `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@700&family=Noto+Sans+JP:wght@500&display=block" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#1d1b18}
  .bg{position:absolute;inset:0;background:url(${photo}) center/cover no-repeat}
  .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(18,16,13,.86) 0%,rgba(18,16,13,.62) 44%,rgba(18,16,13,.08) 80%)}
  .frame{position:absolute;inset:28px;border:1px solid rgba(214,186,132,.55)}
  .box{position:absolute;left:84px;top:0;bottom:0;width:760px;display:flex;flex-direction:column;justify-content:center;color:#fff}
  .label{display:flex;align-items:center;gap:16px;font:500 21px 'Noto Sans JP',sans-serif;letter-spacing:.3em;color:#d6ba84}
  .label:after{content:'';width:72px;height:1px;background:#d6ba84}
  .title{margin-top:26px;font:700 var(--size)/1.3 'Shippori Mincho',serif;letter-spacing:.08em;word-break:keep-all}
  .tagline{margin-top:22px;font:500 25px/1.6 'Noto Sans JP',sans-serif;letter-spacing:.08em;color:rgba(255,255,255,.86)}
  .brand{position:absolute;left:84px;bottom:58px;display:flex;align-items:center;gap:14px;font:700 22px 'Shippori Mincho',serif;letter-spacing:.16em;color:#fff}
  .mark{width:32px;height:32px;background:#b8935a;display:flex;align-items:center;justify-content:center;font-size:18px}
</style>
<div class="bg"></div><div class="shade"></div><div class="frame"></div>
<div class="box"><div class="label">特集</div><div class="title" style="--size:${size}">${escape(title)}</div><div class="tagline">${escape(tagline)}</div></div>
<div class="brand"><span class="mark">盆</span>盆栽コレクション</div>`
}

const all = selections()
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(all)
const pw = '/opt/pw-browsers'
const chrome = readdirSync(pw).filter(d => d.startsWith('chromium-')).sort().pop()
const browser = await chromium.launch({ executablePath: `${pw}/${chrome}/chrome-linux/chrome` })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
mkdirSync(OUT, { recursive: true })
for (const slug of slugs) {
  const photo = path.join(PHOTOS, `${slug}.jpg`)
  if (!all[slug] || !existsSync(photo)) {
    console.log('skip (no photo)', slug)
    continue
  }
  await page.setContent(html(photo, all[slug]), { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: path.join(OUT, `${slug}.jpg`), type: 'jpeg', quality: 84 })
  console.log('ok', slug)
}
await browser.close()
