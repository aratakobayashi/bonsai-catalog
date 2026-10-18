// 贈り物の時期（トップと贈り物ナビの「いまの時期の贈り物」に使う）
// show〜end（日本時間の月日）のあいだ表示する。年をまたぐものは show が end より後ろになる。
// サイトは5日ごとに作り直すので、ビルドした日の日付で決まる
export interface GiftSeason {
  key: string
  label: string
  // いつまでに何をするかの目安（1行）
  deadline: string
  show: [number, number]
  end: [number, number]
  guide: string
  guideLabel: string
  selection?: string
  selectionLabel?: string
  // 贈り物ナビの場面（okurimono.ts の SCENE_OPTIONS の value）
  scene?: string
  photo: string
}

export const GIFT_SEASONS: GiftSeason[] = [
  {
    key: 'retire', label: '卒業・退職祝い', deadline: '3月の送別会に向けて、2〜3週間前までに注文',
    show: [2, 15], end: [3, 31], guide: 'retirement-gift-bonsai', guideLabel: '退職祝いの選び方',
    selection: 'celebration-bonsai', selectionLabel: 'お祝いに贈る盆栽', scene: 'retire',
    photo: '/images/articles/photos/retirement-gift-bonsai-1.jpg',
  },
  {
    key: 'mother', label: '母の日', deadline: '5月の第2日曜。花ものは5月に咲く樹を',
    show: [4, 1], end: [5, 14], guide: 'article-26', guideLabel: '母の日の選び方',
    selection: 'flowering-bonsai', selectionLabel: '花を楽しむ盆栽', scene: 'mother',
    photo: '/images/articles/photos/article-26-1.jpg',
  },
  {
    key: 'father', label: '父の日', deadline: '6月の第3日曜。松柏類や始めやすいセットを',
    show: [5, 15], end: [6, 21], guide: 'article-27', guideLabel: '父の日の選び方',
    selection: 'evergreen-bonsai', selectionLabel: '一年中緑の盆栽', scene: 'father',
    photo: '/images/articles/photos/article-27-1.jpg',
  },
  {
    key: 'keiro', label: '敬老の日', deadline: '9月の第3月曜。2〜3週間前までに注文',
    show: [8, 15], end: [9, 23], guide: 'article-32', guideLabel: '敬老の日の選び方',
    selection: 'celebration-bonsai', selectionLabel: 'お祝いに贈る盆栽', scene: 'keiro',
    photo: '/images/articles/photos/article-32-1.jpg',
  },
  {
    key: 'oseibo', label: 'お歳暮', deadline: '12月上旬に注文し、20日ごろまでに届ける',
    show: [10, 15], end: [12, 20], guide: 'oseibo-bonsai-gift', guideLabel: 'お歳暮の選び方',
    selection: 'oseibo-bonsai', selectionLabel: 'お歳暮に贈る盆栽', scene: 'oseibo',
    photo: '/images/selections/photos/oseibo-bonsai.jpg',
  },
  {
    key: 'christmas', label: 'クリスマス', deadline: '配送が混む12月は、上旬までに注文',
    show: [11, 10], end: [12, 24], guide: 'christmas-bonsai-guide', guideLabel: 'クリスマスの贈り方・飾り方',
    selection: 'christmas-bonsai', selectionLabel: 'クリスマスに飾る盆栽',
    photo: '/images/selections/photos/christmas-bonsai.jpg',
  },
  {
    key: 'newyear', label: '正月飾り', deadline: '28日ごろまでに飾りはじめ、松の内まで',
    show: [12, 1], end: [1, 7], guide: 'new-year-bonsai-display', guideLabel: '正月の飾り方',
    selection: 'new-year-bonsai', selectionLabel: '正月に飾る盆栽',
    photo: '/images/selections/photos/new-year-bonsai.jpg',
  },
]

function jstMonthDay(date: Date): [number, number] {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  return [jst.getUTCMonth() + 1, jst.getUTCDate()]
}

const ord = ([m, d]: [number, number]) => m * 100 + d

// いま表示する贈り物の時期（締め切りの近い順に最大 limit 件）
export function activeGiftSeasons(date = new Date(), limit = 2): GiftSeason[] {
  const today = ord(jstMonthDay(date))
  // 締め切りまでの日数の目安（年をまたぐものは翌年の日付として数える）
  const untilEnd = (s: GiftSeason) => {
    const end = ord(s.end)
    return end >= today ? end - today : end + 1200 - today
  }
  return GIFT_SEASONS.filter(s => {
    const show = ord(s.show), end = ord(s.end)
    return show <= end ? today >= show && today <= end : today >= show || today <= end
  })
    .sort((a, b) => untilEnd(a) - untilEnd(b))
    .slice(0, limit)
}
