// 記事ごとの公開方針
// 候補は docs/growth/content-audit.csv の「推奨対応」列を参照。

// 削除扱いの記事（盆栽と無関係な、別サイトの記事が混入したもの）。
// 一覧・関連記事・sitemap から外し、記事URLは /guides へ恒久リダイレクトする。
export const HIDDEN_ARTICLE_SLUGS: ReadonlySet<string> = new Set<string>([
  'oshikatsu-star-song-specialjr-535',
  'star-song-specialjr-535',
  'oshikatsu-ok-552',
  'oshikatsu-wi-fi3-563',
  'oshikatsu--573',
  'oshikatsu-timelesz-583',
  'timelesz-612',
  'timelesz-fam-mc-621',
  '-577',
])

// 内容の修正が終わるまで検索結果から外したい記事。
// 追加した記事は noindex になり、一覧・関連記事・sitemap からも外れる（ページ自体は表示される）。
export const NOINDEX_ARTICLE_SLUGS: ReadonlySet<string> = new Set<string>([
  // 出典を確認できない「取材・監修」表記や効果の主張を含む体験談記事。書き直したら外す
  'beginner-bonsai-club-experience',
  '30s-working-mother-bonsai-life',
  '50s-manager-stress-relief-bonsai',
  '60s-retiree-bonsai-club-experience',
  '70s-beginner-community-participation',
])

// 削除扱い（リダイレクト対象）か
export function isArticleHidden(slug: string): boolean {
  return HIDDEN_ARTICLE_SLUGS.has(slug)
}

// 検索エンジンにインデックスさせてよいか
export function isArticleIndexable(slug: string): boolean {
  return !HIDDEN_ARTICLE_SLUGS.has(slug) && !NOINDEX_ARTICLE_SLUGS.has(slug)
}

// 一覧・関連記事・検索候補・sitemap に出してよいか（削除扱い・noindex の記事は出さない）
export function isArticleListable(slug: string): boolean {
  return isArticleIndexable(slug)
}

// 一覧に出さない記事の slug（DB クエリで除外するため）
export const UNLISTED_ARTICLE_SLUGS: readonly string[] = [
  ...Array.from(HIDDEN_ARTICLE_SLUGS),
  ...Array.from(NOINDEX_ARTICLE_SLUGS),
]
