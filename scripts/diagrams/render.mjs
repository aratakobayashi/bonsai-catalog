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
  // 盆栽を贈る前に確かめたい5つのこと
  'gift-check-five': () => checklist('盆栽を贈る前に確かめたい5つのこと', '5つがそろえば、贈ったあとも長く楽しんでもらえます', [
    ['置き場所', '日の当たるベランダや庭、玄関先があるか'],
    ['世話', '土が乾いたら水をやれるか。家を長く空けないか'],
    ['大きさと重さ', '置き場所に収まり、持ち運べる重さか'],
    ['好み', '花・実・紅葉・緑のどれが好きそうか'],
    ['届く日', '相手が受け取れる日に届けられるか'],
  ], '※ 屋外に置き場所がない方には、室内で育てやすい樹や苔玉を選びます。'),

  // 女性へのプレゼントに選ばれる樹の見ごろ
  'gift-women-season': () => monthChart('贈りやすい花もの・実ものの見ごろ', '数字は月。贈る時期に合わせて選びます', [
    ['梅', [[1, 3, 'f']]],
    ['桜', [[3, 4, 'f']]],
    ['長寿梅', [[3, 5, 'f'], [9, 10, 'f2']]],
    ['姫りんご', [[4, 4, 'f'], [9, 11, 'm']]],
    ['サツキ', [[5, 6, 'f']]],
    ['南天など', [[10, 12, 'm'], [1, 2, 'm']]],
  ], '※ 見ごろは目安です。長寿梅の秋の花は、咲かない年もあります。'),

  // 置き場所で決める盆栽の大きさ（男性へのプレゼント）
  'gift-size-by-place': () => {
    const tree = (x, h, pot) => {
      const top = 300 - h
      return `<path d="M${x} 300 C${x - 4} ${300 - h * .45} ${x + 8} ${300 - h * .7} ${x} ${top + 20}" stroke="${C.soil}" stroke-width="${pot / 9}" fill="none" stroke-linecap="round"/>
      <ellipse cx="${x - pot * .32}" cy="${top + h * .42}" rx="${pot * .34}" ry="${h * .12}" fill="${C.green}"/><ellipse cx="${x + pot * .3}" cy="${top + h * .3}" rx="${pot * .32}" ry="${h * .11}" fill="${C.green}"/><ellipse cx="${x}" cy="${top + h * .12}" rx="${pot * .42}" ry="${h * .15}" fill="${C.green}"/>
      <path d="M${x - pot / 2} 300 H${x + pot / 2} L${x + pot / 2 - 8} ${300 + pot * .22} H${x - pot / 2 + 8} Z" fill="${C.pot}"/>`
    }
    return base(`<h1>置き場所で決める盆栽の大きさ</h1>
<p class="lead">贈る前に、相手の家に屋外の置き場所があるかを確かめます</p>
<style>.fig{display:block;margin-top:24px}.legend{margin-top:16px;display:flex;flex-direction:column;gap:10px}.item{padding:14px 20px}.item b{display:block;font-size:22px;line-height:1.4}.item span{display:block;font-size:20px;color:${C.sub};line-height:1.5;margin-top:4px}</style>
<svg class="fig card" viewBox="0 0 648 380" width="648" height="380" font-family="Noto Sans JP">
  <line x1="20" y1="300" x2="628" y2="300" stroke="#e6dfd2" stroke-width="2"/>
  ${tree(118, 210, 150)}${tree(330, 140, 110)}
  <path d="M530 300 C526 270 512 262 518 240" stroke="${C.soil}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M518 300 C510 286 500 282 494 280 M540 300 C548 288 556 284 562 282" stroke="${C.soil}" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="522" cy="214" rx="56" ry="36" fill="#6f9a52"/>
  <path d="M482 300 H578 L572 322 H488 Z" fill="#c9b9a0"/>
  <g font-size="22" font-weight="700" fill="${C.ink}" text-anchor="middle"><text x="118" y="356">高さ25〜40cm</text><text x="330" y="356">高さ15〜25cm</text><text x="530" y="356">室内向きの樹</text></g>
</svg>
<div class="legend">
  <div class="item card"><b>庭・広いベランダ</b><span>存在感のある小品〜中品盆栽</span></div>
  <div class="item card"><b>マンションのベランダ</b><span>小品盆栽。手すりの内側に置ける大きさ</span></div>
  <div class="item card"><b>屋外に置き場所がない</b><span>ガジュマルなどの室内向きの樹や苔玉</span></div>
</div>`)
  },

  // 開店祝い：置き場所で選ぶ樹
  'opening-gift-place': () => base(`<h1>開店祝いは「どこに置くか」で選ぶ</h1>
<p class="lead">盆栽の多くは屋外の樹。置き場所に合う樹を選びます</p>
<style>.two{margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:14px}.pane{padding:20px 18px;text-align:center}.pane svg{display:block;margin:0 auto 10px}.pane b{display:block;font-size:26px;line-height:1.4}.pane .t{display:block;margin-top:10px;font-size:22px;line-height:1.55;color:${C.sub};text-align:left}.tag{display:inline-block;margin-top:12px;background:#eef3ea;color:#3f5c2e;border-radius:12px;padding:6px 14px;font-size:22px;font-weight:700}
.avoid{margin-top:16px;padding:18px 22px}.avoid b{font-size:24px;color:#a2463e}.avoid ul{margin:8px 0 0;padding-left:1.2em;font-size:22px;line-height:1.7;color:${C.sub}}</style>
<div class="two">
  <div class="pane card"><svg width="200" height="130" viewBox="0 0 200 130"><rect x="30" y="10" width="140" height="100" fill="#f3f7fb" stroke="${C.sub}" stroke-width="4"/><line x1="100" y1="10" x2="100" y2="110" stroke="${C.sub}" stroke-width="3"/><path d="M40 10 q14 50 0 100 h22 q14 -50 0 -100z M108 10 q14 50 0 100 h22 q14 -50 0 -100z" fill="#fff" stroke="#e3ddd2" stroke-width="2"/><circle cx="160" cy="26" r="12" fill="#f0c95a"/></svg>
    <b>窓のある明るい店内・受付</b><span class="tag">ガジュマル・苔玉</span><span class="t">室内で育てやすい樹を選びます。受け皿付きだと安心</span></div>
  <div class="pane card"><svg width="200" height="130" viewBox="0 0 200 130"><path d="M20 30 H180 L168 56 H32 Z" fill="${C.gold}"/><path d="M32 56 q12 10 24 0 q12 10 24 0 q12 10 24 0 q12 10 24 0 q12 10 24 0" fill="none" stroke="${C.gold}" stroke-width="4"/><rect x="40" y="62" width="120" height="58" fill="#f6f1e8" stroke="${C.sub}" stroke-width="3"/><rect x="84" y="74" width="32" height="46" fill="#e6dccb" stroke="${C.sub}" stroke-width="3"/></svg>
    <b>入口の軒下・店先</b><span class="tag">真柏・松・長寿梅</span><span class="t">日が当たり、雨風をある程度しのげれば屋外の樹も育ちます</span></div>
</div>
<div class="avoid card"><b>避けておくと安心なこと</b><ul><li>真っ赤な鉢や包装（火事を連想させるとされる）</li><li>冬に葉を落とした姿の樹（枯れたと受け取られることも）</li><li>毎日の手入れが欠かせない樹</li></ul></div>`),

  // 長寿祝いの年齢と色
  'kanreki-age-colors': () => {
    const items = [['還暦', '60歳', '#c8433a', '赤', '#fff'], ['古希', '70歳', '#7d5a9e', '紫', '#fff'], ['喜寿', '77歳', '#7d5a9e', '紫', '#fff'], ['傘寿', '80歳', '#d9a43a', '黄・金茶', C.ink], ['米寿', '88歳', '#d9a43a', '黄・金茶', C.ink], ['白寿', '99歳', '#ffffff', '白', C.ink]]
    return base(`<h1>長寿祝いの年齢とお祝いの色</h1>
<p class="lead">色は、鉢や花の色で取り入れると選びやすくなります</p>
<style>.grid{margin-top:24px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.it{padding:20px 10px 18px;text-align:center}.dot{width:104px;height:104px;margin:0 auto;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid #e3dccf}.dot b{font-size:30px;line-height:1.2}.dot span{font-size:20px}.it .c{display:block;margin-top:12px;font-size:23px;font-weight:700}
.hint{margin-top:16px;padding:16px 22px;font-size:22px;line-height:1.7;color:${C.sub}}.hint b{color:${C.ink}}</style>
<div class="grid">${items.map(([n, a, bg, c, fg]) => `<div class="it card"><div class="dot" style="background:${bg};color:${fg}"><b>${n}</b><span>${a}</span></div><span class="c">${c}</span></div>`).join('')}</div>
<div class="hint card"><b>例：</b>還暦には赤い花の長寿梅や朱色の鉢、白寿には白梅や白い鉢</div>
<p class="note">※ お祝いの色は、地域や家によって違う考え方もあります。</p>`)
  },

  // 退職祝い：手渡すか、届けるか
  'retirement-handover': () => base(`<h1>送別会で手渡すか、自宅に届けるか</h1>
<p class="lead">渡し方で、選ぶ大きさと準備が変わります</p>
<style>.two{margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:14px}.pane{padding:20px 18px}.pane h2{margin:0;font-size:27px;text-align:center}.size{margin:12px 0 14px;text-align:center;background:#f5efe4;border-radius:12px;padding:8px;font-size:22px;font-weight:700}.pane ol{margin:0;padding:0;list-style:none;counter-reset:s}.pane li{position:relative;padding:0 0 14px 44px;font-size:21px;line-height:1.55;color:${C.sub}}.pane li b{display:block;color:${C.ink};font-size:22px}.pane li:before{counter-increment:s;content:counter(s);position:absolute;left:0;top:2px;width:32px;height:32px;border-radius:50%;background:${C.gold};color:#fff;font-weight:700;font-size:19px;display:flex;align-items:center;justify-content:center}</style>
<div class="two">
  <div class="pane card"><h2>手渡す</h2><div class="size">高さ20cmほどまで</div><ol>
    <li><b>2〜3週間前</b>樹と予算を決めて注文。連名もまとめる</li>
    <li><b>前日まで</b>箱から出して、明るい場所で休ませる</li>
    <li><b>当日</b>水やりは控えめに。箱ごと手提げ袋へ</li></ol></div>
  <div class="pane card"><h2>自宅に届ける</h2><div class="size">大きさは自由</div><ol>
    <li><b>注文前</b>受け取れる日を本人や家族に確かめる</li>
    <li><b>注文時</b>配達日を指定する</li>
    <li><b>届いたら</b>すぐ箱から出し、明るい日陰で休ませてから水を</li></ol></div>
</div>
<p class="note">※ 電車で帰る方も多いので、手渡しなら持ち帰りやすい大きさと重さにします。</p>`),

  // お歳暮の盆栽を届けるまでの流れ
  'oseibo-schedule': () => flow('お歳暮の盆栽を届けるまでの流れ', '12月は配送が混み合うので、早めに動きます', [
    ['11月中旬〜下旬', '選ぶ', '贈る相手と樹を決め、予算の範囲で商品を選ぶ'],
    ['12月上旬', '注文する', '受け取れる日を確かめてから、配達日を指定する'],
    ['12月20日ごろまで', '届ける', '年末に休業するショップもあるので発送予定を確認'],
  ], `<div class="late card"><b>間に合わなかったとき</b><div class="row"><span>年明け〜松の内</span><em>「御年賀」</em></div><div class="row"><span>松の内〜立春（2月4日ごろ）</span><em>「寒中御見舞」</em></div></div>`, '※ 松の内は地域により1月7日または15日までです。'),

  // クリスマスの盆栽を室内に飾る日数
  'christmas-indoor-days': () => dayStrip('クリスマスに室内へ飾るのは2〜3日', '当日を中心に飾り、ほかの日は屋外の明るい軒下に戻します', [
    ['12/22', 'out'], ['12/23', 'in'], ['12/24', 'in'], ['12/25', 'in'], ['12/26', 'out'], ['12/27', 'out'],
  ], { in: ['室内', '#cf4f5c', '#fff'], out: ['屋外', '#e8efe2', '#3f5c2e'] }, `<div class="after card"><b>そのあとは</b>オーナメントを外して、南天や真柏をそのまま正月の飾りに</div>`, '※ 屋外に戻すときは、日中の暖かい時間にすると樹の負担が少なくなります。'),

  // 正月飾りを飾る日と片付ける日
  'new-year-display-dates': () => dayStrip('盆栽を正月に飾る日の目安', '28日ごろまでに飾り、松の内を目安に片付けます', [
    ['12/27', 'ok'], ['12/28', 'best'], ['12/29', 'avoid'], ['12/30', 'ok'], ['12/31', 'avoid'],
  ], { best: ['よい日', '#b8935a', '#fff'], ok: ['飾れる', '#e8efe2', '#3f5c2e'], avoid: ['避ける家も', '#f3e3e0', '#a2463e'] }, `<div class="after card"><b>12/28</b>「八」が末広がりで縁起がよいとされる<br><b>12/29</b>「苦」に通じるとして避けることがある<br><b>12/31</b>「一夜飾り」として避けることがある<br><b>片付け</b>松の内（1月7日または15日）が目安</div>`, '※ 習わしは家や地域によって違います。樹のためには、室内に置く日数を短くします。'),

  // 種から育てる盆栽の成長の目安
  'kit-growth-timeline': () => flow('種から盆栽らしくなるまでの目安', '何年もかけて、少しずつ形を作っていきます', [
    ['数週間〜数か月', '発芽', '種類によって早さに大きな差がある'],
    ['1年目', '苗を育てる', '真夏の水切れと冬の凍結を防いで、冬越しさせる'],
    ['2〜3年目', '植え替え', '1本ずつ鉢に植え替え、幹を太らせる'],
    ['3〜5年目以降', '形を作る', '剪定や針金かけで樹形を整えていく'],
  ], '', '※ 育ち方は樹の種類や環境で大きく変わります。毎年同じ時期に写真を撮ると成長がよく分かります。'),
}

// 番号付きの確認リスト
const checklist = (title, lead, items, note) => base(`<h1>${title}</h1><p class="lead">${lead}</p>
<style>.list{margin-top:24px;display:flex;flex-direction:column;gap:12px}.li{display:flex;gap:16px;align-items:center;padding:16px 20px}.li b{display:block;font-size:26px;line-height:1.4}.li span.t{display:block;font-size:22px;color:${C.sub};line-height:1.5}</style>
<div class="list">${items.map(([h, t], i) => `<div class="li card"><span class="k" style="background:${C.gold}">${i + 1}</span><div><b>${h}</b><span class="t">${t}</span></div></div>`).join('')}</div>
<p class="note">${note}</p>`)

// 時期つきの縦の流れ
const flow = (title, lead, steps, extra, note) => base(`<h1>${title}</h1><p class="lead">${lead}</p>
<style>.flow{margin-top:24px;display:flex;flex-direction:column}.st{display:grid;grid-template-columns:200px 1fr;gap:16px;align-items:center;padding:16px 20px}.when{background:#f5efe4;border-radius:12px;padding:10px 8px;text-align:center;font-size:21px;font-weight:700;color:#7a5a2c;line-height:1.35}.st b{display:block;font-size:27px;line-height:1.35}.st span{display:block;font-size:21px;color:${C.sub};line-height:1.5;margin-top:2px}.down{width:0;height:0;margin:6px auto;border-left:14px solid transparent;border-right:14px solid transparent;border-top:14px solid ${C.gold}}
.late{margin-top:16px;padding:16px 22px}.late b{display:block;font-size:24px;margin-bottom:6px}.late .row{display:flex;justify-content:space-between;font-size:22px;line-height:1.8;color:${C.sub}}.late em{font-style:normal;font-weight:700;color:${C.ink}}</style>
<div class="flow">${steps.map(([w, h, t], i) => `${i ? '<div class="down"></div>' : ''}<div class="st card"><div class="when">${w}</div><div><b>${h}</b><span>${t}</span></div></div>`).join('')}</div>${extra}
<p class="note">${note}</p>`)

// 日付の帯
const dayStrip = (title, lead, days, kinds, extra, note) => base(`<h1>${title}</h1><p class="lead">${lead}</p>
<style>.strip{margin-top:24px;padding:18px 14px;display:grid;grid-template-columns:repeat(${days.length},1fr);gap:8px}.d{border-radius:14px;padding:14px 4px;text-align:center}.d b{display:block;font-size:24px}.d span{display:block;margin-top:6px;font-size:19px;font-weight:700;line-height:1.3}
.after{margin-top:16px;padding:16px 22px;font-size:22px;line-height:1.8;color:${C.sub}}.after b{color:${C.ink};margin-right:10px}</style>
<div class="strip card">${days.map(([d, k]) => `<div class="d" style="background:${kinds[k][1]};color:${kinds[k][2]}"><b>${d}</b><span>${kinds[k][0]}</span></div>`).join('')}</div>${extra}
<p class="note">${note}</p>`)

// 12か月の見ごろ表（f:花 f2:咲くことがある花 m:実）
const monthChart = (title, lead, rows, note) => {
  const col = 40, color = { f: '#ec9fb4', f2: '#f6d3dd', m: '#cf4f5c' }
  return base(`<h1>${title}</h1><p class="lead">${lead}</p>
<style>.mc{margin-top:24px;padding:14px 16px 10px}.r{display:grid;grid-template-columns:120px ${col * 12}px;align-items:center;height:60px;border-top:2px solid #f0eadf}.r.h{height:40px;border-top:0;font-size:19px;color:${C.sub};font-weight:500}.n{font-size:23px;font-weight:700}.tr{position:relative;height:100%;display:grid;grid-template-columns:repeat(12,${col}px)}.tr span{border-left:2px dashed #ece5d8}.h .tr span{border:0;text-align:center;line-height:40px}.b{position:absolute;top:14px;bottom:14px;border-radius:16px}
.lg{display:flex;gap:22px;margin-top:14px;font-size:21px;color:${C.sub}}.lg i{display:inline-block;width:30px;height:18px;border-radius:9px;margin-right:8px;vertical-align:-2px}</style>
<div class="mc card"><div class="r h"><div></div><div class="tr">${Array.from({ length: 12 }, (_, i) => `<span>${i + 1}</span>`).join('')}</div></div>
${rows.map(([n, bars]) => `<div class="r"><div class="n">${n}</div><div class="tr">${Array.from({ length: 12 }, () => '<span></span>').join('')}${bars.map(([s, e, k]) => `<div class="b" style="left:${(s - 1) * col + 3}px;width:${(e - s + 1) * col - 6}px;background:${color[k]}"></div>`).join('')}</div></div>`).join('')}</div>
<div class="lg"><span><i style="background:${color.f}"></i>花</span><span><i style="background:${color.f2}"></i>咲くことがある花</span><span><i style="background:${color.m}"></i>実</span></div>
<p class="note">${note}</p>`)
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
