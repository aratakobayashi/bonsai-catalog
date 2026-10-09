// サイト全体のナビゲーション（ヘッダー・スマホの下部タブで共通）
export const SHOP_NAV = { href: '/products', label: '盆栽を探す', match: ['/products', '/selection', '/shindan'] } as const

export const NAV_ITEMS = [
  { href: '/guides', label: '育て方', match: ['/guides', '/faq'] },
  { href: '/gardens', label: '盆栽園', match: ['/gardens'] },
  { href: '/events', label: 'イベント', match: ['/events'] },
] as const

export function isNavActive(pathname: string, match: readonly string[]): boolean {
  return match.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
