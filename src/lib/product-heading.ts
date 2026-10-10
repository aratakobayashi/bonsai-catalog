// 商品ページの見出し：楽天の商品名（宣伝文句やキーワードの羅列が多い）の代わりに、
// 「品種・樹種の盆栽｜特徴」の形で短く読みやすい名前を作る。元の商品名は商品説明の中に残す
import type { CatalogProduct } from '@/lib/catalog-model'
import { SPECIES_TRAITS } from '@/lib/species-traits'

// 商品名から拾う特徴（上から順に、3つまで）
const FEATURES: { pattern: RegExp; label: (m: RegExpMatchArray) => string }[] = [
  { pattern: /^苗[：:]|実生苗|挿し木苗|ポット苗|苗木|盆栽素材|（1ポット）|\(1ポット\)/, label: () => '苗' },
  { pattern: /(はじめて|初心者)?(?:の)?\d?点?道具セット|道具付/, label: () => '道具セット' },
  { pattern: /(\d+)\s*(本|鉢)セット/, label: m => `${m[1]}${m[2]}セット` },
  { pattern: /(スイーツ|お菓子)セット/, label: () => 'お菓子セット' },
  { pattern: /樹齢\s*(\d{1,3})\s*年/, label: m => `樹齢${m[1]}年` },
  { pattern: /寄せ植え|寄植|寄せ\b|\d本寄せ|二本寄せ|双幹|双竜/, label: () => '寄せ植え' },
  { pattern: /根上が?り/, label: () => '根上がり' },
  { pattern: /石付|石つき/, label: () => '石付き' },
  { pattern: /斑入り/, label: () => '斑入り' },
  { pattern: /八房/, label: () => '八房' },
  { pattern: /曲付き?|曲\)/, label: () => '曲付き' },
  { pattern: /(信楽|常滑|瀬戸|萬古|万古|益子|美濃|備前|丹波|九谷|有田|清水|伊賀|唐津|萩)焼?/, label: m => `${m[1]}焼の鉢` },
  { pattern: /炭化焼/, label: () => '炭化焼の鉢' },
  { pattern: /鉢が選べる|鉢を選べる/, label: () => '鉢が選べる' },
  { pattern: /苔付|苔つき|苔・|苔＆|苔と/, label: () => '苔付き' },
  { pattern: /大品/, label: () => '大品' },
  { pattern: /中品/, label: () => '中品' },
  { pattern: /現品/, label: () => '現品' },
]

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// 樹種名の前に付いた品種・産地の名前（「銀八房五葉松」「三河黒松」「斑入り真柏」など、前の語が4文字まで）
function varietyName(name: string, species: string): string | null {
  const re = new RegExp(`(?:^|[\\s　（(「：:*＊])([一-龥々ァ-ヶー]{1,4})${escapeRe(species)}`, 'g')
  for (const m of Array.from(name.matchAll(re))) {
    const prefix = m[1]
    // 宣伝・分類の語は品種名にしない
    if (/^(盆栽|ミニ|小品|中品|特選|高級|希少|人気|本格|曲付|曲付き|現品|和|苗|品種系|プレゼント)$/.test(prefix)) continue
    return `${prefix}${species}`
  }
  return null
}

// 「皐月 葵の輝 樹高…」「富士桜 おかめ …」のように、樹種名のすぐ後ろに置かれた品種名
const NOT_VARIETY = /^(樹高|全高|希少|紅葉|新緑|ミニ|ミニミニ|盆栽|小品|中品|大品|初心者|鉢植え|現品|一点物|特選|特撰|高級|人気|縁起物|室内|苗|苗木|素材|実生|挿し木|取り木|接ぎ木|サクラ|さくら|モミジ|もみじ|紅葉|曲付き?|寄せ植え|石付き?|八房|斑入り)/
function varietyAfter(name: string, species: string, aliases: string[]): string | null {
  const words = name.split(/[\s　]+/).filter(Boolean)
  if (words.length < 2 || ![species, ...aliases].includes(words[0])) return null
  const next = words[1]
  if (next.length < 2 || next.length > 6 || NOT_VARIETY.test(next) || /[0-9０-９a-zA-Z（）()【】*＊:：/]/.test(next) || next.includes(species)) return null
  return next
}

// 鉢・道具など：一覧用の短い名前を、さらに見出しに収まる長さ（語の切れ目まで）にする
function shortFallback(name: string, max = 30): string {
  const text = name.replace(/…$/, '')
  if (text.length <= max) return name
  const cut = text.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.5 ? cut.slice(0, space) : cut).trim()}…`
}

export function productHeading(product: Pick<CatalogProduct, 'originalName' | 'speciesLabel' | 'productType'>, fallback: string): string {
  const name = product.originalName || ''
  if (product.productType !== 'tree' || !product.speciesLabel) return shortFallback(fallback)
  // 「もみじ・楓」「実もの」のようにまとめた樹種名は、商品名に出てくる名前（もみじ・梅もどき など）にする
  let species = product.speciesLabel
  if (/・/.test(species) || species === '実もの') {
    const trait = SPECIES_TRAITS.find(t => t.label === species)
    const m = trait ? name.match(trait.pattern) : null
    if (m && m[0] !== '実もの' && m[0] !== '実物') species = m[0]
  }
  const variety = varietyName(name, species)
  const after = variety ? null : varietyAfter(name, species, ['皐月', 'サツキ', 'さくら', 'サクラ'])
  const base = after ? `${species}「${after}」の盆栽` : `${variety ?? species}の盆栽`
  const features: string[] = []
  for (const f of FEATURES) {
    const m = name.match(f.pattern)
    if (!m) continue
    const label = f.label(m)
    // 品種名に含まれる特徴（「八房」など）は重ねない
    // 鉢の特徴は1つだけ（「益子焼の鉢・炭化焼の鉢」のように重ねない）
    if (label.endsWith('の鉢') && features.some(f => f.endsWith('の鉢'))) continue
    if (!features.includes(label) && !(variety && variety.includes(label))) features.push(label)
    if (features.length >= 3) break
  }
  return features.length ? `${base}｜${features.join('・')}` : base
}
