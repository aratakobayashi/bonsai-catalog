import { MetadataRoute } from 'next'
import { getArticles } from '@/lib/database/articles'
import { supabase } from '@/lib/supabase'

const baseUrl = 'https://www.bonsai-collection.com'

// 盆栽カテゴリ一覧
const bonsaiCategories = [
  '松柏類', '雑木類', '花もの', '実もの', '草もの',
  'ミニ盆栽', '初心者向け', '室内向け'
]

// 価格帯一覧
const priceRanges = [
  { min: 0, max: 5000, label: '5,000円以下' },
  { min: 5000, max: 10000, label: '5,000-10,000円' },
  { min: 10000, max: 20000, label: '10,000-20,000円' },
  { min: 20000, max: 50000, label: '20,000-50,000円' },
  { min: 50000, max: null, label: '50,000円以上' }
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ（エラーを避けるため非同期処理を削除）
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
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // カテゴリページ
  const categoryPages: MetadataRoute.Sitemap = bonsaiCategories.map(category => ({
    url: `${baseUrl}/products?category=${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 価格帯ページ
  const pricePages: MetadataRoute.Sitemap = priceRanges.map(range => {
    const params = new URLSearchParams()
    params.set('price_min', range.min.toString())
    if (range.max) params.set('price_max', range.max.toString())

    return {
      url: `${baseUrl}/products?${params.toString()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }
  })

  // 記事タグページ（動的取得）
  let tagPages: MetadataRoute.Sitemap = []
  try {
    const articlesData = await getArticles({ page: 1, limit: 1000 })
    const uniqueTags = new Set<string>()

    articlesData.articles.forEach(article => {
      article.tags?.forEach(tag => {
        uniqueTags.add(tag.slug)
      })
    })

    tagPages = Array.from(uniqueTags).map(tagSlug => ({
      url: `${baseUrl}/guides?tags=${encodeURIComponent(tagSlug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('記事タグページのサイトマップ生成エラー:', error)
  }

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

  return [...staticPages, ...categoryPages, ...pricePages, ...tagPages, ...productPages, ...articlePages, ...gardenPages]
}