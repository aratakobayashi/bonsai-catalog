// サイトの正規URL（canonical・構造化データ・sitemap で共通利用）
export const SITE_URL = 'https://www.bonsai-collection.com'

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}
