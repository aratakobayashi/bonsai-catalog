// トップで使う「写真のきれいな商品」の判定と並べ替え。
// 今の表示画像を目で確かめた判定（src/data/product-image-review.json の labels：clean / minor / text）を使う
// 手順は docs/growth/image-review.md
import review from '@/data/product-image-review.json'
import type { CatalogProduct } from '@/lib/catalog-model'

const LABELS = (review as { labels: Record<string, 'clean' | 'minor' | 'text'> }).labels

// 文字・バナーのない写真（トップの「よく選ばれている盆栽」などに使う）
export function hasCuratedImage(product: Pick<CatalogProduct, 'id' | 'imageUrl'>): boolean {
  return Boolean(product.imageUrl) && LABELS[product.id] === 'clean'
}

// 写真のきれいさ（clean 2 > minor 1 > text・未確認 0）
function imageScore(product: Pick<CatalogProduct, 'id' | 'imageUrl'>): number {
  if (!product.imageUrl) return -1
  const label = LABELS[product.id]
  return label === 'clean' ? 2 : label === 'minor' ? 1 : 0
}

export const byReviews = (a: CatalogProduct, b: CatalogProduct) =>
  b.reviewCount - a.reviewCount || b.reviewAverage - a.reviewAverage

// 写真のきれいな商品を先に（それ以外の並びは変えない。Array.prototype.sort は安定ソート）
export const byCuratedImage = (a: CatalogProduct, b: CatalogProduct) => imageScore(b) - imageScore(a)

// 写真のきれいな商品を先に、その中ではレビューの多い順
export const byCuratedThenReviews = (a: CatalogProduct, b: CatalogProduct) =>
  imageScore(b) - imageScore(a) || byReviews(a, b)
