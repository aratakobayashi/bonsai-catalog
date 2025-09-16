import { MetadataRoute } from 'next'
import { getArticles } from '@/lib/database/articles'
import { supabase } from '@/lib/supabase'

const baseUrl = 'https://www.bonsai-collection.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gardens`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // 商品ページ
  let productPages: MetadataRoute.Sitemap = []
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, created_at, updated_at')
      .eq('is_visible', true)

    if (products && products.length > 0) {
      productPages = (products as Array<{id: string, created_at: string, updated_at: string}>).map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(product.updated_at || product.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('商品ページのサイトマップ生成エラー:', error)
  }

  // 記事ページ
  let articlePages: MetadataRoute.Sitemap = []
  try {
    const articlesData = await getArticles({
      page: 1,
      limit: 1000, // サイトマップでは全記事を取得
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    })

    articlePages = articlesData.articles.map((article) => ({
      url: `${baseUrl}/guides/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('記事ページのサイトマップ生成エラー:', error)
  }

  // 盆栽園ページ
  let gardenPages: MetadataRoute.Sitemap = []
  try {
    const { data: gardens } = await supabase
      .from('gardens')
      .select('id, created_at, updated_at')

    if (gardens && gardens.length > 0) {
      gardenPages = (gardens as Array<{id: string, created_at: string, updated_at: string}>).map((garden) => ({
        url: `${baseUrl}/gardens/${garden.id}`,
        lastModified: new Date(garden.updated_at || garden.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('盆栽園ページのサイトマップ生成エラー:', error)
  }

  return [...staticPages, ...productPages, ...articlePages, ...gardenPages]
}