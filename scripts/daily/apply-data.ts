// 盆栽園・イベントの確認結果（src/data/garden-updates.json・event-updates.json）を Supabase に反映する
// GitHub Actions の手動実行（task: gardens / events）から使う。何度実行しても同じ結果になる（旧 /api/admin/*/apply と同じ処理）
import { getSupabaseAdmin } from '../../src/lib/supabase-admin'
import { isGardenHiddenId } from '../../src/lib/garden-verification'
import updates from '../../src/data/garden-updates.json'
import eventData from '../../src/data/event-updates.json'

async function applyGardens() {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('SUPABASE_SERVICE_ROLE_KEY が設定されていません')

  const errors: string[] = []
  let updated = 0
  for (const { id, set } of updates.updates) {
    const { error } = await supabase.from('gardens').update({ ...set, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) errors.push(`update ${set.name ?? id}: ${error.message}`)
    else updated++
  }

  // 同じ名前・都道府県の掲載中の園がなければ追加する（非公開にした誤ったデータと同名の園は追加する）
  const { data: existing, error: listError } = await supabase.from('gardens').select('id, name, prefecture')
  if (listError) errors.push(`list: ${listError.message}`)
  const published = new Set(
    (existing || []).filter(g => !isGardenHiddenId(g.id)).map(g => `${g.name}|${g.prefecture}`)
  )
  const toInsert = updates.inserts.filter(row => !published.has(`${row.name}|${row.prefecture}`))
  let inserted = 0
  for (let i = 0; i < toInsert.length; i += 50) {
    const chunk = toInsert.slice(i, i + 50)
    const { error } = await supabase.from('gardens').insert(chunk)
    if (error) errors.push(`insert: ${error.message}`)
    else inserted += chunk.length
  }

  return { updated, inserted, alreadyPresent: updates.inserts.length - toInsert.length, errors }
}

async function applyEvents() {
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('SUPABASE_SERVICE_ROLE_KEY が設定されていません')

  const errors: string[] = []
  let deleted = 0
  const deleteIds = eventData.deleteIds as string[]
  for (let i = 0; i < deleteIds.length; i += 50) {
    const chunk = deleteIds.slice(i, i + 50)
    const { error, count } = await supabase.from('events').delete({ count: 'exact' }).in('id', chunk)
    if (error) errors.push(`delete: ${error.message}`)
    else deleted += count ?? 0
  }

  const { data: existing, error: listError } = await supabase.from('events').select('id, slug')
  if (listError) errors.push(`list: ${listError.message}`)
  const idBySlug = new Map((existing || []).map(e => [e.slug as string, e.id as string]))

  let inserted = 0
  let updated = 0
  for (const row of eventData.inserts as Record<string, unknown>[]) {
    const id = idBySlug.get(row.slug as string)
    const { error } = id
      ? await supabase.from('events').update({ ...row, updated_at: new Date().toISOString() }).eq('id', id)
      : await supabase.from('events').insert(row)
    if (error) errors.push(`${row.slug}: ${error.message}`)
    else if (id) updated++
    else inserted++
  }

  return { deleted, inserted, updated, errors }
}

async function main() {
  const task = process.argv[2]
  const result = task === 'gardens' ? await applyGardens() : task === 'events' ? await applyEvents() : null
  if (!result) throw new Error('使い方: tsx scripts/daily/apply-data.ts gardens|events')
  console.log(JSON.stringify(result, null, 2))
  if (result.errors.length > 0) process.exit(1)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
