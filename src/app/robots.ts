import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /_next/ は描画に必要な JS・CSS を含むためブロックしない
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://www.bonsai-collection.com/sitemap.xml',
  }
}
