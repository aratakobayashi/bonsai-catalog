// next/image で最適化できる画像か（ローカル画像か、next.config.js の remotePatterns に含まれるホスト）
const OPTIMIZABLE_HOSTS = [
  /(^|\.)media-amazon\.com$/,
  /^images-na\.ssl-images-amazon\.com$/,
  /\.amazonaws\.com$/,
  /^images\.unsplash\.com$/,
  /^res\.cloudinary\.com$/,
]

export function isOptimizableImage(url: string | null | undefined): url is string {
  if (!url) return false
  if (url.startsWith('/')) return true
  try {
    const { hostname } = new URL(url)
    return OPTIMIZABLE_HOSTS.some(pattern => pattern.test(hostname))
  } catch {
    return false
  }
}
