// 検索候補（ヘッダーの検索欄・スマホの検索画面）：樹種 → 商品 → 育て方 の順に返す
// 商品・記事はキャッシュ済みのデータから探し、DB への問い合わせを増やさない
import { unstable_cache } from 'next/cache'
import { filterProducts, getCatalogProducts, parseFilters, type CatalogProduct } from '@/lib/catalog'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { SEASON_OPTIONS, SPECIES_TRAITS } from '@/lib/species-traits'
import { matchesKeyword, parseKeyword } from '@/lib/search-normalize'
import { supabase } from '@/lib/supabase'

export interface SuggestSpecies {
  slug: string
  name: string
  count: number
  // 見ごろの季節（樹種ごとの一般的な目安。ない樹種は空）
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
  momiji: 'もみじ 紅葉 楓 かえで momiji',
  sakura: 'さくら sakura',
  ume: 'うめ ちょうじゅばい 長寿梅 ume',
  mini: 'みに 豆盆栽 小品',
  kokedama: 'こけだま',
  akamatsu: 'あかまつ akamatsu',
  satsuki: 'さつき 皐月 つつじ satsuki',
  keyaki: 'けやき 欅 keyaki',
  sansho: 'さんしょう 山椒',
  nanten: 'なんてん 南天',
  himeringo: 'ひめりんご りんご 林檎',
  mimono: 'みもの 実物',
  olive: 'おりーぶ',
  gajumaru: 'がじゅまる',
}

// 入力前に「樹種から」に出す順番（商品があるものだけ表示する）
const FEATURED_SPECIES = ['momiji', 'goyomatsu', 'ume', 'kuromatsu', 'sakura', 'himeringo', 'nanten', 'shimpaku']

const TREE_CATEGORIES = SHOP_CATEGORIES.filter(c => c.group === 'tree')

function speciesCount(products: CatalogProduct[], slug: string): number {
  return filterProducts(products, { ...parseFilters({}), species: slug, type: slug === 'kokedama' ? 'kokedama' : 'tree' }).length
}

function seasonText(slug: string): string {
  const trait = SPECIES_TRAITS.find(t => t.key === slug)
  if (!trait?.seasons.length) return ''
  return `見ごろ ${trait.seasons.map(s => SEASON_OPTIONS.find(o => o.value === s)?.label).join('・')}`
}

// 商品一覧の変換結果を1分だけメモリに持つ（候補は入力ごとに呼ばれるため）
let memo: { at: number; products: CatalogProduct[]; counts: Map<string, number> } | null = null

async function getProductsWithCounts() {
  if (memo && Date.now() - memo.at < 60_000) return memo
  const products = await getCatalogProducts()
  const counts = new Map(TREE_CATEGORIES.map(c => [c.slug, speciesCount(products, c.slug)]))
  memo = { at: Date.now(), products, counts }
  return memo
}

// 公開中の記事のタイトルだけを取得して1時間キャッシュする
const getArticleTitles = unstable_cache(
  async (): Promise<{ slug: string; title: string }[]> => {
    const { data, error } = await supabase
      .from('articles')
      .select('slug, title')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1000)
    if (error) {
      console.error('記事タイトルの取得エラー:', error.message)
      return []
    }
    return ((data as { slug: string; title: string }[] | null) ?? []).filter(a => a.slug && a.title)
  },
  ['search-suggest-article-titles-v1'],
  { revalidate: 3600, tags: ['articles'] },
)

// 入力前の「樹種から」
export async function getFeaturedSpecies(): Promise<SuggestSpecies[]> {
  const { counts } = await getProductsWithCounts()
  return FEATURED_SPECIES.flatMap(slug => {
    const category = TREE_CATEGORIES.find(c => c.slug === slug)
    const count = counts.get(slug) ?? 0
    return category && count > 0 ? [{ slug, name: category.name, count, season: seasonText(slug) }] : []
  })
}

export async function getSearchSuggestions(rawQuery: string): Promise<SuggestResponse> {
  const q = rawQuery.trim().slice(0, 50)
  const keyword = parseKeyword(q)
  const [{ products, counts }, articles] = await Promise.all([getProductsWithCounts(), getArticleTitles().catch(() => [])])

  const species = TREE_CATEGORIES.filter(c => (counts.get(c.slug) ?? 0) > 0 && matchesKeyword(keyword, `${c.name} ${READINGS[c.slug] ?? ''}`))
    .slice(0, 2)
    .map(c => ({ slug: c.slug, name: c.name, count: counts.get(c.slug) ?? 0, season: seasonText(c.slug) }))

  const matched = filterProducts(products, parseFilters({ q }))

  return {
    q,
    total: matched.length,
    species,
    products: matched.slice(0, 4).map(p => ({ id: p.id, name: p.name, price: p.price })),
    articles: articles.filter(a => matchesKeyword(keyword, a.title)).slice(0, 2),
  }
}
