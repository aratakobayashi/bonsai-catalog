import { supabase } from '@/lib/supabase'
import { baseUrl, SITEMAP_CONFIG, createSitemapResponse, generateXmlHeader, generateXmlFooter, generateUrlElement } from '@/lib/sitemap-utils'

export async function GET() {
  try {
    const config = SITEMAP_CONFIG.gardens

    let urls: string[] = []

    // 庭園詳細ページ
    try {
      const { data: gardens } = await supabase
        .from('gardens')
        .select('id, created_at, updated_at')

      if (gardens && gardens.length > 0) {
        const gardenUrls = gardens.map((garden: any) =>
          generateUrlElement(
            `${baseUrl}/gardens/${garden.id}`,
            new Date(garden.updated_at || garden.created_at).toISOString().split('T')[0],
            'monthly',
            0.6
          )
        )
        urls.push(...gardenUrls)
      }
    } catch (error) {
      console.error('Gardens data fetch error:', error)
      // エラーでも庭園トップページは含める
      urls.push(generateUrlElement(`${baseUrl}/gardens`, new Date().toISOString().split('T')[0], 'weekly', 0.8))
    }

    const xmlContent = `${generateXmlHeader()}${urls.join('')}
${generateXmlFooter()}`

    return createSitemapResponse(xmlContent, 'gardens')

  } catch (error) {
    console.error('Gardens sitemap generation error:', error)

    // 最小限のサイトマップを返す（庭園トップページのみ）
    const fallbackXml = `${generateXmlHeader()}${generateUrlElement(`${baseUrl}/gardens`, new Date().toISOString().split('T')[0], 'weekly', 0.8)}
${generateXmlFooter()}`

    return createSitemapResponse(fallbackXml, 'gardens')
  }
}