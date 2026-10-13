// next build（output: 'export'）のあとの仕上げ：転送の一覧（out/redirects.txt）を out/_redirects に足す
import { appendFileSync, existsSync, readFileSync, rmSync } from 'fs'

const generated = 'out/redirects.txt'
if (!existsSync('out/_redirects') || !existsSync(generated)) {
  console.error('out/_redirects または out/redirects.txt がありません（next build が終わっているか確かめてください）')
  process.exit(1)
}
const lines = readFileSync(generated, 'utf8').trim()
appendFileSync('out/_redirects', `\n# 掲載をやめた園・削除扱いの記事（src/app/redirects.txt/route.ts から作る）\n${lines}\n`)
rmSync(generated)
console.log(`_redirects: ${lines.split('\n').length} 件を追加`)
