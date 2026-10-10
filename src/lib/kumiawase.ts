// 「組み合わせで選ぶ（自分だけの一鉢）」の判定と並べ替え（/kumiawase）
// 樹・大きさ・鉢の雰囲気・仕上げを順に選ぶと、植え付け済みで届く楽天の掲載商品から合うものを出す。
// 鉢の色・形・仕上げは商品名の表記（鉢の焼き物名・色名・形の語、「苔付き」「石付き」など）から判定する。
// 判定の語は掲載中の商品名（2026年10月時点の楽天の盆栽・苔玉 約900件）を見て決めた
import type { CatalogProduct } from '@/lib/catalog-model'
import { byCuratedThenReviews, hasCuratedImage } from '@/components/home/curated'

// ---------- 選択肢 ----------

export interface TreeOption {
  key: string
  label: string
  note: string
  // speciesKey で判定する樹種（苔玉だけは商品の種類で判定する）
  species?: string[]
  kokedama?: true
}

export const TREE_OPTIONS: TreeOption[] = [
  { key: 'momiji', label: 'もみじ', note: '新緑と紅葉', species: ['momiji'] },
  { key: 'goyomatsu', label: '五葉松', note: '短い葉の松', species: ['goyomatsu'] },
  { key: 'kuromatsu', label: '黒松', note: '力強い松', species: ['kuromatsu'] },
  { key: 'akamatsu', label: '赤松', note: 'やさしい樹形の松', species: ['akamatsu'] },
  { key: 'shimpaku', label: '真柏', note: '白い幹と緑の葉', species: ['shimpaku'] },
  { key: 'sakura', label: '桜', note: '春の花', species: ['sakura'] },
  { key: 'chojubai', label: '長寿梅', note: '春と秋に花', species: ['chojubai'] },
  { key: 'ume', label: '梅', note: '冬から春の花', species: ['ume'] },
  { key: 'satsuki', label: 'さつき', note: '初夏の花', species: ['satsuki'] },
  { key: 'nanten', label: '南天', note: '赤い実と紅葉', species: ['nanten'] },
  { key: 'himeringo', label: '姫りんご', note: '花と小さな実', species: ['himeringo', 'ringo'] },
  { key: 'mimono', label: '実もの', note: 'ずみ・まゆみなど', species: ['mimono'] },
  { key: 'zoki', label: 'けやき・ニレケヤキ', note: '細かな枝と紅葉', species: ['keyaki', 'nirekeyaki'] },
  { key: 'sansho', label: '磯山椒', note: '小さな葉の常緑樹', species: ['sansho'] },
  { key: 'gajumaru', label: 'ガジュマル', note: '室内向き', species: ['gajumaru', 'ficus'] },
  { key: 'olive', label: 'オリーブ', note: '銀色がかった葉', species: ['olive'] },
  { key: 'kokedama', label: '苔玉', note: '鉢のかわりに苔の玉', kokedama: true },
]

export type SizeKey = 'mini' | 'small' | 'medium'
export const SIZE_OPTIONS: { value: SizeKey; label: string; note: string }[] = [
  { value: 'mini', label: 'ミニ', note: '手のひらにのる大きさ' },
  { value: 'small', label: '小品', note: '棚や机に置きやすい大きさ' },
  { value: 'medium', label: '中品', note: '玄関や床の間に映える大きさ' },
]

export type ColorKey = 'white' | 'black' | 'bluegreen' | 'earth' | 'red'
export const COLOR_OPTIONS: { value: ColorKey; label: string; note: string; swatch: string }[] = [
  { value: 'white', label: '白', note: '白釉・白い陶器', swatch: '#f4f1ea' },
  { value: 'black', label: '黒', note: '黒釉・いぶし', swatch: '#2b2a28' },
  { value: 'bluegreen', label: '青・緑', note: '青釉・緑釉', swatch: '#4f7a78' },
  { value: 'earth', label: '茶・土もの', note: '信楽・焼締・岩の鉢', swatch: '#8a6a4c' },
  { value: 'red', label: '赤系', note: '朱・紅・ピンク', swatch: '#a8493d' },
]

export type ShapeKey = 'round' | 'square' | 'shallow'
export const SHAPE_OPTIONS: { value: ShapeKey; label: string; note: string }[] = [
  { value: 'round', label: '丸', note: '丸鉢・花型・つぼ' },
  { value: 'square', label: '四角', note: '角鉢・長方・六角' },
  { value: 'shallow', label: '浅め', note: '平鉢・水盤' },
]

const SHAPE_LABELS: Record<ShapeKey, string> = { round: '丸い鉢', square: '四角い鉢', shallow: '浅めの鉢' }

export type FinishKey = 'moss' | 'stone' | 'sand' | 'saucer' | 'name' | 'wrap'
export const FINISH_OPTIONS: { value: FinishKey; label: string; note: string }[] = [
  { value: 'moss', label: '苔付き', note: '土の表面に苔' },
  { value: 'stone', label: '石付き', note: '石や岩と組み合わせた' },
  { value: 'sand', label: '砂付き', note: '化粧砂・玉砂利' },
  { value: 'saucer', label: '受け皿付き', note: '室内に置きやすい' },
  { value: 'name', label: '名入れ・メッセージ', note: '札やカードに名前' },
  { value: 'wrap', label: 'ギフト包装', note: 'ラッピング・のし' },
]

// ---------- 商品名からの判定 ----------

// 植え付けが必要な苗・ポット苗・盆栽素材（鉢に植わった状態で届かないもの）
const SEEDLING = /^苗[：:]|ポット苗|ポット入|cmポット|盆栽素材|素材|苗木|山野草の苗/
const IN_POT = /鉢植|鉢入|鉢付|焼.{0,6}鉢|陶器/

// 鉢の色・形を探すため、商品名から鉢の部分（「萬古焼丸鉢」「黒角器」など）だけを取り出す。
// 樹種名に含まれる色（黒松・赤松・紅葉・白花など）は鉢の色と混ざらないよう先に除く
const NOT_POT_WORDS = /黒松|赤松|クロマツ|アカマツ|紅葉|紅白|紅梅|白梅|白花|赤花|紅花|赤い実|青リンゴ|赤いりんご|赤芽|白覆輪|錦糸|緑の|新緑/g
const POT_TOKEN = /[^\s　（）()＜＞<>【】「」[\]・*＊:：、,，／/＿_！!]{0,12}(?:鉢(?!植)|器(?!セット)|器)/g
const WARE = /(?:[白黒青緑茶]色?)?(?:信楽|萬古|万古|瀬戸|備前|常滑|益子|小石原|美濃|九谷|有田|伊賀|くらま)焼?|焼き?締め?|焼〆|炭化|溶岩|抗火石|テラコッタ|漆黒|浅丸|浅角|マット(?:ブラック|ホワイト)/g
// 「（受皿付き 白 角 陶器 鉢植え）」のように、鉢の説明をかっこの中にまとめて書く商品がある
const POT_BRACKET = /[（(＜<【[]([^）)＞>】\]]*(?:陶器|鉢(?!が選|を選|色)|焼)[^）)＞>】\]]*)[）)＞>】\]]/g

export function potText(name: string): string {
  const text = (name || '').replace(NOT_POT_WORDS, '')
  const brackets = [...text.matchAll(POT_BRACKET)].map(m => m[1].replace(/鉢植え?/g, ''))
  const parts = [...(text.match(POT_TOKEN) || []), ...(text.match(WARE) || []), ...brackets]
  return parts.filter(p => !/^(1|一|二|\d)?鉢$|盆栽鉢|植木|花鉢$|一鉢$/.test(p)).join(' ')
}

const COLOR_RULES: Record<ColorKey, RegExp> = {
  white: /白|雪|ホワイト|乳白/,
  black: /黒|ブラック|イブシ|いぶし|炭化|炭鉢|烏泥/,
  bluegreen: /青|緑|ブルー|グリーン|瑠璃|紺|藍|織部|均釉|海鼠|なまこ|生子/,
  earth: /茶|焼き?締|備前|南蛮|泥物|くらま|岩|溶岩|抗火石|軽石|テラコッタ|灰|ハケメ/,
  red: /赤|朱|紅|ピンク|紫泥/,
}
// 色の書かれていない信楽焼・常滑焼などは、土の風合いの鉢として扱う
const EARTH_WARE = /信楽|常滑|益子|小石原|伊賀/

export function potColors(name: string): ColorKey[] {
  const pot = potText(name)
  const colors = (Object.keys(COLOR_RULES) as ColorKey[]).filter(k => COLOR_RULES[k].test(pot))
  if (EARTH_WARE.test(pot) && !colors.some(c => c !== 'earth') && !/金彩|金吹/.test(pot) && !colors.includes('earth')) colors.push('earth')
  return colors
}

const SHAPE_RULES: Record<ShapeKey, RegExp> = {
  round: /丸|円|ボウル|ぼうる|木瓜|輪花|花型|菊型|つぼ|壺|だるま/,
  square: /角|長方|正方/,
  // 「受け皿」「下皿」は鉢の形ではないため除く
  shallow: /浅|平鉢|水盤|(?<!受け|受|下)皿/,
}
export function potShapes(name: string): ShapeKey[] {
  const pot = potText(name)
  return (Object.keys(SHAPE_RULES) as ShapeKey[]).filter(k => SHAPE_RULES[k].test(pot))
}

// 鉢（鉢の色）を注文時に選べる商品。「鉢色おまかせ」は選べないので含めない
const POT_SELECTABLE = /鉢が選べる|鉢を選べる|鉢選べる|選べる(?:\d種)?鉢|鉢色選べる|選べる(?:\d種)?鉢色|鉢色を?選べ|選べる器/
export function potSelectable(name: string): boolean {
  return POT_SELECTABLE.test(name || '')
}

// 「苔 こけ コケ」のような検索用の言葉の並びは苔付きとみなさない
const FINISH_RULES: Record<FinishKey, RegExp> = {
  moss: /苔(?:付|つき|・|と|＆|&|張|貼|庭)|＜苔|【苔|編み込み苔|苔盆栽|苔リウム/,
  stone: /石付|石つき|石附|敷石|石 苔|＆石/,
  sand: /砂付|化粧砂|富士砂|玉砂利|寒水|と砂/,
  saucer: /受け皿|受皿|水受け/,
  name: /名入れ|名入|名前入|お名前|メッセージ|立札|木札|カード/,
  wrap: /ラッピング|ギフト包装|のし(?!おり)|熨斗|リボン|化粧箱|ギフトBOX|ギフトボックス/,
}

export interface KumiTraits {
  colors: ColorKey[]
  shapes: ShapeKey[]
  selectable: boolean
  finishes: FinishKey[]
}

export function kumiTraits(product: Pick<CatalogProduct, 'originalName' | 'productType'>): KumiTraits {
  const name = product.originalName || ''
  const finishes = (Object.keys(FINISH_RULES) as FinishKey[]).filter(k => FINISH_RULES[k].test(name))
  // 苔玉は苔で包まれているため、苔付きとして扱う
  if (product.productType === 'kokedama' && !finishes.includes('moss')) finishes.unshift('moss')
  return { colors: potColors(name), shapes: potShapes(name), selectable: potSelectable(name), finishes }
}

// 植え付け済みで届く盆栽・苔玉（楽天の掲載商品で、写真があるもの）
export function isReadyPlanted(product: CatalogProduct): boolean {
  if (product.source !== 'rakuten' || !product.imageUrl) return false
  if (product.productType !== 'tree' && product.productType !== 'kokedama') return false
  const name = product.originalName || ''
  if (SEEDLING.test(name) && !IN_POT.test(name)) return false
  return true
}

export function treeMatches(option: TreeOption, product: CatalogProduct): boolean {
  if (option.kokedama) return product.productType === 'kokedama'
  return Boolean(product.speciesKey && option.species?.includes(product.speciesKey))
}

function sizeMatches(size: SizeKey, product: CatalogProduct): boolean {
  if (size === 'medium') return product.sizeCategory === 'medium' || product.sizeCategory === 'large'
  return product.sizeCategory === size
}

// ---------- URL（searchParams） ----------

export type Step = 1 | 2 | 3 | 4 | 'result'

export interface KumiState {
  tree: string | null
  size: SizeKey | null
  color: ColorKey | null
  shape: ShapeKey | null
  finishes: FinishKey[]
  step: Step
}

type Params = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''
function pick<T extends string>(value: string, options: { value: T }[]): T | null {
  return options.find(o => o.value === value)?.value ?? null
}

export function parseKumi(params: Params): KumiState {
  const tree = TREE_OPTIONS.find(t => t.key === first(params.ki))?.key ?? null
  const finishes = first(params.fin)
    .split(/[,\s]+/)
    .map(v => pick(v, FINISH_OPTIONS))
    .filter((v, i, a): v is FinishKey => v !== null && a.indexOf(v) === i)
  const rawStep = first(params.step)
  let step: Step = rawStep === 'result' ? 'result' : (Number(rawStep) as Step)
  if (![1, 2, 3, 4, 'result'].includes(step)) step = tree ? 2 : 1
  // 樹を選ぶまでは先に進めない
  if (!tree) step = 1
  return { tree, size: pick(first(params.size), SIZE_OPTIONS), color: pick(first(params.color), COLOR_OPTIONS), shape: pick(first(params.shape), SHAPE_OPTIONS), finishes, step }
}

export function kumiHref(state: KumiState, patch: Partial<KumiState> = {}, hash = '#steps'): string {
  const next = { ...state, ...patch }
  const q = new URLSearchParams()
  if (next.tree) q.set('ki', next.tree)
  if (next.size) q.set('size', next.size)
  if (next.color) q.set('color', next.color)
  if (next.shape) q.set('shape', next.shape)
  if (next.finishes.length) q.set('fin', FINISH_OPTIONS.map(o => o.value).filter(v => next.finishes.includes(v)).join(','))
  if (next.tree && next.step !== 1) q.set('step', String(next.step))
  if (!next.tree && next.step === 1) return `/kumiawase${hash}`
  const qs = q.toString()
  return `/kumiawase${qs ? `?${qs}` : ''}${hash}`
}

export function toggleFinish(state: KumiState, value: FinishKey): FinishKey[] {
  return state.finishes.includes(value) ? state.finishes.filter(f => f !== value) : [...state.finishes, value]
}

// ---------- 合う商品を探す ----------

export type CriterionKey = 'size' | 'color' | 'shape' | `fin:${FinishKey}`

export interface Criterion {
  key: CriterionKey
  label: string
  // 商品がこの条件を満たすか（'selectable' は鉢を注文時に選べるため合わせられる見込みがあるもの）
  test: (p: CatalogProduct, t: KumiTraits) => boolean | 'selectable'
}

export function criteriaOf(state: KumiState): Criterion[] {
  const list: Criterion[] = []
  if (state.size) {
    const size = state.size
    list.push({ key: 'size', label: SIZE_OPTIONS.find(o => o.value === size)!.label, test: p => sizeMatches(size, p) })
  }
  if (state.color) {
    const color = state.color
    list.push({ key: 'color', label: `${COLOR_OPTIONS.find(o => o.value === color)!.label}の鉢`, test: (_p, t) => t.colors.includes(color) || (t.selectable ? 'selectable' : false) })
  }
  if (state.shape) {
    const shape = state.shape
    list.push({ key: 'shape', label: SHAPE_LABELS[shape], test: (_p, t) => t.shapes.includes(shape) || (t.selectable ? 'selectable' : false) })
  }
  for (const f of FINISH_OPTIONS.filter(o => state.finishes.includes(o.value))) {
    list.push({ key: `fin:${f.value}`, label: f.label, test: (_p, t) => t.finishes.includes(f.value) })
  }
  return list
}

export interface KumiMatch {
  product: CatalogProduct
  traits: KumiTraits
  matched: string[]
  // 鉢が選べるため合わせられる見込みの条件
  viaSelectable: string[]
  score: number
}

export interface KumiResult {
  tree: TreeOption | null
  pool: number
  matches: KumiMatch[]
  // 合う商品が少ないためゆるめた条件（ゆるめた順）
  relaxed: string[]
  // すべての条件を満たす商品の数
  exactCount: number
}

export const MIN_RESULTS = 4
export const MAX_RESULTS = 24

// ゆるめる順：仕上げ（あとから選んだものから）→ 鉢の形 → 鉢の色 → 大きさ。樹はゆるめない
function relaxOrder(criteria: Criterion[]): Criterion[] {
  const fins = criteria.filter(c => c.key.startsWith('fin:')).reverse()
  const by = (k: CriterionKey) => criteria.filter(c => c.key === k)
  return [...fins, ...by('shape'), ...by('color'), ...by('size')]
}

export function readyPool(products: CatalogProduct[]): { product: CatalogProduct; traits: KumiTraits }[] {
  return products.filter(isReadyPlanted).map(product => ({ product, traits: kumiTraits(product) }))
}

export function findKumi(state: KumiState, products: CatalogProduct[]): KumiResult {
  const tree = TREE_OPTIONS.find(t => t.key === state.tree) ?? null
  if (!tree) return { tree: null, pool: 0, matches: [], relaxed: [], exactCount: 0 }
  const pool = readyPool(products).filter(({ product }) => treeMatches(tree, product))
  const criteria = criteriaOf(state)

  const scored: KumiMatch[] = pool.map(({ product, traits }) => {
    const matched: string[] = []
    const viaSelectable: string[] = []
    let score = 0
    for (const c of criteria) {
      const r = c.test(product, traits)
      if (r === true) { matched.push(c.label); score += 1 }
      else if (r === 'selectable') { viaSelectable.push(c.label); score += 0.5 }
    }
    return { product, traits, matched, viaSelectable, score }
  })
  const satisfies = (m: KumiMatch, active: Criterion[]) => active.every(c => m.matched.includes(c.label) || m.viaSelectable.includes(c.label))

  let active = [...criteria]
  const relaxed: string[] = []
  const exactCount = scored.filter(m => satisfies(m, active)).length
  let candidates = scored.filter(m => satisfies(m, active))
  // 足りないときは、ゆるめたときに一番多く見つかる条件を1つずつゆるめる（同じ数なら relaxOrder の順）
  while (candidates.length < MIN_RESULTS && active.length > 0) {
    let best: { c: Criterion; list: KumiMatch[] } | null = null
    for (const c of relaxOrder(active)) {
      const rest = active.filter(a => a !== c)
      const list = scored.filter(m => satisfies(m, rest))
      if (!best || list.length > best.list.length) best = { c, list }
    }
    if (!best) break
    active = active.filter(a => a !== best!.c)
    relaxed.push(best.c.label)
    candidates = best.list
  }

  // 多くの条件に合う順。同じなら写真のきれいな商品を先に、その中ではレビューの多い順
  candidates.sort((a, b) => b.score - a.score || byCuratedThenReviews(a.product, b.product))
  return { tree, pool: pool.length, matches: candidates.slice(0, MAX_RESULTS), relaxed, exactCount }
}

// 樹の選択肢ごとの商品数と見本の写真（写真のきれいな商品から）
export interface TreeChoice {
  option: TreeOption
  count: number
  sample: CatalogProduct | null
}

export function treeChoices(products: CatalogProduct[], minCount = 3): TreeChoice[] {
  const pool = readyPool(products)
  return TREE_OPTIONS.map(option => {
    const items = pool.filter(({ product }) => treeMatches(option, product)).map(x => x.product)
    const sample = [...items].sort(byCuratedThenReviews).find(hasCuratedImage) ?? null
    return { option, count: items.length, sample }
  }).filter(c => c.count >= minCount)
}

// 選んだ樹の中で、各選択肢に合う商品の数（0件の選択肢は控えめに表示する）
export function optionCounts(state: KumiState, products: CatalogProduct[]) {
  const tree = TREE_OPTIONS.find(t => t.key === state.tree)
  const pool = tree ? readyPool(products).filter(({ product }) => treeMatches(tree, product)) : readyPool(products)
  const size = Object.fromEntries(SIZE_OPTIONS.map(o => [o.value, pool.filter(x => sizeMatches(o.value, x.product)).length])) as Record<SizeKey, number>
  const color = Object.fromEntries(COLOR_OPTIONS.map(o => [o.value, pool.filter(x => x.traits.colors.includes(o.value)).length])) as Record<ColorKey, number>
  const shape = Object.fromEntries(SHAPE_OPTIONS.map(o => [o.value, pool.filter(x => x.traits.shapes.includes(o.value)).length])) as Record<ShapeKey, number>
  const finish = Object.fromEntries(FINISH_OPTIONS.map(o => [o.value, pool.filter(x => x.traits.finishes.includes(o.value)).length])) as Record<FinishKey, number>
  const selectable = pool.filter(x => x.traits.selectable).length
  return { size, color, shape, finish, selectable, total: pool.length }
}

// 掲載商品全体で1件もない選択肢（赤系の鉢・名入れなど、今は該当がないもの）は出さない
export function availableOptions(products: CatalogProduct[]) {
  const all = optionCounts({ tree: null, size: null, color: null, shape: null, finishes: [], step: 1 }, products)
  return {
    colors: COLOR_OPTIONS.filter(o => all.color[o.value] > 0),
    shapes: SHAPE_OPTIONS.filter(o => all.shape[o.value] > 0),
    finishes: FINISH_OPTIONS.filter(o => all.finish[o.value] > 0),
  }
}
