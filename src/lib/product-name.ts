// 楽天の商品名から宣伝文句や検索用キーワードの羅列を取り除き、一覧で読みやすい名前にする
// 元の商品名は詳細ページの「販売ページの商品名」として別に表示する

// 【マラソン開催中★10%OFFクーポン】【送料無料】◇楽天1位◇ など、括弧でくくられた宣伝・補足
const BRACKETED = /【[^】]*】|［[^］]*］|\[[^\]]*\]|◇[^◇]*◇|★[^★]*★|☆[^☆]*☆|＼[^／]*／|《[^》]*》|≪[^≫]*≫|〈[^〉]*〉/g

// 括弧の外にある宣伝文句
const PROMO_WORDS = [
  /楽天(?:ランキング)?\d+位(?:受賞|獲得|入賞)?/g,
  /送料無料/g,
  /即日(?:出荷|発送)可?[!！]?/g,
  /あす楽(?:対応)?/g,
  /W?プレゼント特典/g,
  /割引お買い?特品/g,
  /ポイント\s*\d+\s*倍/g,
  /\d+\s*%\s*OFF/gi,
  /クーポン(?:配布中|利用で)?/g,
  /最安値に挑戦/g,
  /お買い物マラソン|マラソン(?:開催中|期間中)/g,
]

export function cleanProductName(name: string, maxLength = 48): string {
  if (!name) return name
  let text = name.replace(BRACKETED, ' ')
  PROMO_WORDS.forEach(pattern => { text = text.replace(pattern, ' ') })

  text = text
    .replace(/[　\s]+/g, ' ')
    .replace(/^[\s*＊・:：/／|｜-]+|[\s*＊・:：/／|｜-]+$/g, '')
    .trim()

  // 「盆栽 松 … 盆栽 松」のような検索用キーワードの重複を取り除く
  const seen = new Set<string>()
  text = text
    .split(' ')
    .filter(word => {
      if (!word) return false
      if (seen.has(word)) return false
      seen.add(word)
      return true
    })
    .join(' ')

  // 長すぎる場合は単語の切れ目で切る
  if (text.length > maxLength) {
    const cut = text.slice(0, maxLength)
    const lastSpace = cut.lastIndexOf(' ')
    text = (lastSpace > maxLength * 0.5 ? cut.slice(0, lastSpace) : cut).trim() + '…'
  }

  // 取り除きすぎて短くなった場合は元の名前を使う
  return text.replace(/…$/, '').length >= 4 ? text : name.slice(0, maxLength)
}
