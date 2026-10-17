// データベースに行がなく、src/content/articles の .md だけで公開する記事
// 本文・タイトル・説明は .md（article-overrides が読む）から、カテゴリと公開日はここで決める
import type { Article, ArticleCategory } from '@/types'
import { estimateReadingTime, getArticleOverride } from '@/lib/article-overrides'

interface LocalArticleMeta {
  // 記事のカテゴリ（article_categories の slug）
  category: string
  publishedAt: string
}

export const LOCAL_ARTICLES: Record<string, LocalArticleMeta> = {
  'oseibo-bonsai-gift': { category: 'shopping', publishedAt: '2026-10-13T12:00:00+09:00' },
  'new-year-bonsai-display': { category: 'enjoyment', publishedAt: '2026-10-13T12:00:00+09:00' },
  'retirement-gift-bonsai': { category: 'shopping', publishedAt: '2026-10-13T12:00:00+09:00' },
  'kanreki-gift-bonsai': { category: 'shopping', publishedAt: '2026-10-13T12:00:00+09:00' },
  'gift-bonsai-guide': { category: 'shopping', publishedAt: '2026-10-16T12:00:00+09:00' },
  'kokedama-guide': { category: 'basic-care', publishedAt: '2026-10-16T12:00:00+09:00' },
  'bonsai-kit-guide': { category: 'beginner', publishedAt: '2026-10-16T12:00:00+09:00' },
  'christmas-bonsai-guide': { category: 'enjoyment', publishedAt: '2026-10-16T12:00:00+09:00' },
  'bonsai-pot-guide': { category: 'shopping', publishedAt: '2026-10-16T12:00:00+09:00' },
  'opening-gift-bonsai': { category: 'shopping', publishedAt: '2026-10-17T12:00:00+09:00' },
  'bonsai-gift-for-men': { category: 'shopping', publishedAt: '2026-10-17T12:00:00+09:00' },
  'bonsai-gift-for-women': { category: 'shopping', publishedAt: '2026-10-17T12:00:00+09:00' },
  'winter-flowering-bonsai': { category: 'enjoyment', publishedAt: '2026-10-17T12:00:00+09:00' },
  'bonsai-display-guide': { category: 'enjoyment', publishedAt: '2026-10-17T12:00:00+09:00' },
}

export const isLocalArticle = (slug: string) => Object.prototype.hasOwnProperty.call(LOCAL_ARTICLES, slug)

// categories：article_categories の一覧（id・名前を合わせるため）
export function buildLocalArticle(slug: string, categories: ArticleCategory[]): Article | null {
  const meta = LOCAL_ARTICLES[slug]
  const override = meta ? getArticleOverride(slug) : null
  if (!meta || !override?.title || !override.content) return null
  const category = categories.find(c => c.slug === meta.category) ?? { id: `local-${meta.category}`, name: meta.category, slug: meta.category }
  return {
    id: `local-${slug}`,
    title: override.title,
    slug,
    content: override.content,
    excerpt: override.description ?? '',
    category,
    tags: [],
    relatedProducts: [],
    seoTitle: override.title,
    seoDescription: override.description,
    readingTime: estimateReadingTime(override.content),
    publishedAt: meta.publishedAt,
    updatedAt: override.updatedAt ?? meta.publishedAt,
    status: 'published',
  }
}

// 新しい順に並べたファイルだけの記事（category・search で絞る）
export function localArticles(categories: ArticleCategory[], filters: { category?: string; search?: string } = {}): Article[] {
  const search = filters.search?.toLowerCase()
  return Object.keys(LOCAL_ARTICLES)
    .filter(slug => !filters.category || LOCAL_ARTICLES[slug].category === filters.category)
    .map(slug => buildLocalArticle(slug, categories))
    .filter((a): a is Article => Boolean(a))
    .filter(a => !search || `${a.title} ${a.excerpt} ${a.content}`.toLowerCase().includes(search))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
