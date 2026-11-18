// 盆栽展のページのURL。データベースの slug は年つき（例：kokufu-bonsai-ten-2027）だが、
// URL は年を外して毎年同じにする（/events/kokufu-bonsai-ten）。毎年同じURLにすると、前の年に得た検索の評価を引き継げる。
// 年つきの古いURLは、src/app/redirects.txt/route.ts で年なしのURLへ転送する
const YEAR_SUFFIX = /-20\d{2}$/

export const eventUrlSlug = (slug: string) => slug.replace(YEAR_SUFFIX, '')
export const eventHref = (slug: string) => `/events/${eventUrlSlug(slug)}`

// 同じ年なしのURLになる回が複数あるとき（今年の回と来年の回など）、ページに出す回を選ぶ：
// まだ終わっていない回のうちいちばん早いもの。すべて終わっていれば、いちばん新しい回
export function pickEventEdition<T extends { slug: string; start_date: string; end_date: string }>(rows: T[], today = new Date().toISOString().slice(0, 10)): T | null {
  if (rows.length === 0) return null
  const upcoming = rows.filter(r => (r.end_date || r.start_date) >= today).sort((a, b) => a.start_date.localeCompare(b.start_date))
  if (upcoming.length) return upcoming[0]
  return [...rows].sort((a, b) => b.start_date.localeCompare(a.start_date))[0]
}
