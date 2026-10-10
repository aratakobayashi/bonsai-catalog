// 商品詳細ページに出す「育て方の目安」「購入前のチェック」
// 一般的な栽培知識の範囲で書き、個別の商品の効果や品質はうたわない
import type { ProductType } from '@/lib/product-classify'

export interface CareGuide {
  title: string
  items: { label: string; text: string }[]
  guideLink?: { href: string; label: string }
}

const CATEGORY_GUIDES: Record<string, CareGuide> = {
  松柏類: {
    title: '松柏類（松・真柏など）の育て方の目安',
    items: [
      { label: '置き場所', text: '日当たりと風通しのよい屋外が基本です。室内に飾るのは2〜3日にとどめます。' },
      { label: '水やり', text: '土の表面が乾いたら、鉢底から流れ出るまでたっぷり与えます。夏は乾きやすいので朝夕に確かめます。' },
      { label: '季節の手入れ', text: '松は春のみどり摘み（黒松は初夏の芽切りも）、真柏は春〜秋に指で芽摘みをし、秋から冬に古葉を整理します。' },
      { label: '冬の管理', text: '寒さには比較的強いですが、ミニ盆栽は鉢が凍らないよう軒下などに移すと安心です。' },
    ],
    guideLink: { href: '/guides', label: '松柏類の育て方ガイドを見る' },
  },
  雑木類: {
    title: '雑木類（もみじ・ケヤキなど）の育て方の目安',
    items: [
      { label: '置き場所', text: '屋外の日当たりのよい場所が基本です。真夏の強い西日は葉焼けの原因になるため半日陰へ。' },
      { label: '水やり', text: '葉が多い春〜夏は水切れしやすいため、土の乾き具合をこまめに確認します。' },
      { label: '季節の楽しみ', text: '春の芽吹き、夏の青葉、秋の紅葉、冬の枝ぶりと四季の変化が楽しめます。' },
      { label: '冬の管理', text: '落葉後は水やりの回数を控えめにし、寒風の当たらない場所で管理します。' },
    ],
    guideLink: { href: '/guides', label: '雑木類の育て方ガイドを見る' },
  },
  花もの: {
    title: '花もの（桜・梅・藤など）の育て方の目安',
    items: [
      { label: '置き場所', text: '花芽をつけるには日光が必要です。日当たりのよい屋外で管理します。' },
      { label: '水やり', text: '開花中は特に水切れに注意します。花に直接水をかけないようにすると花が長持ちします。' },
      { label: '開花時期', text: '開花時期は品種や地域によって異なります。届く時期と花の時期は商品ページで確認を。' },
      { label: '花後の手入れ', text: '花が終わったら花がらを摘み、肥料を与えて翌年の花芽づくりに備えます。' },
    ],
    guideLink: { href: '/guides', label: '花ものの育て方ガイドを見る' },
  },
  実もの: {
    title: '実もの（姫りんご・南天など）の育て方の目安',
    items: [
      { label: '置き場所', text: '日当たりのよい屋外で管理すると、花つき・実つきがよくなります。' },
      { label: '水やり', text: '実がついている時期は水切れに注意し、土の表面が乾いたらたっぷり与えます。' },
      { label: '実をつけるために', text: '樹種によっては、実をつけるのに別の品種の花粉や雄木が必要です（姫りんご・梅もどきなど）。詳しくは各樹種の育て方の記事で説明しています。' },
      { label: '季節の楽しみ', text: '花と実の両方を楽しめるのが実ものの見どころです。' },
    ],
    guideLink: { href: '/guides', label: '実ものの育て方ガイドを見る' },
  },
}

const DEFAULT_TREE_GUIDE: CareGuide = {
  title: '盆栽の育て方の基本',
  items: [
    { label: '置き場所', text: '多くの盆栽は屋外で育てる植物です。日当たりと風通しのよい場所が基本です。' },
    { label: '水やり', text: '土の表面が乾いたら、鉢底から流れ出るまでたっぷり。小さな鉢ほど乾きやすくなります。' },
    { label: '室内に飾るとき', text: '室内での観賞は短時間〜数日にとどめ、普段は屋外に戻すと元気に育ちます。' },
  ],
  guideLink: { href: '/selection/beginner-mini-bonsai', label: '初心者向けミニ盆栽の選び方を見る' },
}

const PART_GUIDES: Partial<Record<ProductType, CareGuide>> = {
  pot: {
    title: '盆栽鉢の選び方のポイント',
    items: [
      { label: 'サイズ', text: '鉢のサイズは「号」で表され、1号は直径約3cmです。植える樹の根の量に合わせて選びます。' },
      { label: '水抜き穴', text: '鉢底に穴があるものを選びましょう。植え替えのときは鉢底網で穴をふさぎます。' },
      { label: '色と質感', text: '釉薬をかけた色鉢は花もの・実ものに、素焼きに近い泥物は松柏類によく合わせられます。' },
    ],
  },
  soil: {
    title: '盆栽用の土の選び方のポイント',
    items: [
      { label: '基本の土', text: '赤玉土が基本です。粒の崩れにくい硬質のものは水はけが長持ちします。' },
      { label: '配合', text: '松柏類は水はけ重視、雑木類は水もちも重視するなど、樹種によって配合を変えます。' },
      { label: '粒の大きさ', text: '小さな鉢には小粒、大きな鉢には中粒が目安です。' },
    ],
  },
  tool: {
    title: '盆栽の道具の選び方のポイント',
    items: [
      { label: '最初の1本', text: 'まずは枝や葉を整える剪定ばさみがあれば始められます。' },
      { label: '手入れ', text: '使用後は樹液を拭き取り、さび止めをすると長く使えます。' },
    ],
  },
  wire: {
    title: '盆栽用の針金の選び方のポイント',
    items: [
      { label: '素材', text: '曲げやすいアルミ線が初心者向けです。銅線は保持力が強く、松柏類に使われます。' },
      { label: '太さ', text: '枝の太さの1/3程度の太さが目安です。食い込む前に外すのが大切です。' },
    ],
  },
  fertilizer: {
    title: '盆栽の肥料の使い方のポイント',
    items: [
      { label: '時期', text: '春と秋の成長期に与えるのが一般的です。真夏と冬は控えます。' },
      { label: '種類', text: '土の上に置く固形の置き肥がよく使われます。量は商品の説明に従いましょう。' },
    ],
  },
}

export function getCareGuide(productType: ProductType, category: string): CareGuide | null {
  if (PART_GUIDES[productType]) return PART_GUIDES[productType]!
  if (productType === 'seed' || productType === 'other') return null
  return CATEGORY_GUIDES[category] ?? DEFAULT_TREE_GUIDE
}

// 購入者の不安（調査結果: 写真と実物の違い・サイズ感・開花時期・育て方サポート・送料）にもとづくチェック項目
export function getPurchaseChecklist(productType: ProductType): string[] {
  if (['pot', 'soil', 'tool', 'wire', 'fertilizer'].includes(productType)) {
    return [
      'サイズ・容量（鉢の号数、土の量、道具の長さなど）',
      '素材と、水抜き穴などの仕様',
      '送料と、ほかの商品とまとめて送ってもらえるか',
    ]
  }
  return [
    '写真が「現品」か「見本（イメージ）」か',
    '樹高・鉢のサイズ（届いたときのサイズ感）',
    '花・実・紅葉の時期と、届く時期',
    '育て方の説明書やサポート（問い合わせ先）があるか',
    '送料、ラッピング・メッセージカードの対応（贈り物の場合）',
  ]
}
