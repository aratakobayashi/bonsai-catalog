// 「今月の手入れ」「盆栽ノート」で使う、記事のタイトル・サムネイルの読み出し（サーバー側だけ）
import { articlesForSpecies, estimateReadingTime, getArticleOverride, thumbnailPath } from '@/lib/article-overrides'
import { SPECIES_GUIDES } from '@/lib/care-calendar'
import { SPECIES_TRAITS } from '@/lib/species-traits'
import type { ArticleCardItem } from '@/components/article/RelatedArticleRows'

export interface GuideLink {
  slug: string
  title: string
}

// 「梅の盆栽の育て方｜花後の剪定と…」→「梅の盆栽の育て方」
export function shortTitle(title: string): string {
  return title.split('｜')[0].trim()
}

// 記事の slug から、リンク用の短いタイトル。記事ファイルがなければ null
export function guideLink(slug: string): GuideLink | null {
  const override = getArticleOverride(slug)
  return override?.title ? { slug, title: shortTitle(override.title) } : null
}

export function guideLinks(slugs: string[]): GuideLink[] {
  return slugs.map(guideLink).filter((g): g is GuideLink => g !== null)
}

// 記事カード（ArticleCardGrid）用
export function articleCards(slugs: string[]): ArticleCardItem[] {
  return slugs.flatMap(slug => {
    const override = getArticleOverride(slug)
    if (!override?.title) return []
    return [{
      href: `/guides/${slug}`,
      title: override.title,
      image: thumbnailPath(slug) ?? override.photo ?? null,
      readingTime: override.content ? estimateReadingTime(override.content) : null,
    }]
  })
}

// 樹種（SPECIES_TRAITS の key）→ 育て方の記事。決めてある記事がなければ、記事の species から探す
export function speciesGuideMap(): Record<string, GuideLink> {
  const map: Record<string, GuideLink> = {}
  for (const trait of SPECIES_TRAITS) {
    const slug = SPECIES_GUIDES[trait.key] ?? articlesForSpecies(trait.key)[0]
    const link = slug ? guideLink(slug) : null
    if (link) map[trait.key] = link
  }
  return map
}
