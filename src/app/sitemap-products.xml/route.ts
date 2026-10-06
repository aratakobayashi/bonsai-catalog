import { supabase } from '@/lib/supabase'
import { baseUrl, SITEMAP_CONFIG, createSitemapResponse, generateXmlHeader, generateXmlFooter, generateUrlElement } from '@/lib/sitemap-utils'

export const revalidate = 3600

export async function GET() {
  try {
    const config = SITEMAP_CONFIG.products
    const lastMod = new Date().toISOString().split('T')[0]

    let urls: string[] = []

    // 商品一覧（パラメータ付きの絞り込みURLは canonical と重複するため含めない）
    urls.push(generateUrlElement(`${baseUrl}/products`, lastMod, 'daily', 0.9))

    // 商品詳細ページ
    try {
      const { data: products } = await supabase
        .from('products')
        .select('id, created_at, updated_at')

      if (products && products.length > 0) {
        const productUrls = products.map((product: any) =>
          generateUrlElement(
            `${baseUrl}/products/${product.id}`,
            new Date(product.updated_at || product.created_at).toISOString().split('T')[0],
            'weekly',
            0.8
          )
        )
        urls.push(...productUrls)
      }
    } catch (error) {
      console.error('Products data fetch error:', error)
      // エラーでも基本的なカテゴリページは含める
    }

    const xmlContent = `${generateXmlHeader()}${urls.join('')}
${generateXmlFooter()}`

    return createSitemapResponse(xmlContent, 'products')

  } catch (error) {
    console.error('Products sitemap generation error:', error)

    // 最小限のサイトマップを返す（メイン商品ページのみ）
    const fallbackXml = `${generateXmlHeader()}${generateUrlElement(`${baseUrl}/products`, new Date().toISOString().split('T')[0], 'daily', 0.9)}
${generateXmlFooter()}`

    return createSitemapResponse(fallbackXml, 'products')
  }
}