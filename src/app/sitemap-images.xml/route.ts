import { NextResponse } from 'next/server'
import { getArticles } from '@/lib/database/articles'
import { isArticleIndexable } from '@/lib/content-policy'
import { getArticleOverride, thumbnailPath } from '@/lib/article-overrides'

const baseUrl = 'https://www.bonsai-collection.com'

// XMLエスケープ用のヘルパー関数
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const absolute = (src: string) => (src.startsWith('/') ? `${baseUrl}${src}` : src)

export const revalidate = 3600

// 画像サイトマップ：検索結果に出す記事の画像（サムネイル・記事の写真・図解）
// 楽天から自動取得した商品の詳細ページは noindex のため、商品画像は含めない
export async function GET() {
  let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`

  const { articles } = await getArticles({ page: 1, limit: 1000 })
  for (const article of articles.filter(a => isArticleIndexable(a.slug))) {
    const override = getArticleOverride(article.slug)
    const images = new Map<string, string>()
    const thumb = thumbnailPath(article.slug)
    if (thumb) images.set(thumb, article.title)
    if (override?.photo) images.set(override.photo, article.title)
    // 本文の画像（写真・図解）。説明文（alt）をキャプションにする
    for (const m of (override?.content ?? '').matchAll(/!\[([^\]]*)\]\((\/images\/[^)\s]+)\)/g)) {
      if (!images.has(m[2])) images.set(m[2], m[1] || article.title)
    }
    if (images.size === 0) continue

    xmlContent += `
  <url>
    <loc>${baseUrl}/guides/${article.slug}</loc>${Array.from(images, ([src, caption]) => `
    <image:image>
      <image:loc>${escapeXml(absolute(src))}</image:loc>
      <image:caption>${escapeXml(caption)}</image:caption>
    </image:image>`).join('')}
  </url>`
  }

  xmlContent += `
</urlset>`

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  })
}
