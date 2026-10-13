import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import eventData from '@/data/event-updates.json'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// 盆栽イベントの確認結果（src/data/event-updates.json）を DB に反映する。管理者のみ・何度実行しても同じ結果になる
// 確認できなかった過去のイベント（deleteIds）は削除する（元データは docs/growth/event-audit に保存済み）
export async function POST(request: NextRequest) {
  if (!(await verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY が設定されていません' }, { status: 500 })
  }

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

  revalidatePath('/events')
  revalidatePath('/events/[slug]', 'page')
  revalidatePath('/sitemap-static.xml')
  return NextResponse.json({ ok: errors.length === 0, deleted, inserted, updated, errors: errors.slice(0, 10) })
}
