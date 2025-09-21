import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { EventSearchParams } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    // パラメータを取得
    const prefecture = searchParams.get('prefecture')
    const types = searchParams.get('types')?.split(',').filter(Boolean)
    const garden_id = searchParams.get('garden_id')
    const month = searchParams.get('month')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // ベースクエリを構築
    let query = supabase
      .from('events')
      .select(`
        *,
        garden:gardens(id, name, prefecture, address)
      `)

    // フィルターを適用
    if (prefecture) {
      query = query.eq('prefecture', prefecture)
    }

    if (types && types.length > 0) {
      query = query.overlaps('types', types)
    }

    if (garden_id) {
      query = query.eq('garden_id', garden_id)
    }

    if (month) {
      const [year, monthNum] = month.split('-')
      const startOfMonth = `${year}-${monthNum.padStart(2, '0')}-01`
      const endOfMonth = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split('T')[0]
      query = query.gte('start_date', startOfMonth).lte('start_date', endOfMonth)
    }

    if (search) {
      query = query.or(`
        title.ilike.%${search}%,
        venue_name.ilike.%${search}%,
        organizer_name.ilike.%${search}%,
        description.ilike.%${search}%
      `)
    }

    // カウントクエリ
    const { count } = await query.select('*', { count: 'exact', head: true })

    // データクエリ
    const { data: events, error } = await query
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Events fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    // 都道府県一覧を取得（フィルター用）
    const { data: prefectureData } = await supabase
      .from('events')
      .select('prefecture')
      .order('prefecture')

    const prefectures = [...new Set(prefectureData?.map(p => p.prefecture) || [])]

    // 今後のイベント数を取得
    const today = new Date().toISOString().split('T')[0]
    const { count: upcomingCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('start_date', today)

    return NextResponse.json({
      events: events || [],
      total: count || 0,
      page,
      limit,
      prefectures,
      upcoming_count: upcomingCount || 0
    })

  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}