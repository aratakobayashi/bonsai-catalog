// 盆栽園ごとの数字（園のページの表示・公式サイトへの移動など）を、Supabase の track_garden() で1つ足す。
// 管理画面（/owner）で園の方が見る数字。GA4 とは別に、園ごと・日ごとの合計だけを残す（個人は記録しない）
// 表がまだ無いとき・送れなかったときは何もしない。ページの表示は待たせない（keepalive で送りっぱなし）
const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function trackGarden(gardenId: string, metric: string, source: string) {
  if (!URL_BASE || !KEY || typeof window === 'undefined' || navigator.webdriver) return
  try {
    fetch(`${URL_BASE}/rest/v1/rpc/track_garden`, {
      method: 'POST',
      keepalive: true,
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_garden: gardenId, p_metric: metric, p_source: source }),
    }).catch(() => {})
  } catch {
    // 送れなくても画面には影響させない
  }
}

// どこから来たか（同じサイトの中は前のページの種類、外からは検索・外部・直接）
export function sourceOfPath(path: string | null): string {
  if (!path) return 'direct'
  if (path === '/') return 'home'
  if (path.startsWith('/taiken')) return 'taiken'
  if (path.startsWith('/gardens/shops')) return 'shops'
  if (path.startsWith('/gardens/omiya')) return 'omiya'
  if (/^\/gardens\/[0-9a-f-]{36}/.test(path)) return 'garden'
  if (path.startsWith('/gardens')) return 'gardens'
  if (path.startsWith('/events')) return 'events'
  if (path.startsWith('/guides')) return 'guides'
  if (path.startsWith('/en')) return 'english'
  return 'site'
}

export function sourceOfReferrer(referrer: string): string {
  if (!referrer) return 'direct'
  try {
    const u = new URL(referrer)
    if (u.hostname === window.location.hostname) return sourceOfPath(u.pathname)
    if (/(^|\.)(google|bing|yahoo|duckduckgo|ecosia|baidu|naver)\./.test(u.hostname)) return 'search'
    if (/(instagram|facebook|twitter|x\.com|t\.co|line\.me|threads)/.test(u.hostname)) return 'sns'
    return 'external'
  } catch {
    return 'external'
  }
}
