// 樹種ごとの一般的な性質（置き場所・楽しみ方・見ごろ・育てやすさ）
// 商品名に書かれていなくても、樹種から「室内に置きやすい」「花を楽しむ」などで探せるようにする。
// あくまで一般的な目安なので、画面では「目安」と明記する。商品名で最初に書かれている樹種を選ぶ（同じ位置から始まる場合は上にある具体的な樹種）

import { SPECIES_PEAKS, seasonsOfMonths } from '@/lib/seasons'

export type Place = 'indoor' | 'outdoor'
export type Enjoy = 'flower' | 'leaf_color' | 'fruit' | 'evergreen'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type Level = 'easy' | 'normal'

export interface SpeciesTrait {
  key: string
  label: string
  pattern: RegExp
  place: Place
  enjoy: Enjoy[]
  seasons: Season[]
  level: Level
}

// seasons は seasons.ts の見頃の月から求める（下の SPECIES_TRAITS で上書き）。ここに書いた値は目安の控え
const RAW_TRAITS: SpeciesTrait[] = [
  // 室内に置きやすい樹種（寒さに弱く、明るい室内で管理するもの）
  { key: 'gajumaru', label: 'ガジュマル', pattern: /ガジュマル|がじゅまる/, place: 'indoor', enjoy: ['evergreen'], seasons: [], level: 'easy' },
  { key: 'ficus', label: 'フィカス', pattern: /フィカス|ベンジャミン/, place: 'indoor', enjoy: ['evergreen'], seasons: [], level: 'easy' },
  // 松柏類
  { key: 'goyomatsu', label: '五葉松', pattern: /五葉松|ゴヨウマツ|ごようまつ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'normal' },
  { key: 'kuromatsu', label: '黒松', pattern: /黒松|クロマツ|くろまつ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'normal' },
  { key: 'akamatsu', label: '赤松', pattern: /赤松|アカマツ|あかまつ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'normal' },
  { key: 'shimpaku', label: '真柏', pattern: /真柏|シンパク|しんぱく/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'easy' },
  { key: 'toshou', label: '杜松', pattern: /杜松|トショウ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'normal' },
  { key: 'hinoki', label: '檜・ヒバ', pattern: /檜|ヒノキ|ヒバ|石化ヒノキ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'easy' },
  // 花もの
  { key: 'chojubai', label: '長寿梅', pattern: /長寿梅|チョウジュバイ|ちょうじゅばい/, place: 'outdoor', enjoy: ['flower'], seasons: ['spring', 'autumn'], level: 'easy' },
  { key: 'ume', label: '梅', pattern: /梅(?!もどき|モドキ)|うめ|ウメ(?!モドキ)/, place: 'outdoor', enjoy: ['flower'], seasons: ['winter', 'spring'], level: 'normal' },
  { key: 'sakura', label: '桜', pattern: /桜|さくら|サクラ/, place: 'outdoor', enjoy: ['flower'], seasons: ['spring'], level: 'normal' },
  { key: 'satsuki', label: 'さつき', pattern: /さつき|サツキ|皐月|ツツジ|つつじ/, place: 'outdoor', enjoy: ['flower'], seasons: ['spring', 'summer'], level: 'normal' },
  { key: 'fuji', label: '藤', pattern: /藤/, place: 'outdoor', enjoy: ['flower'], seasons: ['spring'], level: 'normal' },
  // 夏椿（ヒメシャラの仲間・落葉樹）は椿とは別の樹種
  { key: 'natsutsubaki', label: '夏椿', pattern: /夏椿|ナツツバキ|沙羅|ヒメシャラ|姫シャラ/, place: 'outdoor', enjoy: ['flower', 'leaf_color'], seasons: ['summer'], level: 'normal' },
  { key: 'tsubaki', label: '椿', pattern: /椿|ツバキ|山茶花|サザンカ/, place: 'outdoor', enjoy: ['flower', 'evergreen'], seasons: ['winter', 'spring'], level: 'easy' },
  { key: 'sarusuberi', label: 'サルスベリ', pattern: /サルスベリ|百日紅/, place: 'outdoor', enjoy: ['flower'], seasons: ['summer'], level: 'normal' },
  { key: 'kuchinashi', label: 'クチナシ', pattern: /クチナシ|くちなし|梔子/, place: 'outdoor', enjoy: ['flower', 'fruit'], seasons: ['summer', 'autumn'], level: 'normal' },
  { key: 'bara', label: 'バラ', pattern: /バラ|ばら|薔薇/, place: 'outdoor', enjoy: ['flower'], seasons: ['spring', 'autumn'], level: 'normal' },
  // 実もの
  { key: 'himeringo', label: '姫りんご', pattern: /姫りんご|姫リンゴ|姫林檎|ヒメリンゴ|ひめりんご/, place: 'outdoor', enjoy: ['flower', 'fruit'], seasons: ['spring', 'autumn'], level: 'normal' },
  // 「冬りんご」「長寿りんご」など、姫りんごと書かれていないりんごの鉢植え（品種は販売店の表記による）
  { key: 'ringo', label: 'りんご', pattern: /りんご|リンゴ|林檎/, place: 'outdoor', enjoy: ['flower', 'fruit'], seasons: ['spring', 'autumn'], level: 'normal' },
  { key: 'nanten', label: '南天', pattern: /南天|ナンテン|なんてん/, place: 'outdoor', enjoy: ['fruit', 'leaf_color', 'evergreen'], seasons: ['autumn', 'winter'], level: 'easy' },
  { key: 'senryo', label: '千両・万両', pattern: /千両|万両|センリョウ|マンリョウ/, place: 'outdoor', enjoy: ['fruit', 'evergreen'], seasons: ['winter'], level: 'easy' },
  { key: 'mimono', label: '実もの', pattern: /ピラカンサ|梅もどき|梅モドキ|ウメモドキ|柿|ザクロ|石榴|紫式部|ムラサキシキブ|花梨|カリン|かりん|ズミ|ずみ|金柑|キンカン|ブルーベリー|ガマズミ|まゆみ|マユミ|真弓|かまつか|カマツカ|ナツハゼ|夏はぜ|夏櫨|あけび|アケビ|木通|カイドウ|海棠|実もの|実物/, place: 'outdoor', enjoy: ['fruit'], seasons: ['autumn', 'winter'], level: 'normal' },
  { key: 'sansho', label: '山椒', pattern: /山椒|サンショウ/, place: 'outdoor', enjoy: [], seasons: ['spring'], level: 'normal' },
  // 雑木類（「紅葉」は秋の色づきを指す言葉として多くの樹種の商品名に入るため、もみじの判定には使わない）
  { key: 'momiji', label: 'もみじ・楓', pattern: /もみじ|モミジ|もみぢ|楓|カエデ|かえで/, place: 'outdoor', enjoy: ['leaf_color'], seasons: ['spring', 'autumn'], level: 'easy' },
  // 楡欅（ニレケヤキ＝アキニレ）は欅とは別の樹種
  { key: 'nirekeyaki', label: 'ニレケヤキ', pattern: /楡欅|にれけやき|ニレケヤキ|アキニレ|楡/, place: 'outdoor', enjoy: ['leaf_color'], seasons: ['autumn'], level: 'easy' },
  { key: 'keyaki', label: '欅', pattern: /欅|けやき|ケヤキ/, place: 'outdoor', enjoy: ['leaf_color'], seasons: ['spring', 'autumn'], level: 'easy' },
  { key: 'ichou', label: 'イチョウ', pattern: /イチョウ|いちょう|銀杏|公孫樹/, place: 'outdoor', enjoy: ['leaf_color'], seasons: ['autumn'], level: 'easy' },
  { key: 'buna', label: 'ブナ', pattern: /ブナ|ぶな|橅/, place: 'outdoor', enjoy: ['leaf_color'], seasons: ['spring', 'autumn'], level: 'normal' },
  { key: 'olive', label: 'オリーブ', pattern: /オリーブ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'easy' },
]

// 見頃の季節は月単位の見頃（seasons.ts）にそろえる
export const SPECIES_TRAITS: SpeciesTrait[] = RAW_TRAITS.map(t => {
  const peak = SPECIES_PEAKS[t.key]
  return peak ? { ...t, seasons: seasonsOfMonths(peak.months) } : t
})

// 1つの単語（空白で区切られた部分）に3種類以上の樹種名が続けて書かれているものは、検索用のキーワードの羅列とみなす
// 例：「黒松五葉松真柏楓梅皐月欅植木蘭鉢お花お祝いプレゼント」
const STUFFING_MIN_SPECIES = 3
// 名前全体で3種類以上の樹種が出てくる場合は、寄せ植えでなければ先頭のこの文字数の中だけで判定する（見つからなければ不明）
const LEADING_WINDOW = 24
// 両方が書かれているときに優先する樹種（ニレケヤキの商品は「けやき」も、姫りんごの商品は「りんご」も検索用に書くことが多い）
const PREFER_OVER: Record<string, string> = { keyaki: 'nirekeyaki', ringo: 'himeringo' }

// 樹種判定の前に、括弧でくくられた宣伝文句（【マラソン開催中…】など）だけを取り除く
const PROMO_BRACKET = /【[^】]*(?:マラソン|クーポン|OFF|ＯＦＦ|ポイント|送料|楽天|セール|SALE|開催|まで|即日|あす楽|お中元|お歳暮|ギフト)[^】]*】/gi

function speciesHits(text: string): { trait: SpeciesTrait; index: number }[] {
  const hits: { trait: SpeciesTrait; index: number }[] = []
  SPECIES_TRAITS.forEach(trait => {
    const match = trait.pattern.exec(text)
    if (match) hits.push({ trait, index: match.index })
  })
  return hits
}

// 商品名から、樹種の判定に使う部分を取り出す（宣伝文句と、樹種名を羅列したキーワードを除く）
export function speciesText(name: string): string {
  return name
    .replace(PROMO_BRACKET, ' ')
    .split(/[\s　]+/)
    .filter(word => word && countSpeciesInWord(word) < STUFFING_MIN_SPECIES)
    .join(' ')
}

// 書かれている位置が最も前の樹種（同じ位置なら一覧の上にある具体的な樹種）を選ぶ
function earliest(hits: { trait: SpeciesTrait; index: number }[]): SpeciesTrait | null {
  if (!hits.length) return null
  const sorted = [...hits].sort((a, b) => a.index - b.index || SPECIES_TRAITS.indexOf(a.trait) - SPECIES_TRAITS.indexOf(b.trait))
  const chosen = sorted[0].trait
  const preferred = hits.find(h => h.trait.key === PREFER_OVER[chosen.key])
  return preferred ? preferred.trait : chosen
}

function detectTrait(name: string): SpeciesTrait | null {
  const text = speciesText(name)
  const hits = speciesHits(text)
  if (distinctSpecies(hits) >= STUFFING_MIN_SPECIES && !/寄せ植え|寄植え|寄せ植|寄植/.test(text)) {
    return earliest(speciesHits(text.slice(0, LEADING_WINDOW)))
  }
  // 寄せ植え・2種類までの場合は、商品名の最初に書かれている樹種
  return earliest(hits)
}

// 同じ樹種の言い換え・重なり（長寿梅と梅、姫りんごとりんご、楡欅と欅）は1種類として数える
const SAME_FAMILY: Record<string, string> = { chojubai: 'ume', ringo: 'himeringo', keyaki: 'nirekeyaki' }
function distinctSpecies(hits: { trait: SpeciesTrait }[]): number {
  return new Set(hits.map(h => SAME_FAMILY[h.trait.key] ?? h.trait.key)).size
}

// 1語に含まれる樹種の数（キーワードの羅列かどうかの判定用）
export function countSpeciesInWord(word: string): number {
  return distinctSpecies(speciesHits(word))
}

// 商品名に書かれている樹種すべて（羅列のキーワードを除く。樹種を1つに決められない商品の置き場所の判定などに使う）
export function speciesCandidates(name: string): SpeciesTrait[] {
  return speciesHits(speciesText(name || '')).map(h => h.trait)
}

const traitCache = new Map<string, SpeciesTrait | null>()

// 商品名から樹種の性質を探す（見つからなければ null）
export function findSpeciesTrait(name: string): SpeciesTrait | null {
  const cached = traitCache.get(name)
  if (cached !== undefined) return cached
  const trait = detectTrait(name || '')
  if (traitCache.size > 20000) traitCache.clear()
  traitCache.set(name, trait)
  return trait
}

export function getSpeciesTrait(key: string | null | undefined): SpeciesTrait | null {
  return key ? SPECIES_TRAITS.find(t => t.key === key) ?? null : null
}

export const PLACE_OPTIONS: { value: Place; label: string }[] = [
  { value: 'indoor', label: '室内に置きやすい' },
  { value: 'outdoor', label: '屋外（ベランダ・庭）向き' },
]

export const ENJOY_OPTIONS: { value: Enjoy; label: string }[] = [
  { value: 'flower', label: '花を楽しむ' },
  { value: 'leaf_color', label: '紅葉・新緑を楽しむ' },
  { value: 'fruit', label: '実を楽しむ' },
  { value: 'evergreen', label: '一年中緑を楽しむ' },
]

export const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: 'spring', label: '春' },
  { value: 'summer', label: '夏' },
  { value: 'autumn', label: '秋' },
  { value: 'winter', label: '冬' },
]

export const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: 'easy', label: 'はじめてでも育てやすい' },
  { value: 'normal', label: '少し手間がかかる' },
]
