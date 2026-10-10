// サイト全体のナビゲーション（ヘッダー・スマホの下部タブで共通）
export const SHOP_NAV = { href: '/products', label: '盆栽を探す', match: ['/products', '/selection', '/shindan', '/okurimono', '/kumiawase', '/soroeru'] } as const

export const NAV_ITEMS = [
  { href: '/guides', label: '育て方', match: ['/guides', '/faq', '/teire', '/shojo', '/hajimete', '/zukan', '/note'] },
  { href: '/gardens', label: '盆栽園', match: ['/gardens'] },
  { href: '/events', label: 'イベント', match: ['/events'] },
] as const

export function isNavActive(pathname: string, match: readonly string[]): boolean {
  return match.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
