import { supabase } from '@/lib/supabase'
import { baseUrl, SITEMAP_CONFIG, createSitemapResponse, generateXmlHeader, generateXmlFooter, generateUrlElement } from '@/lib/sitemap-utils'

export async function GET() {
  try {
    const config = SITEMAP_CONFIG.events

    let urls: string[] = []

    // イベント詳細ページ
    try {
      const { data: events } = await supabase
        .from('events')
        .select('slug, created_at, updated_at')

      if (events && events.length > 0) {
        const eventUrls = events.map((event: any) =>
          generateUrlElement(
            `${baseUrl}/events/${event.slug}`,
            new Date(event.updated_at || event.created_at).toISOString().split('T')[0],
            'daily',
            0.8
          )
        )
        urls.push(...eventUrls)
      }
    } catch (error) {
      console.error('Events data fetch error:', error)
      // エラーでもイベントトップページは含める
      urls.push(generateUrlElement(`${baseUrl}/events`, new Date().toISOString().split('T')[0], 'weekly', 0.8))
    }

    const xmlContent = `${generateXmlHeader()}${urls.join('')}
${generateXmlFooter()}`

    return createSitemapResponse(xmlContent, 'events')

  } catch (error) {
    console.error('Events sitemap generation error:', error)

    // 最小限のサイトマップを返す（イベントトップページのみ）
    const fallbackXml = `${generateXmlHeader()}${generateUrlElement(`${baseUrl}/events`, new Date().toISOString().split('T')[0], 'weekly', 0.8)}
${generateXmlFooter()}`

    return createSitemapResponse(fallbackXml, 'events')
  }
}