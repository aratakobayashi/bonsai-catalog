import type { Product } from '@/types'

// 特集ページ（購入を検討している人向けの選び方＋比較ページ）の定義
// 本文は一般的な知識の範囲で書き、体験談や根拠のない効果はうたわない

export interface SelectionSection {
  heading: string
  paragraphs: string[]
  points?: string[]
}

export interface Selection {
  slug: string
  title: string
  description: string
  h1: string
  lead: string
  sections: SelectionSection[]
  listHeading: string
  // 掲載する商品の条件
  filter: (product: Product) => boolean
  sort?: (a: Product, b: Product) => number
  limit?: number
}

const text = (p: Product) => `${p.name} ${(p.tags || []).join(' ')} ${p.description || ''}`

export const SELECTIONS: Selection[] = [
  {
    slug: 'new-year-bonsai',
    title: '正月に飾る盆栽の選び方｜松・梅・南天など縁起物の盆栽を比較 - 盆栽コレクション',
    description: '正月飾りにする盆栽の選び方をまとめました。松竹梅や南天など縁起物とされる樹種、飾る場所と期間、届いてからの管理のポイントと、通販で買える盆栽の比較表を掲載しています。',
    h1: '正月に飾る盆栽の選び方',
    lead: '松竹梅や南天は、昔から慶事の縁起物として親しまれてきた植物です。正月飾りとして盆栽を選ぶときのポイントと、通販で買える松・梅・南天などの盆栽をまとめました。',
    sections: [
      {
        heading: '正月飾りに選ばれる主な樹種',
        paragraphs: [
          '松・竹・梅の「松竹梅」は、冬の寒さの中でも緑を保つ松と竹、早春に花を咲かせる梅の組み合わせで、おめでたい席の飾りとして定番です。',
          '南天は「難を転ずる」に通じる語呂合わせから縁起物とされ、冬に赤い実をつける姿が正月飾りによく使われます。',
        ],
        points: [
          '松（五葉松・黒松）：一年中緑を保つ常緑樹。正月飾りの中心になる樹種',
          '梅（長寿梅・白梅）：花の時期は品種で異なる。長寿梅は四季咲き性があり、時期を問わず花を楽しみやすい',
          '南天：赤い実が冬の彩りになる。縁起物として贈り物にも選ばれる',
        ],
      },
      {
        heading: '選ぶときのポイント',
        paragraphs: [
          '飾る場所の広さに合わせてサイズを選びます。玄関の棚やテーブルに置くなら、ミニ盆栽〜小品（高さ10〜20cm程度）が扱いやすい大きさです。',
          '年末は配送が混み合います。正月に間に合わせたい場合は、各ショップの年末年始の発送スケジュールを確認し、余裕をもって注文するのがおすすめです。',
        ],
      },
      {
        heading: '届いてからの管理',
        paragraphs: [
          '松や梅などの多くの盆栽は、本来は屋外で育てる植物です。室内に飾るのは正月の数日間にとどめ、普段は日当たりと風通しのよい屋外で管理しましょう。',
          '暖房の風が直接当たる場所は乾燥しやすいため避けます。水やりは土の表面が乾いたらたっぷり与えるのが基本です。',
        ],
      },
    ],
    listHeading: '正月飾りにおすすめの盆栽（松・梅・南天など）',
    // 「松柏類」の「松」には反応させない
    filter: p => /(?<!真)松(?!柏)|梅|南天|竹|縁起/.test(`${p.name} ${(p.tags || []).join(' ')}`),
    sort: (a, b) => a.price - b.price,
    limit: 15,
  },
  {
    slug: 'beginner-mini-bonsai',
    title: '初心者向けミニ盆栽の選び方｜育てやすい樹種とサイズ・価格を比較 - 盆栽コレクション',
    description: 'はじめての盆栽におすすめのミニ盆栽・小品盆栽を、樹種・サイズ・育てやすさ・参考価格で比較できます。初心者が選ぶときのポイントと、最初にそろえたい道具もまとめました。',
    h1: '初心者向けミニ盆栽の選び方',
    lead: 'はじめて盆栽を育てるなら、手のひらに乗るミニ盆栽や小品盆栽から始めると、置き場所に困らず手入れの基本も身につけやすくなります。育てやすさの目安とあわせて比較できるようにまとめました。',
    sections: [
      {
        heading: 'はじめての1鉢を選ぶポイント',
        paragraphs: [
          '最初の1鉢は「丈夫で、季節の変化がわかりやすい樹種」を選ぶと、管理の手応えを感じやすくなります。',
        ],
        points: [
          '樹種：五葉松などの松柏類は一年中緑を楽しめ、もみじなどの雑木類は新緑や紅葉で季節を感じられる',
          'サイズ：ミニ・小品は場所を取らない一方、鉢が小さく土が乾きやすいので水切れに注意する',
          '育てやすさ：下の表の「難易度」を目安に、まずは「初心者OK」のものから選ぶ',
        ],
      },
      {
        heading: '置き場所と水やりの基本',
        paragraphs: [
          '盆栽の多くは屋外で育てる植物です。日当たりと風通しのよい場所に置き、室内に飾るのは短時間にとどめると元気に育ちます。',
          '水やりは「土の表面が乾いたら、鉢底から流れ出るまでたっぷり」が基本です。小さな鉢ほど乾きやすいので、夏場は特にこまめに様子を見ましょう。',
        ],
      },
      {
        heading: '最初にそろえたい道具',
        paragraphs: [
          '始めるときに必要な道具は多くありません。まずは水やり用のジョウロ（ハス口の細かいもの）と、伸びた枝や葉を整える剪定ばさみがあれば十分です。',
        ],
      },
    ],
    listHeading: '初心者向けのミニ盆栽・小品盆栽',
    filter: p => (p.size_category === 'mini' || p.size_category === 'small') &&
      (p.difficulty_level === 1 || (p.difficulty_level === 2 && p.beginner_friendly === true)),
    sort: (a, b) => (a.difficulty_level ?? 2) - (b.difficulty_level ?? 2) || a.price - b.price,
    limit: 18,
  },
  {
    slug: 'bonsai-gift',
    title: '盆栽ギフトの選び方｜予算・相手別に贈りやすい盆栽を比較 - 盆栽コレクション',
    description: '母の日・敬老の日・誕生日・お祝いに贈る盆栽の選び方をまとめました。予算の目安、相手に合わせた樹種の選び方、贈るときの注意点と、通販で買える盆栽の比較表を掲載しています。',
    h1: '盆栽ギフトの選び方',
    lead: '盆栽は、季節の花や紅葉を長く楽しめる贈り物として、母の日や敬老の日、新築・開店祝いなどに選ばれています。贈る相手や予算に合わせた選び方と、贈りやすい盆栽をまとめました。',
    sections: [
      {
        heading: '予算の目安',
        paragraphs: [
          '盆栽の価格はサイズや樹種、鉢によって大きく変わります。手軽な贈り物ならミニ盆栽、特別なお祝いなら鉢や樹形にこだわった小品・中品と、予算に合わせて選べます。下の比較表で掲載中の盆栽のサイズ別の参考価格を確認できます。',
        ],
      },
      {
        heading: '相手に合わせた選び方',
        paragraphs: [
          '盆栽を育てた経験がない方への贈り物なら、手入れの負担が少ないミニ盆栽や、花・実が楽しめる樹種が喜ばれやすい選択です。',
        ],
        points: [
          '花を楽しんでほしい：桜・梅・藤などの花もの',
          '長く緑を楽しんでほしい：五葉松などの松柏類',
          '季節の移ろいを楽しんでほしい：もみじなどの雑木類',
        ],
      },
      {
        heading: '贈るときの注意点',
        paragraphs: [
          '盆栽は生き物なので、受け取った方がすぐに置き場所や水やりを確認できるよう、簡単な育て方のメモを添えると親切です。',
          '花の時期を合わせたい場合は、商品ページで開花時期や発送時期を確認しておきましょう。ラッピングやメッセージカードの対応は販売店によって異なります。',
        ],
      },
    ],
    listHeading: '贈り物に選ばれている盆栽',
    filter: p => p.gift_suitable === true || /ギフト|プレゼント|贈|縁起|花もの/.test(text(p)) || p.category === '花もの',
    sort: (a, b) => a.price - b.price,
    limit: 18,
  },
]

export function getSelection(slug: string): Selection | undefined {
  return SELECTIONS.find(selection => selection.slug === slug)
}

// 同じ商品名の重複登録をまとめる
export function pickSelectionProducts(selection: Selection, products: Product[]): Product[] {
  const seen = new Set<string>()
  const unique = products.filter(p => {
    if (seen.has(p.name)) return false
    seen.add(p.name)
    return true
  })
  const picked = unique.filter(selection.filter)
  if (selection.sort) picked.sort(selection.sort)
  return picked.slice(0, selection.limit ?? picked.length)
}
