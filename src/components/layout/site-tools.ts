// サイトの「選ぶ・育てる」の道具（トップ・フッター・育て方の一覧で共通）。icon は CareIcon の名前
export interface SiteTool {
  href: string
  label: string
  note: string
  icon: string
  group: 'choose' | 'grow'
  // 案内のカードに使う写真（クレジットは photo-credits.json）。写真のクレジットも一緒に持つ（ブラウザで描くページに、クレジットの一覧全体を読み込ませないため）
  photo?: string
  // 写真のクレジット（photo-credits.json の写真を使うときの表記。ページの下に添える）
  credit?: string
}

export const SITE_TOOLS: SiteTool[] = [
  { href: '/shindan', label: 'かんたん盆栽診断', note: '4つの質問で合いそうな盆栽を探す', icon: 'question', group: 'choose', photo: '/images/articles/photos/article-10-1.jpg', credit: 'APK / CC BY 4.0' },
  { href: '/okurimono', label: '贈り物ナビ', note: '誰に・場面・予算から3鉢に絞る', icon: 'gift', group: 'choose', photo: '/images/selections/photos/bonsai-gift.jpg', credit: 'yoppy / CC BY 2.0' },
  { href: '/kumiawase', label: '組み合わせで選ぶ', note: '樹・鉢・仕上げを選んで自分だけの一鉢', icon: 'bonsai', group: 'choose', photo: '/images/selections/photos/evergreen-bonsai.jpg', credit: 'sarahstierch / CC BY 2.0' },
  { href: '/osusume', label: '盆栽のおすすめ', note: '初心者・室内・予算別に、レビューで選んだ一鉢', icon: 'star', group: 'choose', photo: '/images/selections/photos/celebration-bonsai.jpg', credit: 'Tatiana12 / CC BY 2.0' },
  { href: '/nedan', label: '盆栽の値段・相場', note: '樹種ごとの価格帯と、予算・大きさの目安', icon: 'yen', group: 'choose', photo: '/images/selections/photos/bonsai-under-3000.jpg', credit: 'gergelyhideg / CC BY 2.0' },
  { href: '/soroeru', label: '鉢・土・道具をそろえる', note: '大きさに合う号数と土の配合', icon: 'scissors', group: 'choose', photo: '/images/articles/photos/article-16-1.jpg', credit: 'The Greenery Nursery / CC BY 2.0' },
  { href: '/teire', label: '今月の手入れ', note: '樹種別の水やり・置き場所・作業', icon: 'season', group: 'grow', photo: '/images/articles/photos/article-7-2.jpg', credit: 'ambabheg / CC BY 2.0' },
  { href: '/shojo', label: '症状から調べる', note: '葉が黄色い・しおれるなどの原因と対処', icon: 'search', group: 'grow', photo: '/images/articles/photos/article-10-2.jpg', credit: 'ncole458 / CC BY 2.0' },
  { href: '/hajimete', label: 'はじめての1か月', note: '届いた日からのチェックリスト', icon: 'check', group: 'grow', photo: '/images/selections/photos/beginner-mini-bonsai.jpg', credit: 'Ryan Somma / CC BY 2.0' },
  { href: '/zukan', label: '名前・樹形図鑑', note: '懸崖・文人木・出猩々などの意味', icon: 'book', group: 'grow', photo: '/images/articles/photos/american-bonsai-west-coast-style-2.jpg', credit: 'Drew Avery / CC BY 2.0' },
  { href: '/note', label: 'わたしの盆栽ノート', note: '持っている盆栽の今週やること', icon: 'note', group: 'grow', photo: '/images/articles/photos/bonsai-experience-programs-complete-guide-2.jpg', credit: 'yoppy / CC BY 2.0' },
]
