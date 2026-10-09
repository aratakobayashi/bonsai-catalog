// 盆栽園・イベントのページの「あわせて読む」。出かける・見学・展示に関係する記事を優先し、足りない分は新着で埋める
import { supabaseServer } from '@/lib/supabase-server'
import type { Article } from '@/types'

const SELECT = `
  id,
  title,
  slug,
  excerpt,
  featured_image_url,
  published_at,
  category:article_categories!articles_category_id_fkey(*)
`

function toArticle(item: any): Article {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    featuredImage: item.featured_image_url ? { url: item.featured_image_url } : undefined,
    publishedAt: item.published_at,
    category: item.category,
    content: '', // 一覧では本文を使わない
    updatedAt: item.published_at,
  }
}

export const GARDEN_ARTICLE_TOPICS = {
  keywords: ['盆栽園', '見学', 'めぐり', '美術館', '購入', '専門店', '体験教室', '盆栽村'],
  categories: ['shopping', 'events'],
}

export const EVENT_ARTICLE_TOPICS = {
  keywords: ['展示', '盆栽展', 'イベント', '鑑賞', '即売', 'まつり'],
  categories: ['events'],
}

// タイトルにキーワードを含む記事 → 同じカテゴリーの記事 → 新着 の順に、重ならないように集める
export async function getTopicArticles(
  topics: { keywords: string[]; categories: string[] },
  limit = 4
): Promise<Article[]> {
  const articles: Article[] = []
  const seen = new Set<string>()
  const add = (rows: any[] | null) => {
    for (const item of rows || []) {
      if (articles.length >= limit) break
      if (seen.has(item.id)) continue
      seen.add(item.id)
      articles.push(toArticle(item))
    }
  }
  const base = () =>
    supabaseServer
      .from('articles')
      .select(SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

  try {
    if (topics.keywords.length > 0) {
      const { data } = await base().or(topics.keywords.map(k => `title.ilike.%${k}%`).join(',')).limit(limit)
      add(data)
    }
    if (articles.length < limit && topics.categories.length > 0) {
      const { data: cats } = await supabaseServer.from('article_categories').select('id').in('slug', topics.categories)
      const ids = ((cats || []) as { id: string }[]).map(c => c.id)
      if (ids.length > 0) {
        const { data } = await base().in('category_id', ids).limit(limit + articles.length)
        add(data)
      }
    }
    if (articles.length < limit) {
      const { data } = await base().limit(limit + articles.length)
      add(data)
    }
  } catch (error) {
    console.error('関連記事の取得エラー:', error)
  }
  return articles
}
