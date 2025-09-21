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
  // サイトマップインデックス形式で各専用サイトマップを参照
  return [
    {
      url: `${baseUrl}/sitemap-static.xml`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sitemap-products.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sitemap-articles.xml`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sitemap-events.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sitemap-gardens.xml`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sitemap-images.xml`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  ]
}