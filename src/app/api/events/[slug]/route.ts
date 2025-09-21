import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = supabaseServer
    const { slug } = params

    // イベント詳細を取得
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        garden:gardens(id, name, prefecture, address, phone, website_url)
      `)
      .eq('slug', slug)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // 関連記事を取得
    const { data: eventArticles } = await supabase
      .from('event_articles')
      .select(`
        *,
        article:articles(id, title, slug, excerpt, eyecatch_url)
      `)
      .eq('event_id', event.id)

    // 同じ地域の近日中のイベントを取得（関連イベント）
    const { data: relatedEvents } = await supabase
      .from('events')
      .select('id, title, slug, start_date, end_date, venue_name, types, price_type')
      .eq('prefecture', event.prefecture)
      .neq('id', event.id)
      .gte('start_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(5)

    return NextResponse.json({
      event,
      event_articles: eventArticles || [],
      related_events: relatedEvents || []
    })

  } catch (error) {
    console.error('Event detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}