// 商品詳細（一覧の右側のパネルと商品ページで共通）に出す情報の組み立て
import { PRODUCT_TYPE_LABELS } from '@/lib/product-classify'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { ENJOY_OPTIONS, LEVEL_OPTIONS, PLACE_OPTIONS, SEASON_OPTIONS } from '@/lib/species-traits'
import type { CatalogProduct } from '@/lib/catalog-model'

export const SHOP_LABELS = { amazon: 'Amazon', rakuten: '楽天市場' } as const

const SIZE_LABELS: Record<string, string> = {
  mini: 'ミニ（樹高15cm程度まで）',
  small: '小品（樹高25cm程度まで）',
  medium: '中品（樹高45cm程度まで）',
  large: '大品',
  unknown: '記載なし（商品ページでご確認ください）',
}

export const PART_TYPES = ['pot', 'soil', 'tool', 'wire', 'fertilizer']

export function isPartProduct(product: CatalogProduct): boolean {
  return PART_TYPES.includes(product.productType)
}

export function categoryLink(product: CatalogProduct) {
  const slug = product.syncCategory || SHOP_CATEGORIES.find(c => c.group === 'tree' && product.originalName.includes(c.name))?.slug
  const category = SHOP_CATEGORIES.find(c => c.slug === slug)
  return category ? { href: `/products/category/${category.slug}`, label: category.name } : null
}

// 樹種ごとの一般的な性質（置き場所・楽しみ方・見ごろ・育てやすさ）
function traitText(product: CatalogProduct): string | null {
  if (!product.speciesLabel) return null
  return [
    product.speciesLabel,
    PLACE_OPTIONS.find(o => o.value === product.place)?.label,
    product.enjoy.map(e => ENJOY_OPTIONS.find(o => o.value === e)?.label).filter(Boolean).join('・'),
    product.seasons.length ? `見ごろ：${product.seasons.map(v => SEASON_OPTIONS.find(o => o.value === v)?.label).join('・')}` : '',
    LEVEL_OPTIONS.find(o => o.value === product.level)?.label,
  ].filter(Boolean).join('／') + '（一般的な目安）'
}

export function productSpecs(product: CatalogProduct): { label: string; value: string }[] {
  const isPart = isPartProduct(product)
  const shopLabel = SHOP_LABELS[product.source]
  const traits = traitText(product)
  return [
    { label: '種類', value: PRODUCT_TYPE_LABELS[product.productType] },
    ...(!isPart && product.category !== 'その他' ? [{ label: '分類', value: product.category }] : []),
    ...(traits ? [{ label: '樹種の目安', value: traits }] : []),
    ...(!isPart ? [{ label: 'サイズの目安', value: product.heightCm ? `樹高 約${product.heightCm}cm（${SIZE_LABELS[product.sizeCategory].split('（')[0]}）` : SIZE_LABELS[product.sizeCategory] }] : []),
    { label: '販売ショップ', value: `${product.shopName}（${shopLabel}）` },
    ...(product.originalName !== product.name ? [{ label: '販売ページの商品名', value: product.originalName }] : []),
    { label: '送料', value: product.freeShipping === true ? '送料無料（表記あり）' : product.freeShipping === false ? '送料別（ショップにより異なります）' : '商品ページでご確認ください' },
    { label: 'レビュー', value: product.reviewCount > 0 ? `★${product.reviewAverage.toFixed(1)}（${product.reviewCount.toLocaleString()}件・${shopLabel}）` : 'まだありません' },
  ]
}

export function priceNote(product: CatalogProduct): string {
  const date = product.lastSyncedAt ? new Date(product.lastSyncedAt).toLocaleDateString('ja-JP') : null
  return `参考価格${date ? `（${date}時点）` : ''}。最新の価格・在庫・送料は商品ページでご確認ください。`
}
