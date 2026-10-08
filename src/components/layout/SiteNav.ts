// サイト全体のナビゲーション（ヘッダー・スマホの下部タブで共通）
export const NAV_ITEMS = [
  { href: '/products', label: '探す', match: ['/products', '/selection', '/shindan'] },
  { href: '/guides', label: '育て方', match: ['/guides'] },
  { href: '/gardens', label: '出かける', match: ['/gardens', '/events'] },
] as const

export function isNavActive(pathname: string, match: readonly string[]): boolean {
  return match.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
