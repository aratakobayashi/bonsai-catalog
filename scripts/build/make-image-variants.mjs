// next build のあとの仕上げ：out/images の jpg・png から、640px と 1280px 幅の WebP を作る（src/lib/image-loader.js が使う）
// 元の画像の幅が小さいときは、拡大せずに元の幅のまま作る
import { copyFileSync, readdirSync, statSync, existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'out/images'
const WIDTHS = [640, 1280]

function files(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? files(full) : /\.(jpe?g|png)$/i.test(name) ? [full] : []
  })
}

if (!existsSync(ROOT)) {
  console.error(`${ROOT} がありません（next build が終わっているか確かめてください）`)
  process.exit(1)
}
const list = files(ROOT).filter(file => !/\.w\d+\.webp$/.test(file))
let made = 0
const queue = [...list]
async function worker() {
  for (let file = queue.shift(); file; file = queue.shift()) {
    for (const width of WIDTHS) {
      const out = file.replace(/\.(jpe?g|png)$/i, `.w${width}.webp`)
      try {
        await sharp(file).resize({ width, withoutEnlargement: true }).webp({ quality: 72 }).toFile(out)
        made++
      } catch (error) {
        // 画像として読めないファイルは、元のファイルをそのまま小さい版の名前で置く（表示は元と同じになる）
        copyFileSync(file, out)
        console.warn(`読めない画像のため元のまま使います：${file}（${error instanceof Error ? error.message : error}）`)
      }
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker))
console.log(`画像の小さい版：${list.length} 枚から ${made} 個を作成`)
