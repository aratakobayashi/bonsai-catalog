import { SELECTIONS } from '@/lib/selections'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { baseUrl, SITEMAP_CONFIG, createSitemapResponse, generateXmlHeader, generateXmlFooter, generateUrlElement } from '@/lib/sitemap-utils'

export const revalidate = 3600

export async function GET() {
  try {
    const config = SITEMAP_CONFIG.static

    const staticPages = [
      {
        url: `${baseUrl}/`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'weekly',
        priority: 1.0
      },
      {
        url: `${baseUrl}/products`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/guides`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/shop`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'daily',
        priority: 0.9
      },
      ...SHOP_CATEGORIES.map(category => ({
        url: `${baseUrl}/shop/${category.slug}`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'daily',
        priority: 0.8
      })),
      ...SELECTIONS.map(selection => ({
        url: `${baseUrl}/selection/${selection.slug}`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'weekly',
        priority: 0.9
      })),
      {
        url: `${baseUrl}/about`,
        lastMod: new Date('2026-06-15').toISOString().split('T')[0],
        changeFreq: 'monthly',
        priority: 0.5
      },
      {
        url: `${baseUrl}/contact`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'monthly',
        priority: 0.5
      },
      {
        url: `${baseUrl}/faq`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'monthly',
        priority: 0.5
      },
      {
        url: `${baseUrl}/privacy`,
        lastMod: new Date('2024-01-01').toISOString().split('T')[0],
        changeFreq: 'monthly',
        priority: 0.3
      },
      {
        url: `${baseUrl}/terms`,
        lastMod: new Date('2024-01-01').toISOString().split('T')[0],
        changeFreq: 'monthly',
        priority: 0.3
      }
    ]

    const xmlContent = `${generateXmlHeader()}${staticPages.map(page =>
      generateUrlElement(page.url, page.lastMod, page.changeFreq, page.priority)
    ).join('')}
${generateXmlFooter()}`

    return createSitemapResponse(xmlContent, 'static')

  } catch (error) {
    console.error('Static sitemap generation error:', error)

    // 最小限の静的サイトマップを返す
    const fallbackXml = `${generateXmlHeader()}${generateUrlElement(`${baseUrl}/`, new Date().toISOString().split('T')[0], 'weekly', 1.0)}
${generateXmlFooter()}`

    return createSitemapResponse(fallbackXml, 'static')
  }
}