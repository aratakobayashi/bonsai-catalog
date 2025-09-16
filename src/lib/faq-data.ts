// FAQ データ管理システム - 盆栽に関するよくある質問と回答

export interface FAQItem {
  question: string
  answer: string
  category?: 'general' | 'care' | 'beginner' | 'purchase' | 'species'
  keywords?: string[]
}

// 汎用FAQ - すべてのページで使用可能
export const generalFAQs: FAQItem[] = [
  {
    question: '盆栽の水やりの頻度はどのくらいですか？',
    answer: '盆栽の水やり頻度は季節や樹種により異なります。春秋は1日1回、夏は1日2回、冬は2-3日に1回が基本です。土の表面が乾いたら水をたっぷり与え、鉢底から水が流れ出るまでしっかりと水やりをしましょう。',
    category: 'care',
    keywords: ['水やり', '頻度', '管理']
  },
  {
    question: '初心者におすすめの盆栽の種類は何ですか？',
    answer: '初心者には、育てやすい「ケヤキ」「モミジ」「五葉松」がおすすめです。特にケヤキは成長が早く、失敗してもリカバリーしやすいため、初めての方に最適です。また、ミニ盆栽から始めると管理もしやすくなります。',
    category: 'beginner',
    keywords: ['初心者', 'おすすめ', '種類', 'ケヤキ', 'モミジ']
  },
  {
    question: '盆栽は室内で育てられますか？',
    answer: '多くの盆栽は屋外での管理が基本ですが、一部の樹種は室内でも育てられます。「ガジュマル」「フィカス」などの観葉植物系の盆栽や、「真柏」の一部品種は室内管理も可能です。ただし、定期的に外気浴をさせることが大切です。',
    category: 'care',
    keywords: ['室内', '育て方', '管理']
  },
  {
    question: '盆栽の植え替えはいつ行うべきですか？',
    answer: '盆栽の植え替えは、樹種により異なりますが、一般的に2-3年に1回、春（3-4月）に行います。若い木や成長の早い樹種は毎年、老木は3-5年に1回が目安です。根詰まりを起こす前に植え替えることが重要です。',
    category: 'care',
    keywords: ['植え替え', '時期', '頻度']
  },
  {
    question: '盆栽の肥料はどのように与えればよいですか？',
    answer: '盆栽の肥料は春から秋にかけて与えます。固形肥料なら月1回、液体肥料なら2週間に1回が基本です。冬は休眠期のため肥料は必要ありません。有機肥料を使用すると、ゆっくりと効果が持続し、根にも優しいです。',
    category: 'care',
    keywords: ['肥料', '施肥', '頻度', '時期']
  }
]

// 樹種別FAQ
export const speciesFAQs: Record<string, FAQItem[]> = {
  '真柏': [
    {
      question: '真柏盆栽の剪定時期はいつですか？',
      answer: '真柏の剪定は年2回行います。強剪定は3-4月の春、軽い整枝は6-7月に行うのが理想的です。針金かけは秋（10-11月）が最適で、樹液の動きが緩やかな時期に行うことで樹へのダメージを最小限に抑えられます。',
      category: 'species',
      keywords: ['真柏', '剪定', '時期', '針金']
    },
    {
      question: '真柏の葉が茶色くなってきました。原因は何ですか？',
      answer: '真柏の葉が茶色くなる主な原因は、水不足、根詰まり、病害虫、または直射日光による葉焼けです。まず水やりを見直し、土の状態を確認してください。また、風通しの良い半日陰に移動させることも効果的です。',
      category: 'species',
      keywords: ['真柏', '葉', '病気', 'トラブル']
    }
  ],
  'ケヤキ': [
    {
      question: 'ケヤキ盆栽の芽摘みはいつ行いますか？',
      answer: 'ケヤキの芽摘みは春（4-5月）の新芽が伸び始めた時期に行います。新芽を2-3節残して摘むことで、枝分かれを促進し、美しい樹形を作ることができます。夏には徒長枝の剪定も必要です。',
      category: 'species',
      keywords: ['ケヤキ', '芽摘み', '剪定', '時期']
    }
  ],
  'モミジ': [
    {
      question: 'モミジ盆栽の紅葉を美しくする方法は？',
      answer: 'モミジの紅葉を美しくするには、昼夜の温度差が重要です。秋は日中は日当たりの良い場所に、夜は涼しい場所に置きましょう。また、秋の施肥を控えめにし、適度な水分管理を行うことで、鮮やかな紅葉が楽しめます。',
      category: 'species',
      keywords: ['モミジ', '紅葉', '管理', '秋']
    }
  ]
}

// 購入・価格関連FAQ
export const purchaseFAQs: FAQItem[] = [
  {
    question: '盆栽の価格はどのくらいですか？',
    answer: '盆栽の価格は樹種、樹齢、仕立て具合により大きく異なります。初心者向けのミニ盆栽なら3,000円〜10,000円、中級者向けは10,000円〜50,000円、展示会級の作品は数十万円以上になることもあります。',
    category: 'purchase',
    keywords: ['価格', '値段', '相場']
  },
  {
    question: '盆栽はどこで購入できますか？',
    answer: '盆栽は専門店、園芸店、オンラインショップで購入できます。初心者の方は、アフターケアや相談ができる専門店がおすすめです。当サイトでは、Amazonで購入可能な厳選商品をご紹介しています。',
    category: 'purchase',
    keywords: ['購入', '買う', '通販', 'Amazon']
  },
  {
    question: '盆栽を贈り物にする際の注意点は？',
    answer: '盆栽を贈り物にする際は、相手の経験レベルと管理環境を考慮しましょう。初心者には育てやすい樹種を、説明書付きで贈ると喜ばれます。また、鉢や道具がセットになったギフトセットもおすすめです。',
    category: 'purchase',
    keywords: ['贈り物', 'ギフト', 'プレゼント']
  }
]

// カテゴリ別FAQを取得
export function getFAQsByCategory(category: FAQItem['category']): FAQItem[] {
  return generalFAQs.filter(faq => faq.category === category)
}

// キーワードでFAQを検索
export function searchFAQs(keyword: string): FAQItem[] {
  const lowerKeyword = keyword.toLowerCase()
  return generalFAQs.filter(faq =>
    faq.question.toLowerCase().includes(lowerKeyword) ||
    faq.answer.toLowerCase().includes(lowerKeyword) ||
    faq.keywords?.some(k => k.toLowerCase().includes(lowerKeyword))
  )
}

// 記事に関連するFAQを自動選択
export function getRelatedFAQs(
  title: string,
  content: string,
  maxItems: number = 5
): FAQItem[] {
  const relevantFAQs: { faq: FAQItem; score: number }[] = []

  // タイトルと内容から関連FAQをスコアリング
  generalFAQs.forEach(faq => {
    let score = 0

    // キーワードマッチング
    faq.keywords?.forEach(keyword => {
      if (title.includes(keyword)) score += 3
      if (content.includes(keyword)) score += 1
    })

    // 質問文のマッチング
    const questionWords = faq.question.split(/[、。？]/);
    questionWords.forEach(word => {
      if (word && title.includes(word)) score += 2
      if (word && content.includes(word)) score += 0.5
    })

    if (score > 0) {
      relevantFAQs.push({ faq, score })
    }
  })

  // スコア順にソートして上位を返す
  return relevantFAQs
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map(item => item.faq)
}

// 商品に関連するFAQを取得
export function getProductFAQs(
  productName: string,
  category: string,
  tags?: string[]
): FAQItem[] {
  const faqs: FAQItem[] = []

  // 樹種名から特定FAQを取得
  Object.keys(speciesFAQs).forEach(species => {
    if (productName.includes(species)) {
      faqs.push(...speciesFAQs[species])
    }
  })

  // カテゴリに基づく一般FAQを追加
  if (category.includes('初心者')) {
    faqs.push(...getFAQsByCategory('beginner'))
  }

  // タグに基づくFAQを追加
  tags?.forEach(tag => {
    if (tag.includes('室内')) {
      const indoorFAQ = generalFAQs.find(faq =>
        faq.keywords?.includes('室内')
      )
      if (indoorFAQ && !faqs.includes(indoorFAQ)) {
        faqs.push(indoorFAQ)
      }
    }
  })

  // 一般的な管理FAQを追加（最大5個まで）
  const careFAQs = getFAQsByCategory('care')
  faqs.push(...careFAQs.slice(0, Math.max(0, 5 - faqs.length)))

  return faqs.slice(0, 5) // 最大5個まで
}