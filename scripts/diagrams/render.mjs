// 記事の図解を作る（スマホで読める文字の大きさにするため、幅720pxで組み、2倍の解像度で書き出す）
//   作業用フォルダ（playwright-core を入れたところ）にコピーして REPO_ROOT=<リポジトリ> node render.mjs [名前 …]
//   名前を省略すると全部。public/images/articles/diagrams/<名前>.webp に書き出す
// 図ごとに HTML を書き、Chromium で撮影して sharp で WebP にする。文字は Noto Sans JP、色はサイトの金茶と墨色に合わせる
import { chromium } from 'playwright-core'
import { mkdirSync, readdirSync } from 'fs'
import { createRequire } from 'module'
import path from 'path'

const ROOT = process.env.REPO_ROOT || path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const OUT = path.join(ROOT, 'public/images/articles/diagrams')
const sharp = createRequire(path.join(ROOT, 'package.json'))('sharp')

const C = { ink: '#2c2a26', sub: '#6b655b', line: '#d9d1c3', paper: '#faf7f0', card: '#ffffff', gold: '#b8935a', green: '#5b7a46', soil: '#8a6a4a', pot: '#7a5236', water: '#4f86b5' }

const base = body => `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=block" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  html,body{margin:0;width:720px;background:${C.paper};color:${C.ink};font-family:'Noto Sans JP',sans-serif}
  .wrap{padding:40px 36px 28px}
  h1{margin:0;font-size:36px;line-height:1.4;font-weight:700;letter-spacing:.03em}
  .lead{margin:10px 0 0;font-size:24px;line-height:1.6;color:${C.sub}}
  .note{margin:22px 0 0;font-size:22px;line-height:1.6;color:${C.sub}}
  .card{background:${C.card};border:2px solid ${C.line};border-radius:18px}
  .brand{margin-top:14px;text-align:right;font-size:19px;color:${C.gold};letter-spacing:.12em;font-weight:500}
  .k{display:inline-flex;align-items:center;justify-content:center;flex:none;width:44px;height:44px;border-radius:50%;color:#fff;font-weight:700;font-size:24px}
</style>
<div class="wrap">${body}<div class="brand">盆栽コレクション</div></div>`

const badge = (x, y, n, color) => `<circle cx="${x}" cy="${y}" r="24" fill="${color}"/><text x="${x}" y="${y + 9}" font-size="26" fill="#fff" text-anchor="middle" font-weight="700">${n}</text>`

const DIAGRAMS = {
  // 冬から早春に咲く盆栽の開花カレンダー
  'winter-flowering-calendar': () => {
    const months = ['10月', '11月', '12月', '1月', '2月', '3月']
    const rows = [
      ['山茶花', 0, 2, '#e9a3b3', '白・桃・赤', C.ink],
      ['寒椿', 1, 4, '#cf4f5c', '赤・桃', '#fff'],
      ['寒ボケ', 1, 5, '#e0705a', '赤・白・桃', '#fff'],
      ['ロウバイ', 2, 4, '#ecc650', '黄', C.ink],
      ['梅', 3, 5, '#f2bccb', '白・紅・桃', C.ink],
      ['福寿草', 3, 5, '#f4d43e', '黄', C.ink],
      ['マンサク', 4, 5, '#e3ad3a', '黄・赤', C.ink],
    ]
    const col = 78
    return base(`<h1>冬から早春に咲く盆栽の<br>開花カレンダー</h1>
<p class="lead">樹を選べば、10月から3月まで花を楽しめます</p>
<style>
  .cal{margin-top:26px;padding:16px 18px 10px}
  .row{display:grid;grid-template-columns:128px ${col * 6}px;align-items:center;height:66px;border-top:2px solid #f0eadf}
  .row.head{height:44px;border-top:0;font-size:22px;color:${C.sub};font-weight:500}
  .name{font-size:25px;font-weight:700}
  .track{position:relative;height:100%;display:grid;grid-template-columns:repeat(6,${col}px)}
  .track span{border-left:2px dashed #ece5d8}
  .head .track span{border:0;text-align:center;line-height:44px}
  .bar{position:absolute;top:12px;bottom:12px;border-radius:21px;display:flex;align-items:center;padding-left:16px;font-size:20px;font-weight:500;white-space:nowrap}
</style>
<div class="card cal">
  <div class="row head"><div></div><div class="track">${months.map(m => `<span>${m}</span>`).join('')}</div></div>
  ${rows.map(([name, s, e, color, label, fg]) => `<div class="row"><div class="name">${name}</div><div class="track">${months.map(() => '<span></span>').join('')}<div class="bar" style="left:${s * col + 4}px;width:${(e - s + 1) * col - 8}px;background:${color};color:${fg}">${label}</div></div></div>`).join('')}
</div>
<p class="note">※ 咲く時期は目安です。地域やその年の気温、置き場所によって前後します。バーの中は花の色です。</p>`)
  },

  // 樹の大きさと鉢の大きさ・深さの目安
  'pot-size-guide': () => base(`<h1>樹に合う鉢の大きさの目安</h1>
<p class="lead">鉢の長さは樹高の約3分の2、深さは幹の太さくらいが目安</p>
<style>
  .fig{display:block;margin-top:24px}
  .legend{margin-top:18px;display:flex;flex-direction:column;gap:12px}
  .item{display:flex;gap:16px;align-items:center;padding:16px 20px}
  .item b{display:block;font-size:26px;line-height:1.4}
  .item span.t{display:block;font-size:22px;color:${C.sub};line-height:1.5}
</style>
<svg class="fig card" viewBox="0 0 648 470" width="648" height="470" font-family="Noto Sans JP">
  <path d="M310 352 C306 300 288 280 300 230 C308 194 328 176 322 140" stroke="${C.soil}" stroke-width="24" fill="none" stroke-linecap="round"/>
  <path d="M304 248 C272 232 246 230 220 218" stroke="${C.soil}" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M314 194 C344 180 372 182 402 172" stroke="${C.soil}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <ellipse cx="210" cy="206" rx="72" ry="35" fill="${C.green}"/>
  <ellipse cx="406" cy="162" rx="76" ry="35" fill="${C.green}"/>
  <ellipse cx="322" cy="108" rx="90" ry="46" fill="${C.green}"/>
  <path d="M196 352 H436 L424 400 H208 Z" fill="${C.pot}"/>
  <rect x="190" y="344" width="252" height="12" rx="3" fill="#8f6444"/>
  <rect x="216" y="400" width="22" height="10" fill="${C.pot}"/><rect x="394" y="400" width="22" height="10" fill="${C.pot}"/>
  <g stroke="${C.gold}" stroke-width="4"><line x1="530" y1="62" x2="530" y2="350"/><line x1="512" y1="62" x2="548" y2="62"/><line x1="512" y1="350" x2="548" y2="350"/></g>
  ${badge(578, 206, 1, C.gold)}
  <g stroke="${C.green}" stroke-width="4"><line x1="190" y1="432" x2="442" y2="432"/><line x1="190" y1="416" x2="190" y2="448"/><line x1="442" y1="416" x2="442" y2="448"/></g>
  ${badge(476, 432, 2, C.green)}
  <g stroke="${C.water}" stroke-width="4"><line x1="140" y1="352" x2="140" y2="400"/><line x1="126" y1="352" x2="154" y2="352"/><line x1="126" y1="400" x2="154" y2="400"/>
  <line x1="294" y1="318" x2="326" y2="318"/><line x1="294" y1="306" x2="294" y2="330"/><line x1="326" y1="306" x2="326" y2="330"/></g>
  ${badge(96, 376, 3, C.water)}
  <line x1="154" y1="370" x2="288" y2="322" stroke="${C.water}" stroke-width="3" stroke-dasharray="8 7"/>
</svg>
<div class="legend">
  <div class="item card"><span class="k" style="background:${C.gold}">1</span><div><b>樹高</b><span class="t">鉢の縁から、樹のいちばん高いところまで</span></div></div>
  <div class="item card"><span class="k" style="background:${C.green}">2</span><div><b>鉢の長さ ＝ 樹高の約3分の2</b><span class="t">丸い鉢なら直径。1号はおよそ3cm</span></div></div>
  <div class="item card"><span class="k" style="background:${C.water}">3</span><div><b>鉢の深さ ＝ 幹の太さくらい</b><span class="t">根元の幹の太さと同じくらいが目安</span></div></div>
</div>
<p class="note">※ 目安です。花もの・実もの、懸崖などの樹形では、深めの鉢を合わせることもあります。</p>`),

  // 苔玉の水やり3ステップ
  'kokedama-watering-steps': () => {
    const icon1 = `<svg width="150" height="130" viewBox="0 0 150 130"><path d="M72 18 C67 32 58 36 61 48" stroke="${C.soil}" stroke-width="5" fill="none"/><ellipse cx="62" cy="24" rx="27" ry="13" fill="${C.green}" opacity=".8"/><circle cx="72" cy="76" r="34" fill="${C.green}"/><circle cx="60" cy="66" r="8" fill="#7a9a62"/><path d="M30 120 C46 96 98 96 114 120" stroke="#d9b896" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M128 64 V30 M116 42 L128 28 L140 42" stroke="${C.gold}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    const icon2 = `<svg width="150" height="130" viewBox="0 0 150 130"><path d="M18 34 H132 L122 122 H28 Z" fill="#e8eef4" stroke="#9bb3c8" stroke-width="4"/><rect x="23" y="52" width="104" height="66" fill="${C.water}" opacity=".42"/><circle cx="75" cy="86" r="28" fill="${C.green}"/><circle cx="54" cy="40" r="6" fill="none" stroke="${C.water}" stroke-width="3"/><circle cx="68" cy="24" r="5" fill="none" stroke="${C.water}" stroke-width="3"/><circle cx="94" cy="34" r="4" fill="none" stroke="${C.water}" stroke-width="3"/></svg>`
    const icon3 = `<svg width="150" height="130" viewBox="0 0 150 130"><path d="M75 22 C70 36 61 40 64 52" stroke="${C.soil}" stroke-width="5" fill="none"/><ellipse cx="65" cy="28" rx="27" ry="13" fill="${C.green}" opacity=".8"/><circle cx="75" cy="78" r="32" fill="${C.green}"/><ellipse cx="75" cy="116" rx="62" ry="10" fill="#cbbba5"/><path d="M124 60 q8 14 0 20 q-8 -6 0 -20z" fill="${C.water}"/></svg>`
    const steps = [
      [icon1, '持ち上げる', '水やり直後の重さを覚えておき、はっきり軽くなったら水やりの合図です'],
      [icon2, '水に沈める', 'バケツなどに苔玉ごと沈め、泡が出なくなるまで数分ほど吸わせます'],
      [icon3, '水を切って戻す', '軽く水を切ってから受け皿へ。皿にたまった水は捨てます'],
    ]
    return base(`<h1>苔玉の水やり 3ステップ</h1>
<p class="lead">日にちではなく、持ち上げたときの重さで確かめます</p>
<style>
  .steps{margin-top:24px;display:flex;flex-direction:column;gap:0}
  .step{display:grid;grid-template-columns:170px 1fr;gap:18px;align-items:center;padding:18px 22px}
  .step svg{display:block;margin:auto}
  .num{display:inline-block;background:${C.gold};color:#fff;font-weight:700;font-size:20px;border-radius:18px;padding:2px 14px;letter-spacing:.08em}
  .step b{display:block;margin:8px 0 6px;font-size:30px}
  .step p{margin:0;font-size:23px;line-height:1.6;color:${C.sub}}
  .down{width:0;height:0;margin:8px auto;border-left:16px solid transparent;border-right:16px solid transparent;border-top:16px solid ${C.gold}}
</style>
<div class="steps">${steps.map(([icon, title, text], i) => `${i ? '<div class="down"></div>' : ''}<div class="step card">${icon}<div><span class="num">STEP ${i + 1}</span><b>${title}</b><p>${text}</p></div></div>`).join('')}</div>
<p class="note">※ 夏は毎日のように乾き、冬は数日に1回で足りることも</p>`)
  },

  // 主木・添え・掛け軸の三点飾りの配置
  'bonsai-display-layout': () => base(`<h1>主木・添え・掛け軸の置き方</h1>
<p class="lead">高さと位置をずらし、三角形になるように置きます</p>
<style>
  .fig{display:block;margin-top:24px}
  .legend{margin-top:18px;display:flex;flex-direction:column;gap:12px}
  .item{padding:16px 20px}
  .item b{display:block;font-size:26px;line-height:1.4}
  .item span{display:block;font-size:22px;color:${C.sub};line-height:1.5}
</style>
<svg class="fig card" viewBox="0 0 648 470" width="648" height="470" font-family="Noto Sans JP">
  <rect x="2" y="392" width="644" height="76" rx="0" fill="#efe6d6"/>
  <rect x="440" y="44" width="124" height="270" fill="#f3efe6" stroke="#bfae92" stroke-width="3"/>
  <rect x="432" y="36" width="140" height="12" rx="4" fill="#6b4f36"/><rect x="432" y="310" width="140" height="12" rx="4" fill="#6b4f36"/>
  <path d="M466 240 C486 196 506 222 528 162" stroke="#9a8f80" stroke-width="3" fill="none"/><circle cx="526" cy="112" r="16" fill="none" stroke="#9a8f80" stroke-width="3"/>
  <rect x="70" y="352" width="250" height="16" rx="3" fill="#5a3e2a"/><rect x="84" y="368" width="14" height="26" fill="#5a3e2a"/><rect x="292" y="368" width="14" height="26" fill="#5a3e2a"/>
  <path d="M100 312 H290 L280 352 H110 Z" fill="${C.pot}"/>
  <path d="M195 312 C188 262 170 242 186 192 C196 162 212 148 206 112" stroke="${C.soil}" stroke-width="18" fill="none" stroke-linecap="round"/>
  <ellipse cx="130" cy="186" rx="64" ry="30" fill="${C.green}"/><ellipse cx="270" cy="148" rx="64" ry="30" fill="${C.green}"/><ellipse cx="206" cy="90" rx="74" ry="38" fill="${C.green}"/>
  <rect x="350" y="380" width="80" height="8" rx="2" fill="#a88a64"/>
  <path d="M364 380 H416 L410 360 H370 Z" fill="#b9a68a"/>
  <path d="M390 360 C384 338 376 332 370 326 M390 360 C392 336 398 328 406 320 M390 360 C390 342 390 334 390 322" stroke="${C.green}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <polygon points="206,58 502,180 390,316" fill="none" stroke="${C.gold}" stroke-width="4" stroke-dasharray="12 9"/>
  <g font-size="26" font-weight="700" fill="${C.ink}" text-anchor="middle"><text x="195" y="440">主木</text><text x="390" y="440">添え</text><text x="530" y="440">掛け軸</text></g>
</svg>
<div class="legend">
  <div class="item card"><b>主木（しゅぼく）</b><span>飾りの中心になる盆栽。卓や敷板にのせて</span></div>
  <div class="item card"><b>添え</b><span>下草（山野草の鉢）や小さな置物。主木より小さく低く</span></div>
  <div class="item card"><b>掛け軸</b><span>季節の景色を補います。なくても主木と添えで十分</span></div>
</div>`),
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(DIAGRAMS)
const pw = '/opt/pw-browsers'
const chrome = readdirSync(pw).filter(d => d.startsWith('chromium-')).sort().pop()
const browser = await chromium.launch({ executablePath: `${pw}/${chrome}/chrome-linux/chrome` })
const page = await browser.newPage({ viewport: { width: 720, height: 900 }, deviceScaleFactor: 2 })
mkdirSync(OUT, { recursive: true })
for (const name of names) {
  if (!DIAGRAMS[name]) { console.log('no such diagram', name); continue }
  await page.setContent(DIAGRAMS[name](), { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  const png = await page.locator('.wrap').screenshot()
  const file = path.join(OUT, `${name}.webp`)
  const info = await sharp(png).webp({ quality: 88 }).toFile(file)
  console.log('ok', name, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`)
}
await browser.close()
