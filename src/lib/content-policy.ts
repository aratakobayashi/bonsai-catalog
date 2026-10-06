// 記事ごとの公開方針
// 内容の修正が終わるまで検索結果から外したい記事の slug をここに追加する。
// 追加した記事は noindex になり、sitemap からも除外される（ページ自体は表示される）。
// 候補は docs/growth/content-audit.csv の「推奨対応」列を参照。
export const NOINDEX_ARTICLE_SLUGS: ReadonlySet<string> = new Set<string>([
  // 盆栽と無関係な記事（別サイトの記事が混入したもの）。削除または別サイトへの移設を推奨
  'oshikatsu-star-song-specialjr-535',
  'star-song-specialjr-535',
  'oshikatsu-ok-552',
  'oshikatsu-wi-fi3-563',
  'oshikatsu--573',
  'oshikatsu-timelesz-583',
  'timelesz-612',

  // 出典を確認できない「取材・監修」表記や効果の主張を含む体験談記事。書き直したら外す
  'beginner-bonsai-club-experience',
  '30s-working-mother-bonsai-life',
  '50s-manager-stress-relief-bonsai',
  '60s-retiree-bonsai-club-experience',
  '70s-beginner-community-participation',
])

export function isArticleIndexable(slug: string): boolean {
  return !NOINDEX_ARTICLE_SLUGS.has(slug)
}
