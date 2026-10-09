// 記事のサムネイル（1200×630、写真＋タイトル文字）を作る
//   node scripts/thumbs/render.mjs [slug …]   … 省略時は src/content/articles の全記事
// front matter の photo（記事の写真）と thumbTitle（短いタイトル。なければ title）を使い、
// public/images/articles/thumbs/<slug>.jpg に書き出す。playwright-core は作業用フォルダに入れ、このファイルをそこへコピーして REPO_ROOT=<リポジトリ> node render.mjs で実行する
import { chromium } from 'playwright-core'
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'fs'
import path from 'path'

// 作業用フォルダにコピーして実行するときは REPO_ROOT でリポジトリの場所を指定する
const ROOT = process.env.REPO_ROOT || path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const ARTICLES = path.join(ROOT, 'src/content/articles')
const OUT = path.join(ROOT, 'public/images/articles/thumbs')

function frontMatter(file) {
  const text = readFileSync(file, 'utf8')
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  const data = {}
  for (const line of (match ? match[1] : '').split('\n')) {
    const m = line.match(/^(\w+):\s*(.*?)\s*(#.*)?$/)
    if (m && m[2] && !m[2].startsWith('-')) data[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  return data
}

// thumbTitle の「／」で改行する。1行の長さに合わせて文字を小さくする
function titleSize(title) {
  const longest = Math.max(...title.split('／').map(line => line.length))
  return longest <= 14 ? '60px' : longest <= 17 ? '52px' : '46px'
}

const escape = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function html(photoPath, title, label) {
  const photo = 'data:image/jpeg;base64,' + readFileSync(path.join(ROOT, 'public', photoPath)).toString('base64')
  return `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@700&family=Noto+Sans+JP:wght@500&display=block" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#22201c}
  .bg{position:absolute;inset:0;background:url(${photo}) center/cover no-repeat}
  .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(20,18,15,.82) 0%,rgba(20,18,15,.6) 46%,rgba(20,18,15,0) 78%)}
  .box{position:absolute;left:72px;top:0;bottom:0;width:980px;display:flex;flex-direction:column;justify-content:center;color:#fff}
  .label{font:500 22px 'Noto Sans JP',sans-serif;letter-spacing:.16em;color:#e4cfa6}
  .title{margin-top:22px;font:700 var(--size,60px)/1.42 'Shippori Mincho',serif;letter-spacing:.04em;word-break:keep-all;overflow-wrap:anywhere}
  .brand{position:absolute;left:72px;bottom:48px;display:flex;align-items:center;gap:14px;font:700 24px 'Shippori Mincho',serif;letter-spacing:.14em;color:#fff}
  .mark{width:34px;height:34px;background:#b8935a;display:flex;align-items:center;justify-content:center;font-size:19px}
</style>
<div class="bg"></div><div class="shade"></div>
<div class="box">${label ? `<div class="label">${escape(label)}</div>` : ''}<div class="title" style="--size:${titleSize(title)}">${title.split('／').map(escape).join('<br>')}</div></div>
<div class="brand"><span class="mark">盆</span>盆栽コレクション</div>`
}

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(ARTICLES).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))

const pw = '/opt/pw-browsers'
const chrome = readdirSync(pw).filter(d => d.startsWith('chromium-')).sort().pop()
const browser = await chromium.launch({ executablePath: `${pw}/${chrome}/chrome-linux/chrome` })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
mkdirSync(OUT, { recursive: true })
for (const slug of slugs) {
  const data = frontMatter(path.join(ARTICLES, `${slug}.md`))
  if (!data.photo || !existsSync(path.join(ROOT, 'public', data.photo))) {
    console.log('skip (no photo)', slug)
    continue
  }
  await page.setContent(html(data.photo, data.thumbTitle || data.title, data.thumbLabel || ''), { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: path.join(OUT, `${slug}.jpg`), type: 'jpeg', quality: 82 })
  console.log('ok', slug)
}
await browser.close()
