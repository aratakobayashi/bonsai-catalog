/**
 * microCMS API クライアント
 * 記事データの取得・管理
 */

import type { Article, ArticleCategory, ArticleTag, ArticleFilters, ArticleListResponse } from '@/types'

// 仮のmicroCMSクライアント（実際の実装時に置き換え）
// 本実装では microcms-js-sdk を使用予定
const MICROCMS_API_URL = process.env.WORDPRESS_API_URL || 'https://bonsai-guidebook.net/wp-json/wp/v2'
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY || ''

/**
 * 記事一覧を取得
 */
export async function getArticles(filters: ArticleFilters = {}): Promise<ArticleListResponse> {
  console.log('🔍 getArticles called with filters:', filters)
  
  try {
    const queryParams = new URLSearchParams({
      per_page: String(filters.limit || 12),
      page: String(filters.page || 1),
      orderby: filters.sortBy === 'title' ? 'title' : 'date',
      order: filters.sortOrder || 'desc',
      _embed: 'true' // 🔧 重要：画像・カテゴリー・タグデータを取得
    })

    // カテゴリーフィルターの処理: スラッグからIDに変換
    if (filters.category) {
      // WordPress APIはカテゴリーIDを要求するため、スラッグからIDに変換
      const categoryMapping: Record<string, string> = {
        'care-bonsai': '3',
        'start-guide': '1', 
        'kinds': '2',
        'info': '5',
        'select': '4'
      }
      
      const categoryId = categoryMapping[filters.category]
      if (categoryId) {
        queryParams.append('categories', categoryId)
        console.log(`🏷️ Category filter: ${filters.category} → ID: ${categoryId}`)
      } else {
        console.warn(`⚠️ Unknown category slug: ${filters.category}`)
      }
    }

    if (filters.search) {
      queryParams.append('search', filters.search)
    }

    // 代替URL形式を使用（?rest_route= 形式）
    const baseUrl = 'https://bonsai-guidebook.net'
    const restRoute = '/wp/v2/posts'
    const url = `${baseUrl}/?rest_route=${restRoute}&${queryParams}`
    
    console.log('📡 Fetching from URL:', url)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bonsai-Collection/1.0'
      },
      // Next.js 14のキャッシング機能を活用
      next: { 
        revalidate: 1800 // 30分キャッシュ（一覧は更新頻度が高いため短め）
      }
    })

    clearTimeout(timeoutId)
    
    console.log('📥 Response status:', response.status)
    console.log('📥 Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Response error text:', errorText)
      throw new Error(`WordPress API responded with ${response.status}: ${errorText}`)
    }

    const posts = await response.json()
    console.log('📝 Posts received:', posts.length)
    
    if (posts.length > 0) {
      console.log('📝 First post:', {
        id: posts[0].id,
        title: posts[0].title?.rendered,
        slug: posts[0].slug,
        date: posts[0].date,
        hasEmbedded: !!posts[0]._embedded, // 🔍 埋め込みデータ確認
        featuredImage: posts[0]._embedded?.['wp:featuredmedia']?.[0]?.source_url
      })
    }
    
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10)
    const totalCount = parseInt(response.headers.get('X-WP-Total') || '0', 10)
    const currentPage = filters.page || 1

    const result = {
      articles: posts.map((post: any) => transformWordPressPost(post)),
      totalCount,
      currentPage,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
    
    console.log('✅ Successfully returning', result.articles.length, 'articles')
    return result
    
  } catch (error) {
    console.error('❌ Error fetching articles:', error)
    
    // フォールバックデータを返す
    return getFallbackArticles(filters)
  }
}

/**
 * WordPressの投稿データをArticle型に変換
 */
function transformWordPressPost(post: any): Article {
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]
  const categories = post._embedded?.['wp:term']?.[0] || []
  const tags = post._embedded?.['wp:term']?.[1] || []

  return {
    id: post.id.toString(),
    slug: post.slug,
    title: decodeHtml(post.title.rendered),
    content: post.content.rendered,
    excerpt: stripHtml(post.excerpt.rendered),
    featuredImage: featuredMedia ? {
      url: featuredMedia.source_url,
      alt: featuredMedia.alt_text || post.title.rendered,
      width: featuredMedia.media_details?.width || 800,
      height: featuredMedia.media_details?.height || 600
    } : undefined,
    category: {
      id: categories[0]?.id?.toString() || 'uncategorized',
      name: categories[0]?.name || 'その他',
      slug: categories[0]?.slug || 'uncategorized',
      description: categories[0]?.description,
      color: getCategoryColor(categories[0]?.slug),
      icon: getCategoryIcon(categories[0]?.slug)
    },
    tags: tags.map((tag: any) => ({
      id: tag.id.toString(),
      name: tag.name,
      slug: tag.slug,
      color: getTagColor(tag.slug)
    })),
    seoTitle: post.title.rendered,
    seoDescription: stripHtml(post.excerpt.rendered).slice(0, 160),
    readingTime: calculateReadingTime(post.content.rendered),
    publishedAt: post.date,
    updatedAt: post.modified,
    status: post.status === 'publish' ? 'published' : 'draft'
  }
}

/**
 * HTMLタグを除去
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim()
}

/**
 * HTMLエンティティをデコード
 */
function decodeHtml(html: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&nbsp;': ' '
  }
  
  return html.replace(/&[^;]+;/g, (entity) => entities[entity] || entity)
}

/**
 * 読書時間を計算（日本語対応）
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 500 // 日本語の平均読書速度（文字/分）
  const textContent = stripHtml(content)
  const characterCount = textContent.length
  
  return Math.ceil(characterCount / wordsPerMinute) || 1
}

/**
 * カテゴリーに応じた色を取得
 */
function getCategoryColor(slug?: string): string {
  const colors: Record<string, string> = {
    // WordPress実際のカテゴリースラッグにマッピング
    'care-bonsai': 'bg-green-100 text-green-800',      // お手入れ・管理
    'start-guide': 'bg-blue-100 text-blue-800',        // はじめての盆栽
    'kinds': 'bg-emerald-100 text-emerald-800',        // 種類別ガイド
    'select': 'bg-purple-100 text-purple-800',         // 道具・鉢の選び方
    'info': 'bg-orange-100 text-orange-800',           // イベント・展示
    // 従来の定義も残す（フォールバック用）
    'care-guide': 'bg-green-100 text-green-800',
    'selection-guide': 'bg-blue-100 text-blue-800',
    'species-guide': 'bg-emerald-100 text-emerald-800',
    'troubleshooting': 'bg-red-100 text-red-800',
    'basics': 'bg-gray-100 text-gray-800',
    'styling': 'bg-pink-100 text-pink-800'
  }
  return colors[slug || ''] || 'bg-gray-100 text-gray-800'
}

/**
 * カテゴリーに応じたアイコンを取得
 */
function getCategoryIcon(slug?: string): string {
  const icons: Record<string, string> = {
    // WordPress実際のカテゴリースラッグにマッピング
    'care-bonsai': '🌱',      // お手入れ・管理
    'start-guide': '🌸',      // はじめての盆栽
    'kinds': '🌲',            // 種類別ガイド
    'select': '🛠️',           // 道具・鉢の選び方
    'info': '📅',             // イベント・展示
    // 従来の定義も残す（フォールバック用）
    'care-guide': '🌱',
    'selection-guide': '🎯',
    'species-guide': '🌲',
    'troubleshooting': '⚡',
    'basics': '📚',
    'styling': '🎨'
  }
  return icons[slug || ''] || '📄'
}

/**
 * タグに応じた色を取得
 */
function getTagColor(slug: string): string {
  const colors: Record<string, string> = {
    'beginner': 'bg-blue-100 text-blue-800',
    'intermediate': 'bg-yellow-100 text-yellow-800',
    'advanced': 'bg-red-100 text-red-800',
    'momiji': 'bg-red-100 text-red-800',
    'pine': 'bg-green-100 text-green-800',
    'sakura': 'bg-pink-100 text-pink-800',
    'spring': 'bg-green-100 text-green-800',
    'summer': 'bg-blue-100 text-blue-800',
    'autumn': 'bg-orange-100 text-orange-800',
    'winter': 'bg-gray-100 text-gray-800'
  }
  return colors[slug] || 'bg-gray-100 text-gray-600'
}

/**
 * エラー時のフォールバック用モックデータ
 */
function getFallbackArticles(filters: ArticleFilters = {}): ArticleListResponse {
  // 実際のWordPress記事データに基づくモックデータ
  const mockArticles: Article[] = [
    {
      id: '206',
      title: '【初心者向け】ギフトにも最適なミニ盆栽・豆盆栽とは？育て方と人気の種類を解説',
      slug: 'mini-bonsai-mame-bonsai-guide',
      content: `<div style="background: #f1f8e9; padding: 1.6em 1.8em; border-left: 6px solid #8bc34a; margin-top: 1.5em; border-radius: 10px;">
<p><strong>この記事でわかること</strong></p>
<ul style="margin-left: 1.2em; line-height: 1.9;">
<li>ミニ盆栽と豆盆栽の違いと魅力</li>
<li>初心者向けのおすすめ樹種</li>
<li>育て方の基本と失敗しないコツ</li>
</ul>
</div>
<p style="line-height: 1.9; font-size: 16px; margin-top: 1.5em;">「ミニ盆栽」や「豆盆栽」は、その名の通り"手のひらサイズ"の小さな盆栽です。限られたスペースの中に自然の風景を凝縮したような美しさがあり、初心者にも取り入れやすいことで人気を集めています。</p>`,
      excerpt: 'ミニ盆栽・豆盆栽の魅力と育て方について初心者向けに解説。ギフトにも最適な理由や人気の種類をご紹介します。',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=450&fit=crop',
        alt: 'ミニ盆栽・豆盆栽'
      },
      category: {
        id: 'care-guide',
        name: '育て方・管理',
        slug: 'care-guide',
        color: 'bg-green-100 text-green-800',
        icon: '🌱'
      },
      tags: [
        { id: 'mini-bonsai', name: 'ミニ盆栽', slug: 'mini-bonsai', color: 'bg-green-100 text-green-800' },
        { id: 'beginner', name: '初心者', slug: 'beginner', color: 'bg-blue-100 text-blue-800' }
      ],
      readingTime: 10,
      publishedAt: '2025-07-08T23:01:33Z',
      updatedAt: '2025-07-08T23:14:36Z',
      status: 'published'
    },
    {
      id: '2',
      title: '【もみじ盆栽】美しい紅葉を楽しむための管理方法',
      slug: 'momiji-bonsai-autumn-care',
      content: '# もみじ盆栽について\n\nもみじ盆栽は四季を通じて美しい姿を楽しめる代表的な樹種です...',
      excerpt: 'もみじ盆栽は四季を通じて美しい姿を楽しめる代表的な樹種です。特に秋の紅葉は圧巻で、多くの愛好家に親しまれています。',
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop',
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
        { id: 'autumn', name: '秋', slug: 'autumn', color: 'bg-orange-100 text-orange-800' }
      ],
      readingTime: 8,
      publishedAt: '2025-07-06T10:00:00Z',
      updatedAt: '2025-07-06T10:00:00Z',
      status: 'published'
    }
  ]

  // 簡易フィルタリング
  let filteredArticles = mockArticles
  
  if (filters.category) {
    filteredArticles = filteredArticles.filter(article => 
      article.category.slug === filters.category
    )
  }

  const limit = filters.limit || 12
  const page = filters.page || 1

  return {
    articles: filteredArticles,
    totalCount: filteredArticles.length,
    currentPage: page,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  }
}

/**
 * スラッグで記事を取得
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    // 代替URL形式を使用（?rest_route= 形式）
    const baseUrl = 'https://bonsai-guidebook.net'
    const restRoute = '/wp/v2/posts'
    const url = `${baseUrl}/?rest_route=${restRoute}&slug=${encodeURIComponent(slug)}&_embed=true`
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bonsai-Collection/1.0'
      },
      // Next.js 14のキャッシング機能を活用
      next: { 
        revalidate: 3600 // 1時間キャッシュ
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`)
    }

    const posts = await response.json()
    if (posts.length === 0) {
      return null
    }

    return transformWordPressPost(posts[0])
  } catch (error) {
    console.error(`Error fetching article by slug (${slug}):`, error)
    // エラー時はフォールバックデータから検索
    const fallbackData = getFallbackArticles()
    return fallbackData.articles.find(article => article.slug === slug) || null
  }
}

/**
 * カテゴリ一覧を取得
 */
export async function getCategories(): Promise<ArticleCategory[]> {
  try {
    // WordPress REST APIから実際のカテゴリーを取得
    const baseUrl = 'https://bonsai-guidebook.net'
    const restRoute = '/wp/v2/categories'
    const url = `${baseUrl}/?rest_route=${restRoute}&per_page=100&orderby=name&order=asc`
    
    const response = await fetch(url, {
      next: { revalidate: 604800 }, // 1週間キャッシュ
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`Categories fetch error: ${response.status} ${response.statusText}`)
    }

    const categories = await response.json()
    return categories.map((cat: any) => ({
      id: cat.id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: getCategoryColor(cat.slug),
      icon: getCategoryIcon(cat.slug)
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    // エラー時は実際のWordPressカテゴリーに基づくフォールバックデータを返す
    return [
      {
        id: '3',
        name: 'お手入れ・管理',
        slug: 'care-bonsai',
        description: '盆栽の日常管理、水やり、剪定等の育て方ガイド',
        color: 'bg-green-100 text-green-800',
        icon: '🌱'
      },
      {
        id: '1',
        name: 'はじめての盆栽',
        slug: 'start-guide',
        description: '初心者向けの樹種選びや購入のポイント',
        color: 'bg-blue-100 text-blue-800',
        icon: '🎯'
      },
      {
        id: '2',
        name: '種類別ガイド',
        slug: 'kinds',
        description: '松柏類、雑木類、花もの等の種類別詳細ガイド',
        color: 'bg-emerald-100 text-emerald-800',
        icon: '🌲'
      },
      {
        id: '5',
        name: 'イベント・展示',
        slug: 'info',
        description: '盆栽展示会やイベント情報',
        color: 'bg-purple-100 text-purple-800',
        icon: '🎪'
      },
      {
        id: '4',
        name: '道具・鉢の選び方',
        slug: 'select',
        description: '盆栽道具や鉢の選び方ガイド',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🛠️'
      }
    ]
  }
}

/**
 * タグ一覧を取得
 */
export async function getTags(): Promise<ArticleTag[]> {
  try {
    const response = await fetch(`${MICROCMS_API_URL}/tags?per_page=100&orderby=count&order=desc`, {
      next: { revalidate: 604800 }, // 1週間キャッシュ
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`Tags fetch error: ${response.status} ${response.statusText}`)
    }

    const tags = await response.json()
    return tags.map((tag: any) => ({
      id: tag.id.toString(),
      name: tag.name,
      slug: tag.slug,
      color: getTagColor(tag.slug)
    }))
  } catch (error) {
    console.error('Error fetching tags:', error)
    // エラー時はフォールバックデータを返す
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
}