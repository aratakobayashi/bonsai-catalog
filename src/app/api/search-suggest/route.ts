import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedSpecies, getSearchSuggestions } from '@/lib/search-suggest'

// 検索候補：商品・記事はキャッシュ済みのデータを使い、応答も CDN・ブラウザで短時間キャッシュする
const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600' }

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').trim()
  try {
    if (!q) return NextResponse.json({ species: await getFeaturedSpecies() }, { headers: CACHE_HEADERS })
    return NextResponse.json(await getSearchSuggestions(q), { headers: CACHE_HEADERS })
  } catch (error) {
    console.error('検索候補の取得エラー:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: '検索候補を取得できませんでした' }, { status: 500 })
  }
}
