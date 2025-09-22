import { supabase, type DatabaseArticle, type DatabaseArticleCategory, type DatabaseArticleTag } from '@/lib/supabase'
import type { Article, ArticleCategory, ArticleTag, ArticleListResponse, ArticleFilters } from '@/types'

// Function to strip frontmatter from markdown content
function stripFrontmatter(content: string): string {
  if (content.startsWith('---')) {
    const endIndex = content.indexOf('---', 3)
    if (endIndex !== -1) {
      return content.substring(endIndex + 3).trim()
    }
  }
  return content
}

// データベース記事をフロントエンド用Article型に変換
function transformDatabaseArticle(
  dbArticle: DatabaseArticle,
  category: DatabaseArticleCategory,
  tags: DatabaseArticleTag[]
): Article {
  return {
    id: dbArticle.id,
    title: dbArticle.title,
    slug: dbArticle.slug,
    content: stripFrontmatter(dbArticle.content),
    excerpt: dbArticle.excerpt,
    featuredImage: dbArticle.featured_image_url ? {
      url: dbArticle.featured_image_url,
      alt: dbArticle.featured_image_alt || dbArticle.title,
      width: 1200,
      height: 630
    } : undefined,
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      icon: category.icon
    },
    tags: tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color
    })),
    relatedProducts: dbArticle.related_product_ids || [],
    seoTitle: dbArticle.seo_title,
    seoDescription: dbArticle.seo_description,
    readingTime: dbArticle.reading_time,
    publishedAt: dbArticle.published_at,
    updatedAt: dbArticle.updated_at,
    status: dbArticle.status
  }
}

// フロントエンド用Article型をデータベース用に変換
function transformToDatabase(article: Partial<Article>): Partial<DatabaseArticle> {
  return {
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt,
    featured_image_url: article.featuredImage?.url,
    featured_image_alt: article.featuredImage?.alt,
    category_id: article.category?.id,
    tag_ids: article.tags?.map(tag => tag.id),
    related_product_ids: article.relatedProducts,
    seo_title: article.seoTitle,
    seo_description: article.seoDescription,
    reading_time: article.readingTime,
    published_at: article.publishedAt,
    status: article.status || 'published'
  }
}

// カテゴリーキャッシュ（メモリキャッシュでパフォーマンス向上）
let categoryCache: any[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5分間キャッシュ

async function getCategoriesWithCache() {
  const now = Date.now()
  if (categoryCache && (now - cacheTimestamp) < CACHE_TTL) {
    return categoryCache
  }

  const { data: categories } = await supabase
    .from('article_categories')
    .select('id, slug, name, icon, color, description')

  categoryCache = categories || []
  cacheTimestamp = now
  return categoryCache
}

// 記事一覧取得
export async function getArticles(filters: ArticleFilters = {}): Promise<ArticleListResponse> {
  try {
    // カテゴリーを直接取得（キャッシュなし）
    const { data: categories } = await supabase
      .from('article_categories')
      .select('id, slug, name, icon, color, description')

    const categoryMap = new Map((categories as any[])?.map(cat => [cat.slug, cat]) || [])
    
    let categoryId: string | null = null
    
    if (filters.category) {
      const selectedCategory = categoryMap.get(filters.category)
      categoryId = selectedCategory?.id || null
      
      if (!categoryId) {
        return {
          articles: [],
          totalCount: 0,
          currentPage: 1,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    }

    // 記事データの取得
    let query = supabase
      .from('articles')
      .select(`
        *,
        category:article_categories!articles_category_id_fkey(*)
      `, { count: 'exact' })
      .eq('status', 'published')

    // フィルター適用
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`)
    }

    // ソート
    const sortFieldMap: Record<string, string> = {
      publishedAt: 'published_at',
      updatedAt: 'updated_at',
      readingTime: 'reading_time',
      title: 'title'
    }
    const frontendSortBy = filters.sortBy || 'publishedAt'
    const dbSortBy = sortFieldMap[frontendSortBy] || 'published_at'
    const sortOrder = filters.sortOrder || 'desc'
    query = query.order(dbSortBy, { ascending: sortOrder === 'asc' })

    // ページネーション
    const page = filters.page || 1
    const limit = filters.limit || 12
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('記事取得エラー:', error)
      throw error
    }

    const actualTotalCount = count || 0

    if (!data || data.length === 0) {
      return {
        articles: [],
        totalCount: actualTotalCount,
        currentPage: page,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    }

    // タグの取得
    const allTagIds = (data as any[]).flatMap(article => article.tag_ids || [])
    const uniqueTagIds = [...new Set(allTagIds)]

    let tags: DatabaseArticleTag[] = []
    if (uniqueTagIds.length > 0) {
      const { data: tagData } = await supabase
        .from('article_tags')
        .select('id, name, slug, color')
        .in('id', uniqueTagIds)
      tags = tagData || []
    }

    // データ変換
    const articles = data.map((item: any) => {
      const articleTags = tags.filter(tag => item.tag_ids?.includes(tag.id))
      return transformDatabaseArticle(item, item.category, articleTags)
    })

    const totalPages = Math.ceil(actualTotalCount / limit)

    return {
      articles,
      totalCount: actualTotalCount,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }

  } catch (error) {
    console.error('記事取得エラー:', error)
    return {
      articles: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
  }
}

// 特定記事取得（スラッグによる）
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:article_categories!articles_category_id_fkey(*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      console.error('記事取得エラー:', error)
      return null
    }

    // タグの取得
    let tags: DatabaseArticleTag[] = []
    if ((data as any).tag_ids && (data as any).tag_ids.length > 0) {
      const { data: tagData } = await supabase
        .from('article_tags')
        .select('*')
        .in('id', (data as any).tag_ids)
      tags = tagData || []
    }

    return transformDatabaseArticle(data as any, (data as any).category, tags)

  } catch (error) {
    console.error('記事取得エラー:', error)
    return null
  }
}

// 特定記事取得（IDによる）
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:article_categories!articles_category_id_fkey(*)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('記事取得エラー:', error)
      return null
    }

    // タグの取得
    let tags: DatabaseArticleTag[] = []
    if ((data as any).tag_ids && (data as any).tag_ids.length > 0) {
      const { data: tagData } = await supabase
        .from('article_tags')
        .select('*')
        .in('id', (data as any).tag_ids)
      tags = tagData || []
    }

    return transformDatabaseArticle(data as any, (data as any).category, tags)

  } catch (error) {
    console.error('記事取得エラー:', error)
    return null
  }
}

// 記事作成
export async function createArticle(article: Omit<Article, 'id' | 'publishedAt' | 'updatedAt'>): Promise<Article | null> {
  try {
    // アイキャッチ画像が設定されていない場合、自動検出を試行
    let finalArticle = { ...article }
    if (!finalArticle.featuredImage && finalArticle.slug) {
      const { detectFeaturedImage } = await import('@/lib/utils')
      const detectedImage = detectFeaturedImage(finalArticle.slug)
      if (detectedImage) {
        finalArticle.featuredImage = detectedImage
      }
    }

    const dbArticle = transformToDatabase(finalArticle)

    const { data, error } = await (supabase as any)
      .from('articles')
      .insert(dbArticle)
      .select(`
        *,
        category:article_categories!articles_category_id_fkey(*)
      `)
      .single()

    if (error || !data) {
      console.error('記事作成エラー:', error)
      throw error
    }

    // タグの取得
    let tags: DatabaseArticleTag[] = []
    if ((data as any).tag_ids && (data as any).tag_ids.length > 0) {
      const { data: tagData } = await supabase
        .from('article_tags')
        .select('*')
        .in('id', (data as any).tag_ids)
      tags = tagData || []
    }

    return transformDatabaseArticle(data as any, (data as any).category, tags)

  } catch (error) {
    console.error('記事作成エラー:', error)
    throw error
  }
}

// 記事更新
export async function updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
  try {
    const dbUpdates = transformToDatabase(updates)

    const { data, error } = await (supabase as any)
      .from('articles')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        category:article_categories!articles_category_id_fkey(*)
      `)
      .single()

    if (error || !data) {
      console.error('記事更新エラー:', error)
      throw error
    }

    // タグの取得
    let tags: DatabaseArticleTag[] = []
    if ((data as any).tag_ids && (data as any).tag_ids.length > 0) {
      const { data: tagData } = await supabase
        .from('article_tags')
        .select('*')
        .in('id', (data as any).tag_ids)
      tags = tagData || []
    }

    return transformDatabaseArticle(data as any, (data as any).category, tags)

  } catch (error) {
    console.error('記事更新エラー:', error)
    throw error
  }
}

// 記事削除
export async function deleteArticle(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('記事削除エラー:', error)
      throw error
    }

    return true

  } catch (error) {
    console.error('記事削除エラー:', error)
    return false
  }
}

// カテゴリー一覧取得
export async function getCategories(): Promise<ArticleCategory[]> {
  try {
    // 同じキャッシュを使用してパフォーマンス向上
    const categories = await getCategoriesWithCache()

    return categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color,
      icon: category.icon
    }))

  } catch (error) {
    console.error('カテゴリー取得エラー:', error)
    return []
  }
}

// タグ一覧取得
export async function getTags(): Promise<ArticleTag[]> {
  try {
    const { data, error } = await supabase
      .from('article_tags')
      .select('*')
      .order('name')

    if (error) {
      console.error('タグ取得エラー:', error)
      return []
    }

    return ((data as any) || []).map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color
    }))

  } catch (error) {
    console.error('タグ取得エラー:', error)
    return []
  }
}