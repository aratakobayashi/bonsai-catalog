// サイトの「選ぶ・育てる」の道具（トップ・フッター・育て方の一覧で共通）。icon は CareIcon の名前
export interface SiteTool {
  href: string
  label: string
  note: string
  icon: string
  group: 'choose' | 'grow'
}

export const SITE_TOOLS: SiteTool[] = [
  { href: '/shindan', label: 'かんたん盆栽診断', note: '4つの質問で合いそうな盆栽を探す', icon: 'level', group: 'choose' },
  { href: '/okurimono', label: '贈り物ナビ', note: '誰に・場面・予算から3鉢に絞る', icon: 'fruit', group: 'choose' },
  { href: '/kumiawase', label: '組み合わせで選ぶ', note: '樹・鉢・仕上げを選んで自分だけの一鉢', icon: 'place', group: 'choose' },
  { href: '/soroeru', label: '鉢・土・道具をそろえる', note: '大きさに合う号数と土の配合', icon: 'size', group: 'choose' },
  { href: '/teire', label: '今月の手入れ', note: '樹種別の水やり・置き場所・作業', icon: 'season', group: 'grow' },
  { href: '/shojo', label: '症状から調べる', note: '葉が黄色い・しおれるなどの原因と対処', icon: 'water', group: 'grow' },
  { href: '/hajimete', label: 'はじめての1か月', note: '届いた日からのチェックリスト', icon: 'care', group: 'grow' },
  { href: '/zukan', label: '名前・樹形図鑑', note: '懸崖・文人木・出猩々などの意味', icon: 'winter', group: 'grow' },
  { href: '/note', label: 'わたしの盆栽ノート', note: '持っている盆栽の今週やること', icon: 'outdoor', group: 'grow' },
]
