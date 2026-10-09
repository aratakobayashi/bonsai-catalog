// トップで使う「写真のきれいな商品」の判定と並べ替え（src/data/product-images.json で、ショップの候補から盆栽がよく見える1枚を選び直した商品）
import productImages from '@/data/product-images.json'
import type { CatalogProduct } from '@/lib/catalog-model'

const CURATED = new Set(Object.keys(productImages as Record<string, string>))

export function hasCuratedImage(product: Pick<CatalogProduct, 'id' | 'imageUrl'>): boolean {
  return Boolean(product.imageUrl) && CURATED.has(product.id)
}

export const byReviews = (a: CatalogProduct, b: CatalogProduct) =>
  b.reviewCount - a.reviewCount || b.reviewAverage - a.reviewAverage

// 写真を選び直した商品を先に、その中ではレビューの多い順
export const byCuratedThenReviews = (a: CatalogProduct, b: CatalogProduct) =>
  Number(hasCuratedImage(b)) - Number(hasCuratedImage(a)) || byReviews(a, b)
