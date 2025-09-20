import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const baseUrl = 'https://www.bonsai-collection.com'

export async function GET() {
  try {
    // 商品画像を取得
    const { data: products } = await supabase
      .from('products')
      .select('id, name, image_url, updated_at')
      .eq('is_visible', true)
      .not('image_url', 'is', null)

    // 盆栽園画像を取得
    const { data: gardens } = await supabase
      .from('gardens')
      .select('id, name, image_url, updated_at')
      .not('image_url', 'is', null)

    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`

    // 商品画像をXMLに追加
    if (products && products.length > 0) {
      (products as Array<{id: string, name: string, image_url: string, updated_at: string}>).forEach(product => {
        xmlContent += `
  <url>
    <loc>${baseUrl}/products/${product.id}</loc>
    <image:image>
      <image:loc>${product.image_url}</image:loc>
      <image:title>${product.name}</image:title>
      <image:caption>盆栽「${product.name}」の商品画像</image:caption>
    </image:image>
    <lastmod>${new Date(product.updated_at).toISOString()}</lastmod>
  </url>`
      })
    }

    // 盆栽園画像をXMLに追加
    if (gardens && gardens.length > 0) {
      (gardens as Array<{id: string, name: string, image_url: string | null, updated_at: string}>).forEach(garden => {
        if (garden.image_url) {
          xmlContent += `
  <url>
    <loc>${baseUrl}/gardens/${garden.id}</loc>
    <image:image>
      <image:loc>${garden.image_url}</image:loc>
      <image:title>${garden.name}</image:title>
      <image:caption>盆栽園「${garden.name}」の画像</image:caption>
    </image:image>
    <lastmod>${new Date(garden.updated_at).toISOString()}</lastmod>
  </url>`
        }
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