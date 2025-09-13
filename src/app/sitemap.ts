import { MetadataRoute } from 'next'
import { getArticles } from '@/lib/microcms'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.bonsai-collection.com'
  
  // 静的ページ
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ]

  try {
    // 動的な記事ページ
    const { articles } = await getArticles({ limit: 1000 })
    const articlePages = articles.map((article) => ({
      url: `${baseUrl}/guides/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...articlePages]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    // エラーが発生した場合は静的ページのみ返す
    return staticPages
  }
}