import verification from '@/data/garden-verification.json'
import { HIDDEN_ARTICLE_SLUGS } from '@/lib/content-policy'
import { supabaseServer } from '@/lib/supabase-server'
import { getGardenList } from '@/lib/gardens-list'
import { prefectureAreaHref } from '@/lib/prefectures'
import { eventHref } from '@/lib/event-url'

// 掲載をやめた園・削除扱いの記事・年つきの盆栽展のURLの転送（Cloudflare Pages の _redirects の書式）。
// ビルドのあと scripts/build/finish-export.mjs が out/_redirects に足し、このファイルは消す
export const dynamic = 'force-static'

// 掲載をやめた園は、その都道府県のまとめページへ（その県に掲載中の園がなければ盆栽園一覧へ）
async function gardenTargets(ids: string[]): Promise<Map<string, string>> {
  const targets = new Map<string, string>()
  const published = new Set((await getGardenList()).map(g => g.prefecture).filter(Boolean))
  const { data, error } = await supabaseServer.from('gardens').select('id, prefecture').in('id', ids)
  if (error) throw new Error(`盆栽園の都道府県の取得エラー: ${error.message}`)
  for (const row of (data || []) as { id: string; prefecture: string | null }[]) {
    if (row.prefecture && published.has(row.prefecture)) targets.set(row.id, prefectureAreaHref(row.prefecture))
  }
  return targets
}

export async function GET() {
  const hidden = verification.hiddenIds as string[]
  const targets = await gardenTargets(hidden)
  // 盆栽展：年つきの古いURL（/events/〇〇-2026）を、年を外したURLへ
  const { data: events, error } = await supabaseServer.from('events').select('slug').limit(5000)
  if (error) throw new Error(`イベントの一覧の取得エラー: ${error.message}`)
  const eventLines = ((events || []) as { slug: string | null }[])
    .map(row => row.slug)
    .filter((slug): slug is string => Boolean(slug) && eventHref(slug as string) !== `/events/${slug}`)
    .map(slug => `/events/${slug} ${eventHref(slug)} 301`)
  const lines = [
    ...eventLines,
    ...hidden.map(id => `/gardens/${id} ${targets.get(id) ?? '/gardens'} 301`),
    ...Array.from(HIDDEN_ARTICLE_SLUGS).map(slug => `/guides/${slug} /guides 301`),
  ]
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
