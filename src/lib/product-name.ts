import { countSpeciesInWord } from '@/lib/species-traits'

// 楽天の商品名から宣伝文句や検索用キーワードの羅列を取り除き、一覧で読みやすい名前にする
// 元の商品名は詳細ページの「販売ページの商品名」として別に表示する

// 【マラソン開催中★10%OFFクーポン】【送料無料】◇楽天1位◇ など、括弧でくくられた宣伝・補足
const BRACKETED = /【[^】]*】|［[^］]*］|\[[^\]]*\]|◇[^◇]*◇|★[^★]*★|☆[^☆]*☆|＼[^／]*／|《[^》]*》|≪[^≫]*≫|〈[^〉]*〉/g

// 括弧の外にある宣伝文句
const PROMO_WORDS = [
  /楽天(?:ランキング)?\d+位(?:受賞|獲得|入賞)?/g,
  /(?:全国)?送料無料/g,
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

// ---- 表示用の短い名前・宣伝文句を除いた販売ページの名前 ----

// 括弧の中が宣伝・期間限定の案内（【マラソン開催中★10%OFFクーポン】【送料無料】など）かどうか
const PROMO_INSIDE = /マラソン|クーポン|OFF|ＯＦＦ|ポイント|P\d+倍|Ｐ\d+倍|送料|代引|楽天|セール|SALE|開催|\d+\/\d+|まで|即日|あす楽|お中元|お歳暮|ポッキリ|発送不可|ご褒美|お買い得|人気商品|割引|特典/i
const ANY_BRACKET = /【([^】]*)】|［([^］]*)］|\[([^\]]*)\]|◇([^◇]*)◇|★([^★]*)★|☆([^☆]*)☆|＼([^／]*)／|《([^》]*)》|≪([^≫]*)≫/g

// 販売ページの元の商品名から、期限のある宣伝文句（【マラソン…】【10%OFF…】【送料無料】など）だけを取り除く
// それ以外の括弧（【伊予灘黒松】【現品】など）や説明はそのまま残す
export function stripPromoText(name: string): string {
  if (!name) return name
  let text = name.replace(ANY_BRACKET, (whole, ...groups: (string | undefined)[]) => {
    const inner = groups.slice(0, 9).find(g => g !== undefined) ?? ''
    return PROMO_INSIDE.test(inner) ? ' ' : whole
  })
  PROMO_WORDS.forEach(pattern => { text = text.replace(pattern, ' ') })
  text = text.replace(/[　\s]+/g, ' ').replace(/^[\s*＊・:：/／|｜-]+|[\s*＊・:：/／|｜-]+$/g, '').trim()
  return text.length >= 4 ? text : name
}

// どの商品にも付く一般的な言葉（短い名前からは除く）
const GENERIC_WORDS = new Set([
  '盆栽', 'ぼんさい', 'ボンサイ', 'bonsai', 'ギフト', 'プレゼント', 'ギフトプレゼント', '送料無料', '母の日', '父の日', '敬老の日',
  '誕生日', '贈り物', '贈答', '贈答品', 'お祝い', '祝い', 'フラワーギフト', '盆栽ギフト', '趣味', '癒し', '鑑賞', '観賞', '観賞用', 'おしゃれ', 'かわいい',
])
// 名前の先頭にあるときだけ除く言葉（サイズはカードの別の欄に出るため）
const LEADING_WORDS = new Set(['ミニ盆栽', '小品盆栽', 'ミニ', '盆栽ミニ', '盆栽セット'])

const coreOf = (word: string) => word.replace(/(?:の)?盆栽$/, '')

// 一覧のカード向けの短い名前：先頭の一般的な言葉と、繰り返しのキーワード・樹種名の羅列を取り除く
// 樹齢・品種・鉢などの情報は残し、元の名前にない言葉は足さない。空になる場合は cleanProductName の結果を返す
export function shortProductName(name: string, speciesLabel?: string | null, maxLength = 40): string {
  if (!name) return name
  // 宣伝の括弧は除き、残った括弧は、中身がキーワードの羅列（3語以上）なら除き、そうでなければ外して1語として扱う
  const text = stripPromoText(name).replace(ANY_BRACKET, (_whole, ...groups: (string | undefined)[]) => {
    const inner = (groups.slice(0, 9).find(g => g !== undefined) ?? '').trim()
    return inner.split(/[\s　]+/).filter(Boolean).length >= 3 ? ' ' : ` ${inner} `
  })
  const words = text
    .split(/[\s　]+/)
    .filter(word => word && countSpeciesInWord(word) < 3)
    // 「盆栽：」「ミニ盆栽：」のような先頭の分類名
    .map(word => word.replace(/^(?:盆栽|ミニ盆栽|小品盆栽)[：:]/, ''))
    .filter(Boolean)
  const kept: string[] = []
  words.forEach((word, index) => {
    if (GENERIC_WORDS.has(word)) return
    if (kept.length === 0) {
      if (LEADING_WORDS.has(word)) return
      // 「盆栽 松 黒松」の「松」のように、後ろの語に含まれる1文字の分類名
      if (word.length === 1 && words.slice(index + 1).some(w => w !== word && w.includes(word))) return
      // 樹種名の一部だけの語（樹種「黒松」に対する先頭の「松」など）
      if (speciesLabel && word !== speciesLabel && word.length <= 2 && speciesLabel.includes(word) && words.slice(index + 1).some(w => w.includes(speciesLabel))) return
    }
    // すでに出てきた語の繰り返し（「松盆栽」「ミニ黒松」など、前の語の組み合わせだけでできている語も含む）
    let rest = coreOf(word)
    if (!rest) return
    ;[...kept].sort((a, b) => b.length - a.length).forEach(k => {
      const core = coreOf(k)
      if (core) rest = rest.split(core).join('')
    })
    if (!rest || kept.some(k => k.includes(rest))) return
    kept.push(word)
  })

  let result = kept.join(' ').replace(/^[\s*＊・:：/／|｜-]+/, '')
  if (result.length > maxLength) {
    const cut = result.slice(0, maxLength)
    const lastSpace = cut.lastIndexOf(' ')
    result = (lastSpace > maxLength * 0.5 ? cut.slice(0, lastSpace) : cut).trim() + '…'
  }
  return result.replace(/…$/, '').length >= 2 ? result : cleanProductName(name)
}
