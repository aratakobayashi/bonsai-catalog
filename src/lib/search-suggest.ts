// 検索候補（ヘッダーの検索欄・スマホの検索画面）：樹種 → 商品 → 育て方 の順に返す
// 商品・記事は、ビルド時に作ったデータ（/data/catalog.json・/data/articles.json）からブラウザで探す
import { KEYWORD_MAX_LENGTH, categoryCounts, filterProducts, parseFilters, type CatalogProduct } from '@/lib/catalog'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { peakLabel } from '@/lib/seasons'
import { matchesKeyword, parseKeyword } from '@/lib/search-normalize'

export interface SuggestSpecies {
  slug: string
  name: string
  count: number
  // 見頃の目安（「見頃 花 2〜3月」など。seasons.ts の樹種ごとの一般的な目安。常緑・ない樹種は空）
  season: string
}

export interface SuggestResponse {
  q: string
  total: number
  species: SuggestSpecies[]
  products: { id: string; name: string; price: number }[]
  articles: { slug: string; title: string }[]
}

// 樹種名の読み・言い換え（ひらがなで入力しても見つかるように）
const READINGS: Record<string, string> = {
  goyomatsu: 'ごようまつ goyomatsu',
  kuromatsu: 'くろまつ kuromatsu',
  shimpaku: 'しんぱく 糸魚川 shimpaku',
  momiji: 'もみじ もみぢ 楓 かえで momiji',
  sakura: 'さくら sakura',
  ume: 'うめ ちょうじゅばい 長寿梅 ume',
  mini: 'みに 豆盆栽 小品',
  kokedama: 'こけだま',
  akamatsu: 'あかまつ akamatsu',
  satsuki: 'さつき 皐月 つつじ satsuki',
  keyaki: 'けやき 欅 keyaki',
  sansho: 'さんしょう 山椒',
  nanten: 'なんてん 南天',
  himeringo: 'ひめりんご 姫林檎 りんご 林檎',
  mimono: 'みもの 実物',
  olive: 'おりーぶ',
  gajumaru: 'がじゅまる',
}

// 入力前に「樹種から」に出す順番（商品があるものだけ表示する）
const FEATURED_SPECIES = ['momiji', 'goyomatsu', 'ume', 'kuromatsu', 'sakura', 'himeringo', 'nanten', 'shimpaku']

const TREE_CATEGORIES = SHOP_CATEGORIES.filter(c => c.group === 'tree')

function seasonText(slug: string): string {
  const label = peakLabel(slug)
  // 常緑は「見頃」ではないので出さない
  return label && !label.includes('常緑') ? `見頃 ${label}` : ''
}

// 商品一覧の変換結果を1分だけメモリに持つ（候補は入力ごとに呼ばれるため）
// 樹種ごとの商品数（検索候補の件数に使う）
function treeCounts(products: CatalogProduct[]): Map<string, number> {
  const all = categoryCounts(products)
  return new Map(TREE_CATEGORIES.map(c => [c.slug, all[c.slug] ?? 0]))
}

// 入力前に出す樹種（商品がある樹種だけ）。商品データはブラウザで /data/catalog.json から読む
export function getFeaturedSpecies(products: CatalogProduct[]): SuggestSpecies[] {
  const counts = treeCounts(products)
  return FEATURED_SPECIES.flatMap(slug => {
    const category = TREE_CATEGORIES.find(c => c.slug === slug)
    const count = counts.get(slug) ?? 0
    return category && count > 0 ? [{ slug, name: category.name, count, season: seasonText(slug) }] : []
  })
}

// 入力中の検索候補。articles は記事一覧のデータ（/data/articles.json）のタイトル
export function getSearchSuggestions(rawQuery: string, products: CatalogProduct[], articles: { slug: string; title: string }[]): SuggestResponse {
  const q = rawQuery.trim().slice(0, KEYWORD_MAX_LENGTH)
  const keyword = parseKeyword(q)
  const counts = treeCounts(products)

  const species = TREE_CATEGORIES.filter(c => (counts.get(c.slug) ?? 0) > 0 && matchesKeyword(keyword, `${c.name} ${READINGS[c.slug] ?? ''}`))
    .slice(0, 3)
    .map(c => ({ slug: c.slug, name: c.name, count: counts.get(c.slug) ?? 0, season: seasonText(c.slug) }))

  const matched = filterProducts(products, parseFilters({ q }))

  return {
    q,
    total: matched.length,
    species,
    products: matched.slice(0, 4).map(p => ({ id: p.id, name: p.displayName, price: p.price })),
    articles: articles.filter(a => matchesKeyword(keyword, a.title)).slice(0, 2),
  }
}
