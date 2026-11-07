import { CARE_GROUPS, type CareGroupKey } from '@/lib/care-calendar'
import { careIcs } from '@/lib/care-ics'

// 手入れカレンダーのファイル（/calendar/shohaku.ics など）。ビルド時に樹種グループの数だけ作る
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return CARE_GROUPS.map(g => ({ file: `${g.key}.ics` }))
}

export async function GET(_req: Request, { params }: { params: { file: string } }) {
  const key = params.file.replace(/\.ics$/, '') as CareGroupKey
  if (!CARE_GROUPS.some(g => g.key === key)) return new Response('Not found', { status: 404 })
  return new Response(careIcs(key), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } })
}
