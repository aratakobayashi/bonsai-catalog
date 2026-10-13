// 記事の画像を Next.js の画像の部品で表示してよいか（サーバーでもブラウザでも使う）
// next.config.js の images.remotePatterns に入っているホスト（それ以外の外部画像は最適化せずにそのまま表示する）
const OPTIMIZABLE_IMAGE_HOSTS = [
  /^m\.media-amazon\.com$/,
  /^images-na\.ssl-images-amazon\.com$/,
  /\.amazonaws\.com$/,
  /^via\.placeholder\.com$/,
  /^images\.unsplash\.com$/,
  /^res\.cloudinary\.com$/,
]

export function canOptimizeImage(src: string): boolean {
  // SVG は画像の最適化の対象外（そのまま表示する）
  if (/\.svg(\?|$)/i.test(src)) return false
  if (src.startsWith('/')) return true
  try {
    const url = new URL(src)
    if (url.protocol !== 'https:') return false
    if (url.hostname === 'bonsai-guidebook.net') return url.pathname.startsWith('/wp-content/uploads/')
    return OPTIMIZABLE_IMAGE_HOSTS.some(pattern => pattern.test(url.hostname))
  } catch {
    return false
  }
}

