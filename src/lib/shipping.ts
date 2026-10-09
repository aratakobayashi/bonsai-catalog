// 送料の表記をそろえる（カード・商品ページ・比較表で共通に使う）
// 楽天：postageFlag=0 は「送料込（価格に送料を含む）」。postageFlag=1 は「送料別」だが、
//       一定金額以上で送料無料になるショップでも 1 になるため、「送料別」とは書かずショップでの確認を案内する
// Amazon：free_shipping=true のときだけ「送料込」と同じ扱いにする（それ以外は不明）
import type { CatalogProduct } from '@/lib/catalog-model'

type ShippingInput = Pick<CatalogProduct, 'freeShipping' | 'source'>

export const SHIPPING_INCLUDED_LABEL = '送料込'
export const SHIPPING_CHECK_TEXT = '送料はショップでご確認ください'

// 送料が価格に含まれる（送料無料）と分かっている商品か
export function isShippingIncluded(product: ShippingInput): boolean {
  return product.freeShipping === true
}

// カード用の短い表記：送料込のときだけ '送料込'、それ以外は表示しない（null）
export function shippingLabel(product: ShippingInput): typeof SHIPPING_INCLUDED_LABEL | null {
  return isShippingIncluded(product) ? SHIPPING_INCLUDED_LABEL : null
}

// 商品ページ・比較表用の説明
export function shippingDetail(product: ShippingInput): string {
  if (!isShippingIncluded(product)) return SHIPPING_CHECK_TEXT
  return product.source === 'rakuten' ? '送料込（表示価格に送料を含みます）' : '送料無料'
}
