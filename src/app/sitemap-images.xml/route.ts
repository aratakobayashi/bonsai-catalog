import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

export const revalidate = 3600

export async function GET() {
  try {
    // 商品画像を取得
    const { data: products } = await supabase
      .from('products')
      .select('id, name, image_url, updated_at')
      .not('image_url', 'is', null)

    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`

    // 商品画像をXMLに追加
    if (products && products.length > 0) {
      (products as Array<{id: string, name: string, image_url: string, updated_at: string}>).forEach(product => {
        const escapedName = escapeXml(product.name)
        xmlContent += `
  <url>
    <loc>${baseUrl}/products/${product.id}</loc>
    <image:image>
      <image:loc>${escapeXml(product.image_url.startsWith('/') ? `${baseUrl}${product.image_url}` : product.image_url)}</image:loc>
      <image:title>${escapedName}</image:title>
      <image:caption>盆栽「${escapedName}」の商品画像</image:caption>
    </image:image>
  </url>`
      })
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

  } catch (error) {
    console.error('画像サイトマップ生成エラー:', error)

    // エラー時は最小限のXMLを返す
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`

    return new NextResponse(errorXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml'
      }
    })
  }
}