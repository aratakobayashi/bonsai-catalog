import { applyArticleOverride } from '@/lib/article-overrides'
import { getArticles, getCategories } from '@/lib/database/articles'
import type { GuidesData } from '@/components/features/GuidesView'

// 一覧に使う記事のデータ（本文は除き、書き直した記事は新しいタイトル・要約・サムネイルにする）。/data/articles.json と共通
export async function getGuidesData(): Promise<GuidesData> {
  const [articlesData, categories] = await Promise.all([getArticles({ page: 1, limit: 1000 }), getCategories()])
  if (articlesData.articles.length === 0) throw new Error('記事の一覧を取得できませんでした')
  return {
    categories,
    articles: articlesData.articles.map(article => {
      const override = applyArticleOverride(article)
      return { ...article, title: override.title, excerpt: override.excerpt, featuredImage: override.featuredImage?.url?.endsWith('.svg') ? article.featuredImage : override.featuredImage, readingTime: override.readingTime, content: '', tags: [] }
    }),
  }
}

