// 月ごとの手入れ（樹種グループ × 月 × 作業）。/teire と /note で使う
// 時期・回数・置き場所は src/content/articles の記事（年間管理カレンダー・水やり・剪定・植え替え・肥料・各樹種の育て方）に合わせている。
// 時期は関東の平地の目安。寒い地域は春の作業を2〜3週間遅らせ、冬の準備を早める（記事と同じ考え方）
// サーバー・クライアントのどちらからでも使える（外部の依存は species-traits / seasons だけ）

import { SPECIES_TRAITS } from '@/lib/species-traits'

export type CareGroupKey = 'shohaku' | 'zouki' | 'hana' | 'mi' | 'satsuki' | 'indoor'

export type TaskKind = 'prune' | 'bud' | 'repot' | 'wire' | 'pest' | 'protect' | 'enjoy' | 'fertilizer' | 'water' | 'place' | 'prepare'

export interface CareTask {
  kind: TaskKind
  // 太字で見せる作業名（短く）
  title: string
  // 1〜2文の説明
  text: string
  // この樹種だけの作業（SPECIES_TRAITS の key）。省略したらグループ全体
  only?: string[]
  // この樹種には当てはまらない作業
  except?: string[]
}

export interface GroupMonthCare {
  water: string
  place: string
  fertilizer: string
  tasks: CareTask[]
}

export interface MonthCare {
  month: number
  // 樹の様子（短く）
  phase: string
  // その月の要点（1〜2文）
  lead: string
  // どのグループにも共通すること
  common: CareTask[]
  // 関連する記事の slug（src/content/articles に実在するもの）
  articles: string[]
  groups: Record<CareGroupKey, GroupMonthCare>
}

export interface CareGroup {
  key: CareGroupKey
  label: string
  // 含まれる樹種の例
  examples: string
  // CareIcon の名前
  icon: string
  // 商品一覧へのリンク
  productsHref: string
  // まず読む記事（slug）
  guides: string[]
}

export const CARE_GROUPS: CareGroup[] = [
  { key: 'shohaku', label: '松柏類', examples: '黒松・五葉松・赤松・真柏・杜松など', icon: 'level', productsHref: '/products?type=tree&species=cat-shohaku', guides: ['article-10', 'article-6', 'article-20'] },
  { key: 'zouki', label: '雑木類', examples: 'もみじ・欅・ニレケヤキ・イチョウなど', icon: 'outdoor', productsHref: '/products?type=tree&species=cat-zouki', guides: ['article-1', 'keyaki-guide', 'article-48'] },
  { key: 'hana', label: '花もの', examples: '梅・長寿梅・桜・藤・椿・サルスベリなど', icon: 'season', productsHref: '/products?type=tree&species=cat-hana', guides: ['article-13', 'article-39', 'camellia-guide'] },
  { key: 'mi', label: '実もの', examples: '姫りんご・南天・ウメモドキなど', icon: 'fruit', productsHref: '/products?type=tree&species=cat-mi', guides: ['article-2', 'nanten-guide', 'umemodoki-bonsai-guide'] },
  { key: 'satsuki', label: 'さつき', examples: 'さつき・つつじ', icon: 'care', productsHref: '/products/category/satsuki', guides: ['article-49', 'azalea-guide'] },
  { key: 'indoor', label: '室内向き', examples: 'ガジュマル・フィカスなど', icon: 'indoor', productsHref: '/products?type=tree&place=indoor', guides: ['gajumaru-bonsai-guide', 'bonsai-indoor-cultivation-success-guide'] },
]

// 樹種（SPECIES_TRAITS の key）→ グループ。オリーブ・山椒は屋外で育てる葉ものとして雑木類の案内に入れる
export const SPECIES_GROUP: Record<string, CareGroupKey> = {
  gajumaru: 'indoor',
  ficus: 'indoor',
  goyomatsu: 'shohaku',
  kuromatsu: 'shohaku',
  akamatsu: 'shohaku',
  shimpaku: 'shohaku',
  toshou: 'shohaku',
  hinoki: 'shohaku',
  chojubai: 'hana',
  ume: 'hana',
  sakura: 'hana',
  satsuki: 'satsuki',
  fuji: 'hana',
  natsutsubaki: 'hana',
  tsubaki: 'hana',
  sarusuberi: 'hana',
  kuchinashi: 'hana',
  bara: 'hana',
  himeringo: 'mi',
  ringo: 'mi',
  nanten: 'mi',
  senryo: 'mi',
  mimono: 'mi',
  sansho: 'zouki',
  momiji: 'zouki',
  nirekeyaki: 'zouki',
  keyaki: 'zouki',
  ichou: 'zouki',
  buna: 'zouki',
  olive: 'zouki',
}

// 樹種ごとの育て方の記事（いちばん先に読むもの）。記事のない樹種は書かない
export const SPECIES_GUIDES: Record<string, string> = {
  gajumaru: 'gajumaru-bonsai-guide',
  ficus: 'bonsai-indoor-cultivation-success-guide',
  goyomatsu: 'article-6',
  kuromatsu: 'article-10',
  akamatsu: 'red-pine-guide',
  shimpaku: 'article-20',
  toshou: 'tosho-juniper-guide',
  chojubai: 'article-3',
  ume: 'article-13',
  sakura: 'article-39',
  satsuki: 'article-49',
  fuji: 'article-40',
  tsubaki: 'camellia-guide',
  sarusuberi: 'article-45',
  himeringo: 'article-2',
  ringo: 'article-2',
  nanten: 'nanten-guide',
  mimono: 'umemodoki-bonsai-guide',
  sansho: 'japanese-pepper-bonsai-guide',
  momiji: 'article-1',
  nirekeyaki: 'article-48',
  keyaki: 'keyaki-guide',
  ichou: 'ginkgo-bonsai-complete-guide',
  olive: 'olive-bonsai-mediterranean-charm',
}

// 植え替えの適期（月）と表示。各樹種の記事と植え替えのガイドの表に合わせる
export interface RepotWindow {
  months: number[]
  label: string
  // 間隔の目安
  interval: string
  // 何年たったら案内するか
  everyYears: number
}

const GROUP_REPOT: Record<CareGroupKey, RepotWindow> = {
  shohaku: { months: [3, 4], label: '3月〜4月中旬', interval: '小さな鉢は2〜3年、大きな鉢は3〜5年に1回', everyYears: 3 },
  zouki: { months: [3], label: '2月下旬〜3月中旬（芽がふくらみ始めたころ）', interval: '小さな鉢は1〜2年、中くらいの鉢は2〜3年に1回', everyYears: 2 },
  hana: { months: [3], label: '3月ごろ（樹種によっては花後）', interval: '1〜2年に1回（小さな鉢）', everyYears: 2 },
  mi: { months: [3], label: '3月ごろ（芽が動き出す前）', interval: '小さな鉢は1〜2年、中くらいの鉢は2〜3年に1回', everyYears: 2 },
  satsuki: { months: [3, 4, 6], label: '3月中旬〜4月中旬、または花が終わった直後', interval: '2〜3年に1回', everyYears: 3 },
  indoor: { months: [5, 6], label: '気温が上がる5〜6月', interval: '2〜3年に1回', everyYears: 2 },
}

const SPECIES_REPOT: Record<string, Partial<RepotWindow>> = {
  goyomatsu: { months: [3, 4], label: '3月中旬〜4月中旬' },
  kuromatsu: { months: [3, 4], label: '3月下旬〜4月上旬' },
  akamatsu: { months: [3, 4], label: '3月中旬〜4月上旬', interval: '2〜3年に1回' },
  shimpaku: { months: [3, 4], label: '3月下旬〜4月', interval: '2〜3年に1回' },
  toshou: { months: [3, 4], label: '3月下旬〜4月', interval: '2〜3年に1回' },
  momiji: { months: [2, 3], label: '2月下旬〜3月中旬' },
  keyaki: { months: [3], label: '3月ごろ（芽が膨らみ始めたころ）', interval: '小さな鉢は毎年〜2年、中くらいの鉢は2〜3年に1回' },
  nirekeyaki: { months: [3, 4], label: '3月上旬〜4月上旬' },
  ichou: { months: [3], label: '3月（芽が動き出す前）' },
  sansho: { months: [2, 3], label: '2月下旬〜3月中旬', interval: '2〜3年に1回', everyYears: 3 },
  olive: { months: [3, 4], label: '3月中旬〜4月中旬', interval: '2〜3年に1回', everyYears: 3 },
  ume: { months: [2, 3], label: '花後の2月下旬〜3月', interval: '小さな鉢は1〜2年、中くらいの鉢は2〜3年に1回' },
  chojubai: { months: [2, 3, 9, 10], label: '2月下旬〜3月、または9月下旬〜10月', interval: '2〜3年に1回', everyYears: 3 },
  sakura: { months: [2, 3], label: '2月下旬〜3月中旬（芽が動く前）' },
  fuji: { months: [3], label: '3月ごろ' },
  tsubaki: { months: [3, 4, 9], label: '花後の3〜4月、または9月ごろ', interval: '2〜3年に1回', everyYears: 3 },
  sarusuberi: { months: [4], label: '4月ごろ（芽が動き出してから）', interval: '小さな鉢は2年に1回ほど' },
  himeringo: { months: [2, 3], label: '2月下旬〜3月' },
  ringo: { months: [2, 3], label: '2月下旬〜3月' },
  nanten: { months: [3, 4], label: '3〜4月', interval: '小さな鉢は2年、中くらいの鉢は2〜3年に1回' },
  mimono: { months: [3], label: '3月ごろ（芽が動き出す前）' },
}

export function groupOf(speciesKey: string | null | undefined): CareGroupKey | null {
  return speciesKey ? SPECIES_GROUP[speciesKey] ?? null : null
}

export function getCareGroup(key: CareGroupKey): CareGroup {
  return CARE_GROUPS.find(g => g.key === key) ?? CARE_GROUPS[0]
}

export function repotWindow(speciesKey: string): RepotWindow | null {
  const group = groupOf(speciesKey)
  if (!group) return null
  return { ...GROUP_REPOT[group], ...SPECIES_REPOT[speciesKey] }
}

// 樹種の表示名（SPECIES_TRAITS の label）
export function speciesLabel(key: string): string {
  return SPECIES_TRAITS.find(t => t.key === key)?.label ?? key
}

// グループに入っている樹種（SPECIES_TRAITS の並び順）
export function speciesInGroup(group: CareGroupKey): string[] {
  return SPECIES_TRAITS.map(t => t.key).filter(key => SPECIES_GROUP[key] === group)
}

// 作業の種類 → CareIcon の名前
export const TASK_ICON: Record<TaskKind, string> = {
  prune: 'care',
  bud: 'level',
  repot: 'size',
  wire: 'care',
  pest: 'care',
  protect: 'winter',
  enjoy: 'season',
  fertilizer: 'level',
  water: 'water',
  place: 'place',
  prepare: 'care',
}

// ---- 水やりの目安（季節ごと） ----

type WaterSeason = 'winter' | 'spring' | 'rainy' | 'summer' | 'earlyAutumn' | 'autumn'

const WATER: Record<CareGroupKey, Record<WaterSeason, string>> = {
  shohaku: {
    winter: '乾いていれば2〜4日に1回程度。晴れた日の午前中に与えます。常緑なので冬も乾きます',
    spring: '表面がしっかり乾いたら、鉢底から流れるまで。1日1回程度',
    rainy: '乾いたときだけ。雨が続いても葉に遮られて土が乾いていることがあります',
    summer: '朝に1回。夕方にも乾いていればもう1回。常に湿った状態は嫌います',
    earlyAutumn: '上旬は夏と同じく朝と、乾いていれば夕方。中旬からは1日1回程度に',
    autumn: '1日1回から、涼しくなるにつれ1〜2日に1回',
  },
  zouki: {
    winter: '乾いたのを確かめて、晴れた日の午前中に。2〜4日に1回程度',
    spring: '1日1回。芽吹くと急に乾きが早くなります',
    rainy: '乾いたときだけ。水を好むので、晴れ間は乾き具合をこまめに見ます',
    summer: '朝夕の2回が目安。水切れすると葉先が茶色く縮れます',
    earlyAutumn: '上旬は朝夕。中旬からは1日1回に',
    autumn: '1日1回。落葉が近づくと乾きがゆっくりになります',
  },
  hana: {
    winter: '乾いたのを確かめて、晴れた日の午前中に。2〜4日に1回程度',
    spring: '1日1回。咲いている花には水をかけず、土に与えます',
    rainy: '乾いたときだけ。晴れ間は乾き具合を見ます',
    summer: '朝1回、夕方も乾いていればもう1回。翌年の花芽ができる時期なので水切れさせません',
    earlyAutumn: '上旬は朝と、乾いていれば夕方。中旬からは1日1回に',
    autumn: '1日1回から、涼しくなるにつれ間隔をあけます',
  },
  mi: {
    winter: '乾いたのを確かめて、晴れた日の午前中に。2〜4日に1回程度',
    spring: '1日1回。花に水をかけず、土に与えます',
    rainy: '乾いたときだけ。晴れ間は乾き具合を見ます',
    summer: '朝1回、夕方も乾いていればもう1回。水切れすると実が落ちやすくなります',
    earlyAutumn: '上旬は朝と、乾いていれば夕方。中旬からは1日1回に',
    autumn: '1日1回から、涼しくなるにつれ間隔をあけます',
  },
  satsuki: {
    winter: '乾いたのを確かめて、晴れた日の午前中に',
    spring: '1日1回。鹿沼土は乾くと白っぽくなるので、乾き具合が見分けやすい土です',
    rainy: '乾いたときだけ。細い根が表面近くに張り、乾燥に弱いので晴れ間は必ず見ます',
    summer: '朝夕の2回。梅雨明けから9月上旬は、帰宅後にも鉢を見ます',
    earlyAutumn: '上旬は朝夕の2回。中旬からは1日1回に',
    autumn: '1日1回。涼しくなったら乾き具合を見て間隔をあけます',
  },
  indoor: {
    winter: '表面が乾いて2〜3日たってから。暖かい日の午前中に、室温に近い水を与えます',
    spring: '表面が乾いたらたっぷり。生長が始まり、乾きが早くなります',
    rainy: '乾きやすく、ほぼ毎日。屋外では朝に与えます',
    summer: '乾きやすく、ほぼ毎日。屋外では朝に与え、葉にも水をかけます',
    earlyAutumn: 'まだ乾きやすい時期です。表面が乾いたらたっぷり与えます',
    autumn: '乾き具合を見て、少しずつ間隔をあけます',
  },
}

const MONTH_WATER_SEASON: WaterSeason[] = ['winter', 'winter', 'spring', 'spring', 'spring', 'rainy', 'summer', 'summer', 'earlyAutumn', 'autumn', 'autumn', 'winter']

function water(group: CareGroupKey, month: number): string {
  if (group === 'indoor') {
    // ガジュマルの記事：春 4〜5月、夏 6〜9月、秋 10〜11月、冬 12〜3月
    if (month === 3) return WATER.indoor.winter
    if (month >= 6 && month <= 9) return WATER.indoor.summer
  }
  if (month === 7 && group !== 'indoor') return `梅雨明けまでは乾いたときだけ。梅雨明けからは${WATER[group].summer}`
  return WATER[group][MONTH_WATER_SEASON[month - 1]]
}

// ---- 月ごとのデータ ----

type GroupBody = Omit<GroupMonthCare, 'water'>

interface MonthSource {
  phase: string
  lead: string
  common: CareTask[]
  articles: string[]
  groups: Record<CareGroupKey, GroupBody>
}

const NO_FERTILIZER = '与えません'

const FROST: CareTask = { kind: 'protect', title: '鉢土の凍結を防ぐ', text: '小さな鉢ほど凍りやすいので、北風の当たらない軒下や棚の下段、発泡スチロール箱に入れます。' }

const MONTHS: MonthSource[] = [
  // 1月
  {
    phase: '休眠',
    lead: '樹が休んでいる時期です。水やりは乾いてから晴れた日の午前中に。落葉樹の剪定と松柏の針金かけに向いています。',
    common: [
      { kind: 'water', title: '水やりは午前中に', text: '夕方に与えると、夜のうちに鉢の中が凍ることがあります。' },
      FROST,
    ],
    articles: ['bonsai-winter-care-failure-prevention', 'bonsai-pruning-master-guide-2025', 'bonsai-annual-care-calendar-2025'],
    groups: {
      shohaku: {
        place: '屋外の日当たりのよい棚。寒さに強いので外で越せます。小さな鉢だけ北風の当たらない軒下へ',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'wire', title: '針金かけ', text: '樹の動きが止まっている時期で、枝の向きを整えるのに向いています。', except: ['shimpaku'] },
          { kind: 'wire', title: '針金かけは2月から', text: '真冬の厳しい寒さの時期は枝が折れやすいので、針金は2〜3月にかけます。', only: ['shimpaku'] },
          { kind: 'prune', title: '枝の剪定', text: '枝を切る剪定は、樹液の動きが少ない冬が基本です。込み合った枝や交差する枝を元から切ります。', except: ['shimpaku'] },
        ],
      },
      zouki: {
        place: '屋外。細い枝先が寒風で傷みやすいので、寒風の当たらない場所に',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '冬の剪定', text: '葉が落ちて枝の流れが見やすい時期です。混み合った枝・内向きの枝・重なる枝を元から切り、残す枝は2〜3芽を目安に切り戻します。', except: ['olive'] },
          { kind: 'prune', title: '太い枝は2月までに', text: 'もみじは春が近づくと切り口から樹液が出やすくなるので、太い枝の剪定は2月までに済ませます。', only: ['momiji'] },
          { kind: 'protect', title: '霜と寒風を避ける', text: '冬に葉がまとまって落ちるのは寒さや霜が原因のことがあります。軒下や無加温の室内に移します。', only: ['olive'] },
        ],
      },
      hana: {
        place: '屋外で寒さに当てます。霜と寒風は避け、暖かい室内には入れません（花芽が目覚めにくくなります）',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'enjoy', title: '梅の花を楽しむ', text: '早い品種は1月から咲きます。室内に飾るなら玄関など涼しい場所に、数日から1週間ほどまで。咲き終わった花がらは摘みます。', only: ['ume'] },
          { kind: 'enjoy', title: '冬咲きの椿', text: '寒椿など早咲きの品種が咲く時期です。寒風を避け、花がらを摘みます。', only: ['tsubaki'] },
          { kind: 'prune', title: '冬は切りすぎない', text: '形を整えようと冬に切ると、花芽ごと落とすことがあります。切るのは枯れ枝や明らかな忌み枝だけにします。', except: ['fuji', 'sarusuberi'] },
          { kind: 'prune', title: '藤の冬の剪定', text: '丸くふくらんだ花芽を残し、細い葉芽だけの長い枝を切り詰めます。', only: ['fuji'] },
          { kind: 'prune', title: 'サルスベリの剪定', text: '落葉後〜3月の休眠期が剪定の時期です（芽が動く前の2〜3月が適期）。', only: ['sarusuberi'] },
        ],
      },
      mi: {
        place: '屋外。冷たい北風の当たる場所と、鉢土が凍りやすい場所は避けます',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '冬の剪定', text: '花芽を確かめながら、伸びすぎた枝や混み合った枝を整理します。', only: ['himeringo', 'ringo'] },
          { kind: 'enjoy', title: '冬の実を楽しむ', text: '南天・千両・万両の赤い実が見頃です。鳥に食べられやすいので、軒下に置くか目の細かいネットをかけます。', only: ['nanten', 'senryo'] },
          { kind: 'place', title: '正月飾りの後は屋外へ', text: '室内に飾るのは三が日ほどにして、屋外に戻します。暖かい室内に長く置くと、実がしなびたり葉が落ちたりします。', only: ['nanten', 'senryo'] },
        ],
      },
      satsuki: {
        place: '屋外の寒風と霜の当たらない軒下など',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'wire', title: '太い枝の剪定・針金かけ', text: '樹形を大きく変えるなら休眠中の冬に。枝が硬く折れやすいので、無理に曲げず少しずつ形を付けます。' },
          { kind: 'prune', title: '枝先は切らない', text: '花芽を抱えて冬を越しています。枝先を切ると翌年の花が減ります。' },
        ],
      },
      indoor: {
        place: '室内のレースカーテン越しの明るい窓辺。夜は窓際が冷え込むので、部屋の中央寄りへ移します',
        fertilizer: '与えません（生長期の5〜9月に与えます）',
        tasks: [
          { kind: 'protect', title: '夜の窓際と暖房の風を避ける', text: '最低気温が5℃を下回ると葉が傷み始めます。暖房の風が当たる場所も乾燥で葉が落ちます。' },
          { kind: 'water', title: '葉水', text: 'エアコンで乾燥する室内では、霧吹きで葉に水をかけると乾燥を防ぎ、ハダニの予防にもなります。' },
        ],
      },
    },
  },
  // 2月
  {
    phase: '芽が動く前',
    lead: '剪定の仕上げと、植え替えの準備の月です。下旬になると、もみじや梅など早いものから植え替えの時期に入ります。',
    common: [
      { kind: 'prepare', title: '植え替えの準備', text: '用土をふるいにかけて細かい粉を落とし、鉢・鉢底の網・固定用の針金をそろえておきます。' },
      FROST,
    ],
    articles: ['bonsai-repotting-master-guide-2025', 'bonsai-pruning-master-guide-2025', 'bonsai-winter-care-failure-prevention'],
    groups: {
      shohaku: {
        place: '屋外の日当たりのよい棚。小さな鉢は北風の当たらない軒下へ',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'wire', title: '針金かけ', text: '冬の針金かけはこの月までが目安です。真柏も2〜3月が針金の時期です（厳しい寒さの日は作業しません）。' },
          { kind: 'prune', title: '枝の整理', text: '込み合った枝や内側に向かう枝を付け根から切って透かします。枝先に葉を残して切ります。', only: ['shimpaku'] },
          { kind: 'prepare', title: '植え替えの用土をそろえる', text: '松柏類は水はけをよくした土（赤玉土6〜7：桐生砂3〜4）を使います。' },
        ],
      },
      zouki: {
        place: '屋外の寒風の当たらない場所',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '冬の剪定の仕上げ', text: '芽が動く前に済ませます。もみじの太い枝はこの月までに。', except: ['olive'] },
          { kind: 'repot', title: '植え替えの始まり', text: '芽がふくらみ始めたら（2月下旬〜）植え替えの時期です。', only: ['momiji', 'sansho'] },
          { kind: 'prune', title: 'オリーブの剪定', text: '春の芽吹き前（2月中旬〜3月）にまとめて剪定します。花と実を楽しみたい年は、枝先の切り戻しを控えめにします。', only: ['olive'] },
        ],
      },
      hana: {
        place: '屋外で寒さに当てます。霜と寒風は避けます',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '梅の花後の剪定', text: '花が終わったらすぐ（2月下旬〜3月）、枝を切り戻します。切った後に伸びる枝に、夏の間に翌年の花芽ができます。', only: ['ume'] },
          { kind: 'repot', title: '植え替え', text: '芽が動き出す前の2月下旬から植え替えの時期です。', only: ['ume', 'chojubai', 'sakura'] },
          { kind: 'prune', title: 'サルスベリの剪定の適期', text: '前の年に伸びた枝を、付け根から1〜2芽を残して切ります。芽が動き出してからは切りません。', only: ['sarusuberi'] },
          { kind: 'prune', title: '藤の冬の剪定', text: '花芽を残し、葉芽だけの長い枝を切り詰めます。', only: ['fuji'] },
          { kind: 'prune', title: '冬は切りすぎない', text: '花芽を落とさないよう、切るのは枯れ枝や明らかな忌み枝にとどめます。', except: ['ume', 'fuji', 'sarusuberi'] },
        ],
      },
      mi: {
        place: '屋外。北風と鉢土の凍結を避けます',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '冬の剪定の仕上げ', text: '花芽を確かめながら枝を整理します。', only: ['himeringo', 'ringo'] },
          { kind: 'repot', title: '植え替え', text: '芽が動き出す前の2月下旬〜3月が適期です。', only: ['himeringo', 'ringo'] },
          { kind: 'prune', title: '主な剪定', text: 'ウメモドキなど、春に伸びた枝に花が咲く樹は、芽が伸びる前の2〜3月に伸びすぎた枝を2〜3芽残して切り詰めます。', only: ['mimono'] },
        ],
      },
      satsuki: {
        place: '屋外の寒風と霜の当たらない軒下など',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prepare', title: '植え替えの用土をそろえる', text: 'さつきは酸性の土を好むので、鹿沼土を単用するか、鹿沼土を主に赤玉土を少し混ぜます。' },
          { kind: 'prune', title: '枝先は切らない', text: '花芽を抱えている時期です。' },
        ],
      },
      indoor: {
        place: '室内の明るい窓辺。夜は窓から離します',
        fertilizer: '与えません（生長期の5〜9月に与えます）',
        tasks: [
          { kind: 'protect', title: '夜の冷え込みに注意', text: '暖房を切った夜の窓際の冷えが、冬にいちばん多い失敗です。' },
          { kind: 'place', title: '鉢を回す', text: '光の来る方向に枝が伸びるので、1〜2週間に一度、鉢を回して全体に光を当てます。' },
        ],
      },
    },
  },
  // 3月
  {
    phase: '芽がふくらむ',
    lead: '植え替えの適期です。芽がふくらみ始めてから開くまでの間に済ませます。遅霜で新芽が傷むことがあるので、霜の予報が出た夜は軒下へ。',
    common: [
      { kind: 'protect', title: '遅霜に注意', text: '関東の平地では3月から4月上旬ごろまで、霜の予報が出た夜だけ軒下に移します。' },
      { kind: 'repot', title: '植え替えた後の管理', text: '2〜3週間は風の当たらない明るい日陰に。肥料は1か月ほどあけ、芽が伸び出してから再開します。' },
    ],
    articles: ['bonsai-repotting-master-guide-2025', 'article-16', 'article-12'],
    groups: {
      shohaku: {
        place: '冬の置き場所から、日当たりと風通しのよい棚へ。数日かけて慣らします',
        fertilizer: '与えません（4月ごろ、芽が動き出してから）',
        tasks: [
          { kind: 'repot', title: '植え替え', text: '3月中旬から適期に入ります（黒松は3月下旬〜4月上旬）。根に付く白い菌糸を残すため、古い土は全部落とさず一部を残します。' },
          { kind: 'prune', title: '透かし剪定', text: '込み合った枝を付け根から切って、内側に光を入れます。', only: ['shimpaku', 'toshou'] },
          { kind: 'wire', title: '針金かけはこの月まで', text: '樹の動きが落ち着いている2〜3月が目安です。', only: ['shimpaku'] },
        ],
      },
      zouki: {
        place: '日当たりと風通しのよい棚へ。遅霜の夜は軒下へ',
        fertilizer: '与えません（新しい葉が開ききってから）',
        tasks: [
          { kind: 'repot', title: '植え替え', text: '芽がふくらみ始めたころが適期です。雑木類は根の伸びが早く、小さな鉢は1〜2年に1回が目安です。', except: ['olive'] },
          { kind: 'repot', title: 'オリーブの植え替え', text: '3月中旬〜4月中旬が適期です。', only: ['olive'] },
          { kind: 'fertilizer', title: 'オリーブの肥料', text: '3月に固形の肥料を鉢の縁に置きます。', only: ['olive'] },
          { kind: 'enjoy', title: '木の芽', text: '芽吹いたばかりの若葉を数枚ずつ摘めます。一度にたくさん摘むと樹が弱ります。', only: ['sansho'] },
        ],
      },
      hana: {
        place: '日当たりと風通しのよい棚へ。遅霜の夜は軒下へ',
        fertilizer: '咲いている間は与えません',
        tasks: [
          { kind: 'prune', title: '梅の花後の剪定', text: '花が終わったらすぐに切り戻します。剪定が5月以降になると、花芽がつく枝が少なくなります。', only: ['ume'] },
          { kind: 'repot', title: '植え替え', text: '芽が動き出す前の今月が適期です。', only: ['ume', 'chojubai', 'sakura', 'fuji'] },
          { kind: 'enjoy', title: '桜の花', text: '3月下旬から咲き始めます。雨と強風を避け、花に水をかけないようにします。', only: ['sakura'] },
          { kind: 'prune', title: 'サルスベリの剪定は今月まで', text: '芽が伸び始めてから枝先を切ると、その年に花をつける枝を落とします。', only: ['sarusuberi'] },
          { kind: 'prune', title: '椿の花後の剪定', text: '花が終わった直後、新しい芽が伸び出す前の3〜4月に。夏以降に枝先を切ると、翌年の花が咲かなくなります。', only: ['tsubaki'] },
        ],
      },
      mi: {
        place: '日当たりと風通しのよい棚へ。遅霜の夜は軒下へ',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'repot', title: '植え替え', text: '芽が動き出す前の今月が適期です。', only: ['himeringo', 'ringo', 'mimono', 'nanten'] },
          { kind: 'prune', title: '南天の剪定', text: '実を楽しみ終えたら、樹全体を見て整理します。枝先は切らず、古い幹を元から間引きます（一度に全体の3分の1まで）。', only: ['nanten'] },
        ],
      },
      satsuki: {
        place: '日当たりと風通しのよい棚へ。遅霜の夜は軒下へ',
        fertilizer: '植え替えない樹は、芽が動き出したら置き肥を始めます',
        tasks: [
          { kind: 'repot', title: '植え替え', text: '3月中旬〜4月中旬が適期です（花後にもできます）。鹿沼土を主にした土で、2〜3年に1回が目安です。' },
        ],
      },
      indoor: {
        place: '室内の明るい窓辺。屋外に出すのは5月から',
        fertilizer: '与えません（生長期の5〜9月に与えます）',
        tasks: [
          { kind: 'place', title: 'まだ室内で', text: '夜の気温が下がる日があるので、屋外に出すのは暖かくなってからにします。' },
          { kind: 'water', title: '葉水', text: '乾燥した室内では、霧吹きで葉に水をかけてハダニを予防します。' },
        ],
      },
    },
  },
  // 4月
  {
    phase: '芽吹き',
    lead: '新しい芽が次々に伸びます。芽摘みで枝を細かくし、新しい葉が開ききって落ち着いたら肥料を始めます。',
    common: [
      { kind: 'pest', title: 'アブラムシの確認', text: '新芽の先や葉の裏を見て、見つけたら早めに取り除きます。' },
      { kind: 'protect', title: '上旬までは遅霜に注意', text: '霜の予報が出た夜は軒下に移します。' },
    ],
    articles: ['article-7', 'article-8', 'bonsai-repotting-master-guide-2025'],
    groups: {
      shohaku: {
        place: '日当たりと風通しのよい棚',
        fertilizer: '芽が動き出したら、ゆっくり効く固形肥料を鉢の縁に置きます（植え替えた樹は1か月ほどあけて）',
        tasks: [
          { kind: 'repot', title: '植え替えは中旬まで', text: 'まだの樹は、芽が動き出したばかりのうちに済ませます。' },
          { kind: 'bud', title: 'みどり摘み', text: '春に伸びる新芽（みどり）を摘んで長さをそろえます。黒松は4月中旬から、五葉松・赤松は4月下旬からが目安です。', only: ['kuromatsu', 'goyomatsu', 'akamatsu'] },
          { kind: 'bud', title: '芽摘み', text: '伸びた新芽を指先でつまむか、ハサミで枝ごと間引きます。葉先をハサミで切りそろえると、切り口が茶色くなります。', only: ['shimpaku'] },
        ],
      },
      zouki: {
        place: '日当たりと風通しのよい棚',
        fertilizer: '新しい葉が開ききって落ち着いたら始めます（4月下旬ごろ）。開く途中に効かせると葉が大きくなります',
        tasks: [
          { kind: 'bud', title: '芽摘み', text: '伸びた新芽を摘んで長さを抑えると、節の間が詰まり細かい枝ができます。', except: ['olive', 'sansho', 'ichou'] },
          { kind: 'pest', title: 'アゲハの幼虫', text: '若葉の多い時期は数日おきに葉の裏や枝先を見て、見つけたら取り除きます。', only: ['sansho'] },
          { kind: 'enjoy', title: '新緑', text: '芽吹いたばかりのやわらかい葉の色を楽しめる時期です。', only: ['momiji', 'keyaki', 'nirekeyaki', 'buna'] },
        ],
      },
      hana: {
        place: '日当たりと風通しのよい棚。咲いている花は雨と強風を避けます',
        fertilizer: '花が終わった樹にお礼肥を置きます。咲いている間は与えません',
        tasks: [
          { kind: 'prune', title: '花後すぐの剪定', text: '花ものは花が終わったらすぐに剪定するのが基本です。夏以降に切ると、翌年の花芽を落とします。' },
          { kind: 'prune', title: '桜の花後の剪定', text: '花が散った直後（4月下旬〜5月）にまとめて行います。', only: ['sakura'] },
          { kind: 'enjoy', title: '藤の花', text: '4月下旬から咲き始めます。花房に水をかけないようにします。', only: ['fuji'] },
          { kind: 'repot', title: '植え替え', text: '寒い時期を嫌うので、芽が動き出す4月ごろに行います。', only: ['sarusuberi'] },
          { kind: 'repot', title: '植え替え', text: '花が終わった後の3〜4月が適期です。', only: ['tsubaki'] },
          { kind: 'pest', title: 'チャドクガに注意', text: '4月下旬ごろから葉の裏に毛虫が集まります。毛に触れるとかぶれるので、手袋をして枝ごと切り取ります。', only: ['tsubaki'] },
        ],
      },
      mi: {
        place: '日当たりと風通しのよい棚',
        fertilizer: '花が終わってから与えます',
        tasks: [
          { kind: 'enjoy', title: '花と人工授粉', text: '姫りんごは4月ごろに咲きます。実をつけるために人工授粉をします。花に水をかけないようにします。', only: ['himeringo', 'ringo'] },
          { kind: 'fertilizer', title: '南天の肥料', text: '新しい葉が伸びる4〜5月に、控えめに置きます。多すぎると葉ばかり茂ります。', only: ['nanten'] },
          { kind: 'repot', title: '植え替えは今月まで', text: '新しい芽が動き出す3〜4月が適期です。', only: ['nanten'] },
        ],
      },
      satsuki: {
        place: '日当たりと風通しのよい棚',
        fertilizer: '芽が伸び始める4月ごろに置き肥をします（植え替えた樹は1か月ほどあけて）',
        tasks: [
          { kind: 'repot', title: '植え替えは中旬まで', text: 'まだの樹は、花後に植え替えることもできます。' },
          { kind: 'pest', title: 'もち病', text: '春に新しい葉が白くふくらんだら、その部分を早めに取り除いて処分します。' },
        ],
      },
      indoor: {
        place: '室内の明るい窓辺。部屋の奥に置くと枝が間延びします',
        fertilizer: '与えません（5月から始めます）',
        tasks: [
          { kind: 'place', title: '屋外に出す準備', text: '5月から屋外で育てると葉が締まります。出すときは最初の1週間ほど明るい日陰に置き、少しずつ日なたに慣らします。' },
        ],
      },
    },
  },
  // 5月
  {
    phase: '新しい枝が伸びる',
    lead: '芽摘みと新芽の整理、花ものの花後の剪定が続きます。乾きが急に早くなるので、水切れに気をつけます。',
    common: [
      { kind: 'pest', title: '害虫の確認', text: 'アブラムシや、新芽を食べる幼虫がつきやすい時期です。水やりのついでに葉の裏まで見ます。' },
    ],
    articles: ['article-7', 'article-8', 'bonsai-watering-master-guide-2025'],
    groups: {
      shohaku: {
        place: '日当たりと風通しのよい棚',
        fertilizer: '置き肥を続けます（1か月前後で古いものを取り除いて交換）',
        tasks: [
          { kind: 'bud', title: 'みどり摘み', text: '伸びた新芽の長さをそろえます。五葉松は芽切りをせず、このみどり摘みで伸びを調整します。', only: ['kuromatsu', 'goyomatsu', 'akamatsu'] },
          { kind: 'fertilizer', title: '芽切りの前に肥料を外す', text: '芽切りをする赤松は、芽切りの1か月ほど前に肥料を取り除きます。', only: ['akamatsu'] },
          { kind: 'bud', title: '芽摘み', text: '伸びた新芽を指でつまんで整えます。摘みすぎないようにします。', only: ['shimpaku'] },
          { kind: 'bud', title: '芽切り', text: '針のような葉は指では痛いので、ハサミで切ります（5〜6月）。', only: ['toshou'] },
        ],
      },
      zouki: {
        place: '日当たりと風通しのよい棚',
        fertilizer: '置き肥を続けます',
        tasks: [
          { kind: 'bud', title: '芽摘み・新芽の整理', text: '伸びた芽を摘んで長さを抑えます。', except: ['olive', 'ichou', 'nirekeyaki'] },
          { kind: 'prune', title: '切り戻し', text: '5月から9月ごろまで、伸びた枝を切り戻して小枝を増やします。勢いの強い枝から順に切ります。', only: ['nirekeyaki'] },
          { kind: 'prune', title: '長い枝の切り戻し', text: '新しく伸びた長い枝が固まる前に、2〜3枚の葉を残して先を切ります。', only: ['ichou'] },
        ],
      },
      hana: {
        place: '日当たりと風通しのよい棚',
        fertilizer: '花が終わった樹は、お礼肥を置きます',
        tasks: [
          { kind: 'prune', title: '花後の剪定', text: '花が終わったら、花がらを摘んですぐに剪定します。', except: ['sarusuberi', 'ume', 'tsubaki'] },
          { kind: 'prune', title: '伸びすぎた枝を軽く切る', text: '樹の形から大きく飛び出した枝を、5〜6月に軽く切り戻します。7月からは強く切りません。', only: ['ume'] },
          { kind: 'prune', title: '咲き終わった花房を切る', text: '花房を付け根で切ります。残すと実ができて樹が疲れます。', only: ['fuji'] },
          { kind: 'enjoy', title: '芽吹きを待つ', text: 'サルスベリは芽吹きが遅く、葉が出るのは5月ごろです。枝先を爪で少しこすって緑色が見えれば生きています。', only: ['sarusuberi'] },
        ],
      },
      mi: {
        place: '日当たりと風通しのよい棚',
        fertilizer: '花後の置き肥を続けます。実が付いている間は控えめに',
        tasks: [
          { kind: 'enjoy', title: '摘果', text: '実がたくさんついたら、一つの短い枝に一つを目安に減らします。つけすぎると翌年の花芽がつきにくくなります。', only: ['himeringo', 'ringo'] },
          { kind: 'prune', title: '新しい枝は切らない', text: 'ウメモドキなどは春に伸びた枝に花が咲くので、5〜6月は切らずに伸ばします。', only: ['mimono'] },
        ],
      },
      satsuki: {
        place: '日当たりと風通しのよい棚',
        fertilizer: '花が咲いている間は与えません',
        tasks: [
          { kind: 'enjoy', title: '花を楽しむ', text: '5月下旬ごろから咲き始めます。' },
          { kind: 'pest', title: '新芽の害虫', text: '新芽の先が食べられて枯れていたら、幼虫を探して取り除きます。葉が白っぽくかすれるのはツツジグンバイです。' },
        ],
      },
      indoor: {
        place: 'ベランダや庭へ。最初の1週間ほどは明るい日陰に置き、少しずつ日なたに慣らします',
        fertilizer: '固形肥料を月に1回ほど鉢の縁に。または薄めた液体肥料を2週間に1回ほど',
        tasks: [
          { kind: 'repot', title: '植え替え', text: '気温が十分に上がった5〜6月が適期です。植え替え直後の2週間ほどは肥料を控えます。' },
          { kind: 'prune', title: '剪定', text: '生長が盛んな5〜7月が適期です。伸びすぎた枝を2〜3枚の葉を残して切り戻します。' },
        ],
      },
    },
  },
  // 6月
  {
    phase: '枝が固まる',
    lead: '伸びすぎた枝を切り戻して形を保ちます。さつきは花後すぐに剪定し、黒松は中旬から芽切りの時期です。梅雨の蒸れに注意します。',
    common: [
      { kind: 'place', title: '梅雨の蒸れを防ぐ', text: '風通しのよい場所に置き、長雨が続くときは軒下へ。受け皿に水をためないようにします。' },
    ],
    articles: ['bonsai-pruning-master-guide-2025', 'article-49', 'article-12'],
    groups: {
      shohaku: {
        place: '風通しのよい棚。長雨のときは軒下へ（五葉松は湿りすぎと蒸れに弱い）',
        fertilizer: '6月中旬ごろまで。黒松・赤松は芽切りの前に止めます',
        tasks: [
          { kind: 'bud', title: '芽切り', text: '元気な樹だけ、春に伸びた芽を元から切ります（黒松は6月中旬〜7月上旬、赤松は6月上旬〜中旬）。切った後は水と肥料をやや控えめにします。', only: ['kuromatsu', 'akamatsu'] },
          { kind: 'bud', title: '芽摘み', text: '伸びた新芽を整えます。真夏の暑い時期は控えます。', only: ['shimpaku'] },
          { kind: 'bud', title: '芽切り', text: 'ハサミで伸びた芽を切ります。', only: ['toshou'] },
        ],
      },
      zouki: {
        place: '風通しのよい棚。長雨のときは軒下へ',
        fertilizer: '6月中旬（梅雨前）ごろまで',
        tasks: [
          { kind: 'prune', title: '伸びすぎた枝の切り戻し', text: '勢いよく長く伸びた枝を軽く切り戻して、全体の形を保ちます。', except: ['olive'] },
          { kind: 'prune', title: '葉刈り', text: '元気な樹だけ、葉を切り取って二番芽を出させると葉が小さくそろいます。植え替えた年や弱った樹には行いません。', only: ['momiji', 'keyaki', 'nirekeyaki'] },
          { kind: 'prune', title: '花後に軽く整える', text: '花が終わった6月下旬ごろに、勢いよく伸びた枝を軽く整える程度にします。肥料も花後に置きます。', only: ['olive'] },
        ],
      },
      hana: {
        place: '風通しのよい棚。長雨のときは軒下へ',
        fertilizer: '6月中旬ごろまで',
        tasks: [
          { kind: 'prune', title: '花芽ができ始める', text: '多くの花ものは、初夏から夏に翌年の花芽を作ります。軽く整える程度にとどめ、7月からは枝先を強く切りません。', except: ['fuji', 'sarusuberi'] },
          { kind: 'prune', title: '長寿梅の花後の剪定', text: '春の花が終わった枝や長く伸びた枝を、2〜3芽を残して切り戻します（5〜6月）。', only: ['chojubai'] },
          { kind: 'prune', title: 'つるを切る', text: '長く伸びたつるは、付け根から2〜3芽を残して切ります。9月まで、伸びるたびに繰り返します。', only: ['fuji'] },
          { kind: 'enjoy', title: '初夏の花', text: '夏椿やクチナシが咲く時期です。', only: ['natsutsubaki', 'kuchinashi'] },
        ],
      },
      mi: {
        place: '風通しのよい棚。長雨のときは軒下へ',
        fertilizer: '梅雨前まで',
        tasks: [
          { kind: 'prune', title: '初夏の切り戻し', text: '勢いよく長く伸びた枝を軽く切り戻します。7月以降は強い剪定を避けます。', only: ['himeringo', 'ringo'] },
          { kind: 'protect', title: '花を雨から守る', text: '6月ごろに咲く花が雨に当たると実がつきにくくなります。咲いている間は雨の当たらない明るい軒下に置きます。', only: ['nanten'] },
          { kind: 'enjoy', title: '花の時期', text: 'ウメモドキは6月ごろに花が咲きます。雌木だけでは実がつきにくいので、雄木があれば近くに並べます。', only: ['mimono'] },
        ],
      },
      satsuki: {
        place: '風通しのよい棚。長雨のときは軒下へ',
        fertilizer: '花後の剪定のあと、6月下旬〜7月上旬にお礼肥を置きます',
        tasks: [
          { kind: 'prune', title: '花がら摘みと花後の剪定', text: '花が終わったらすぐに。遅くとも6月中〜7月上旬までに済ませます。7月ごろから枝先に翌年の花芽ができ始めます。' },
          { kind: 'bud', title: '芽の整理', text: '1か所から車輪のように出る新芽は、伸ばしたい向きの2本ほどを残して元から切ります。' },
          { kind: 'wire', title: '針金かけ', text: '剪定の後の6〜7月が向いています。枝が硬く折れやすいので少しずつ曲げます。' },
        ],
      },
      indoor: {
        place: '屋外の日なた（慣らしてから）。長雨のときは軒下へ',
        fertilizer: '固形肥料を月に1回ほど。または薄めた液体肥料を2週間に1回ほど',
        tasks: [
          { kind: 'repot', title: '植え替えは今月まで', text: '根を土の上に出して見せたいときは、1回の植え替えで1〜2cmほどにします。' },
          { kind: 'prune', title: '剪定・葉刈り', text: '葉が大きくなりすぎた元気な樹は、葉を半分ほど切り取ると、次の葉が小さくそろいます。' },
        ],
      },
    },
  },
  // 7月
  {
    phase: '夏の暑さ',
    lead: '梅雨明けからは水切れを防ぐことがいちばんの仕事です。葉の薄い樹は午後の日差しを避け、鉢を地面やコンクリートから離して置きます。',
    common: [
      { kind: 'water', title: 'ホースの水に注意', text: '日なたのホースの中の水は熱くなっています。最初の水は鉢にかけず、冷たくなってから与えます。' },
      { kind: 'prune', title: '植え替えと強い剪定はしない', text: '暑さで根も葉も回復しにくい時期です。針金かけも、枝が太って食い込みやすいので控えます。' },
    ],
    articles: ['article-15', 'bonsai-watering-master-guide-2025', 'article-23'],
    groups: {
      shohaku: {
        place: '黒松・真柏などは日なたのままでよい（床に直接置かず棚に）。五葉松は午前は日なた、午後は日陰に',
        fertilizer: '真夏は休みます',
        tasks: [
          { kind: 'bud', title: '黒松の芽切りは上旬まで', text: '切った後は水と肥料をやや控えめにして、二番芽を待ちます。乾かしすぎてしおれさせないようにします。', only: ['kuromatsu'] },
          { kind: 'water', title: '夕方の葉水', text: '葉全体に水をかけるとハダニの予防になります。葉が白っぽくかすれたら葉の裏を確かめます。', only: ['shimpaku', 'toshou'] },
          { kind: 'bud', title: '芽摘みは休む', text: '真夏の暑い時期は芽摘みを控えて、樹を休ませます。', only: ['shimpaku'] },
        ],
      },
      zouki: {
        place: '午前は日なた、午後は日陰。西日が当たるなら、すだれや遮光ネットで日差しをやわらげます',
        fertilizer: '真夏は休みます',
        tasks: [
          { kind: 'water', title: '夕方の葉水', text: '葉の周りの温度が下がり、ハダニの予防になります。葉水は土への水やりの代わりにはなりません。' },
          { kind: 'prune', title: '切り戻しを続ける', text: '伸びた枝を、勢いの強いものから切り戻します。', only: ['nirekeyaki'] },
        ],
      },
      hana: {
        place: '午前は日なた、午後は日陰。サルスベリは花つきのため一日中日の当たる場所に',
        fertilizer: '真夏は休みます',
        tasks: [
          { kind: 'water', title: '花芽の時期は水切れさせない', text: '梅・桜・椿・藤などは夏に翌年の花芽ができます。この時期に葉を傷めると、翌年の花が減ります。', except: ['sarusuberi'] },
          { kind: 'prune', title: '強い剪定はしない', text: '花芽を落とさないよう、枝先は切りません。', except: ['sarusuberi', 'fuji'] },
          { kind: 'enjoy', title: 'サルスベリの花', text: '7月から9月ごろまで咲きます。咲き終わった房をすぐ下の葉の少し上で切ると、脇芽が伸びてもう一度咲くことがあります。', only: ['sarusuberi'] },
          { kind: 'prune', title: 'つるを切る', text: '長く伸びたつるを、2〜3芽を残して切ります。', only: ['fuji'] },
        ],
      },
      mi: {
        place: '午前は日なた、午後は日陰。強い西日を避けます',
        fertilizer: '真夏は休みます',
        tasks: [
          { kind: 'water', title: '水切れで実を落とさない', text: '夏に一度でも強く水切れさせると、実が落ちたり秋にしぼんだりします。出かける前と帰宅後に鉢を見ます。' },
          { kind: 'prune', title: '強い剪定はしない', text: '翌年の花芽がつくられる時期です。', only: ['himeringo', 'ringo'] },
          { kind: 'prune', title: '実の先を軽く切る', text: '実がついたのを確かめてから、実より先に長く伸びた枝だけを軽く切り戻します。', only: ['mimono'] },
        ],
      },
      satsuki: {
        place: '午前は日なた、午後は日陰',
        fertilizer: '上旬のお礼肥のあとは、真夏は休みます',
        tasks: [
          { kind: 'prune', title: '剪定は上旬まで', text: '花芽ができ始めるので、それより後に枝先を切ると翌年の花が減ります。' },
          { kind: 'water', title: '夕方の葉水', text: '葉の色が抜けて細かい斑点が出るハダニの予防になります。' },
        ],
      },
      indoor: {
        place: '屋外の日なた、または明るい窓辺',
        fertilizer: '固形肥料を月に1回ほど。または薄めた液体肥料を2週間に1回ほど',
        tasks: [
          { kind: 'prune', title: '剪定は今月まで', text: '伸びすぎた枝を、2〜3枚の葉を残して切り戻します。' },
          { kind: 'water', title: '葉にも水を', text: '葉水でハダニを予防します。' },
        ],
      },
    },
  },
  // 8月
  {
    phase: '暑さのピーク',
    lead: '一年でいちばん水切れしやすい時期です。朝に与えても夕方には乾いていることが多いので、帰宅後にも鉢を見ます。',
    common: [
      { kind: 'water', title: '留守にするとき', text: '2日以上あけるなら、鉢を日陰にまとめ、浅い容器の水に鉢の下3分の1ほどを浸す腰水に。帰ったら普段の水やりに戻します。' },
      { kind: 'water', title: '夕方の葉水', text: '乾燥を好むハダニの予防になります。土への水やりの代わりにはなりません。' },
    ],
    articles: ['article-15', 'article-23', 'bonsai-summer-heat-damage-prevention'],
    groups: {
      shohaku: {
        place: '黒松・真柏などは日なたのまま（照り返しに注意して棚に）。五葉松は午後に日陰になる場所か、すだれの下に',
        fertilizer: '真夏は休みます',
        tasks: [
          { kind: 'bud', title: '芽かき', text: '芽切りの後に出た二番芽が多すぎるところは、下旬から2本ほどに減らします（8月下旬〜9月）。', only: ['kuromatsu'] },
          { kind: 'pest', title: 'ハダニに注意', text: '葉の色がかすれたようになったら、葉の裏を確かめます。', only: ['shimpaku', 'toshou'] },
        ],
      },
      zouki: {
        place: '午前は日なた、午後は日陰。すだれや遮光ネットで西日と照り返しを避けます',
        fertilizer: '真夏は休みます',
        tasks: [
          { kind: 'water', title: '水切れと葉焼けを防ぐ', text: '夏に傷んだ葉は秋にきれいに色づきません。夏の管理がそのまま紅葉につながります。' },
        ],
      },
      hana: {
        place: '午前は日なた、午後は日陰。サルスベリは一日中日の当たる場所に',
        fertilizer: '真夏は休みます',
        tasks: [
          { kind: 'water', title: '花芽の時期は水切れさせない', text: '7〜8月の水切れは、翌春の花が減る原因になります。', except: ['sarusuberi'] },
          { kind: 'prune', title: '枝先を切らない', text: '翌年の花芽を落とさないよう、強く切りません。', except: ['sarusuberi', 'fuji'] },
          { kind: 'pest', title: 'チャドクガに注意', text: '8月中旬ごろから再び発生します。素手で触らず、葉ごと切り取ります。', only: ['tsubaki'] },
          { kind: 'enjoy', title: 'サルスベリの花', text: '早く咲いた房を切ると、夏の終わりにもう一度咲くことがあります。', only: ['sarusuberi'] },
        ],
      },
      mi: {
        place: '午前は日なた、午後は日陰。強い西日を避けます',
        fertilizer: '真夏は休みます',
        tasks: [
          { kind: 'water', title: '水切れで実を落とさない', text: '出かける前と帰宅後に鉢の乾き具合を見ます。' },
        ],
      },
      satsuki: {
        place: '午前は日なた、午後は日陰',
        fertilizer: '真夏は休みます',
        tasks: [
          { kind: 'prune', title: '枝先は切らない', text: '8月以降は、枯れ枝や明らかに飛び出した枝を取る程度にとどめます。' },
          { kind: 'water', title: '強い水切れに注意', text: '一度強く水切れさせると、細い根が傷んで葉が落ち、回復に時間がかかります。' },
        ],
      },
      indoor: {
        place: '屋外の日なた、または明るい窓辺',
        fertilizer: '固形肥料を月に1回ほど。または薄めた液体肥料を2週間に1回ほど',
        tasks: [
          { kind: 'water', title: '葉にも水を', text: '屋外では朝の水やりのときに葉にも水をかけます。' },
        ],
      },
    },
  },
  // 9月
  {
    phase: '秋の生長',
    lead: '暑さがやわらぐと、樹がもう一度よく育ちます。中旬を過ぎたら日当たりのよい場所へ戻し、肥料を再開します。',
    common: [
      { kind: 'place', title: '遮光ネット・すだれを外す', text: '9月中旬を過ぎて日差しがやわらいだら外します。暗くしすぎると枝が間延びします。' },
      { kind: 'water', title: '水やりを少しずつ減らす', text: '気温が下がると乾きが遅くなります。夏の感覚のまま与えすぎないようにします。' },
    ],
    articles: ['article-8', 'article-12', 'bonsai-watering-master-guide-2025'],
    groups: {
      shohaku: {
        place: '中旬からは日当たりのよい棚へ',
        fertilizer: '暑さがやわらいだら再開します（9〜10月）',
        tasks: [
          { kind: 'bud', title: '芽かき', text: '二番芽が多すぎるところを整理します。', only: ['kuromatsu'] },
          { kind: 'prune', title: '芽摘み・枝の整理', text: '9月中旬〜10月に、込み合った枝や内側に向かう枝を付け根から切って透かします。', only: ['shimpaku'] },
        ],
      },
      zouki: {
        place: '中旬からは日当たりのよい場所へ戻します',
        fertilizer: '9月中旬ごろから再開します',
        tasks: [
          { kind: 'prune', title: '切り戻しはこの月まで', text: '5月から続けてきた切り戻しは9月ごろまでです。', only: ['nirekeyaki'] },
          { kind: 'enjoy', title: '赤い実', text: '雌木の山椒は、秋に赤く熟して皮が割れます。観賞するならこの時期まで残します。', only: ['sansho'] },
          { kind: 'fertilizer', title: 'オリーブの秋の肥料', text: '9月下旬〜10月に置きます。', only: ['olive'] },
        ],
      },
      hana: {
        place: '中旬からは日当たりのよい場所へ戻します',
        fertilizer: '暑さがやわらいだら再開します（9月中旬ごろ）',
        tasks: [
          { kind: 'prune', title: '枝は切らない', text: '花芽ができている時期です。秋から冬に枝を切ると、できた花芽を落とします。', except: ['fuji', 'sarusuberi'] },
          { kind: 'enjoy', title: '蕾の数を整える', text: '一つの枝に蕾がたくさんついていたら、9〜10月ごろに1〜2個を残して摘みます。', only: ['tsubaki'] },
          { kind: 'repot', title: '秋の植え替え', text: '春にできなかったときは、9月ごろにも植え替えられます。', only: ['tsubaki'] },
          { kind: 'enjoy', title: '終わりの花', text: '9月に入ってからの房は、そのまま咲かせ終えて構いません。花が終わったら、9月下旬から肥料を置きます。', only: ['sarusuberi'] },
          { kind: 'repot', title: '秋の植え替え', text: '暑さが落ち着いた9月下旬〜10月にも植え替えられます。', only: ['chojubai'] },
        ],
      },
      mi: {
        place: '中旬からは日当たりのよい場所へ戻します',
        fertilizer: '9月中旬ごろから。実の色づきを見ながら早めに切り上げます',
        tasks: [
          { kind: 'enjoy', title: '実が色づく', text: '姫りんごやウメモドキの実が色づき始めます。', only: ['himeringo', 'ringo', 'mimono'] },
          { kind: 'fertilizer', title: '南天の肥料', text: '実が育つ9月ごろに、控えめに置きます。', only: ['nanten'] },
        ],
      },
      satsuki: {
        place: '中旬からは日当たりのよい場所へ戻します',
        fertilizer: '暑さがやわらいだら再開します',
        tasks: [
          { kind: 'prune', title: '枝先は切らない', text: '花芽ができている時期です。' },
        ],
      },
      indoor: {
        place: '屋外の日なた、または明るい窓辺',
        fertilizer: '今月で終えます',
        tasks: [
          { kind: 'water', title: '葉にも水を', text: '乾きやすい間は、葉水でハダニを予防します。' },
        ],
      },
    },
  },
  // 10月
  {
    phase: '養分を蓄える',
    lead: '秋に蓄えた養分が、冬を越す力と春の芽吹きにつながります。肥料は10月の半ばごろまで。松柏類の針金かけが始まります。',
    common: [
      { kind: 'fertilizer', title: '肥料は今月で終える', text: '遅くまで効かせると、枝が冬に向けて固まりきらず寒さで傷みやすくなります。紅葉する樹は色づきも冴えにくくなります。' },
    ],
    articles: ['article-7', 'article-8', 'bonsai-annual-care-calendar-2025'],
    groups: {
      shohaku: {
        place: '日当たりのよい棚',
        fertilizer: '置き肥を続け、10月で終えます',
        tasks: [
          { kind: 'wire', title: '針金かけを始める', text: '樹の動きがゆっくりになる時期です。五葉松・真柏は10月から、杜松は10月下旬から、黒松は11月からが目安です。', except: ['kuromatsu'] },
          { kind: 'prune', title: '剪定', text: '混み合った枝、真上や真下に伸びる枝、交差する枝を元から切ります（10〜2月）。', only: ['goyomatsu'] },
          { kind: 'prune', title: '透かし剪定', text: '込み合った枝を間引いて光を入れます（10〜11月）。', only: ['toshou', 'shimpaku'] },
        ],
      },
      zouki: {
        place: '日当たりのよい場所。秋の日光が紅葉を色づかせます',
        fertilizer: '10月で終えます。遅くまで効かせると紅葉が冴えにくくなります',
        tasks: [
          { kind: 'enjoy', title: '紅葉に向けて', text: '日によく当て、肥料を切り上げておくと、色づきが安定しやすくなります。', except: ['olive', 'sansho'] },
        ],
      },
      hana: {
        place: '日当たりのよい場所',
        fertilizer: '10月中旬ごろまでに終えます',
        tasks: [
          { kind: 'enjoy', title: '秋の花', text: '長寿梅の返り咲きや、バラの秋の花が見られる時期です。', only: ['chojubai', 'bara'] },
          { kind: 'enjoy', title: '蕾の数を整える', text: '1か所にいくつもついた蕾を減らすと、花が大きくそろい、蕾落ちも少なくなります。', only: ['tsubaki'] },
          { kind: 'prune', title: '枝は切らない', text: '翌年の花芽ができています。', except: ['fuji', 'chojubai', 'sarusuberi'] },
        ],
      },
      mi: {
        place: '日当たりのよい場所',
        fertilizer: '10月で終えます',
        tasks: [
          { kind: 'enjoy', title: '実を楽しむ', text: '姫りんごやウメモドキの実が見頃です。', only: ['himeringo', 'ringo', 'mimono'] },
          { kind: 'fertilizer', title: '実を楽しみ終えたら', text: 'ウメモドキは、実を楽しみ終えた後の秋（9月下旬〜10月）に肥料を置きます。', only: ['mimono'] },
        ],
      },
      satsuki: {
        place: '日当たりのよい場所',
        fertilizer: '10月で終えます',
        tasks: [
          { kind: 'prune', title: '枝先は切らない', text: '花芽を抱えて冬を越します。' },
        ],
      },
      indoor: {
        place: '下旬、夜の気温が10℃を切るようになったら室内の明るい窓辺へ取り込みます',
        fertilizer: '与えません（10月以降と冬は休みます）',
        tasks: [
          { kind: 'place', title: '室内へ取り込む', text: '寒さに弱く、最低気温が5℃を下回ると葉が傷み始めます。' },
        ],
      },
    },
  },
  // 11月
  {
    phase: '紅葉・落葉',
    lead: '紅葉を楽しむ月です。葉が落ちたら枝の整理を始め、下旬からは冬の置き場所へ移す準備をします。',
    common: [
      { kind: 'place', title: '冬の置き場所へ', text: '関東の平地では11月下旬から12月ごろに、寒風と霜の当たらない軒下や棚の下段へ移します。寒い地域は1か月ほど早めます。' },
    ],
    articles: ['autumn-maple-bonsai-guide', 'bonsai-winter-care-failure-prevention', 'article-12'],
    groups: {
      shohaku: {
        place: '日当たりのよい棚。寒さに強いので冬も屋外で',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '古葉取り', text: '枝の元に残る古い葉を、指やピンセットで下に引いて抜きます。内側まで光と風が入ります（11〜12月）。', only: ['goyomatsu', 'kuromatsu', 'akamatsu'] },
          { kind: 'wire', title: '針金かけ', text: '古葉取りを済ませた後だと枝が見やすく、針金もかけやすくなります。', except: ['shimpaku'] },
          { kind: 'wire', title: '針金かけは今月まで', text: '真冬は枝が折れやすいので、10〜11月の次は2〜3月にします。', only: ['shimpaku'] },
        ],
      },
      zouki: {
        place: '日当たりのよい場所。下旬からは寒風の当たらない場所へ',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'enjoy', title: '紅葉を楽しむ', text: '関東の平地では、もみじは11月中旬から12月初めごろ、イチョウや欅は11月ごろに色づきます。', except: ['olive', 'sansho'] },
          { kind: 'prune', title: '落葉後の剪定', text: '葉が落ちて枝の流れが見やすくなったら、枝の整理を始めます。', except: ['olive'] },
          { kind: 'prune', title: '落ち葉を取り除く', text: '鉢の上に落ちた葉は取り除きます。', only: ['ichou'] },
        ],
      },
      hana: {
        place: '日当たりのよい場所。下旬からは霜と寒風を避ける場所へ',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '花芽を確かめる', text: '花芽を確かめて、軽く枝を整理する程度にします。寒さに当てて花芽を育てます。', only: ['ume'] },
          { kind: 'enjoy', title: '冬咲きの椿', text: '寒椿など早咲きの品種が咲き始めます。', only: ['tsubaki'] },
          { kind: 'prune', title: '枝は切らない', text: '翌年の花芽を落とさないようにします。', except: ['ume', 'fuji', 'sarusuberi'] },
        ],
      },
      mi: {
        place: '日当たりのよい場所。北風の強い場所は避けます',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'enjoy', title: '実を楽しむ', text: '南天の実は11月ごろから赤く色づきます。鳥に食べられることがあるので、軒下に置くかネットをかけます。', only: ['nanten'] },
          { kind: 'enjoy', title: '実を楽しむ', text: '秋の実が見頃です。', except: ['nanten'] },
        ],
      },
      satsuki: {
        place: '日当たりのよい場所。下旬からは寒風と霜の当たらない場所へ',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '枝先は切らない', text: '花芽を抱えて冬を越します。' },
        ],
      },
      indoor: {
        place: '室内の明るい窓辺。冷暖房の風が当たらない場所に',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'water', title: '水やりの間隔をあける', text: '気温が下がると乾きが遅くなります。' },
        ],
      },
    },
  },
  // 12月
  {
    phase: '休眠に入る',
    lead: '寒風を避ける場所へ移し、水やりは乾いてから晴れた日の午前中に。正月に室内へ飾る樹は、数日で屋外へ戻します。',
    common: [
      { kind: 'place', title: '正月飾りは数日で屋外へ', text: '松や梅など屋外の樹を室内に飾るのは2〜3日までにします。暖房の効きすぎない玄関などが向いています。' },
      FROST,
    ],
    articles: ['bonsai-winter-care-failure-prevention', 'year-end-new-year-bonsai-events-guide', 'bonsai-pruning-master-guide-2025'],
    groups: {
      shohaku: {
        place: '屋外の日当たりのよい棚。小さな鉢は北風の当たらない軒下へ',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '古葉取り', text: 'まだの樹は、前年より古い葉を取り除いて光を入れます。', only: ['goyomatsu', 'kuromatsu', 'akamatsu'] },
          { kind: 'wire', title: '針金かけ', text: '樹の動きが止まる冬が針金かけの時期です。', except: ['shimpaku'] },
          { kind: 'protect', title: '休ませる', text: '真冬は針金かけを避けて休ませます。小さな鉢の凍結を防ぎます。', only: ['shimpaku'] },
        ],
      },
      zouki: {
        place: '屋外の寒風の当たらない場所',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '冬の剪定', text: '落葉後〜2月が基本の剪定の時期です。混み合った枝や内向きの枝を元から切ります。', except: ['olive'] },
          { kind: 'protect', title: '霜と寒風を避ける', text: '軒下や無加温の室内に移します。', only: ['olive'] },
        ],
      },
      hana: {
        place: '屋外で寒さに当てます。霜と寒風は避け、暖かい室内には入れません',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '冬は切りすぎない', text: '花芽ごと切らないよう、切るのは枯れ枝や明らかな忌み枝だけにします。', except: ['fuji', 'sarusuberi'] },
          { kind: 'prune', title: '藤の冬の剪定', text: '葉が落ちて芽が見やすくなったら、花芽を残して葉芽だけの長い枝を切り詰めます。', only: ['fuji'] },
          { kind: 'prune', title: 'サルスベリの剪定', text: '落葉後から3月までの休眠期に行います（2〜3月が適期）。', only: ['sarusuberi'] },
          { kind: 'enjoy', title: '冬咲きの椿', text: '寒風を避け、咲き終わった花がらを摘みます。', only: ['tsubaki'] },
        ],
      },
      mi: {
        place: '屋外。北風の強い場所と、鉢土の凍結を避けます',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'prune', title: '冬の剪定', text: '花芽を確かめながら剪定します（12〜2月）。', only: ['himeringo', 'ringo'] },
          { kind: 'place', title: '正月に飾るとき', text: '暖房の効きすぎない玄関などに三が日ほど飾り、屋外に戻します。室内でも土が乾いたら水を与えます。', only: ['nanten', 'senryo'] },
        ],
      },
      satsuki: {
        place: '屋外の寒風と霜の当たらない軒下など',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'wire', title: '太い枝の剪定・針金かけ', text: '樹形を大きく変えるなら休眠中に。少しずつ形を付けます。' },
        ],
      },
      indoor: {
        place: '室内の明るい窓辺。夜は窓から離し、暖房の風を避けます',
        fertilizer: NO_FERTILIZER,
        tasks: [
          { kind: 'protect', title: '夜の窓際に注意', text: '夜は窓ガラスの近くが外と同じくらい冷え込みます。厚手のカーテンの内側に入れます。' },
          { kind: 'water', title: '葉水', text: '暖房で乾燥するので、霧吹きで葉に水をかけます。' },
        ],
      },
    },
  },
]

export const CARE_CALENDAR: MonthCare[] = MONTHS.map((source, i) => {
  const month = i + 1
  const groups = {} as Record<CareGroupKey, GroupMonthCare>
  for (const group of CARE_GROUPS) {
    groups[group.key] = { water: water(group.key, month), ...source.groups[group.key] }
  }
  return { month, ...source, groups }
})

export const MONTH_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1)

export function isValidMonth(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12
}

export function getMonthCare(month: number): MonthCare {
  return CARE_CALENDAR[(isValidMonth(month) ? month : 1) - 1]
}

// 樹種に当てはまる作業か
export function taskAppliesTo(task: CareTask, speciesKey: string): boolean {
  if (task.only && !task.only.includes(speciesKey)) return false
  if (task.except && task.except.includes(speciesKey)) return false
  return true
}

// ある樹種のその月の手入れ（グループの作業のうち、その樹種に当てはまるもの）
export function careForSpecies(month: number, speciesKey: string): (GroupMonthCare & { group: CareGroupKey }) | null {
  const group = groupOf(speciesKey)
  if (!group) return null
  const care = getMonthCare(month).groups[group]
  return { ...care, group, tasks: care.tasks.filter(t => taskAppliesTo(t, speciesKey)) }
}

// 一覧で見せるときの、作業の対象（「梅・桜」など）。グループ全体なら null
export function taskTargetLabel(task: CareTask): string | null {
  if (task.only) return task.only.map(speciesLabel).join('・')
  if (task.except) return `${task.except.map(speciesLabel).join('・')}以外`
  return null
}
