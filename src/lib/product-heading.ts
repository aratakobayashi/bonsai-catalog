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
  // 「肥料付き」の盆栽など、種類が肥料・道具として登録されている樹は盆栽として扱う
  const treeLike = product.productType !== 'tree' && product.speciesLabel && /肥料付|肥料.{0,6}(プレゼント|サービス)|育て方説明書付/.test(name)
  if ((product.productType !== 'tree' && !treeLike) || !product.speciesLabel) return partHeading(name, product.speciesLabel, product.productType) ?? shortFallback(fallback)
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

// ---- 鉢・土・道具・針金・肥料など：「品名｜大きさ・量など」 ----

// 品名（上から順に最初に見つかったもの）。label は見出しに出す名前
const PART_ITEMS: { pattern: RegExp; label: (name: string, species: string | null) => string }[] = [
  { pattern: /苔玉キット/, label: () => '苔玉キット' },
  { pattern: /道具\s*\d?点?セット|\d点セット|道具セット/, label: (_n, sp) => (sp ? `${sp}の盆栽と道具セット` : '盆栽道具セット') },
  { pattern: /栽培キット|栽培セット|盆栽キット|スターターキット/, label: (_n, sp) => (sp ? `${sp}の盆栽 栽培キット` : '盆栽の栽培キット') },
  { pattern: /種子|の種(?!類)|種\s*\d+粒/, label: (_n, sp) => (sp ? `${sp}の種` : '盆栽の種') },
  { pattern: /書籍|育て方本|^本[：:]/, label: (n, sp) => {
    const topic = n.match(/([^\s　【】:：]{1,8})の育て方/)?.[1]
    return topic ? `${topic}の育て方の本` : sp ? `${sp}の育て方の本` : '盆栽の本'
  } },
  { pattern: /置物|ミニチュア|オーナメント/, label: () => '盆栽の飾り物' },
  { pattern: /芽切り?鋏|芽切り?ばさみ/, label: () => '芽切りばさみ' },
  { pattern: /コブ切/, label: () => 'コブ切り' },
  { pattern: /又枝切/, label: () => '又枝切り' },
  { pattern: /針金切|線切/, label: () => '針金切り' },
  { pattern: /やっとこ|ヤットコ|八床/, label: () => 'やっとこ' },
  { pattern: /ピンセット/, label: () => '盆栽用ピンセット' },
  { pattern: /根かき|根掻き|根捌き/, label: () => '根かき' },
  { pattern: /土入れ|土すくい|スコップ/, label: () => '土入れ' },
  { pattern: /じょうろ|ジョウロ|如雨露/, label: () => 'じょうろ' },
  { pattern: /花ばさみ|華道鋏/, label: () => '花ばさみ' },
  { pattern: /剪定鋏|剪定ばさみ|剪定バサミ|剪定はさみ/, label: () => '剪定ばさみ' },
  { pattern: /盆栽鋏|盆栽ハサミ|盆栽はさみ|木鋏/, label: () => '盆栽ばさみ' },
  { pattern: /ラベル|ネームタグ/, label: () => '園芸ラベル' },
  { pattern: /肥料容器|肥料ケース|肥料パック|肥料バスケット|プチドーム/, label: () => '肥料ケース' },
  { pattern: /銅線/, label: () => '盆栽用の銅線' },
  { pattern: /アルミ線|アルミ盆栽針金|アルミ針金/, label: () => '盆栽用のアルミ線' },
  { pattern: /針金|ワイヤー/, label: () => '盆栽用の針金' },
  { pattern: /硬質赤玉土|焼成.{0,4}赤玉土/, label: () => '硬質赤玉土' },
  { pattern: /赤玉土/, label: () => '赤玉土' },
  { pattern: /鹿沼土/, label: () => '鹿沼土' },
  { pattern: /桐生砂/, label: () => '桐生砂' },
  { pattern: /日向土/, label: () => '日向土' },
  { pattern: /富士砂/, label: () => '富士砂' },
  { pattern: /水砂|軽石/, label: () => '軽石' },
  { pattern: /培養土|混合土|配合用土|配合土|盆栽の土|盆栽用土|松盆栽の土|用土/, label: () => '盆栽用の配合土' },
  { pattern: /玉肥/, label: () => '玉肥（置き肥）' },
  { pattern: /油かす|油粕/, label: () => '油かす' },
  { pattern: /液肥|液体肥料/, label: () => '液体肥料' },
  { pattern: /バイオゴールド/, label: () => 'バイオゴールド（有機肥料）' },
  { pattern: /肥料/, label: () => '盆栽用の肥料' },
  { pattern: /鉢|ポット|プランター/, label: name => {
    const ware = name.match(/(信楽|常滑|瀬戸|萬古|万古|益子|美濃|備前|丹波|九谷|有田|清水|伊賀|唐津|萩|小石原|波佐見)焼/)
    return ware ? `${ware[1]}焼の盆栽鉢` : '盆栽鉢'
  } },
]

const POT_SHAPES = ['長角', '正角', '小判', '楕円', '六角', '八角', '菊型', '木瓜', '丸', '外縁', '切足', '三ツ足', '浅型', '深型', '変形']

function partAttributes(name: string, label: string): string[] {
  const attrs: string[] = []
  const add = (v?: string | null) => { if (v && !attrs.includes(v) && attrs.length < 3) attrs.push(v) }
  const n = name.replace(/[～~〜]/g, '〜')
  if (/鉢/.test(label)) {
    add(POT_SHAPES.find(shape => n.includes(shape)))
    const range = n.match(/(\d+(?:\.\d)?)\s*(?:号)?\s*〜\s*(\d+(?:\.\d)?)\s*号/)
    const one = n.match(/(\d+(?:\.\d)?)\s*号/)
    add(range ? `${range[1]}〜${range[2]}号` : one ? `${one[1]}号` : null)
    const width = n.match(/幅\s*約?\s*(\d+(?:\.\d)?)\s*cm/)
    if (!range && !one) add(width ? `幅${width[1]}cm` : null)
  }
  if (/土|砂|軽石/.test(label)) add(n.match(/極小粒|微粒|小粒|中粒|大粒/)?.[0])
  if (/線|針金/.test(label) && !/切/.test(label)) {
    const mm = Array.from(n.matchAll(/(?<![\d.])(\d{1,2}(?:\.\d)?)\s*mm/g)).map(m => m[1])
    add(mm.length > 2 ? `${mm[0]}〜${mm[mm.length - 1]}mm` : mm[0] ? `${mm[0]}mm` : null)
  }
  if (/ばさみ|切り|やっとこ/.test(label)) {
    add(n.match(/ステンレス/)?.[0])
    const len = n.match(/(\d{3})\s*(?:mm|m\/m|ミリ)/)
    add(len ? `${len[1]}mm` : null)
  }
  const volume = n.match(/(\d+(?:\.\d)?)\s*(L|リットル|ℓ)(?![a-zA-Z])/)
  add(volume ? `${volume[1]}L` : null)
  const weight = n.match(/(\d+(?:\.\d)?)\s*(kg|ｋｇ|g|ｇ)(?![a-zA-Z])/)
  if (!volume) add(weight ? `${weight[1]}${weight[2].replace('ｋｇ', 'kg').replace('ｇ', 'g')}` : null)
  const count = n.match(/(\d+)\s*(個|袋|缶|枚|粒|本|点)(?:セット|入り?)/)
  add(count ? `${count[1]}${count[2]}${/入/.test(count[0]) ? '入り' : 'セット'}` : null)
  return attrs
}

function partHeading(name: string, species: string | null, type: string): string | null {
  const item = PART_ITEMS.find(i => i.pattern.test(name))
  // キット：品名が見つからないとき（「もみじ ハケメ丸鉢 … キット」など）は、樹種の栽培キットとする
  const isKitOnly = type === 'kit' && (!item || /鉢/.test(item.label(name, species)))
  if (!item && !isKitOnly) return null
  const label = isKitOnly ? `${species ?? '盆栽'}の盆栽 栽培キット` : item!.label(name, species)
  // 「盆栽道具セット｜4点セット」は「盆栽道具セット（4点）」にまとめる
  let attrs = partAttributes(name, label)
  let base = label
  const pieces = attrs.find(a => /^\d+点セット$/.test(a))
  if (pieces && /セット$/.test(label)) {
    base = `${label}（${pieces.replace('セット', '')}）`
    attrs = attrs.filter(a => a !== pieces)
  }
  const labelOut = base
  return attrs.length ? `${labelOut}｜${attrs.join('・')}` : labelOut
}
