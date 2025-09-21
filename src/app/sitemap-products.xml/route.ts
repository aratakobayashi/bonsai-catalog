import { supabase } from '@/lib/supabase'
import { baseUrl, SITEMAP_CONFIG, createSitemapResponse, generateXmlHeader, generateXmlFooter, generateUrlElement } from '@/lib/sitemap-utils'

const bonsaiCategories = [
  '松柏類', '雑木類', '花もの', '実もの', '草もの',
  'ミニ盆栽', '初心者向け', '室内向け'
]

const priceRanges = [
  { min: 0, max: 5000 },
  { min: 5000, max: 10000 },
  { min: 10000, max: 20000 },
  { min: 20000, max: 50000 },
  { min: 50000, max: null }
]

export async function GET() {
  try {
    const config = SITEMAP_CONFIG.products
    const lastMod = new Date().toISOString().split('T')[0]

    let urls: string[] = []

    // カテゴリページ
    const categoryUrls = bonsaiCategories.map(category =>
      generateUrlElement(`${baseUrl}/products?category=${encodeURIComponent(category)}`, lastMod, 'weekly', 0.8)
    )
    urls.push(...categoryUrls)

    // 価格帯ページ
    const priceUrls = priceRanges.map(range => {
      const params = new URLSearchParams()
      params.set('price_min', range.min.toString())
      if (range.max) params.set('price_max', range.max.toString())

      return generateUrlElement(`${baseUrl}/products?${params.toString()}`, lastMod, 'weekly', 0.7)
    })
    urls.push(...priceUrls)

    // 商品詳細ページ
    try {
      const { data: products } = await supabase
        .from('products')
        .select('id, created_at, updated_at')
        .eq('is_visible', true)

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