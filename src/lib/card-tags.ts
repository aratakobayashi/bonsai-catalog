// 商品カードに添える、見分けるための短い札（樹齢・鉢の色と形・苔付き・石付き）。
// 見出し（displayName）にすでに書いてあることは出さない。多くても2つまで
import type { CatalogProduct } from '@/lib/catalog-model'
import { potLabelOf } from '@/lib/kumiawase'

const COLOR_WORD = { white: '白', black: '黒', bluegreen: '青緑', earth: '茶', red: '赤系' } as const
const SHAPE_WORD = { round: '丸鉢', oval: '楕円の鉢', square: '角鉢', irregular: '岩のような器', none: '鉢' } as const

export function cardTags(product: Pick<CatalogProduct, 'id' | 'originalName' | 'displayName' | 'name' | 'productType'>, max = 2): string[] {
  if (product.productType !== 'tree' && product.productType !== 'kokedama') return []
  const title = product.displayName || product.name
  const tags: string[] = []
  const age = (product.originalName || '').match(/樹齢\s*(?:約\s*)?(\d{1,3})\s*年/)
  if (age && !title.includes('樹齢')) tags.push(`樹齢${age[1]}年`)
  const pot = potLabelOf(product.id)
  if (pot && !/鉢|焼/.test(title.split('｜')[1] ?? '')) {
    tags.push(`${COLOR_WORD[pot.color]}の${pot.shallow && pot.shape !== 'irregular' ? '浅鉢' : SHAPE_WORD[pot.shape]}`)
  }
  if (pot?.stone && !title.includes('石付')) tags.push('石付き')
  else if (pot?.moss && !title.includes('苔')) tags.push('苔付き')
  return tags.slice(0, max)
}
