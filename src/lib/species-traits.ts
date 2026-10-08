// 樹種ごとの一般的な性質（置き場所・楽しみ方・見ごろ・育てやすさ）
// 商品名に書かれていなくても、樹種から「室内に置きやすい」「花を楽しむ」などで探せるようにする。
// あくまで一般的な目安なので、画面では「目安」と明記する。上から順に判定するため、具体的な樹種を先に書く

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

export const SPECIES_TRAITS: SpeciesTrait[] = [
  // 室内に置きやすい樹種（寒さに弱く、明るい室内で管理するもの）
  { key: 'gajumaru', label: 'ガジュマル', pattern: /ガジュマル|がじゅまる/, place: 'indoor', enjoy: ['evergreen'], seasons: [], level: 'easy' },
  { key: 'ficus', label: 'フィカス', pattern: /フィカス|ベンジャミン|パンダガジュマル/, place: 'indoor', enjoy: ['evergreen'], seasons: [], level: 'easy' },
  // 松柏類
  { key: 'goyomatsu', label: '五葉松', pattern: /五葉松|ゴヨウマツ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'normal' },
  { key: 'kuromatsu', label: '黒松', pattern: /黒松|クロマツ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'normal' },
  { key: 'akamatsu', label: '赤松', pattern: /赤松|アカマツ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'normal' },
  { key: 'shimpaku', label: '真柏', pattern: /真柏|シンパク|しんぱく/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'easy' },
  { key: 'toshou', label: '杜松', pattern: /杜松|トショウ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'normal' },
  { key: 'hinoki', label: '檜・ヒバ', pattern: /檜|ヒノキ|ヒバ|石化ヒノキ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'easy' },
  // 花もの
  { key: 'chojubai', label: '長寿梅', pattern: /長寿梅|チョウジュバイ/, place: 'outdoor', enjoy: ['flower'], seasons: ['spring', 'autumn'], level: 'easy' },
  { key: 'ume', label: '梅', pattern: /梅(?!もどき|モドキ)|うめ|ウメ(?!モドキ)/, place: 'outdoor', enjoy: ['flower'], seasons: ['winter', 'spring'], level: 'normal' },
  { key: 'sakura', label: '桜', pattern: /桜|さくら|サクラ/, place: 'outdoor', enjoy: ['flower'], seasons: ['spring'], level: 'normal' },
  { key: 'satsuki', label: 'さつき', pattern: /さつき|サツキ|皐月|ツツジ|つつじ/, place: 'outdoor', enjoy: ['flower'], seasons: ['spring', 'summer'], level: 'normal' },
  { key: 'fuji', label: '藤', pattern: /藤/, place: 'outdoor', enjoy: ['flower'], seasons: ['spring'], level: 'normal' },
  { key: 'tsubaki', label: '椿', pattern: /椿|ツバキ|山茶花|サザンカ/, place: 'outdoor', enjoy: ['flower', 'evergreen'], seasons: ['winter', 'spring'], level: 'easy' },
  { key: 'sarusuberi', label: 'サルスベリ', pattern: /サルスベリ|百日紅/, place: 'outdoor', enjoy: ['flower'], seasons: ['summer'], level: 'normal' },
  { key: 'kuchinashi', label: 'クチナシ', pattern: /クチナシ|くちなし|梔子/, place: 'outdoor', enjoy: ['flower', 'fruit'], seasons: ['summer', 'autumn'], level: 'normal' },
  { key: 'bara', label: 'バラ', pattern: /バラ|ばら|薔薇/, place: 'outdoor', enjoy: ['flower'], seasons: ['spring', 'autumn'], level: 'normal' },
  // 実もの
  { key: 'himeringo', label: '姫りんご', pattern: /姫りんご|姫リンゴ|ヒメリンゴ|りんご|リンゴ/, place: 'outdoor', enjoy: ['flower', 'fruit'], seasons: ['spring', 'autumn'], level: 'normal' },
  { key: 'nanten', label: '南天', pattern: /南天|ナンテン/, place: 'outdoor', enjoy: ['fruit', 'leaf_color', 'evergreen'], seasons: ['autumn', 'winter'], level: 'easy' },
  { key: 'senryo', label: '千両・万両', pattern: /千両|万両|センリョウ|マンリョウ/, place: 'outdoor', enjoy: ['fruit', 'evergreen'], seasons: ['winter'], level: 'easy' },
  { key: 'mimono', label: '実もの', pattern: /ピラカンサ|梅もどき|ウメモドキ|柿|ザクロ|石榴|紫式部|ムラサキシキブ|花梨|カリン|ズミ|ずみ|金柑|キンカン|ブルーベリー|ガマズミ|実もの|実物/, place: 'outdoor', enjoy: ['fruit'], seasons: ['autumn', 'winter'], level: 'normal' },
  { key: 'sansho', label: '山椒', pattern: /山椒|サンショウ/, place: 'outdoor', enjoy: [], seasons: ['spring'], level: 'normal' },
  // 雑木類
  { key: 'momiji', label: 'もみじ・楓', pattern: /もみじ|モミジ|紅葉|楓|カエデ|かえで/, place: 'outdoor', enjoy: ['leaf_color'], seasons: ['spring', 'autumn'], level: 'easy' },
  { key: 'keyaki', label: '欅', pattern: /欅|けやき|ケヤキ/, place: 'outdoor', enjoy: ['leaf_color'], seasons: ['spring', 'autumn'], level: 'easy' },
  { key: 'ichou', label: 'イチョウ', pattern: /イチョウ|銀杏|公孫樹/, place: 'outdoor', enjoy: ['leaf_color'], seasons: ['autumn'], level: 'easy' },
  { key: 'buna', label: 'ブナ', pattern: /ブナ|ぶな|橅/, place: 'outdoor', enjoy: ['leaf_color'], seasons: ['spring', 'autumn'], level: 'normal' },
  { key: 'olive', label: 'オリーブ', pattern: /オリーブ/, place: 'outdoor', enjoy: ['evergreen'], seasons: [], level: 'easy' },
]

const traitCache = new Map<string, SpeciesTrait | null>()

// 商品名から樹種の性質を探す（見つからなければ null）
export function findSpeciesTrait(name: string): SpeciesTrait | null {
  const cached = traitCache.get(name)
  if (cached !== undefined) return cached
  const trait = SPECIES_TRAITS.find(t => t.pattern.test(name)) ?? null
  if (traitCache.size > 20000) traitCache.clear()
  traitCache.set(name, trait)
  return trait
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
