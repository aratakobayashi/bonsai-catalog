// 検索でよく調べられている条件（室内・予算・季節・樹種・用途）ごとの特集
// 本文は一般的な知識の範囲で書き、体験談や根拠のない効果はうたわない
import type { Selection } from './selections'
import type { CatalogProduct } from '@/lib/catalog-model'

const byReviews = (a: CatalogProduct, b: CatalogProduct) => b.reviewCount - a.reviewCount || a.price - b.price

export const EXTRA_SELECTIONS: Selection[] = [
  {
    slug: 'indoor-bonsai',
    title: '室内に置きやすい盆栽の選び方｜ガジュマルなど室内向きの樹種と置き場所 - 盆栽コレクション',
    description: '室内で育てやすい盆栽の選び方をまとめました。ガジュマルなど室内向きの樹種、松やもみじなど屋外向きの盆栽を室内に飾るときの注意点、置き場所のポイントと、通販で買える盆栽の比較表を掲載しています。',
    h1: '室内に置きやすい盆栽の選び方',
    eyebrow: '特集・室内で楽しむ',
    shortTitle: '室内で楽しむ盆栽',
    tagline: 'ガジュマルなど室内向きの樹種',
    thumbnail: '/images/selections/indoor-bonsai.svg',
    lead: '「部屋に飾りたい」という方は多いものの、盆栽の多くは本来屋外で育てる植物です。室内でも育てやすい樹種と、屋外向きの盆栽を室内で楽しむときのコツをまとめました。',
    sections: [
      {
        heading: '室内でも育てやすい樹種',
        paragraphs: [
          'ガジュマルやフィカスの仲間は寒さに弱く、冬は室内の明るい場所で管理する植物です。そのため、一年を通して室内に置きやすい樹種として選ばれています。',
        ],
        points: [
          'ガジュマル：太くふくらんだ根や幹が特徴。明るい窓辺に置き、冬は寒さに当てないようにする',
          'フィカス（ベンジャミンなど）：葉が小さく樹形を整えやすい。急な環境の変化で葉を落とすことがある',
          '販売店が「室内向け」と書いている盆栽：商品ごとの説明で、置き場所の条件を確認する',
        ],
      },
      {
        heading: '屋外向きの盆栽を室内で楽しむには',
        paragraphs: [
          '松やもみじ、桜などの多くの盆栽は、日光と風に当たることで元気に育ちます。室内に飾るのは数日程度にとどめ、普段は屋外のベランダや庭で管理するのが基本です。',
        ],
        aside: {
          eyebrow: '飾るときの目安',
          title: '室内は数日、普段は屋外へ',
          text: '来客のときや季節の飾りとして室内に置き、また屋外に戻す楽しみ方なら、屋外向きの樹種でも無理なく楽しめます。',
        },
      },
      {
        heading: '室内の置き場所のポイント',
        paragraphs: [
          'レースのカーテン越しに光が入る明るい窓辺が向いています。エアコンの風が直接当たる場所は乾燥しやすいため避けましょう。',
          '室内は土が乾きにくいこともあります。水やりは土の表面が乾いたのを確かめてから与えます。',
        ],
      },
    ],
    listHeading: '室内に置きやすい盆栽（樹種の目安・販売店の表記より）',
    // 屋外向きの樹種（松・桜など）は、販売店が「室内」と書いていても載せない（本文の説明と食い違うため）
    filter: p => p.speciesLabel ? ['ガジュマル', 'フィカス'].includes(p.speciesLabel) : p.indoor,
    sort: byReviews,
    limit: 18,
    catalog: {
      all: '/products?place=indoor',
      chips: [
        { label: 'ガジュマル', href: '/products?place=indoor&species=gajumaru' },
        { label: '〜3,000円', href: '/products?place=indoor&max=3000' },
        { label: '苔玉', href: '/products?place=indoor&type=kokedama' },
      ],
    },
  },
  {
    slug: 'bonsai-under-3000',
    title: '3,000円以下で始める盆栽｜手頃なミニ盆栽・苔玉の選び方 - 盆栽コレクション',
    description: '3,000円以下で買える盆栽・苔玉をまとめました。手頃な価格で選ぶときのポイント、送料や鉢の有無など購入前に確認したいこと、通販で買える盆栽の比較表を掲載しています。',
    h1: '3,000円以下で始める盆栽',
    eyebrow: '特集・予算から',
    shortTitle: '3,000円以下の盆栽',
    tagline: '手頃に始められるミニ盆栽・苔玉',
    thumbnail: '/images/selections/bonsai-under-3000.svg',
    lead: 'まずは手頃な価格で試してみたい、という方に向けて、3,000円以下で買える盆栽と苔玉を集めました。安さだけで選ばないためのポイントもあわせて紹介します。',
    sections: [
      {
        heading: 'この価格帯で選べるもの',
        paragraphs: [
          '3,000円以下では、手のひらサイズのミニ盆栽や苔玉、育てながら形を作っていく若い木（素材・苗）が中心になります。',
        ],
        points: [
          'ミニ盆栽：場所を取らず、はじめての一鉢に向く。小さな鉢は乾きやすいので水やりはこまめに',
          '苔玉：器にのせて飾る楽しみ方。苔が乾かないよう、受け皿で水分を保つ',
          '素材・苗：自分で樹形を作っていく楽しみがある。完成した盆栽とは見た目が異なる',
        ],
      },
      {
        heading: '購入前に確認したいこと',
        paragraphs: [
          '価格が手頃でも、送料を含めると予算を超えることがあります。送料無料かどうか、鉢や受け皿が付いているかを商品ページで確認しましょう。',
          '写真が「現品」か「見本（イメージ）」かも確認しておくと、届いたときの印象の違いを防げます。',
        ],
      },
    ],
    listHeading: '3,000円以下で買える盆栽・苔玉',
    filter: p => p.price > 0 && p.price <= 3000,
    sort: byReviews,
    limit: 24,
    catalog: {
      all: '/products?max=3000&sort=reviews',
      chips: [
        { label: '送料無料', href: '/products?max=3000&flag=free_shipping' },
        { label: 'ミニ盆栽', href: '/products?max=3000&species=mini' },
        { label: '苔玉', href: '/products?max=3000&type=kokedama' },
      ],
    },
  },
  {
    slug: 'autumn-leaves-bonsai',
    title: '紅葉を楽しむ盆栽の選び方｜もみじ・欅など紅葉する樹種と育て方 - 盆栽コレクション',
    description: '紅葉を楽しめる盆栽の選び方をまとめました。もみじ・楓・欅などの紅葉する樹種、きれいに色づくための管理のポイントと、通販で買える盆栽の比較表を掲載しています。',
    h1: '紅葉を楽しむ盆栽の選び方',
    eyebrow: '特集・秋',
    shortTitle: '紅葉を楽しむ盆栽',
    tagline: 'もみじ・欅など季節の移ろいを',
    thumbnail: '/images/selections/autumn-leaves-bonsai.svg',
    lead: '春の芽吹き、夏の青葉、秋の紅葉、冬の枝ぶりと、季節ごとに姿を変える雑木の盆栽。秋に紅葉を楽しめる樹種と、色づきをよくするための管理のポイントをまとめました。',
    sections: [
      {
        heading: '紅葉を楽しめる主な樹種',
        paragraphs: [
          '紅葉する盆栽は、落葉する「雑木類」に多く見られます。',
        ],
        points: [
          'もみじ・楓：紅葉の代表。品種によって赤や黄色に色づく',
          '欅（けやき）：枝がほうきのように広がる樹形。秋には黄色〜赤褐色に色づく',
          'イチョウ・ブナ：黄葉を楽しめる樹種',
        ],
      },
      {
        heading: 'きれいに色づかせるには',
        paragraphs: [
          '日当たりのよい屋外で育て、昼と夜の寒暖差を感じられる環境に置くことが、色づきをよくするポイントとされています。',
          '一方で、真夏の強い西日は葉焼けの原因になります。夏は半日陰に移すなど、葉を傷めないように管理すると秋まで葉を楽しめます。',
        ],
      },
    ],
    listHeading: '紅葉・新緑を楽しめる盆栽（樹種の目安より）',
    filter: p => p.enjoy.includes('leaf_color'),
    sort: byReviews,
    limit: 18,
    catalog: {
      all: '/products?type=tree&enjoy=leaf_color',
      chips: [
        { label: 'もみじ', href: '/products/category/momiji' },
        { label: '欅', href: '/products/category/keyaki' },
        { label: 'ミニ', href: '/products?type=tree&enjoy=leaf_color&size=mini' },
      ],
    },
  },
  {
    slug: 'flowering-bonsai',
    title: '花を楽しむ盆栽の選び方｜梅・桜・さつきなど季節の花もの盆栽 - 盆栽コレクション',
    description: '花を楽しめる盆栽（花もの盆栽）の選び方をまとめました。梅・桜・さつき・長寿梅など季節ごとの花、花を咲かせるための管理のポイントと、通販で買える盆栽の比較表を掲載しています。',
    h1: '花を楽しむ盆栽の選び方',
    eyebrow: '特集・花もの',
    shortTitle: '花を楽しむ盆栽',
    tagline: '梅・桜・さつきなど季節の花',
    thumbnail: '/images/selections/flowering-bonsai.svg',
    lead: '小さな樹に咲く花は、花もの盆栽ならではの楽しみです。季節ごとに花を楽しめる樹種と、毎年花を咲かせるための管理のポイントをまとめました。',
    sections: [
      {
        heading: '季節ごとの花の目安',
        paragraphs: [
          '開花の時期は品種や地域、その年の気候によって変わります。購入前に商品ページで開花時期や発送時期を確認しましょう。',
        ],
        points: [
          '梅：冬の終わりから早春にかけて咲く',
          '桜：春に咲く。一才桜や旭山桜など小さな樹でも咲きやすい品種が選ばれる',
          'さつき：5〜6月ごろに咲く。品種がとても多い',
          '長寿梅：春のほか、秋にも花を咲かせることがある',
        ],
      },
      {
        heading: '毎年花を咲かせるには',
        paragraphs: [
          '花芽をつけるには日光が欠かせません。日当たりのよい屋外で育てるのが基本です。',
          '花が終わったら花がらを摘み、肥料を与えて翌年の花芽づくりに備えます。開花中は水切れに特に注意しましょう。',
        ],
      },
    ],
    listHeading: '花を楽しめる盆栽（樹種の目安より）',
    filter: p => p.enjoy.includes('flower'),
    sort: byReviews,
    limit: 18,
    catalog: {
      all: '/products?type=tree&enjoy=flower',
      chips: [
        { label: '桜', href: '/products/category/sakura' },
        { label: '梅・長寿梅', href: '/products/category/ume' },
        { label: 'さつき', href: '/products/category/satsuki' },
      ],
    },
  },
  {
    slug: 'fruit-bonsai',
    title: '実ものの盆栽の選び方｜姫りんご・南天など実を楽しむ盆栽 - 盆栽コレクション',
    description: '実を楽しめる盆栽（実もの盆栽）の選び方をまとめました。姫りんご・南天・ピラカンサなどの樹種、実をつけるための管理のポイントと、通販で買える盆栽の比較表を掲載しています。',
    h1: '実ものの盆栽の選び方',
    eyebrow: '特集・実もの',
    shortTitle: '実ものの盆栽',
    tagline: '姫りんご・南天など秋冬の彩り',
    thumbnail: '/images/selections/fruit-bonsai.svg',
    lead: '秋から冬にかけて、小さな実がなる姿を楽しめるのが実もの盆栽です。主な樹種と、実をつけるためのポイントをまとめました。',
    sections: [
      {
        heading: '実を楽しめる主な樹種',
        paragraphs: [
          '実の色や形、見ごろの時期は樹種によって異なります。',
        ],
        points: [
          '姫りんご：春に花、秋に小さな実をつける実もの盆栽の定番',
          '南天：冬に赤い実をつける常緑の低木。縁起物として正月飾りにも使われる',
          'ピラカンサ・梅もどき：秋から冬に赤や橙色の実をたくさんつける',
        ],
      },
      {
        heading: '実をつけるためのポイント',
        paragraphs: [
          '樹種によっては、実をつけるために別の品種の花粉が必要な場合があります（受粉樹）。実を楽しみたい場合は、商品ページで受粉樹の要否を確認しましょう。',
          '花から実がなるまでの時期は水切れに注意し、日当たりのよい場所で育てます。',
        ],
      },
    ],
    listHeading: '実を楽しめる盆栽（樹種の目安より）',
    filter: p => p.enjoy.includes('fruit'),
    sort: byReviews,
    limit: 18,
    catalog: {
      all: '/products?type=tree&enjoy=fruit',
      chips: [
        { label: '姫りんご', href: '/products/category/himeringo' },
        { label: '南天', href: '/products/category/nanten' },
        { label: '実もの盆栽', href: '/products/category/mimono' },
      ],
    },
  },
  {
    slug: 'evergreen-bonsai',
    title: '松・真柏など一年中緑を楽しむ盆栽｜松柏類の選び方 - 盆栽コレクション',
    description: '五葉松・黒松・真柏など、一年中緑を楽しめる松柏類の盆栽の選び方をまとめました。樹種ごとの特徴、管理のポイントと、通販で買える盆栽の比較表を掲載しています。',
    h1: '松・真柏など一年中緑を楽しむ盆栽',
    eyebrow: '特集・松柏類',
    shortTitle: '一年中緑の松柏類',
    tagline: '五葉松・黒松・真柏など',
    thumbnail: '/images/selections/evergreen-bonsai.svg',
    lead: '松や真柏などの松柏類は、冬でも緑を保つ常緑樹で、盆栽らしい力強い姿が魅力です。代表的な樹種の特徴と、管理のポイントをまとめました。',
    sections: [
      {
        heading: '代表的な樹種',
        paragraphs: [
          '同じ松柏類でも、葉の形や幹の見どころが異なります。',
        ],
        points: [
          '五葉松：5本ずつ束になった短い葉。樹形が整いやすく、贈り物にも選ばれる',
          '黒松：太い幹と硬い葉。「松の王様」とも呼ばれる',
          '真柏：幹の一部が白く枯れた「ジン」「シャリ」の造形が見どころ',
        ],
      },
      {
        heading: '管理のポイント',
        paragraphs: [
          '日当たりと風通しのよい屋外が基本です。土の表面が乾いたら、鉢底から流れ出るまでたっぷり水を与えます。',
          '春の新芽の時期の「芽摘み」など、樹種ごとの季節の手入れで姿を整えていきます。',
        ],
      },
    ],
    listHeading: '一年中緑を楽しめる松柏類の盆栽',
    filter: p => p.category === '松柏類',
    sort: byReviews,
    limit: 18,
    catalog: {
      all: '/products?type=tree&species=cat-shohaku',
      chips: [
        { label: '五葉松', href: '/products/category/goyomatsu' },
        { label: '黒松', href: '/products/category/kuromatsu' },
        { label: '真柏', href: '/products/category/shimpaku' },
      ],
    },
  },
  {
    slug: 'celebration-bonsai',
    title: '長寿・お祝いに贈る盆栽｜敬老の日・還暦・開店祝いの選び方 - 盆栽コレクション',
    description: '敬老の日や還暦などの長寿祝い、開店・新築祝いに贈る盆栽の選び方をまとめました。縁起のよい樹種、贈るときに確認したいこと、通販で買える盆栽の比較表を掲載しています。',
    h1: '長寿・お祝いに贈る盆栽',
    eyebrow: '特集・お祝い',
    shortTitle: '長寿・お祝いの盆栽',
    tagline: '敬老の日・還暦・開店祝いに',
    thumbnail: '/images/selections/celebration-bonsai.svg',
    lead: '長く育てられる盆栽は、長寿祝いや新しい門出を祝う贈り物として選ばれています。お祝いの場面に合わせた選び方と、贈るときに確認したいことをまとめました。',
    sections: [
      {
        heading: 'お祝いに選ばれる樹種',
        paragraphs: [
          '一年中緑を保つ松は、古くから長寿の象徴とされてきました。名前に「長寿」が入る長寿梅も、長寿祝いの贈り物に選ばれています。',
        ],
        points: [
          '松（五葉松・黒松）：常緑で格調があり、改まったお祝いに',
          '長寿梅：花を咲かせる時期が長く、名前も縁起がよい',
          '花もの・実もの：にぎやかな印象で、開店・新築祝いにも',
        ],
      },
      {
        heading: '贈るときに確認したいこと',
        paragraphs: [
          'のし・ラッピング・メッセージカードの対応や、お届け日の指定ができるかは販売店によって異なります。商品ページで確認しておきましょう。',
          '受け取る方が育てやすいよう、置き場所と水やりの簡単なメモを添えると親切です。',
        ],
      },
    ],
    listHeading: '長寿・お祝いの贈り物に選ばれている盆栽',
    filter: p => p.celebration || /長寿梅/.test(p.originalName) || (p.gift && p.category === '松柏類'),
    sort: byReviews,
    limit: 18,
    catalog: {
      all: '/products?type=tree&use=celebration',
      chips: [
        { label: 'ラッピング・のし対応', href: '/products?type=tree&flag=wrapping' },
        { label: '長寿梅', href: '/products?type=tree&q=長寿梅' },
        { label: '松', href: '/products?type=tree&use=gift&species=cat-shohaku' },
      ],
    },
  },
  {
    slug: 'starter-tools',
    title: 'はじめての盆栽鉢・土・道具の選び方｜最初にそろえたいもの - 盆栽コレクション',
    description: '盆栽を始めるときにそろえたい鉢・土・道具の選び方をまとめました。剪定ばさみ、盆栽鉢、用土、肥料の選び方のポイントと、通販で買える商品の比較表を掲載しています。',
    h1: 'はじめての鉢・土・道具の選び方',
    eyebrow: '特集・道具',
    shortTitle: 'はじめての鉢・土・道具',
    tagline: '最初にそろえたいものを比較',
    thumbnail: '/images/selections/starter-tools.svg',
    lead: '盆栽を始めるときに必要な道具は、実はそれほど多くありません。最初にそろえたいものと、鉢・土・道具を選ぶときのポイントをまとめました。',
    sections: [
      {
        heading: '最初にそろえたいもの',
        paragraphs: [
          'まずは次のものがあれば、日々の手入れを始められます。',
        ],
        points: [
          '剪定ばさみ：伸びた枝や葉を整える。最初の1本に',
          'ジョウロ：ハス口の細かいものが、土を流さずに水やりしやすい',
          '盆栽鉢と用土：植え替えのときに。樹の大きさに合わせて選ぶ',
        ],
      },
      {
        heading: '鉢と土の選び方',
        paragraphs: [
          '鉢は、底に水抜き穴があるものを選びます。釉薬（ゆうやく）をかけた色鉢は花もの・実ものに、素焼きに近い泥物は松柏類に合わせることが多いです。',
          '土は水はけと水もちのバランスが大切です。赤玉土を中心に、樹種に合わせて配合した盆栽用の用土も販売されています。',
        ],
      },
    ],
    listHeading: 'はじめてそろえたい鉢・土・道具',
    includeParts: true,
    filter: () => true,
    sort: byReviews,
    limit: 24,
    catalog: {
      all: '/products?type=parts',
      chips: [
        { label: '盆栽鉢', href: '/products/category/hachi' },
        { label: '用土', href: '/products/category/tsuchi' },
        { label: '道具', href: '/products/category/dougu' },
      ],
    },
  },
]
