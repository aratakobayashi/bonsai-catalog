// 「はじめての1か月ガイド」（/hajimete）：盆栽が届いた日から1か月の世話を、チェックしながら進める
// 内容は記事 article-11（届いてから1か月の世話）・bonsai-online-sales-complete-guide（届いた日から1週間）・
// article-12（置き場所）・bonsai-watering-master-guide-2025（水やり）・article-19 などに合わせている

export type TreeKind = 'shohaku' | 'zoki' | 'hana' | 'mi' | 'satsuki' | 'indoor'

export interface KindTips {
  value: TreeKind
  label: string
  note: string
  // 届いた日の休ませ方
  arrive: string
  // いつもの置き場所
  place: string
  // 水やり
  water: string
  // この樹で気をつけたいこと
  care: string
  articles: string[]
  // /soroeru の group
  soroeruGroup: 'shohaku' | 'zoki' | 'hana' | 'satsuki' | 'indoor'
}

export const KINDS: KindTips[] = [
  {
    value: 'shohaku',
    label: '松柏類',
    note: '黒松・五葉松・真柏など',
    arrive: '屋外の明るい日陰で2〜3日休ませます。',
    place: '日当たりと風通しのよい屋外の棚の上。よく日に当てるほど葉が締まります。五葉松は夏の午後だけ日陰にします。',
    water: '表面がしっかり乾いてから、鉢底から流れるまで与えます。いつも湿った状態を嫌います。冬も葉から水が出ていくので、乾き具合は毎日見ます。',
    care: '葉が硬く、しおれが目に見えにくい樹です。葉の色がくすむ、新芽の先が垂れるといった小さな変化に気をつけます。',
    articles: ['article-42', 'article-20', 'article-6'],
    soroeruGroup: 'shohaku',
  },
  {
    value: 'zoki',
    label: '雑木類',
    note: 'もみじ・欅など',
    arrive: '屋外の明るい日陰で2〜3日休ませます。',
    place: '春と秋はよく日の当たる屋外の棚の上。真夏は午前中に日が当たり、午後は日陰になる場所にします。',
    water: '水を好み、水切れすると葉先が茶色く縮れやすい樹です。夏は朝に加えて、夕方にも土を見ます。',
    care: '秋から冬に葉を落とすのは自然な変化です。冬も屋外で寒さに当てると、春の芽吹きがそろいます。',
    articles: ['article-1', 'keyaki-guide', 'autumn-maple-bonsai-guide'],
    soroeruGroup: 'zoki',
  },
  {
    value: 'hana',
    label: '花もの',
    note: '梅・桜・長寿梅など',
    arrive: '屋外の明るい日陰で2〜3日休ませます。花の時期に届いたら、室内に2〜3日飾ってから屋外へ移してもかまいません。',
    place: '日当たりのよい屋外の棚の上。日が足りないと枝ばかり伸びて、翌年の花が少なくなります。',
    water: '乾いたら鉢底から流れるまで与えます。花が咲いている間は、花に水がかからないよう株元に注ぎます。夏の水切れは翌年の花芽に響きます。',
    care: '剪定は花後すぐが基本です。秋や冬に枝を短く切ると、できていた花芽を落とします。冬は暖かい室内に入れず、屋外で寒さに当てます。',
    articles: ['article-43', 'article-39', 'article-3'],
    soroeruGroup: 'hana',
  },
  {
    value: 'mi',
    label: '実もの',
    note: '姫リンゴ・ウメモドキ・南天など',
    arrive: '屋外の明るい日陰で2〜3日休ませます。実がついていれば、実に触れないよう鉢の縁を持って運びます。',
    place: '日当たりのよい屋外の棚の上。花の時期に長雨が続くときは、雨の当たらない日なたの軒下へ移します。',
    water: '実がついている間と夏は、乾かさないようにします。夏の水切れで、いったんついた実が落ちることがあります。',
    care: 'ウメモドキのように雌木と雄木が別の樹や、姫リンゴのように別の品種の花粉が要る樹があります。樹種名を確かめておきます。',
    articles: ['article-2', 'umemodoki-bonsai-guide', 'nanten-guide'],
    soroeruGroup: 'hana',
  },
  {
    value: 'satsuki',
    label: 'さつき',
    note: 'さつき・つつじ',
    arrive: '屋外の明るい日陰で2〜3日休ませます。',
    place: '日当たりと風通しのよい屋外の棚の上。夏の強い西日は避けます。',
    water: '鹿沼土は乾くと白っぽく、湿ると黄色っぽくなります。表面が白っぽくなったら鉢底から流れるまで与えます。細い根は乾きに弱く、真夏は朝夕2回の日もあります。',
    care: '花が終わった直後の花がら摘みと剪定で、翌年の花が決まります。土は鹿沼土を使います。',
    articles: ['article-49', 'azalea-guide'],
    soroeruGroup: 'satsuki',
  },
  {
    value: 'indoor',
    label: '室内向き',
    note: 'ガジュマルなど',
    arrive: '直射日光の当たらない、室内の明るい場所で2〜3日休ませます。',
    place: 'レースカーテン越しに光が入る窓辺。エアコンの風が当たる場所と部屋の奥は避け、冬の夜は窓から離します。1〜2週間に一度、鉢を回して全体に光を当てます。',
    water: '表面が乾いたら、流しなどで鉢底から流れるまで与え、水が切れてから戻します。受け皿の水は捨てます。冬は乾いてから2〜3日あけ、室温に近い水を与えます。',
    care: '寒さに弱い樹です。冬は室内で、夜の窓際の冷えに気をつけます。エアコンで乾く部屋では、霧吹きで葉に水をかけます。',
    articles: ['gajumaru-bonsai-guide', 'article-25', 'bonsai-indoor-cultivation-success-guide'],
    soroeruGroup: 'indoor',
  },
]

export function parseKind(params: Record<string, string | string[] | undefined>): KindTips | null {
  const raw = Array.isArray(params.shu) ? params.shu[0] : params.shu
  return KINDS.find(k => k.value === raw) ?? null
}

export interface CheckItem {
  id: string
  text: string
  // 樹の種類を選んだときに添える助言
  tip?: 'arrive' | 'place' | 'water' | 'care'
  link?: { href: string; label: string }
}

export interface Stage {
  key: string
  label: string
  summary: string
  items: CheckItem[]
}

export const STAGES: Stage[] = [
  {
    key: 'day0',
    label: '届いた日',
    summary: '運ばれてきた樹は少し疲れています。傷みを確かめて、休ませるところまでで十分です。',
    items: [
      { id: 'd0-open', text: '箱の天地を確かめてすぐ開け、幹や枝ではなく鉢の縁を両手で持って取り出す' },
      { id: 'd0-check', text: '枝折れ・鉢の割れ・土のこぼれ・葉のしおれを見る。傷みがあれば、片付ける前に写真を撮って販売元へ連絡する' },
      { id: 'd0-unwrap', text: '固定用の針金やテープ、土の表面を覆う紙やネットを外す。緩衝材で曲がった枝は無理に戻さない' },
      { id: 'd0-water', text: '土を触り、乾いていれば鉢底から流れるまで水を与える。湿っていれば翌日まで待つ' },
      { id: 'd0-rest', text: '直射日光と強い風を避けた明るい場所で休ませる', tip: 'arrive' },
      { id: 'd0-keep', text: '添えられた育て方の説明と樹種名を、捨てずに取っておく' },
    ],
  },
  {
    key: 'day1',
    label: '1〜3日目',
    summary: '毎朝、土の乾き具合を見るところから始めます。置き場所は2〜3日たってから決めておいた場所へ。',
    items: [
      { id: 'd1-morning', text: '毎朝、土の表面を見る。乾いて白っぽくなっていたら、鉢底から流れるまで水を与える', tip: 'water' },
      { id: 'd1-place', text: '2〜3日たったら、決めておいた置き場所へ移す。日に当てる時間は数日かけて延ばす', tip: 'place', link: { href: '/guides/article-12', label: '置き場所の考え方' } },
      { id: 'd1-saucer', text: '受け皿は使わない。室内で使うときは、水やりを流しで済ませ、水が切れてから戻す' },
      { id: 'd1-wait', text: '剪定・植え替え・肥料はまだしない。鉢が小さく見えても、植え替えは次の適期まで待つ' },
    ],
  },
  {
    key: 'week1',
    label: '1週目',
    summary: '水やりの判断に慣れる週です。毎回、与える前に乾き具合を確かめます。',
    items: [
      { id: 'w1-judge', text: '与える前に、土の色・指で触った湿り気・鉢の重さで乾き具合を確かめる', link: { href: '/guides/bonsai-watering-master-guide-2025', label: '水やりの見分け方' } },
      { id: 'w1-weight', text: '水やり直後に一度鉢を持ち上げて、重さを覚えておく（乾いたときの軽さで分かるようになります）' },
      { id: 'w1-bugs', text: '葉の裏と新芽に虫がついていないかを見る' },
      { id: 'w1-leaves', text: '枯れた葉や鉢に落ちた葉を、ピンセットで取り除く' },
      { id: 'w1-tools', text: '盆栽ばさみ・ハス口のじょうろ・ピンセットの3つをそろえる', link: { href: '/soroeru', label: '道具をそろえる' } },
      { id: 'w1-photo', text: '落ち着いたら、正面・横・根元の写真を、物差しを添えて撮っておく' },
    ],
  },
  {
    key: 'week2',
    label: '2週目',
    summary: '樹の様子を見る目を育てる週です。気になる変化があれば、症状から原因を調べます。',
    items: [
      { id: 'w2-look', text: '朝の水やりのとき、葉の張りとつやを一度見る' },
      { id: 'w2-yellow', text: '葉が数枚落ちたり黄色くなったりしても、新しい芽が動いていれば環境の変化によるものが多い。続くときは症状から調べる', link: { href: '/shojo', label: '症状から調べる' } },
      { id: 'w2-rain', text: '雨の翌朝も、鉢の土まで濡れているかを見てから水やりを決める' },
      { id: 'w2-shelf', text: '棚や台の上に置き、鉢の間は葉が触れ合わない程度にあける（地面やコンクリートに直接置かない）' },
      { id: 'w2-care', text: '樹種の記事で、この樹で気をつけたいことを確かめる（上で樹の種類を選ぶと、ここに要点が出ます）', tip: 'care' },
    ],
  },
  {
    key: 'week34',
    label: '3〜4週目',
    summary: '毎日の世話が習慣になってきたら、これから先の手入れの予定を立てます。',
    items: [
      { id: 'w4-weekly', text: '週に一度、葉の裏・新芽・枝の付け根を見る' },
      { id: 'w4-fertilizer', text: '肥料の予定を決める。販売元が与えているかを確かめ、与えるなら春か秋に少量から。真夏と冬、弱っている樹には与えない', link: { href: '/guides/article-8', label: '肥料の与え方' } },
      { id: 'w4-next', text: '剪定や植え替えの次の適期を、樹種ごとの記事で確かめておく', link: { href: '/teire', label: '手入れの時期を見る' } },
      { id: 'w4-away', text: '留守にする予定があれば、水やりの段取りを決める（夏の腰水は留守の間だけ）', link: { href: '/guides/article-23', label: '留守中の水やり' } },
      { id: 'w4-compare', text: '1か月たったら、最初の写真と同じ向きで撮って見比べる' },
    ],
  },
]

export const ALL_CHECK_IDS = STAGES.flatMap(s => s.items.map(i => i.id))

// 今の季節に気をつけたいこと（関東の平地の目安。記事 bonsai-watering-master-guide-2025・article-12 と同じ内容）
export function seasonNote(month: number): { label: string; text: string } {
  if (month >= 3 && month <= 5) return { label: '春（3〜5月）', text: '芽吹きとともに乾きが早くなります。水やりは朝が基本です。遅霜の予報が出た夜は軒下へ移します。' }
  if (month === 6) return { label: '梅雨（6〜7月上旬）', text: '雨が続いても、葉に遮られて土が乾いていることがあります。長雨のときは軒下へ移し、蒸れを防ぎます。' }
  if (month === 7 || month === 8) return { label: '夏（7〜9月上旬）', text: '一年で最も水切れしやすい時期です。朝にたっぷり与え、夕方にも乾いていればもう一度。日中の暑い時間の水やりは避け、棚に上げて照り返しを防ぎます。' }
  if (month === 9) return { label: '9月', text: '上旬までは夏と同じく朝夕に鉢を見ます。中旬から涼しくなるにつれ乾きが遅くなるので、夏の回数のまま与えすぎないようにします。' }
  if (month === 10 || month === 11) return { label: '秋（9月中旬〜11月）', text: '涼しくなるにつれ乾きが遅くなります。夏の感覚のまま与えすぎないようにし、日当たりのよい場所に置きます。11月下旬からは冬の置き場所の準備をします。' }
  return { label: '冬（12〜2月）', text: '乾きがゆっくりになります。乾いたのを確かめてから晴れた日の午前中に与えます。屋外の樹は霜と北風の当たらない軒下や棚の下段へ移します。' }
}
