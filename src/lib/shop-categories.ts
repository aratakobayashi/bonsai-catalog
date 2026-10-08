// 楽天市場の商品を探すカテゴリ（樹種・鉢・土・道具）
// 説明文は一般的な知識の範囲で書き、効果や体験はうたわない

export type ShopCategoryGroup = 'tree' | 'part'

export interface ShopCategory {
  slug: string
  group: ShopCategoryGroup
  name: string
  keyword: string
  ngKeyword?: string
  description: string
  intro: string
}

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    slug: 'goyomatsu',
    group: 'tree',
    name: '五葉松',
    keyword: '五葉松 盆栽',
    description: '楽天市場で買える五葉松の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '五葉松は5本ずつ束になった短い葉が特徴の松で、松柏類の盆栽の定番です。常緑で一年中緑を楽しめます。',
  },
  {
    slug: 'kuromatsu',
    group: 'tree',
    name: '黒松',
    keyword: '黒松 盆栽',
    description: '楽天市場で買える黒松の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '黒松は太く力強い幹と硬い葉が特徴で、「松の王様」とも呼ばれる盆栽の代表的な樹種です。日当たりのよい屋外で育てます。',
  },
  {
    slug: 'shimpaku',
    group: 'tree',
    name: '真柏',
    keyword: '真柏 盆栽',
    description: '楽天市場で買える真柏（しんぱく）の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '真柏はヒノキ科の常緑樹で、幹の一部が白く枯れた「ジン」「シャリ」と呼ばれる造形が見どころです。',
  },
  {
    slug: 'momiji',
    group: 'tree',
    name: 'もみじ',
    keyword: 'もみじ 盆栽',
    description: '楽天市場で買えるもみじ・楓の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: 'もみじは春の芽吹き、夏の青葉、秋の紅葉、冬の枝ぶりと、四季の変化を楽しめる雑木盆栽の代表です。',
  },
  {
    slug: 'sakura',
    group: 'tree',
    name: '桜',
    keyword: '桜 盆栽',
    description: '楽天市場で買える桜の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '桜の盆栽は、小さな樹でも花を咲かせやすい一才桜や富士桜（信濃寒桜）などの品種がよく選ばれます。開花時期は品種によって異なります。',
  },
  {
    slug: 'ume',
    group: 'tree',
    name: '梅・長寿梅',
    keyword: '梅 盆栽',
    description: '楽天市場で買える梅・長寿梅の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '梅は早春に花を咲かせる花もの盆栽の定番です。長寿梅はボケの仲間で、花を咲かせる時期が長いのが特徴です。',
  },
  {
    slug: 'mini',
    group: 'tree',
    name: 'ミニ盆栽',
    keyword: 'ミニ盆栽',
    description: '楽天市場で買えるミニ盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: 'ミニ盆栽は手のひらに乗るほどの小さな盆栽です。場所を取らない一方、鉢が小さく土が乾きやすいので水やりに注意が必要です。',
  },
  {
    slug: 'kokedama',
    group: 'tree',
    name: '苔玉',
    keyword: '苔玉',
    description: '楽天市場で買える苔玉を、価格・ショップ・レビュー件数で比較できます。',
    intro: '苔玉は、植物の根を土で丸く包み、表面を苔で覆ったものです。器に載せて飾る、インテリア向けの楽しみ方として人気があります。',
  },
  {
    slug: 'akamatsu',
    group: 'tree',
    name: '赤松',
    keyword: '赤松 盆栽',
    description: '楽天市場で買える赤松の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '赤松は赤みを帯びた樹皮と、黒松より細く柔らかい葉が特徴の松です。優しい印象から「女松（めまつ）」とも呼ばれます。',
  },
  {
    slug: 'satsuki',
    group: 'tree',
    name: 'さつき',
    keyword: 'さつき 盆栽',
    description: '楽天市場で買えるさつき（皐月）の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: 'さつきはツツジの仲間で、5〜6月ごろに花を咲かせる花もの盆栽です。品種がとても多く、1本の木に色の違う花が咲き分ける品種もあります。',
  },
  {
    slug: 'keyaki',
    group: 'tree',
    name: '欅（けやき）',
    keyword: 'けやき 盆栽',
    description: '楽天市場で買える欅（けやき）の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '欅は、枝がほうきのように広がる「箒立ち（ほうきだち）」の樹形が代表的な雑木盆栽です。葉が落ちた冬に見える、細かな枝ぶりも見どころです。',
  },
  {
    slug: 'sansho',
    group: 'tree',
    name: '山椒',
    keyword: '山椒 盆栽',
    description: '楽天市場で買える山椒の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '山椒は葉や実に独特の香りがある落葉樹です。枝にとげがあるものが多いですが、とげの少ない品種もあります。',
  },
  {
    slug: 'nanten',
    group: 'tree',
    name: '南天',
    keyword: '南天 盆栽',
    description: '楽天市場で買える南天の盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '南天は冬に赤い実をつける常緑の低木です。「難を転ずる」に通じる縁起のよい木として、正月飾りにも使われます。',
  },
  {
    slug: 'himeringo',
    group: 'tree',
    name: '姫りんご',
    keyword: '姫りんご 盆栽',
    description: '楽天市場で買える姫りんごの盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '姫りんごは春に白〜淡いピンクの花を咲かせ、秋に小さな実をつける実もの盆栽の定番です。実をつけるために、別の品種の花粉が必要な場合があります。',
  },
  {
    slug: 'mimono',
    group: 'tree',
    name: '実もの盆栽',
    keyword: '実もの 盆栽',
    description: '楽天市場で買える実もの盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: '実もの盆栽は、実を観賞する盆栽の総称です。ピラカンサ・梅もどき・姫りんご・柿などがあり、秋から冬に見ごろを迎えるものが多くあります。',
  },
  {
    slug: 'olive',
    group: 'tree',
    name: 'オリーブ',
    keyword: 'オリーブ 盆栽',
    description: '楽天市場で買えるオリーブの盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: 'オリーブは銀色がかった細い葉が特徴の常緑樹で、洋風のインテリアにも合わせやすい樹種です。日当たりのよい場所を好みます。',
  },
  {
    slug: 'gajumaru',
    group: 'tree',
    name: 'ガジュマル',
    keyword: 'ガジュマル 盆栽',
    description: '楽天市場で買えるガジュマルの盆栽を、価格・ショップ・レビュー件数で比較できます。',
    intro: 'ガジュマルは、太くふくらんだ根や幹が特徴の常緑樹です。寒さに弱いため、冬は室内の明るい場所で管理します。',
  },
  {
    slug: 'hachi',
    group: 'part',
    name: '盆栽鉢',
    keyword: '盆栽鉢',
    description: '楽天市場で買える盆栽鉢を、価格・ショップ・レビュー件数で比較できます。',
    intro: '盆栽鉢は樹の印象を大きく左右します。釉薬（ゆうやく）をかけた色鉢は花もの・実ものに、素焼きに近い泥物（でいもの）は松柏類に合わせることが多いです。鉢底に水抜き穴があるものを選びましょう。',
  },
  {
    slug: 'tsuchi',
    group: 'part',
    name: '盆栽用の土',
    keyword: '盆栽 用土',
    description: '楽天市場で買える盆栽用の土（赤玉土・用土）を、価格・ショップ・レビュー件数で比較できます。',
    intro: '盆栽の土は、水はけと水もちのバランスが大切です。赤玉土を中心に、樹種に合わせて桐生砂や川砂などを混ぜた配合用土も販売されています。',
  },
  {
    slug: 'dougu',
    group: 'part',
    name: '盆栽の道具',
    keyword: '盆栽 はさみ',
    description: '楽天市場で買える盆栽用のはさみ・道具を、価格・ショップ・レビュー件数で比較できます。',
    intro: '始めるときにまず必要なのは、枝や葉を整える剪定ばさみです。太い枝を切る又枝切りや、植え替えに使うピンセットなどは必要に応じてそろえます。',
  },
  {
    slug: 'harigane',
    group: 'part',
    name: '針金',
    keyword: '盆栽 針金',
    description: '楽天市場で買える盆栽用の針金（アルミ線・銅線）を、価格・ショップ・レビュー件数で比較できます。',
    intro: '針金かけは、枝の向きや形を整えるための技法です。扱いやすいアルミ線が初心者向けで、太さは枝の太さに合わせて選びます。',
  },
  {
    slug: 'hiryo',
    group: 'part',
    name: '肥料',
    keyword: '盆栽 肥料',
    description: '楽天市場で買える盆栽用の肥料を、価格・ショップ・レビュー件数で比較できます。',
    intro: '盆栽の肥料は、土の上に置く固形の置き肥がよく使われます。与える時期や量は樹種や季節によって異なるため、商品の説明を確認しましょう。',
  },
]

export function getShopCategory(slug: string): ShopCategory | undefined {
  return SHOP_CATEGORIES.find(category => category.slug === slug)
}
