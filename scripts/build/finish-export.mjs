// next build（output: 'export'）のあとの仕上げ：転送の一覧（out/redirects.txt）を out/_redirects に足し、SNS 用の表示（OGP）を整える
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'fs'
import path from 'path'

const generated = 'out/redirects.txt'
if (!existsSync('out/_redirects') || !existsSync(generated)) {
  console.error('out/_redirects または out/redirects.txt がありません（next build が終わっているか確かめてください）')
  process.exit(1)
}
const lines = readFileSync(generated, 'utf8').trim()
// Cloudflare Pages は、:slug や * を含む転送（動的）より後ろの行をすべて動的として数え、動的は100件までしか効かない。
// そのため固定の転送を先に、動的な転送を最後に並べ直す
const isDynamic = line => /[:*]/.test(line.split(/\s+/)[0] ?? '')
const base = readFileSync('out/_redirects', 'utf8').split('\n')
const dynamicLines = base.filter(line => line.trim() && !line.startsWith('#') && isDynamic(line))
writeFileSync(
  'out/_redirects',
  `${base.filter(line => !dynamicLines.includes(line)).join('\n').trimEnd()}\n\n# 掲載をやめた園・削除扱いの記事（src/app/redirects.txt/route.ts から作る）\n${lines}\n\n# 動的な転送（固定の転送より後ろに置く）\n${dynamicLines.join('\n')}\n`,
)
rmSync(generated)
console.log(`_redirects: ${lines.split('\n').length} 件を追加`)

// SNS で共有されたときの表示（OGP）を整える
// ・ページ側で openGraph を書いていないページは、サイト共通の og:title・og:description のままになるので、ページの <title> と説明文に置き換える
// ・og:image がないページには、共通の画像（public/images/og-default.jpg）を入れる
// ・og:url がないページには canonical の URL を入れる
const SITE = 'https://www.bonsai-collection.com'
const SITE_OG_TITLE = '盆栽コレクション｜初心者向け盆栽の選び方・育て方と通販ガイド'
const SITE_TW_TITLE = '盆栽コレクション - 美しい盆栽を見つける'
const DEFAULT_IMAGE = `${SITE}/images/og-default.jpg`

function htmlFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = path.join(dir, name)
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : []
  })
}

const meta = (attr, key) => new RegExp(`<meta ${attr}="${key.replace(/:/g, '\\:')}" content="([^"]*)"\\s*/?>`)
let fixedTitle = 0, addedImage = 0
for (const file of htmlFiles('out')) {
  const original = readFileSync(file, 'utf8')
  let html = original
  if (!html.includes('</head>')) continue
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]
  const desc = html.match(meta('name', 'description'))?.[1]
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"\s*\/?>/)?.[1]
  const add = []

  const ogTitle = html.match(meta('property', 'og:title'))
  if (title && ogTitle && ogTitle[1] === SITE_OG_TITLE && title !== SITE_OG_TITLE) {
    html = html.replace(ogTitle[0], `<meta property="og:title" content="${title}"/>`)
    const ogDesc = html.match(meta('property', 'og:description'))
    if (desc && ogDesc) html = html.replace(ogDesc[0], `<meta property="og:description" content="${desc}"/>`)
    const twTitle = html.match(meta('name', 'twitter:title'))
    if (twTitle && twTitle[1] === SITE_TW_TITLE) html = html.replace(twTitle[0], `<meta name="twitter:title" content="${title}"/>`)
    const twDesc = html.match(meta('name', 'twitter:description'))
    if (desc && twDesc) html = html.replace(twDesc[0], `<meta name="twitter:description" content="${desc}"/>`)
    fixedTitle++
  }
  if (canonical && !meta('property', 'og:url').test(html)) add.push(`<meta property="og:url" content="${canonical}"/>`)
  if (!meta('property', 'og:image').test(html)) {
    add.push(`<meta property="og:image" content="${DEFAULT_IMAGE}"/>`, '<meta property="og:image:width" content="1200"/>', '<meta property="og:image:height" content="630"/>')
    if (!meta('name', 'twitter:image').test(html)) add.push(`<meta name="twitter:image" content="${DEFAULT_IMAGE}"/>`)
    addedImage++
  }
  if (add.length) {
    const end = html.indexOf('</head>')
    html = html.slice(0, end) + add.join('') + html.slice(end)
  }
  if (html !== original) writeFileSync(file, html)
}
console.log(`OGP: タイトルを直したページ ${fixedTitle} 件、共通の画像を入れたページ ${addedImage} 件`)

// いつ作ったサイトかを書き出す（GitHub Actions の作り直しのあと、公開されたかをこのファイルで確かめる）
writeFileSync('out/build-info.json', JSON.stringify({ builtAt: new Date().toISOString(), commit: process.env.CF_PAGES_COMMIT_SHA || null }))
console.log('build-info.json を書き出しました')
