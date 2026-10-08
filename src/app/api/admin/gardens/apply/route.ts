import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isGardenHiddenId } from '@/lib/garden-verification'
import updates from '@/data/garden-updates.json'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// 盆栽園データの確認結果（src/data/garden-updates.json）を DB に反映する。管理者のみ・何度実行しても同じ結果になる
export async function POST(request: NextRequest) {
  if (!(await verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY が設定されていません' }, { status: 500 })
  }

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

  revalidatePath('/gardens')
  revalidatePath('/gardens/[id]', 'page')
  revalidatePath('/sitemap-gardens.xml')
  return NextResponse.json({
    ok: errors.length === 0,
    updated,
    inserted,
    alreadyPresent: updates.inserts.length - toInsert.length,
    errors: errors.slice(0, 10),
  })
}
