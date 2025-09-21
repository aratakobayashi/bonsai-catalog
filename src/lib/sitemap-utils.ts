import { MetadataRoute } from 'next'

export const baseUrl = 'https://www.bonsai-collection.com'

export interface SitemapConfig {
  cache: number
  freq: 'monthly' | 'weekly' | 'daily'
  priority: number
}

export const SITEMAP_CONFIG: Record<string, SitemapConfig> = {
  static: { cache: 86400, freq: 'monthly', priority: 0.8 },
  products: { cache: 3600, freq: 'daily', priority: 0.9 },
  articles: { cache: 21600, freq: 'weekly', priority: 0.7 },
  gardens: { cache: 43200, freq: 'monthly', priority: 0.6 },
  events: { cache: 21600, freq: 'daily', priority: 0.8 },
  images: { cache: 86400, freq: 'monthly', priority: 0.5 }
}

export function createSitemapResponse(xmlContent: string, configKey: string): Response {
  const config = SITEMAP_CONFIG[configKey]

  return new Response(xmlContent, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${config.cache}, stale-while-revalidate=${config.cache * 2}`
    }
  })
}

export function createSitemapUrl(loc: string, lastModified?: Date, configKey?: string): MetadataRoute.Sitemap[0] {
  const config = configKey ? SITEMAP_CONFIG[configKey] : { freq: 'weekly', priority: 0.5 }

  return {
    url: loc,
    lastModified: lastModified || new Date(),
    changeFrequency: config.freq as any,
    priority: config.priority
  }
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function generateXmlHeader(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
}

export function generateXmlFooter(): string {
  return '</urlset>'
}

export function generateUrlElement(url: string, lastMod?: string, changeFreq?: string, priority?: number): string {
  return `
  <url>
    <loc>${escapeXml(url)}</loc>
    ${lastMod ? `<lastmod>${lastMod}</lastmod>` : ''}
    ${changeFreq ? `<changefreq>${changeFreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`
}