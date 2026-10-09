// 比較シート（HTML）を PNG にする：node render.mjs <HTML ファイル…>
// playwright-core は作業用フォルダに入れて使う（npm i playwright-core）。Chromium は /opt/pw-browsers にあるものを使う
import { chromium } from 'playwright-core'
import { readdirSync } from 'fs'

const dir = '/opt/pw-browsers'
const chrome = readdirSync(dir).filter(d => d.startsWith('chromium-')).sort().pop()
const browser = await chromium.launch({ executablePath: `${dir}/${chrome}/chrome-linux/chrome` })
const page = await browser.newPage({ viewport: { width: 900, height: 800 } })
for (const file of process.argv.slice(2)) {
  await page.goto('file://' + file, { waitUntil: 'networkidle' })
  await page.screenshot({ path: file.replace(/\.html$/, '.png'), fullPage: true })
}
await browser.close()
