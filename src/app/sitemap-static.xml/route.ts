import eventData from '@/data/event-updates.json'
import { SELECTIONS } from '@/lib/selections'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { ZUKAN_ENTRIES } from '@/lib/zukan'
import { SHOJO } from '@/lib/shojo'
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
      ...SHOP_CATEGORIES.map(category => ({
        url: `${baseUrl}/products/category/${category.slug}`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'daily',
        priority: 0.8
      })),
      {
        url: `${baseUrl}/events`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'weekly',
        priority: 0.7
      },
      ...(eventData.inserts as { slug: string }[]).map(event => ({
        url: `${baseUrl}/events/${event.slug}`,
        lastMod: eventData.verifiedAt || new Date().toISOString().split('T')[0],
        changeFreq: 'weekly',
        priority: 0.6
      })),
      // 選ぶ・育てる道具
      ...['/okurimono', '/kumiawase', '/soroeru', '/teire', '/shojo', '/hajimete', '/zukan', '/note'].map(path => ({
        url: `${baseUrl}${path}`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'weekly',
        priority: 0.8
      })),
      ...Array.from({ length: 12 }, (_, i) => ({
        url: `${baseUrl}/teire/${i + 1}`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'monthly',
        priority: 0.7
      })),
      ...SHOJO.map(entry => ({
        url: `${baseUrl}/shojo/${entry.slug}`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'monthly',
        priority: 0.7
      })),
      ...ZUKAN_ENTRIES.map(entry => ({
        url: `${baseUrl}/zukan/${entry.slug}`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'monthly',
        priority: 0.6
      })),
      {
        url: `${baseUrl}/shindan`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/selection`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'weekly',
        priority: 0.8
      },
      ...SELECTIONS.map(selection => ({
        url: `${baseUrl}/selection/${selection.slug}`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'weekly',
        priority: 0.9
      })),
      {
        url: `${baseUrl}/gardens`,
        lastMod: new Date().toISOString().split('T')[0],
        changeFreq: 'weekly',
        priority: 0.8
      },
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