import { getArticles } from '@/lib/database/articles'
import { baseUrl, SITEMAP_CONFIG, createSitemapResponse, generateXmlHeader, generateXmlFooter, generateUrlElement } from '@/lib/sitemap-utils'

export async function GET() {
  try {
    const config = SITEMAP_CONFIG.articles

    let urls: string[] = []

    // 記事ページとタグページ
    try {
      const articlesData = await getArticles({ page: 1, limit: 1000 })
      const uniqueTags = new Set<string>()

      // 記事詳細ページ
      const articleUrls = articlesData.articles.map((article) =>
        generateUrlElement(
          `${baseUrl}/guides/${article.slug}`,
          new Date(article.updatedAt).toISOString().split('T')[0],
          'weekly',
          0.7
        )
      )
      urls.push(...articleUrls)

      // タグ収集
      articlesData.articles.forEach(article => {
        article.tags?.forEach(tag => {
          uniqueTags.add(tag.slug)
        })
      })

      // タグページ
      const tagUrls = Array.from(uniqueTags).map(tagSlug =>
        generateUrlElement(
          `${baseUrl}/guides?tags=${encodeURIComponent(tagSlug)}`,
          new Date().toISOString().split('T')[0],
          'weekly',
          0.6
        )
      )
      urls.push(...tagUrls)

    } catch (error) {
      console.error('Articles data fetch error:', error)
      // エラーでもガイドトップページは含める
      urls.push(generateUrlElement(`${baseUrl}/guides`, new Date().toISOString().split('T')[0], 'daily', 0.9))
    }

    const xmlContent = `${generateXmlHeader()}${urls.join('')}
${generateXmlFooter()}`

    return createSitemapResponse(xmlContent, 'articles')

  } catch (error) {
    console.error('Articles sitemap generation error:', error)

    // 最小限のサイトマップを返す（ガイドトップページのみ）
    const fallbackXml = `${generateXmlHeader()}${generateUrlElement(`${baseUrl}/guides`, new Date().toISOString().split('T')[0], 'daily', 0.9)}
${generateXmlFooter()}`

    return createSitemapResponse(fallbackXml, 'articles')
  }
}