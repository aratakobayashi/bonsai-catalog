import verification from '@/data/garden-verification.json'
import { HIDDEN_ARTICLE_SLUGS } from '@/lib/content-policy'

// 掲載をやめた園・削除扱いの記事の転送（Cloudflare Pages の _redirects の書式）。
// ビルドのあと scripts/build/finish-export.mjs が out/_redirects に足し、このファイルは消す
export const dynamic = 'force-static'

export function GET() {
  const lines = [
    ...(verification.hiddenIds as string[]).map(id => `/gardens/${id} /gardens 301`),
    ...Array.from(HIDDEN_ARTICLE_SLUGS).map(slug => `/guides/${slug} /guides 301`),
  ]
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
