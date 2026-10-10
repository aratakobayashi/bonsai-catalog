// 特集の表示用の補助（掲載件数・関連する育て方ガイド）
import type { CatalogProduct } from '@/lib/catalog-model'
import { SELECTIONS, pickSelectionProducts, type Selection } from '@/lib/selections'
import { getArticleBySlug } from '@/lib/database/articles'
import { isArticleIndexable } from '@/lib/content-policy'

// 掲載商品がこれより少ない特集は、トップや一覧で目立たせない
export const MIN_FEATURED_PRODUCTS = 4

// 特集ごとの掲載件数（特集ページと同じ条件で数える）。商品データを取得できなかったときは空（＝すべて表示）
export function selectionCounts(products: CatalogProduct[]): Map<string, number> {
  if (products.length === 0) return new Map()
  return new Map(SELECTIONS.map(s => [s.slug, pickSelectionProducts(s, products).length]))
}

export function isFeaturable(selection: Pick<Selection, 'slug'>, counts: Map<string, number>): boolean {
  if (counts.size === 0) return true
  return (counts.get(selection.slug) ?? 0) >= MIN_FEATURED_PRODUCTS
}

// 月ごとに先に見せる特集（トップ・特集一覧の先頭。季節の行事や見頃に合わせる）。1月〜12月
const SEASON_LEAD: string[][] = [
  ['new-year-bonsai', 'evergreen-bonsai', 'fruit-bonsai'],
  ['flowering-bonsai', 'new-year-bonsai', 'evergreen-bonsai'],
  ['flowering-bonsai', 'beginner-mini-bonsai', 'bonsai-gift'],
  ['flowering-bonsai', 'beginner-mini-bonsai', 'starter-tools'],
  ['bonsai-gift', 'flowering-bonsai', 'beginner-mini-bonsai'],
  ['flowering-bonsai', 'bonsai-gift', 'indoor-bonsai'],
  ['indoor-bonsai', 'bonsai-under-3000', 'evergreen-bonsai'],
  ['indoor-bonsai', 'bonsai-under-3000', 'celebration-bonsai'],
  ['celebration-bonsai', 'bonsai-gift', 'fruit-bonsai'],
  ['autumn-leaves-bonsai', 'fruit-bonsai', 'celebration-bonsai'],
  ['autumn-leaves-bonsai', 'fruit-bonsai', 'new-year-bonsai'],
  ['new-year-bonsai', 'fruit-bonsai', 'bonsai-gift'],
]

// 今月の特集を先に、そのあとは定義の順に並べる
export function orderSelectionsBySeason<T extends Pick<Selection, 'slug'>>(selections: T[], month: number): T[] {
  const lead = SEASON_LEAD[(month - 1 + 12) % 12] ?? []
  const rank = (slug: string) => (lead.includes(slug) ? lead.indexOf(slug) : lead.length)
  return selections.map((s, i) => ({ s, i })).sort((a, b) => rank(a.s.slug) - rank(b.s.slug) || a.i - b.i).map(x => x.s)
}

// 特集ページの最後に案内する育て方ガイド（docs/growth/content-audit.csv で「維持」などの記事から選んだ slug）
const SELECTION_GUIDES: Record<string, string[]> = {
  'new-year-bonsai': ['article-6', 'article-3', 'nanten-guide'],
  'beginner-mini-bonsai': ['article-11', 'article-4', 'beginner-tree-species-guide'],
  'bonsai-gift': ['article-5', 'article-11'],
  'indoor-bonsai': ['article-51', 'gajumaru-bonsai-guide', 'article-12'],
  'bonsai-under-3000': ['article-4', 'budget-guide'],
  'autumn-leaves-bonsai': ['article-1', 'autumn-maple-bonsai-guide', 'maple-varieties-guide'],
  'flowering-bonsai': ['sakura-general-guide', 'azalea-guide', 'article-3'],
  'fruit-bonsai': ['article-2', 'nanten-guide', 'umemodoki-bonsai-guide'],
  'evergreen-bonsai': ['article-6', 'article-10', 'article-20'],
  'celebration-bonsai': ['article-3', 'senior-friendly-bonsai-guide'],
  'starter-tools': ['article-7', 'article-16', 'article-8'],
}
const COMMON_GUIDE = 'bonsai-watering-master-guide-2025'

export interface GuideLink {
  slug: string
  title: string
  category?: string
}

// 公開中かつ noindex でない記事だけを、実際のタイトルで返す
export async function getGuideLinks(slugs: string[], limit = slugs.length): Promise<GuideLink[]> {
  const unique = Array.from(new Set(slugs)).filter(isArticleIndexable)
  const articles = await Promise.all(unique.map(slug => getArticleBySlug(slug).catch(() => null)))
  return articles
    .flatMap(article => (article ? [{ slug: article.slug, title: article.title, category: article.category?.name }] : []))
    .slice(0, limit)
}

export function getSelectionGuideLinks(slug: string): Promise<GuideLink[]> {
  return getGuideLinks([...(SELECTION_GUIDES[slug] ?? []), COMMON_GUIDE], 3)
}
