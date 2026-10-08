// キーワード検索の表記ゆれ対応
// 全角・半角、カタカナ・ひらがな、大文字・小文字をそろえたうえで、言い換え（紅葉＝もみじ＝楓 など）でも見つかるようにする

export function normalizeText(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}

// 同じものを指す言い方のグループ（どれで検索しても、ほかの言い方の商品も見つかる）
const SYNONYM_GROUPS: string[][] = [
  ['もみじ', '紅葉', '楓', 'かえで', '椛'],
  ['さつき', '皐月', 'つつじ', '躑躅'],
  ['しんぱく', '真柏', '糸魚川'],
  ['ごようまつ', '五葉松'],
  ['くろまつ', '黒松'],
  ['あかまつ', '赤松'],
  ['まつ', '松'],
  ['けやき', '欅'],
  ['さくら', '桜'],
  ['うめ', '梅'],
  ['ちょうじゅばい', '長寿梅'],
  ['ひめりんご', '姫りんご', 'りんご', '林檎'],
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
  ['はさみ', '鋏', '剪定ばさみ'],
  ['つち', '土', '用土', '赤玉'],
  ['はりがね', '針金', 'ワイヤー'],
  ['ひりょう', '肥料', '置き肥'],
  ['ぎふと', 'プレゼント', '贈り物', '贈答'],
  ['しょうがつ', '正月', '迎春', '新年'],
  ['しつない', '室内', 'インテリア'],
  ['しょしんしゃ', '初心者', '入門', 'はじめて'],
]

const normalizedGroups = SYNONYM_GROUPS.map(group => Array.from(new Set(group.map(normalizeText))))

// 入力されたキーワードを、言い換えを含む候補のグループに分ける（すべてのグループに当てはまる商品を表示する）
export function parseKeyword(query: string | undefined): string[][] {
  if (!query) return []
  return normalizeText(query)
    .split(/[\s　]+/)
    .filter(Boolean)
    .map(term => {
      const group = normalizedGroups.find(g => g.includes(term))
      return group ?? [term]
    })
}

export function matchesKeyword(groups: string[][], haystack: string): boolean {
  const text = normalizeText(haystack)
  return groups.every(group => group.some(term => text.includes(term)))
}
