// 楽天市場の「盆栽専門店」（盆栽を専門に扱う店）と、そのうち当サイトに掲載している盆栽園の店。
// 楽天のショップ情報（会社名・所在地）で確かめたもの（2026年11月23日確認）。
// 店は楽天の店舗コード（item.rakuten.co.jp/<code>/）で見分ける。店名は変わることがあるため使わない
import type { CatalogProduct } from '@/lib/catalog-model'

export type BonsaiShopKind = 'garden' | 'specialist'

export interface BonsaiShop {
  code: string
  name: string
  kind: BonsaiShopKind
  // 所在地（ショップ情報の住所から、都道府県と市区町村まで）
  area: string
  // 当サイトの盆栽園のページ（kind が garden のとき）
  gardenId?: string
  gardenName?: string
  // 主に扱うもの（道具の専門店など）
  note?: string
}

export const BONSAI_SHOPS: BonsaiShop[] = [
  { code: 'bonsai-haniwa', name: '盆栽はニわ', kind: 'garden', area: '三重県津市', gardenId: '6431e451-1cc9-4934-91c1-6d81fa25631b', gardenName: '盆栽はニわ' },
  { code: 'yukei', name: '遊恵盆栽', kind: 'garden', area: '大阪府池田市', gardenId: 'd59a502e-61cb-427e-ac93-bb4da4dfc5f6', gardenName: '養庄園' },
  { code: 'ichijuen', name: '一樹園', kind: 'garden', area: '香川県高松市（鬼無）', gardenId: '92b86a0d-a49b-4213-b2c8-c55ebe35f360', gardenName: '一樹園' },
  { code: 'miurabaijuen', name: '三浦培樹園', kind: 'garden', area: '大阪府豊能郡能勢町', gardenId: 'c0d05f51-6d9e-4cab-87e9-14f85f31f501', gardenName: '三浦培樹園' },
  { code: 'auc-iyoji-en', name: 'いよじ園', kind: 'garden', area: '愛媛県伊予郡松前町', gardenId: 'be6da991-1351-4921-8980-644c1556366b', gardenName: '伊予路園' },
  { code: 'bonsai-myo', name: '盆栽妙', kind: 'specialist', area: '香川県高松市' },
  { code: 'bonsaisaito', name: 'BONSAI 彩都', kind: 'specialist', area: '京都府京都市' },
  { code: 'hanagokoro-bonsai', name: '花心盆栽', kind: 'specialist', area: '東京都練馬区' },
  { code: 'vertmoi', name: '山野草と盆栽の専門店ヴェールモア', kind: 'specialist', area: '大阪府大阪市' },
  { code: 'ishidaseikaen', name: '石田精華園', kind: 'specialist', area: '京都府京都市' },
  { code: 'syokouen', name: '片岡笑幸園', kind: 'specialist', area: '新潟県新潟市' },
  { code: 'umekichi', name: 'うめきち盆栽用品店', kind: 'specialist', area: '神奈川県横浜市', note: '盆栽の道具・用品' },
]

const BY_CODE = new Map(BONSAI_SHOPS.map(s => [s.code, s]))
export const BONSAI_SHOPS_CHECKED_AT = '2026-11-23'

// 楽天の店舗コード（商品のURL・画像のURLから）
export function rakutenShopCode(product: Pick<CatalogProduct, 'source' | 'buyUrl' | 'imageUrl'>): string | null {
  if (product.source !== 'rakuten') return null
  const url = product.buyUrl ? decodeURIComponent(product.buyUrl) : ''
  const m = url.match(/item\.rakuten\.co\.jp\/([^/?#]+)\//) ?? (product.imageUrl || '').match(/@0_mall\/([^/]+)\//)
  return m ? m[1] : null
}

export function bonsaiShopOf(product: Pick<CatalogProduct, 'source' | 'buyUrl' | 'imageUrl'>): BonsaiShop | null {
  const code = rakutenShopCode(product)
  return code ? BY_CODE.get(code) ?? null : null
}

export const bonsaiShopOfGarden = (gardenId: string) => BONSAI_SHOPS.find(s => s.gardenId === gardenId) ?? null

export const shopBadgeLabel = (shop: BonsaiShop) => (shop.kind === 'garden' ? '盆栽園の店' : '盆栽専門店')
