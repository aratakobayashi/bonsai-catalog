// 楽天の商品を Supabase に同期する（GitHub Actions から毎日実行。scripts/daily/README.md）
// 1回の同期は約40秒で区切られる（Vercel の時間制限に合わせた作り）ため、残りのカテゴリがなくなるまで繰り返す
import { syncRakutenProducts } from '../../src/lib/rakuten-sync'

const MAX_ROUNDS = 6

async function main() {
  let upserted = 0
  let failedRounds = 0
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const summary = await syncRakutenProducts()
    upserted += summary.upserted
    console.log(`round ${round}: processed=${summary.processedCategories.join(',')} fetched=${summary.fetched} upserted=${summary.upserted} deactivated=${summary.deactivated} remaining=${summary.remainingCategories}`)
    if (summary.errors.length) console.log(`  errors: ${summary.errors.slice(0, 5).join(' / ')}`)
    if (!summary.ok && summary.upserted === 0) failedRounds++
    if (summary.remainingCategories === 0) break
  }
  console.log(`total upserted=${upserted}`)
  if (failedRounds > 0 && upserted === 0) process.exit(1)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
