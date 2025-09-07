/**
 * microCMS API クライアント
 * 記事データの取得・管理
 */

import type { Article, ArticleCategory, ArticleTag, ArticleFilters, ArticleListResponse } from '@/types'

// 仮のmicroCMSクライアント（実際の実装時に置き換え）
// 本実装では microcms-js-sdk を使用予定
const MICROCMS_API_URL = process.env.MICROCMS_API_URL || ''
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY || ''

/**
 * 記事一覧を取得
 */
export async function getArticles(filters: ArticleFilters = {}): Promise<ArticleListResponse> {
  // 暫定的なモックデータ（microCMS実装時に置き換え）
  const mockArticles: Article[] = [
    {
      id: '1',
      title: '【初心者完全版】もみじの盆栽｜美しい紅葉を育てる剪定と管理のコツ',
      slug: 'momiji-bonsai-complete-guide',
      content: '# もみじの盆栽について\n\nもみじの盆栽は四季を通じて美しい姿を楽しめる代表的な樹種です...',
      excerpt: 'もみじの盆栽は四季を通じて美しい姿を楽しめる代表的な樹種です。特に秋の紅葉は圧巻で、多くの愛好家に親しまれています。',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=450&fit=crop',
        alt: 'もみじの盆栽'
      },
      category: {
        id: 'care-guide',
        name: '育て方・管理',
        slug: 'care-guide',
        color: 'bg-green-100 text-green-800',
        icon: '🌱'
      },
      tags: [
        { id: 'momiji', name: 'もみじ', slug: 'momiji', color: 'bg-red-100 text-red-800' },
        { id: 'beginner', name: '初心者', slug: 'beginner', color: 'bg-blue-100 text-blue-800' },
        { id: 'autumn', name: '秋', slug: 'autumn', color: 'bg-orange-100 text-orange-800' }
      ],
      relatedProducts: ['1a87465b-3b3d-409f-a740-f090cbb42b9b'],
      readingTime: 8,
      publishedAt: '2025-07-06T10:00:00Z',
      updatedAt: '2025-07-06T10:00:00Z',
      status: 'published'
    },
    {
      id: '2',
      title: '盆栽初心者が最初に選ぶべき樹種5選｜失敗しない盆栽の始め方',
      slug: 'beginner-bonsai-tree-selection',
      content: '# 初心者におすすめの盆栽\n\n盆栽を始めたいけど、どの樹種を選べばいいかわからない...',
      excerpt: '盆栽を始めたいけど、どの樹種を選べばいいかわからない方へ。初心者でも育てやすく、美しい樹形を楽しめるおすすめ樹種をご紹介します。',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=450&fit=crop',
        alt: '初心者向け盆栽'
      },
      category: {
        id: 'selection-guide',
        name: '選び方・購入ガイド',
        slug: 'selection-guide',
        color: 'bg-blue-100 text-blue-800',
        icon: '🎯'
      },
      tags: [
        { id: 'beginner', name: '初心者', slug: 'beginner', color: 'bg-blue-100 text-blue-800' },
        { id: 'selection', name: '選び方', slug: 'selection', color: 'bg-purple-100 text-purple-800' }
      ],
      relatedProducts: ['1a87465b-3b3d-409f-a740-f090cbb42b9b'],
      readingTime: 6,
      publishedAt: '2025-07-05T10:00:00Z',
      updatedAt: '2025-07-05T10:00:00Z',
      status: 'published'
    },
    {
      id: '3',
      title: '松柏類の盆栽｜黒松・五葉松の育て方と魅力',
      slug: 'pine-bonsai-care-guide',
      content: '# 松柏類の盆栽について\n\n松柏類は盆栽の王様とも呼ばれ、その風格ある姿は多くの人を魅了します...',
      excerpt: '松柏類は盆栽の王様とも呼ばれ、その風格ある姿は多くの人を魅了します。黒松・五葉松の特徴と育て方のポイントを詳しく解説します。',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop',
        alt: '松の盆栽'
      },
      category: {
        id: 'species-guide',
        name: '種類別ガイド',
        slug: 'species-guide',
        color: 'bg-emerald-100 text-emerald-800',
        icon: '🌲'
      },
      tags: [
        { id: 'pine', name: '松', slug: 'pine', color: 'bg-green-100 text-green-800' },
        { id: 'advanced', name: '中級者', slug: 'advanced', color: 'bg-yellow-100 text-yellow-800' }
      ],
      relatedProducts: ['1a87465b-3b3d-409f-a740-f090cbb42b9b'],
      readingTime: 10,
      publishedAt: '2025-07-04T10:00:00Z',
      updatedAt: '2025-07-04T10:00:00Z',
      status: 'published'
    }
  ]

  // フィルタリング処理（簡易版）
  let filteredArticles = mockArticles

  if (filters.category) {
    filteredArticles = filteredArticles.filter(article => 
      article.category.slug === filters.category
    )
  }

  if (filters.search) {
    filteredArticles = filteredArticles.filter(article => 
      article.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(filters.search!.toLowerCase())
    )
  }

  if (filters.tags && filters.tags.length > 0) {
    filteredArticles = filteredArticles.filter(article => 
      article.tags?.some(tag => filters.tags!.includes(tag.slug))
    )
  }

  // ソート処理
  const sortBy = filters.sortBy || 'publishedAt'
  const sortOrder = filters.sortOrder || 'desc'
  
  filteredArticles.sort((a, b) => {
    let aValue: string | number = a[sortBy as keyof Article] as string | number
    let bValue: string | number = b[sortBy as keyof Article] as string | number
    
    if (sortBy === 'publishedAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue as string).getTime()
      bValue = new Date(bValue as string).getTime()
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1
    } else {
      return aValue > bValue ? 1 : -1
    }
  })

  // ページネーション
  const limit = filters.limit || 12
  const page = filters.page || 1
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

  return {
    articles: paginatedArticles,
    totalCount: filteredArticles.length,
    currentPage: page,
    totalPages: Math.ceil(filteredArticles.length / limit),
    hasNext: endIndex < filteredArticles.length,
    hasPrev: page > 1
  }
}

/**
 * スラッグで記事を取得
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { articles } = await getArticles()
  return articles.find(article => article.slug === slug) || null
}

/**
 * カテゴリ一覧を取得
 */
export async function getCategories(): Promise<ArticleCategory[]> {
  return [
    {
      id: 'care-guide',
      name: '育て方・管理',
      slug: 'care-guide',
      description: '盆栽の日常管理、水やり、剪定等の育て方ガイド',
      color: 'bg-green-100 text-green-800',
      icon: '🌱'
    },
    {
      id: 'selection-guide',
      name: '選び方・購入ガイド',
      slug: 'selection-guide',
      description: '初心者向けの樹種選びや購入のポイント',
      color: 'bg-blue-100 text-blue-800',
      icon: '🎯'
    },
    {
      id: 'species-guide',
      name: '種類別ガイド',
      slug: 'species-guide',
      description: '松柏類、雑木類、花もの等の種類別詳細ガイド',
      color: 'bg-emerald-100 text-emerald-800',
      icon: '🌲'
    },
    {
      id: 'troubleshooting',
      name: 'トラブル・対処法',
      slug: 'troubleshooting',
      description: '病気、害虫、育成トラブルの対処法',
      color: 'bg-red-100 text-red-800',
      icon: '⚡'
    },
    {
      id: 'basics',
      name: '基礎知識',
      slug: 'basics',
      description: '盆栽の基本知識、歴史、用語解説',
      color: 'bg-gray-100 text-gray-800',
      icon: '📚'
    },
    {
      id: 'styling',
      name: 'スタイリング・飾り方',
      slug: 'styling',
      description: '盆栽の飾り方、空間演出、季節の楽しみ方',
      color: 'bg-pink-100 text-pink-800',
      icon: '🎨'
    }
  ]
}

/**
 * タグ一覧を取得
 */
export async function getTags(): Promise<ArticleTag[]> {
  return [
    { id: 'beginner', name: '初心者', slug: 'beginner', color: 'bg-blue-100 text-blue-800' },
    { id: 'intermediate', name: '中級者', slug: 'intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'advanced', name: '上級者', slug: 'advanced', color: 'bg-red-100 text-red-800' },
    { id: 'momiji', name: 'もみじ', slug: 'momiji', color: 'bg-red-100 text-red-800' },
    { id: 'pine', name: '松', slug: 'pine', color: 'bg-green-100 text-green-800' },
    { id: 'sakura', name: '桜', slug: 'sakura', color: 'bg-pink-100 text-pink-800' },
    { id: 'spring', name: '春', slug: 'spring', color: 'bg-green-100 text-green-800' },
    { id: 'summer', name: '夏', slug: 'summer', color: 'bg-blue-100 text-blue-800' },
    { id: 'autumn', name: '秋', slug: 'autumn', color: 'bg-orange-100 text-orange-800' },
    { id: 'winter', name: '冬', slug: 'winter', color: 'bg-gray-100 text-gray-800' },
    { id: 'indoor', name: '室内', slug: 'indoor', color: 'bg-purple-100 text-purple-800' },
    { id: 'outdoor', name: '屋外', slug: 'outdoor', color: 'bg-green-100 text-green-800' },
    { id: 'mini', name: 'ミニ盆栽', slug: 'mini', color: 'bg-indigo-100 text-indigo-800' }
  ]
}