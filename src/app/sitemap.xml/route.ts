import { baseUrl } from '@/lib/sitemap-utils'

// サイトマップインデックス（各サイトマップの目次）
// 盆栽園・イベントは noindex のため含めない
const SITEMAPS = ['sitemap-static.xml', 'sitemap-products.xml', 'sitemap-articles.xml', 'sitemap-images.xml']

export const revalidate = 3600

export async function GET() {
  const lastmod = new Date().toISOString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAPS.map(name => `  <sitemap>
    <loc>${baseUrl}/${name}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200'
    }
  })
}
