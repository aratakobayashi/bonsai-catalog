// 「贈り物ナビ」：誰に・場面・予算の3つから、掲載中の盆栽を3つ選び、のし・届ける時期・避けたいことをまとめて出す
// マナーの内容は記事（article-26 母の日、27 父の日、32 敬老の日、29 新築、38 引越し、34 結婚、36 昇進・退職、37 誕生日、28 お見舞い）
// と特集（bonsai-gift・celebration-bonsai・new-year-bonsai）に合わせている。記事を書き直したときはここも見直す
import type { CatalogProduct } from '@/lib/catalog-model'
import { buildCatalogUrl, filterProducts, parseFilters, type CatalogFilters } from '@/lib/catalog'
import { hasCuratedImage } from '@/components/home/curated'
import { isSeedlingOrMaterial } from '@/lib/selections'
import { jstMonth, peakLabel, peakMonths } from '@/lib/seasons'

export type Who = 'family' | 'business' | 'friend' | 'self'
export type Scene = 'mother' | 'father' | 'keiro' | 'choju' | 'birthday' | 'house' | 'shop' | 'promotion' | 'retire' | 'oseibo'
export type Budget = '3000' | '5000' | '10000' | 'over'

export interface Option<T extends string> {
  value: T
  label: string
  note: string
}

export const WHO_OPTIONS: Option<Who>[] = [
  { value: 'family', label: '両親・祖父母', note: '家族へ' },
  { value: 'business', label: '上司・取引先', note: '改まった贈り物' },
  { value: 'friend', label: '友人・同僚', note: '気軽な贈り物' },
  { value: 'self', label: '自分へのごほうび', note: 'のしは不要' },
]

export const SCENE_OPTIONS: Option<Scene>[] = [
  { value: 'mother', label: '母の日', note: '5月の第2日曜' },
  { value: 'father', label: '父の日', note: '6月の第3日曜' },
  { value: 'keiro', label: '敬老の日', note: '9月の第3月曜' },
  { value: 'choju', label: '長寿祝い', note: '還暦・古希・喜寿など' },
  { value: 'birthday', label: '誕生日', note: '見どころの月で選ぶ' },
  { value: 'house', label: '新築・引越し祝い', note: '入居が落ち着いたころ' },
  { value: 'shop', label: '開店・開業祝い', note: '店先・店内に' },
  { value: 'promotion', label: '昇進・栄転祝い', note: '正式な発表のあと' },
  { value: 'retire', label: '退職祝い', note: '個人として自宅へ' },
  { value: 'oseibo', label: 'お歳暮・お礼', note: '年末のあいさつに' },
]

export const BUDGET_OPTIONS: (Option<Budget> & { min?: number; max?: number; floor?: number })[] = [
  { value: '3000', label: '〜3,000円', note: '気軽に', max: 3000 },
  { value: '5000', label: '〜5,000円', note: 'ミニ・小品が中心', max: 5000, floor: 3000 },
  { value: '10000', label: '〜10,000円', note: '小品・鉢にもこだわる', max: 10000, floor: 5000 },
  { value: 'over', label: '10,000円以上', note: '改まったお祝いに', min: 10000 },
]

export interface OkurimonoState {
  who: Who
  scene: Scene
  budget: Budget
}

// 何も選んでいないときの場面は、今の時期に近い行事にする
function defaultScene(month: number): Scene {
  if (month === 4 || month === 5) return 'mother'
  if (month === 6) return 'father'
  if (month === 8 || month === 9) return 'keiro'
  if (month === 11 || month === 12) return 'oseibo'
  return 'birthday'
}

export function parseOkurimono(params: Record<string, string | string[] | undefined>, now = new Date()): OkurimonoState & { chosen: boolean } {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  const pick = <T extends string>(value: unknown, options: Option<T>[], fallback: T): T =>
    options.some(o => o.value === value) ? (value as T) : fallback
  return {
    who: pick(first(params.who), WHO_OPTIONS, 'family'),
    scene: pick(first(params.scene), SCENE_OPTIONS, defaultScene(jstMonth(now))),
    budget: pick(first(params.budget), BUDGET_OPTIONS, '5000'),
    chosen: Boolean(first(params.who) || first(params.scene) || first(params.budget)),
  }
}

export function okurimonoHref(state: OkurimonoState, change: Partial<OkurimonoState> = {}): string {
  const next = { ...state, ...change }
  return `/okurimono?who=${next.who}&scene=${next.scene}&budget=${next.budget}#result`
}

// ---- 場面ごとのマナー（記事と同じ内容） ----

export interface SceneGuide {
  // のし・表書き
  noshi: string
  // 届ける時期の目安
  timing: string
  // 避けたいこと
  avoid: string[]
  // 関連する記事（実在する slug だけ）
  articles: string[]
  // 関連する特集
  selections: string[]
}

export const SCENE_GUIDES: Record<Scene, SceneGuide> = {
  mother: {
    noshi: 'のしは付けず、リボンやカードで贈ることが多い場面です。付けるなら紅白の蝶結びに「母の日」や「感謝」とします。',
    timing: '母の日（5月の第2日曜）の前日か当日の午前など、相手が家にいて受け取りやすい日時を指定します。',
    avoid: [
      '大きすぎる樹は重くて移動しにくく、手のひらに乗るほど小さな鉢は夏に1日2回以上の水やりが要ることがあります',
      '「お部屋に飾ってね」と添えると、屋外向きの樹を室内に置き続けてしまうことがあります。屋外で育てる樹であることを伝えます',
    ],
    articles: ['article-26'],
    selections: ['bonsai-gift', 'flowering-bonsai'],
  },
  father: {
    noshi: 'のしは付けず、リボンやカードで贈ることが多い場面です。付けるなら紅白の蝶結びに「父の日」や「感謝」とします。',
    timing: '父の日（6月の第3日曜）に合わせ、相手が家にいる日を確かめて配達日を指定します。梅雨どきは箱の中が蒸れやすいので、届いたらすぐ箱から出してもらいます。',
    avoid: [
      '松柏類はどれも屋外の日なたで育てる樹です。日の当たる置き場所を用意できるかを先に確かめます',
      '室内に飾るのは2〜3日までにして、屋外に戻すよう伝えます',
    ],
    articles: ['article-27'],
    selections: ['bonsai-gift', 'evergreen-bonsai'],
  },
  keiro: {
    noshi: '紅白の蝶結びの水引に「敬老の日」や「祝敬老」。年齢を意識させる言葉が気になりそうなら「御礼」や「感謝」にします。孫の名前を連名で書くこともあります。',
    timing: '敬老の日（9月の第3月曜）の2〜3週間前に注文し、受け取れる日時を確かめて配達日を指定します。9月はまだ暑いので、届いたら明るい日陰で水をたっぷり与えてもらいます。',
    avoid: [
      '重すぎる鉢や、細かな手入れが多い樹は負担になります。水やりが中心で世話ができる樹を選びます',
      '高齢者向けの施設や病院では、鉢植えの持ち込みを断っていることがあります。施設で暮らしている方には、先に施設に確かめます',
    ],
    articles: ['article-32'],
    selections: ['celebration-bonsai', 'bonsai-gift'],
  },
  choju: {
    noshi: '紅白の蝶結びの水引に「祝還暦」「祝古希」「祝喜寿」「祝米寿」など、節目の名前を入れた表書きにします。',
    timing: '誕生日の前後や、家族が集まってお祝いする日に届くようにします。配送なら、受け取れる日時を本人か家族に確かめておきます。',
    avoid: [
      '年齢を意識させる言い方を嫌う方もいます。カードには日ごろの感謝を中心に書きます',
      '施設で暮らしている方には、鉢植えを置けるかを先に施設に確かめます',
    ],
    articles: ['article-32', 'article-37'],
    selections: ['celebration-bonsai', 'bonsai-gift'],
  },
  birthday: {
    noshi: '誕生日のプレゼントなので、のしは付けず、リボンやカードで贈るのが一般的です。還暦など節目のお祝いを兼ねるなら、紅白の蝶結びに「祝還暦」などとします。',
    timing: '誕生日の数日前に届くよう配達日を指定します。夏は涼しい時間に受け取れるように、冬は届いた日は玄関の中など冷え込まない場所に置いてもらいます。',
    avoid: [
      '室内にしか置き場所がない人に、屋外向きの樹を贈るのは避けます。明るい窓辺で育てやすいガジュマルなどを選びます',
      '花の時期は年によって前後します。カードに「毎年この時期に咲きます」と書いておくと、届いた日に咲いていなくても意味が伝わります',
    ],
    articles: ['article-37'],
    selections: ['bonsai-gift'],
  },
  house: {
    noshi: '何度あってもよいお祝いなので、紅白の蝶結び。新築は「御新築御祝」「祝御新築」、引越しは「御新居祝」「御祝」とします。',
    timing: '新築は入居から半月〜2か月以内、引越しは1〜2か月以内の、荷解きが落ち着いたころが目安です。引き渡しの前や引越しの当日は避けます。',
    avoid: [
      '火事を連想させるものを避ける習慣があります。赤い色を気にする人もいるので、真っ赤な鉢や包装は避けておきます',
      '遠くへ引っ越す人に、引越しの前に盆栽を渡すのは避けます。新居に着いてから届くように手配します',
      'マンションのベランダでは、手すりの上や避難ハッチの前に置かないよう一言添えます',
    ],
    articles: ['article-29', 'article-38'],
    selections: ['celebration-bonsai', 'bonsai-gift'],
  },
  shop: {
    noshi: '紅白の蝶結びの水引に「祝御開店」「御開店御祝」、事務所や医院などなら「祝御開業」とします。',
    timing: '開店日の前日か当日の早い時間に届くようにします。当日は慌ただしいので、受け取れる時間を先方に確かめておきます。',
    avoid: [
      '火事を連想させるとして、赤い色を気にする方がいます。真っ赤な鉢や包装は避けておくと安心です',
      '店内に置くなら、松やもみじなど屋外向きの樹は弱りやすくなります。室内で育てやすい樹か、店先に置ける樹かを先に考えます',
      '店先や受付に置いても邪魔にならない大きさにします',
    ],
    articles: [],
    selections: ['celebration-bonsai', 'bonsai-gift'],
  },
  promotion: {
    noshi: '紅白の蝶結びの水引に、昇進なら「御昇進御祝」「祝御昇進」、栄転なら「御栄転御祝」「祝御栄転」。部署の有志で贈るなら、表書きの下に「〇〇部一同」と書きます。',
    timing: '正式な発表があってから、1〜2週間以内を目安に届けます。4月の異動の時期は贈り物が重なるので、着任日の直前や当日は避けます。',
    avoid: [
      '社内で内々に聞いた段階で贈るのは避けます',
      '職場に贈る前に、植物を置いてよいか、連休の水やりをどうするかを確かめます。分からないときは自宅宛にします',
      '松や真柏、もみじなどはオフィスに置き続けると弱ります。職場に置くならガジュマルなど室内向きの樹を選びます',
    ],
    articles: ['article-36'],
    selections: ['indoor-bonsai', 'celebration-bonsai'],
  },
  retire: {
    noshi: '職場を離れる人へのはなむけなら「御餞別」、お世話になったお礼なら「御礼」。定年退職のお祝いなら「御退職御祝」も使います。',
    timing: '最終出社日の前後に、職場の人づきあいとは別に、個人として自宅に届けるほうが受け取りやすくなります。',
    avoid: [
      '最終日に職場で手渡すと、持ち帰りの荷物になります。配送で自宅に届けるのが無難です',
      '「栄転」のように受け止め方が分からない言葉は使わず、「御餞別」「御礼」とします',
    ],
    articles: ['article-36'],
    selections: ['bonsai-gift', 'evergreen-bonsai'],
  },
  oseibo: {
    noshi: '紅白の蝶結びの水引に「御歳暮」。お礼として贈るなら「御礼」とします。',
    timing: '12月のはじめから20日ごろまでに届けるのが一般的です。年内に間に合わないときは、年が明けてから「御年賀」や「寒中御見舞」として贈ります。',
    avoid: [
      '年末は配送が混み合い、留守も増えます。受け取れる日時を確かめてから注文します',
      '冬に届く鉢は、寒さで土が凍らないよう、届いた日は玄関の中など冷え込まない場所に置いてもらいます',
    ],
    articles: [],
    selections: ['new-year-bonsai', 'bonsai-gift'],
  },
}

// 場面の選択肢にはない贈り方（記事へ案内する）
export const OTHER_SCENES = [
  {
    label: '結婚祝い',
    text: '結び切りの水引に「寿」か「御結婚御祝」。式の1か月前〜1週間前に、二人の新居へ届くようにします。',
    href: '/guides/article-34',
  },
  {
    label: 'お見舞い・退院祝い',
    text: '鉢植えは「根付く」が「寝付く」に通じるとされ、入院中のお見舞いには避けるのが一般的です。退院祝いなら、退院から1〜2週間後に紅白の結び切りで「祝御退院」とします。',
    href: '/guides/article-28',
  },
]

// ---- 選び方 ----

const CONIFERS = ['goyomatsu', 'kuromatsu', 'akamatsu', 'shimpaku', 'toshou', 'hinoki']
const PINES = ['goyomatsu', 'kuromatsu', 'akamatsu']
const INDOOR = ['gajumaru', 'ficus']
const EASY_STARTERS = ['chojubai', 'shimpaku', 'momiji']

interface SpeciesFit {
  weight: number
  reason: string
}

// 場面ごとに向く樹種と、その理由（記事・特集の書き方に合わせる）
function speciesFit(scene: Scene, who: Who, p: CatalogProduct, month: number): SpeciesFit | null {
  const key = p.speciesKey
  if (!key) return null
  const label = p.speciesLabel ?? ''
  const indoor = INDOOR.includes(key)
  switch (scene) {
    case 'mother':
      if (key === 'satsuki') return { weight: 5, reason: 'さつきは母の日のころつぼみが多く、届いてから花が開いていく様子を楽しめます' }
      if (key === 'chojubai') return { weight: 5, reason: '長寿梅は丈夫で、植物を育てた経験が少ない方にも向く花ものです' }
      if (key === 'fuji') return { weight: 3, reason: '藤は4月中旬〜5月上旬に咲く花もの。年によっては花の終わりごろに届きます' }
      if (key === 'himeringo') return { weight: 3, reason: '姫りんごは春の花のあとに小さな実がつき、秋に実を楽しめます' }
      if (indoor) return { weight: 2, reason: `${label}は室内で育てやすく、屋外に置き場所がない方にも贈れます` }
      if (p.enjoy.includes('flower')) return { weight: 2, reason: `${label}は毎年同じ季節に花を咲かせ、贈ったあとも季節ごとの話題になります` + (peakLabel(key) ? `（見ごろの目安：${peakLabel(key)}）` : '') }
      return null
    case 'father':
      if (key === 'kuromatsu') return { weight: 5, reason: '黒松は太い幹と濃い緑の葉の丈夫な樹。季節ごとの手入れを覚える楽しみがあります' }
      if (key === 'goyomatsu') return { weight: 5, reason: '五葉松は生長がゆっくりで、落ち着いた姿を長く眺められます' }
      if (key === 'shimpaku') return { weight: 5, reason: '真柏は枝が柔らかく、針金で形をつくる手入れを楽しみたい方に向きます' }
      if (CONIFERS.includes(key)) return { weight: 3, reason: `${label}は一年中緑の葉を保ち、花の時期を気にせず楽しめます` }
      if (indoor) return { weight: 1, reason: `${label}は室内で育てやすく、屋外に置き場所がない方にも贈れます` }
      return null
    case 'keiro':
      if (key === 'goyomatsu') return { weight: 5, reason: '五葉松は長寿を願う樹として親しまれ、樹形が大きく崩れにくい樹です' }
      if (key === 'chojubai') return { weight: 5, reason: '長寿梅は名前の縁起のよさから、敬老の日に選ばれることの多い花ものです' }
      if (key === 'momiji') return { weight: 4, reason: 'もみじは9月に贈ると、まもなく始まる紅葉をすぐに楽しんでもらえます' }
      if (key === 'shimpaku') return { weight: 4, reason: '真柏は白い幹とねじれた姿が見どころ。盆栽らしい姿を好む方に向きます' }
      if (CONIFERS.includes(key)) return { weight: 3, reason: `${label}は一年中緑を保ち、長く楽しめる樹です` }
      return null
    case 'choju':
      if (PINES.includes(key)) return { weight: 5, reason: `一年中緑を保つ${label}などの松は、古くから長寿の象徴とされてきました` }
      if (key === 'chojubai') return { weight: 5, reason: '長寿梅は名前に「長寿」が入り、長寿祝いの贈り物に選ばれています' }
      if (CONIFERS.includes(key)) return { weight: 3, reason: `${label}は常緑で、改まったお祝いにも合わせやすい樹です` }
      if (key === 'ume') return { weight: 2, reason: '梅は寒い時期に咲く花で、慶事の縁起物として親しまれてきました' }
      return null
    case 'birthday': {
      const months = peakMonths(key)
      const soon = months.includes(month) || months.includes((month % 12) + 1)
      if (soon) return { weight: 4, reason: `${label}はこれからの時期に見どころがくる樹です（見ごろの目安：${peakLabel(key)}）` }
      if (CONIFERS.includes(key)) return { weight: 3, reason: `${label}は季節を問わず緑を楽しめるので、どの月の誕生日にも選べます` }
      if (EASY_STARTERS.includes(key)) return { weight: 2, reason: `${label}は丈夫で、はじめて育てる人にも失敗しにくい樹です` }
      if (indoor) return { weight: 2, reason: `${label}は明るい窓辺で育てやすく、室内にしか置き場所がない人に向きます` }
      return null
    }
    case 'house':
      if (PINES.includes(key)) return { weight: 5, reason: `${label}は一年中葉を落とさず、新しい住まいの門出に選ばれることが多い松の仲間です` }
      if (key === 'momiji') return { weight: 4, reason: 'もみじは春の芽吹きと秋の紅葉を、家族で毎年楽しめます' }
      if (key === 'chojubai' || key === 'ume') return { weight: 4, reason: `${label}は春に花が咲き、玄関先など目に入る場所に向きます` }
      if (indoor) return { weight: 3, reason: `${label}はベランダがない住まいでも、明るい室内で育てやすい樹です` }
      if (CONIFERS.includes(key)) return { weight: 3, reason: `${label}は一年中緑を保ち、和風・洋風どちらの住まいにも合わせやすい樹です` }
      return null
    case 'shop':
      if (PINES.includes(key)) return { weight: 5, reason: `${label}は常緑で格調があり、改まったお祝いに選ばれる松の仲間です` }
      if (key === 'nanten') return { weight: 4, reason: '南天は「難を転ずる」に通じる縁起物とされます' }
      if (indoor) return { weight: 4, reason: `店内に置くなら、${label}のように室内で育てやすい樹が向きます` }
      if (key === 'chojubai') return { weight: 3, reason: '長寿梅は名前の縁起がよく、花の時期が長い樹です' }
      if (p.enjoy.includes('flower') || p.enjoy.includes('fruit')) return { weight: 2, reason: `${label}は花や実がにぎやかな印象で、開店祝いにも選ばれます` }
      if (CONIFERS.includes(key)) return { weight: 3, reason: `${label}は常緑で、店先にも落ち着いた印象を添えます` }
      return null
    case 'promotion':
      if (indoor) return { weight: who === 'business' ? 6 : 4, reason: `${label}は室内の明るい場所で育てやすく、職場に置くときに向きます` }
      if (PINES.includes(key)) return { weight: 3, reason: `自宅宛なら、常緑で格調のある${label}も選べます` }
      if (CONIFERS.includes(key)) return { weight: 2, reason: `自宅宛なら、一年中緑を保つ${label}も選べます` }
      return null
    case 'retire':
      if (CONIFERS.includes(key)) return { weight: 4, reason: `自宅に届けるので、屋外向きの${label}も選べます。季節ごとの手入れを楽しめる樹です` }
      if (key === 'momiji' || key === 'chojubai') return { weight: 4, reason: `${label}は丈夫で、これから盆栽を始める方にも育てやすい樹です` }
      if (p.enjoy.includes('flower') || p.enjoy.includes('leaf_color')) return { weight: 2, reason: `${label}は季節ごとの変化を楽しめる樹です` }
      return null
    case 'oseibo':
      if (PINES.includes(key) || key === 'ume' || key === 'nanten' || key === 'senryo') {
        return { weight: 5, reason: `${label}は正月の縁起物として親しまれ、そのまま新年の飾りになります` }
      }
      if (key === 'chojubai') return { weight: 3, reason: '長寿梅は名前の縁起がよく、春と秋に花を楽しめます' }
      if (CONIFERS.includes(key)) return { weight: 3, reason: `${label}は一年中緑を保ち、年末のあいさつにも合わせやすい樹です` }
      return null
  }
}

// 樹種が分からない商品・場面に合う樹種がない商品の理由
function fallbackReason(p: CatalogProduct): string {
  const first = p.enjoy[0]
  if (first === 'flower') return '季節に花を楽しめる盆栽です'
  if (first === 'leaf_color') return '新緑や紅葉など、季節の変化を楽しめる盆栽です'
  if (first === 'fruit') return '秋から冬に実を楽しめる盆栽です'
  if (first === 'evergreen') return '一年中緑を楽しめる盆栽です'
  if (p.productType === 'kokedama') return '小さく場所を取らない苔玉です'
  return '予算に合う、写真の見やすい盆栽です'
}

export interface GiftPick {
  product: CatalogProduct
  reason: string
  score: number
}

function scoreProduct(p: CatalogProduct, state: OkurimonoState, month: number): GiftPick {
  const fit = speciesFit(state.scene, state.who, p, month)
  const budget = BUDGET_OPTIONS.find(o => o.value === state.budget)!
  let score = fit?.weight ?? 0
  const notes: string[] = []

  if (state.who !== 'self') {
    if (p.wrapping) { score += state.who === 'business' ? 4 : 3; notes.push('ラッピング・のし対応の表記があります') }
    else if (p.gift) { score += 2; notes.push('販売店がギフト対応と表記しています') }
  }
  if ((state.scene === 'choju' || state.scene === 'shop' || state.scene === 'house' || state.scene === 'promotion') && p.celebration) score += 2
  if (state.scene === 'oseibo' && p.newYear) score += 1
  if (p.level === 'easy') { score += state.who === 'self' ? 1 : 1.5; if (!notes.length) notes.push('はじめてでも育てやすい樹種です') }

  // 相手ごとの大きさ：家族・友人には扱いやすい大きさを、取引先には小さすぎないものを
  const size = p.sizeCategory
  if (state.who === 'family' && size === 'large') score -= 2
  if (state.who === 'friend' && (size === 'mini' || size === 'small')) score += 1
  if (state.who === 'business' && size === 'mini') score -= 1
  if (state.who === 'business' && (size === 'small' || size === 'medium')) score += 1

  // 予算の上のほう（〜10,000円なら5,000円より上）を少し優先する
  if (budget.floor && p.price > budget.floor) score += 1
  // 「10,000円以上」でも、極端に高い品は少し後ろに
  if (budget.min && p.price > 30000) score -= 2

  if (hasCuratedImage(p)) score += 3
  score += Math.log10(p.reviewCount + 1) * 0.8

  const reason = `${fit?.reason ?? fallbackReason(p)}。${notes.length ? `${notes[0]}。` : ''}`
  return { product: p, reason, score }
}

export function okurimonoPicks(state: OkurimonoState, products: CatalogProduct[], now = new Date()) {
  const budget = BUDGET_OPTIONS.find(o => o.value === state.budget)!
  const month = jstMonth(now)
  const seen = new Set<string>()
  const ranked = products
    .filter(p => {
      if (seen.has(p.originalName)) return false
      seen.add(p.originalName)
      return (p.productType === 'tree' || p.productType === 'kokedama') && !isSeedlingOrMaterial(p)
    })
    .filter(p => p.imageUrl && p.price > 0)
    .filter(p => (!budget.max || p.price <= budget.max) && (!budget.min || p.price >= budget.min))
    .map(p => scoreProduct(p, state, month))
    .sort((a, b) => b.score - a.score)

  // おすすめの3つは、なるべく樹種が重ならないように選ぶ
  const top: GiftPick[] = []
  const species = new Set<string>()
  for (const item of ranked) {
    if (top.length >= 3) break
    const key = item.product.speciesKey ?? `id:${item.product.id}`
    if (species.has(key)) continue
    species.add(key)
    top.push(item)
  }
  for (const item of ranked) {
    if (top.length >= 3) break
    if (!top.includes(item)) top.push(item)
  }
  const others = ranked.filter(item => !top.includes(item)).slice(0, 8).map(item => item.product)
  return { top, others, total: ranked.length }
}

// 一覧（/products）で同じ条件に近い絞り込みを開くリンク。0件になる条件は外す
const SCENE_FILTERS: Record<Scene, Partial<CatalogFilters>> = {
  mother: { species: 'cat-hana' },
  father: { species: 'cat-shohaku' },
  keiro: {},
  choju: { species: 'cat-shohaku' },
  birthday: {},
  house: {},
  shop: {},
  promotion: { place: 'indoor' },
  retire: {},
  oseibo: { use: 'new_year' },
}

export function okurimonoCatalogLink(state: OkurimonoState, products: CatalogProduct[]): { href: string; count: number } {
  const budget = BUDGET_OPTIONS.find(o => o.value === state.budget)!
  const base: CatalogFilters = {
    ...parseFilters({}),
    type: 'tree',
    min: budget.min,
    max: budget.max,
    use: state.who === 'self' ? undefined : 'gift',
  }
  const extra = SCENE_FILTERS[state.scene]
  const candidates: CatalogFilters[] = [
    { ...base, ...extra },
    { ...base, ...extra, use: extra.use },
    { ...base },
    { ...base, use: undefined },
  ]
  for (const filters of candidates) {
    const count = filterProducts(products, filters).length
    if (count >= 4) return { href: buildCatalogUrl(filters), count }
  }
  return { href: buildCatalogUrl({ ...base, use: undefined }), count: 0 }
}
