import { getGuidesData } from '@/lib/guides-data'

// 記事一覧をブラウザで絞り込むためのデータ（ビルド時に1回だけ作る静的なファイル）
export const dynamic = 'force-static'

export async function GET() {
  return new Response(JSON.stringify(await getGuidesData()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
}
