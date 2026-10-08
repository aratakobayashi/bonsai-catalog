// 商品名・説明文から、種類・樹種カテゴリ・サイズなどを推定する（楽天の商品の取り込み用）
// 推定できないものは「不明」のままにして、根拠のない情報は付けない
import type { ShopCategory } from '@/lib/shop-categories'
import type { SizeCategory } from '@/types'

export type ProductType =
  | 'tree' | 'kokedama' | 'kit' | 'pot' | 'soil' | 'tool' | 'wire' | 'fertilizer' | 'seed' | 'other'

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  tree: '盆栽（樹）',
  kokedama: '苔玉',
  kit: '盆栽キット',
  pot: '鉢',
  soil: '土',
  tool: '道具',
  wire: '針金',
  fertilizer: '肥料',
  seed: '種・苗',
  other: 'その他',
}

const PART_TYPES: Record<string, ProductType> = {
  hachi: 'pot',
  tsuchi: 'soil',
  dougu: 'tool',
  harigane: 'wire',
  hiryo: 'fertilizer',
}

export function detectProductType(name: string, category: ShopCategory): ProductType {
  if (category.group === 'part') return PART_TYPES[category.slug] ?? 'other'
  if (/種子|の種|タネ|たね/.test(name)) return 'seed'
  if (/^本[：:]|書籍|育て方.*資材/.test(name)) return 'other'
  if (/苔玉|こけだま|コケダマ/.test(name) || category.slug === 'kokedama') {
    return /キット/.test(name) ? 'kit' : 'kokedama'
  }
  if (/キット|栽培セット/.test(name)) return 'kit'
  return 'tree'
}

export function detectBonsaiCategory(text: string, type: ProductType): string {
  if (['pot', 'soil', 'tool', 'wire', 'fertilizer'].includes(type)) return '鉢・道具'
  if (/黒松|五葉松|赤松|真柏|杜松|檜|ヒノキ|ヒバ|松柏/.test(text)) return '松柏類'
  if (/りんご|リンゴ|柿|姫りんご|実もの|ザクロ|南天|ナンテン|ピラカンサ|梅もどき|ウメモドキ|紫式部/.test(text)) return '実もの'
  if (/桜|さくら|サクラ|梅|うめ|ウメ|長寿梅|藤|皐月|さつき|サツキ|椿|ツバキ|花もの/.test(text)) return '花もの'
  if (/もみじ|モミジ|紅葉|楓|カエデ|けやき|ケヤキ|欅|ぶな|ブナ|イチョウ|山椒|サンショウ|雑木/.test(text)) return '雑木類'
  if (/苔|草もの|山野草/.test(text)) return '草もの'
  return 'その他'
}

// 「樹高約20cm」のような記載から樹高を読み取る
export function detectHeightCm(text: string): number | null {
  const match = text.match(/(?:樹高|高さ|全高)[^0-9０-９]{0,6}([0-9０-９]{1,3})\s*(?:cm|ｃｍ|センチ)/i)
  if (!match) return null
  const value = Number(match[1].replace(/[０-９]/g, d => String('０１２３４５６７８９'.indexOf(d))))
  return value > 0 && value < 300 ? value : null
}

export function detectSizeCategory(text: string, heightCm: number | null): SizeCategory {
  if (heightCm) {
    if (heightCm <= 15) return 'mini'
    if (heightCm <= 25) return 'small'
    if (heightCm <= 45) return 'medium'
    return 'large'
  }
  if (/豆盆栽|超ミニ|極小|ミニ盆栽|ミニ/.test(text)) return 'mini'
  if (/小品|小型/.test(text)) return 'small'
  if (/中品|中型/.test(text)) return 'medium'
  if (/大品|大型/.test(text)) return 'large'
  return 'unknown'
}

const SPECIES_TAGS = [
  '五葉松', '黒松', '赤松', '真柏', 'もみじ', '楓', 'ケヤキ', '桜', '梅', '長寿梅', '藤', '皐月',
  '南天', '姫りんご', '椿', 'ガジュマル', 'オリーブ', '苔玉',
]

export function detectTags(text: string): string[] {
  const tags = SPECIES_TAGS.filter(tag => text.includes(tag))
  if (/ミニ盆栽|ミニ/.test(text)) tags.push('ミニ盆栽')
  if (/寄せ植え/.test(text)) tags.push('寄せ植え')
  if (/鉢付き|鉢付|鉢植え/.test(text)) tags.push('鉢付き')
  return Array.from(new Set(tags))
}

// 商品名に書かれている場合だけ立てるフラグ（販売店の表記にもとづく）
export function detectClaims(name: string) {
  return {
    indoor: /室内/.test(name),
    gift: /ギフト|プレゼント|贈り物|ラッピング|母の日|父の日|敬老の日|お祝い/.test(name),
    beginner: /初心者|入門|はじめて/.test(name),
  }
}
