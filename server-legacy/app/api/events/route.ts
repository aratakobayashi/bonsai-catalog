import { NextRequest, NextResponse } from 'next/server'
import { getEvents, getEventPrefectures, getUpcomingEventsCount } from '@/lib/events'
import { EventType } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // API仕様に従ったクエリパラメータ取得
    const month = searchParams.get('month') || undefined          // 2025-11
    const prefecture = searchParams.get('prefecture') || undefined // 埼玉県
    const typesParam = searchParams.get('types')                 // exhibition,workshop
    const gardenId = searchParams.get('gardenId') || undefined   // UUID
    const q = searchParams.get('q') || undefined                 // キーワード
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // types文字列をEventType配列に変換
    const types: EventType[] | undefined = typesParam
      ? typesParam.split(',').filter(t =>
          ['exhibition', 'sale', 'workshop', 'lecture'].includes(t)
        ) as EventType[]
      : undefined

    // メインクエリ実行
    const result = await getEvents({
      month,
      prefecture,
      types,
      gardenId,
      q,
      page,
      limit
    })

    // 追加データ取得（並列実行）
    const [prefectures, upcomingCount] = await Promise.all([
      getEventPrefectures(),
      getUpcomingEventsCount()
    ])

    // JSON返却（日本語対応）
    return NextResponse.json({
      events: result.events,
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasNext: result.hasNext,
      hasPrev: result.hasPrev,
      prefectures,
      upcoming_count: upcomingCount
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}