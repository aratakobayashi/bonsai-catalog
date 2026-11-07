// 日本語のページと英語のページ（/en）の行き来。内容の近いページがあればそこへ、なければそれぞれのトップへ
export function englishPathFor(path: string | null): string {
  if (!path) return '/en'
  if (path === '/gardens/area/saitama' || path.startsWith('/gardens/area/saitama')) return '/en/omiya-bonsai-village'
  if (path === '/events' || path.startsWith('/events/')) return '/en/exhibitions'
  return '/en'
}

export function japanesePathFor(path: string | null): string {
  if (path?.startsWith('/en/omiya-bonsai-village')) return '/gardens/area/saitama'
  if (path?.startsWith('/en/exhibitions')) return '/events/autumn-winter-2026'
  return '/'
}
