// キーワード検索の表記ゆれ対応
// 全角・半角、カタカナ・ひらがな、大文字・小文字をそろえたうえで、言い換え（もみじ＝楓 など）でも見つかるようにする
// 読みの途中まで（「ごよう」→ ごようまつ）を入力した場合も、その読みのグループに広げる
import type { ProductType } from '@/lib/product-classify'

export function normalizeText(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}

// 同じものを指す言い方のグループ（どれで検索しても、ほかの言い方の商品も見つかる）
const SYNONYM_GROUPS: string[][] = [
  // 「紅葉」は秋の色づき全般を指すため、もみじの言い換えには入れない（まゆみ・あけびなども「紅葉」と書かれる）
  ['もみじ', 'もみぢ', '楓', 'かえで', '椛'],
  ['さつき', '皐月', 'つつじ', '躑躅'],
  ['しんぱく', '真柏', '糸魚川'],
  ['ごようまつ', '五葉松'],
  ['くろまつ', '黒松'],
  ['あかまつ', '赤松'],
  ['まつ', '松'],
  ['にれけやき', '楡欅'],
  ['けやき', '欅'],
  ['さくら', '桜'],
  ['うめ', '梅'],
  ['ちょうじゅばい', '長寿梅'],
  ['ひめりんご', '姫りんご', '姫林檎', 'りんご', '林檎'],
  ['なんてん', '南天'],
  ['さんしょう', '山椒'],
  ['つばき', '椿'],
  ['ふじ', '藤'],
  ['いちょう', '銀杏', '公孫樹'],
  ['くちなし', '梔子'],
  ['ばら', '薔薇'],
  ['こけだま', '苔玉'],
  ['こけ', '苔'],
  ['みに', 'ミニ', '豆盆栽', '小品'],
  ['はち', '鉢'],
  ['はさみ', '鋏', 'ばさみ', '剪定ばさみ'],
  ['つち', '土', '用土', '赤玉'],
  ['はりがね', '針金', 'ワイヤー'],
  ['ひりょう', '肥料', '置き肥'],
  ['ぎふと', 'プレゼント', '贈り物', '贈答'],
  ['しょうがつ', '正月', '迎春', '新年'],
  ['しつない', '室内', 'インテリア'],
  ['しょしんしゃ', '初心者', '入門', 'はじめて'],
]

const normalizedGroups = SYNONYM_GROUPS.map(group => Array.from(new Set(group.map(normalizeText))))

const KANA_ONLY = /^[ぁ-ゖー]+$/

// 1語を、言い換えを含む候補に広げる
// ・言い換えのグループに完全に一致する語 → そのグループ
// ・ひらがな2文字以上で、グループの読みの先頭部分（「ごよう」「もみ」など） → 入力した語＋当てはまるグループすべて
function expandTerm(term: string): string[] {
  const exact = normalizedGroups.find(g => g.includes(term))
  if (exact) return exact
  if (term.length >= 2 && KANA_ONLY.test(term)) {
    const prefixGroups = normalizedGroups.filter(g => g.some(word => KANA_ONLY.test(word) && word.startsWith(term)))
    if (prefixGroups.length) return Array.from(new Set([term, ...prefixGroups.flat()]))
  }
  return [term]
}

// 入力されたキーワードを、言い換えを含む候補のグループに分ける（すべてのグループに当てはまる商品を表示する）
export function parseKeyword(query: string | undefined): string[][] {
  if (!query) return []
  return normalizeText(query)
    .split(/[\s　]+/)
    .filter(Boolean)
    .map(expandTerm)
}

// キーワードが商品の種類を指しているか（「鉢」→ 鉢、「はさみ」→ 道具 など）。並び順で、その種類を先に出すために使う
const TYPE_INTENTS: { words: string[]; types: ProductType[] }[] = [
  { words: ['はち', '鉢', '盆栽鉢', '植木鉢'], types: ['pot'] },
  { words: ['つち', '土', '用土', '赤玉'], types: ['soil'] },
  { words: ['はさみ', '鋏', 'ばさみ', '剪定ばさみ', '道具'], types: ['tool'] },
  { words: ['はりがね', '針金', 'わいやー'], types: ['wire'] },
  { words: ['ひりょう', '肥料', '置き肥'], types: ['fertilizer'] },
]

export function keywordTypeIntent(groups: string[][]): ProductType[] | null {
  for (const intent of TYPE_INTENTS) {
    const words = intent.words.map(normalizeText)
    // 「鉢」1語だけ、または「盆栽 鉢」のように種類を表す語を含むとき
    if (groups.some(group => group.some(term => words.includes(term)))) return intent.types
  }
  return null
}

export function matchesKeyword(groups: string[][], haystack: string): boolean {
  const text = normalizeText(haystack)
  return groups.every(group => group.some(term => text.includes(term)))
}
