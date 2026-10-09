import { supabaseServer } from './supabase-server'
import { Event, EventType, EventSearchParams } from '@/types'

export interface EventQueryParams {
  month?: string        // 2025-11
  prefecture?: string   // 埼玉県
  types?: EventType[]   // ['exhibition', 'workshop']
  gardenId?: string     // UUID
  q?: string           // キーワード検索
  page?: number
  limit?: number
}

/**
 * イベント検索・取得のメインクエリ関数
 * 期間/地域/種別/園/キーワードで絞り込み可能
 */
// キーワード検索の条件（改行や空白を含めると PostgREST が解釈できないため1行で組み立てる）
const searchFilter = (q: string) =>
  ['title', 'venue_name', 'organizer_name', 'description'].map(column => `${column}.ilike.%${q}%`).join(',')

// 種別の条件（types 列は jsonb のため、配列演算子ではなく「含む」を OR でつなぐ）
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EVENT_TYPES = new Set(['exhibition', 'sale', 'workshop', 'lecture'])
const typesFilter = (types: string[]) =>
  types.filter(t => EVENT_TYPES.has(t)).map(t => `types.cs.["${t}"]`).join(',')

export async function getEvents(params: EventQueryParams = {}) {
  const {
    month,
    prefecture,
    types,
    gardenId,
    q: rawQ,
    page = 1,
    limit = 20
  } = params
  // キーワードに含まれる区切り文字（, ( ) など）は検索条件の書式を壊すため取り除く
  const q = rawQ?.replace(/[,()%*\\]/g, ' ').trim() || undefined

  const offset = (Math.max(1, page || 1) - 1) * limit

  try {
    // ベースクエリビルダー関数
    const buildQuery = () => {
      let query = supabaseServer.from('events').select('*')

      // 期間フィルター（月指定）
      if (month) {
        const [year, monthNum] = month.split('-')
        const startOfMonth = `${year}-${monthNum.padStart(2, '0')}-01`
        const endOfMonth = new Date(parseInt(year), parseInt(monthNum), 0)
          .toISOString().split('T')[0]

        // 月をまたいで開催するイベントも含める（開始が月末まで、かつ終了が月初以降）
        query = query
          .lte('start_date', endOfMonth)
          .gte('end_date', startOfMonth)
      }

      // 地域フィルター
      if (prefecture) {
        query = query.eq('prefecture', prefecture)
      }

      // イベント種別フィルター
      if (types && types.length > 0) {
        const filter = typesFilter(types)
        if (filter) query = query.or(filter)
      }

      // 盆栽園フィルター
      if (gardenId && UUID_RE.test(gardenId)) {
        query = query.eq('garden_id', gardenId)
      }

      // キーワード検索（タイトル、会場、主催者、説明文で検索）
      if (q) {
        query = query.or(searchFilter(q))
      }

      return query
    }

    // カウントクエリ
    let countQuery = supabaseServer.from('events').select('*', { count: 'exact', head: true })

    // カウントクエリにフィルターを適用
    if (month) {
      const [year, monthNum] = month.split('-')
      const startOfMonth = `${year}-${monthNum.padStart(2, '0')}-01`
      const endOfMonth = new Date(parseInt(year), parseInt(monthNum), 0)
        .toISOString().split('T')[0]

      countQuery = countQuery
        .lte('start_date', endOfMonth)
        .gte('end_date', startOfMonth)
    }

    if (prefecture) {
      countQuery = countQuery.eq('prefecture', prefecture)
    }

    if (types && types.length > 0) {
      const filter = typesFilter(types)
      if (filter) countQuery = countQuery.or(filter)
    }

    if (gardenId && UUID_RE.test(gardenId)) {
      countQuery = countQuery.eq('garden_id', gardenId)
    }

    if (q) {
      countQuery = countQuery.or(searchFilter(q))
    }

    const { count } = await countQuery

    // データクエリ（ページネーション付き）
    const { data: events, error } = await buildQuery()
      .select(`
        *,
        garden:gardens(id, name, prefecture, address)
      `)
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Events query failed: ${error.message}`)
    }

    return {
      events: events || [],
      total: count || 0,
      page,
      limit,
      hasNext: (count || 0) > offset + limit,
      hasPrev: page > 1
    }

  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

/**
 * イベント詳細取得（関連データ付き）
 */
export async function getEventBySlug(slug: string) {
  try {
    // イベント詳細取得
    const { data: event, error: eventError } = await supabaseServer
      .from('events')
      .select(`
        *,
        garden:gardens(id, name, prefecture, address, phone, website_url)
      `)
      .eq('slug', slug)
      .single()

    if (eventError || !event) {
      return null
    }

    // TypeScript用に型を明示的にアサート
    const typedEvent = event as any

    // 関連記事取得
    const { data: eventArticles } = await supabaseServer
      .from('event_articles')
      .select(`
        *,
        article:articles(id, title, slug, excerpt, eyecatch_url)
      `)
      .eq('event_id', typedEvent.id)

    // 関連イベント取得（同じ地域の近日中のイベント）
    const { data: relatedEvents } = await supabaseServer
      .from('events')
      .select('id, title, slug, start_date, end_date, venue_name, prefecture, address, types, price_type, price_note')
      .eq('prefecture', typedEvent.prefecture)
      .neq('id', typedEvent.id)
      .gte('start_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(5)

    return {
      event: typedEvent,
      event_articles: eventArticles || [],
      related_events: relatedEvents || []
    }

  } catch (error) {
    console.error('Error fetching event detail:', error)
    throw error
  }
}

/**
 * 都道府県一覧取得（フィルター用）
 */
export async function getEventPrefectures() {
  try {
    const { data } = await supabaseServer
      .from('events')
      .select('prefecture')
      .order('prefecture')

    const prefectures = [...new Set(data?.map((p: any) => p.prefecture) || [])]
    return prefectures

  } catch (error) {
    console.error('Error fetching prefectures:', error)
    return []
  }
}

/**
 * 今後のイベント数取得
 */
export async function getUpcomingEventsCount() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabaseServer
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('start_date', today)

    return count || 0

  } catch (error) {
    console.error('Error counting upcoming events:', error)
    return 0
  }
}

/**
 * 月別イベント取得（カレンダー表示用）
 */
export async function getEventsByMonth(year: number, month: number) {
  try {
    const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`
    const endOfMonth = new Date(year, month, 0).toISOString().split('T')[0]

    const { data: events, error } = await supabaseServer
      .from('events')
      .select(`
        id, title, slug, start_date, end_date, types,
        venue_name, prefecture, price_type
      `)
      .gte('start_date', startOfMonth)
      .lte('end_date', endOfMonth)
      .order('start_date', { ascending: true })

    if (error) {
      throw new Error(`Month events query failed: ${error.message}`)
    }

    return events || []

  } catch (error) {
    console.error('Error fetching events by month:', error)
    throw error
  }
}