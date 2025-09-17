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
  },
  // 🚀 SEO強化: ロングテールキーワード対応FAQ追加
  {
    question: '盆栽の葉が黄色く変色する原因と対処法は？',
    answer: '盆栽の葉が黄色くなる主な原因は、水不足・水過多・栄養不足・根詰まり・病害虫です。まず水やりの頻度を見直し、土の状態を確認してください。栄養不足の場合は適切な施肥を、根詰まりの場合は植え替えを検討しましょう。害虫がいる場合は薬剤散布が必要です。',
    category: 'trouble',
    keywords: ['葉', '黄色', '変色', 'トラブル', '対処法', '病気']
  },
  {
    question: '盆栽の虫害対策と予防方法を教えてください',
    answer: '盆栽の主な害虫はアブラムシ・カイガラムシ・ハダニです。予防には風通しの良い場所での管理と定期的な葉水が効果的です。虫が発生した場合は、園芸用殺虫剤を使用するか、歯ブラシで物理的に除去します。アブラムシには牛乳スプレーも有効です。',
    category: 'trouble',
    keywords: ['虫', '害虫', '対策', '予防', 'アブラムシ', 'カイガラムシ']
  },
  {
    question: '盆栽の冬の管理方法と注意点は？',
    answer: '冬の盆栽管理では、水やりを控えめにし、霜や強風から保護することが重要です。屋外管理の場合は、鉢を地面に埋めたり、防寒シートで覆ったりします。室内に取り込む場合は、暖房の直風を避け、できるだけ涼しい場所で管理してください。肥料は与えません。',
    category: 'seasonal',
    keywords: ['冬', '管理', '防寒', '越冬', '注意点']
  },
  {
    question: '盆栽の夏の管理で気をつけることは？',
    answer: '夏の盆栽管理では、強い直射日光を避け、風通しの良い半日陰に置きます。水やりは朝夕2回行い、鉢の温度上昇を防ぐため鉢底に受け皿を置きます。葉水をかけて湿度を保ち、熱中症を防ぎましょう。真夏の植え替えや強剪定は避けてください。',
    category: 'seasonal',
    keywords: ['夏', '管理', '暑さ対策', '水やり', '遮光']
  },
  {
    question: 'ミニ盆栽の育て方のコツと注意点は？',
    answer: 'ミニ盆栽は乾燥しやすいため、普通の盆栽より頻繁な水やりが必要です。1日2回の水やりを基本とし、鉢底穴から水が流れ出るまでたっぷり与えます。小さな鉢のため根詰まりしやすく、1-2年に1回の植え替えが必要です。肥料は薄めの液肥を2週間に1回与えましょう。',
    category: 'beginner',
    keywords: ['ミニ盆栽', '育て方', 'コツ', '初心者', '小さい']
  },
  {
    question: '盆栽の剪定時期と方法を詳しく教えてください',
    answer: '盆栽の剪定は樹種により異なりますが、一般的に春（3-5月）が最適です。強剪定は芽吹き前に、軽い整枝は成長期に行います。不要枝（交差枝・逆さ枝・車枝）を優先的に除去し、樹形を整えます。切り口には癒合剤を塗布し、雑菌の侵入を防ぎましょう。',
    category: 'care',
    keywords: ['剪定', '時期', '方法', '切り方', '整枝']
  },
  {
    question: '盆栽の針金かけの基本とコツは？',
    answer: '針金かけは盆栽の樹形作りの重要な技術です。秋（10-11月）が最適時期で、樹液の動きが緩やかな時に行います。針金は幹の1/3の太さを選び、45度の角度で巻きます。強く巻きすぎず、食い込まないよう定期的にチェックしましょう。1-2年で外します。',
    category: 'technique',
    keywords: ['針金かけ', '技術', '樹形', '整形', 'コツ']
  }
]

// 樹種別FAQ
export const speciesFAQs: Record<string, FAQItem[]> = {
  '真柏': [
    {
      question: '真柏盆栽の剪定時期はいつですか？',
      answer: '真柏の剪定は年2回行います。強剪定は3-4月の春、軽い整枝は6-7月に行うのが理想的です。針金かけは秋（10-11月）が最適で、樹液の動きが緩やかな時期に行うことで樹への損傷を最小限に抑えられます。',
      category: 'species',
      keywords: ['真柏', '剪定', '時期', '針金']
    },
    {
      question: '真柏の葉が茶色くなってきました。原因は何ですか？',
      answer: '真柏の葉が茶色くなる主な原因は、水不足、根詰まり、病害虫、または直射日光による葉焼けです。まず水やりを見直し、土の状態を確認してください。また、風通しの良い半日陰に移動させることも効果的です。',
      category: 'species',
      keywords: ['真柏', '葉', '病気', 'トラブル']
    },
    {
      question: '真柏盆栽の水やり頻度と注意点は？',
      answer: '真柏は比較的乾燥に強い樹種ですが、完全に乾かすのは禁物です。春秋は1日1回、夏は朝夕2回、冬は2-3日に1回を目安に、土の表面が乾いたらたっぷり水やりしましょう。葉水も定期的に行うと健康に育ちます。',
      category: 'species',
      keywords: ['真柏', '水やり', '頻度', '管理']
    }
  ],
  'ケヤキ': [
    {
      question: 'ケヤキ盆栽の芽摘みはいつ行いますか？',
      answer: 'ケヤキの芽摘みは春（4-5月）の新芽が伸び始めた時期に行います。新芽を2-3節残して摘むことで、枝分かれを促進し、美しい樹形を作ることができます。夏には徒長枝の剪定も必要です。',
      category: 'species',
      keywords: ['ケヤキ', '芽摘み', '剪定', '時期']
    },
    {
      question: 'ケヤキ盆栽の植え替え時期と方法は？',
      answer: 'ケヤキは成長が早いため、若木は毎年、成木でも2年に1回の植え替えが必要です。3-4月の芽吹き前が最適時期です。根を1/3程度切り詰め、新しい用土で植え替えます。植え替え後は半日陰で1-2週間管理しましょう。',
      category: 'species',
      keywords: ['ケヤキ', '植え替え', '時期', '方法']
    },
    {
      question: 'ケヤキの美しい紅葉を楽しむコツは？',
      answer: 'ケヤキの美しい紅葉を楽しむには、秋の管理が重要です。9月以降は肥料を控え、日当たりの良い場所で昼夜の温度差を作ります。水やりも控えめにし、ストレスを与えることで鮮やかな黄葉が期待できます。',
      category: 'species',
      keywords: ['ケヤキ', '紅葉', '黄葉', '秋', '管理']
    }
  ],
  'モミジ': [
    {
      question: 'モミジ盆栽の紅葉を美しくする方法は？',
      answer: 'モミジの紅葉を美しくするには、昼夜の温度差が重要です。秋は日中は日当たりの良い場所に、夜は涼しい場所に置きましょう。また、秋の施肥を控えめにし、適度な水分管理を行うことで、鮮やかな紅葉が楽しめます。',
      category: 'species',
      keywords: ['モミジ', '紅葉', '管理', '秋']
    },
    {
      question: 'モミジ盆栽の夏の管理方法は？',
      answer: 'モミジは夏の強い日差しに弱いため、午前中のみ日が当たる場所や寒冷紗で遮光します。水やりは朝夕2回行い、葉水で湿度を保ちます。真夏の植え替えや強剪定は避け、軽い芽摘み程度に留めましょう。',
      category: 'species',
      keywords: ['モミジ', '夏', '管理', '遮光', '水やり']
    },
    {
      question: 'モミジの葉焼けを防ぐ方法は？',
      answer: 'モミジの葉焼けを防ぐには、強い直射日光を避けることが重要です。50-70%遮光の寒冷紗を使用し、風通しの良い場所で管理します。葉水は日中の暑い時間を避け、朝早くか夕方に行いましょう。',
      category: 'species',
      keywords: ['モミジ', '葉焼け', '予防', '遮光']
    }
  ],
  '松': [
    {
      question: '松盆栽のみどり摘みの時期と方法は？',
      answer: '松のみどり摘みは5-6月に行います。新芽（みどり）が3-5cm程度伸びたら、手で捻るように摘み取ります。強い芽は早めに、弱い芽は遅めに摘むことで、力のバランスを整えます。ハサミは使わず、必ず手で行いましょう。',
      category: 'species',
      keywords: ['松', 'みどり摘み', '時期', '方法', '新芽']
    },
    {
      question: '松盆栽の古葉取りはいつ行いますか？',
      answer: '松の古葉取りは秋（10-11月）に行います。2年以上経った古い葉を手で取り除き、日当たりと風通しを良くします。一度に全ての古葉を取らず、樹の状態を見ながら段階的に行うことが大切です。',
      category: 'species',
      keywords: ['松', '古葉取り', '時期', '管理']
    }
  ],
  '桜': [
    {
      question: '桜盆栽の花を咲かせるコツは？',
      answer: '桜の花を咲かせるには、夏の間に花芽をしっかり作ることが重要です。7-8月は日当たりの良い場所で管理し、適度な乾燥状態を保ちます。秋から冬にかけては低温にあてることで、春の美しい開花が期待できます。',
      category: 'species',
      keywords: ['桜', '花', '開花', 'コツ', '花芽']
    },
    {
      question: '桜盆栽の剪定時期はいつですか？',
      answer: '桜の剪定は花後すぐ（4-5月）に行います。遅くとも6月までには完了させましょう。秋冬の剪定は花芽を切ってしまう恐れがあります。不要枝の除去と軽い整枝程度に留め、強い剪定は避けてください。',
      category: 'species',
      keywords: ['桜', '剪定', '時期', '花後']
    }
  ],
  'ガジュマル': [
    {
      question: 'ガジュマル盆栽の室内での育て方は？',
      answer: 'ガジュマルは室内でも育てやすい盆栽です。明るい窓際に置き、直射日光は避けます。水やりは土の表面が乾いたらたっぷりと与え、冬は控えめにします。月1回程度、外気浴をさせると健康に育ちます。',
      category: 'species',
      keywords: ['ガジュマル', '室内', '育て方', '観葉植物']
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
  },
  // 🚀 SEO強化: 購入関連ロングテールキーワード追加
  {
    question: '初心者におすすめの盆栽セットの選び方は？',
    answer: '初心者向け盆栽セットは、育てやすい樹種（ケヤキ・ガジュマルなど）、適切なサイズの鉢、基本的な道具（ハサミ・ジョウロ）、用土、育て方ガイドが含まれているものを選びましょう。価格は5,000円〜15,000円程度が目安です。',
    category: 'purchase',
    keywords: ['初心者', 'セット', '選び方', 'おすすめ', '道具']
  },
  {
    question: 'ミニ盆栽を通販で購入する際の注意点は？',
    answer: 'ミニ盆栽の通販購入では、配送時の衝撃対策、季節による配送時期の調整、返品・交換ポリシーの確認が重要です。信頼できる販売者を選び、レビューを参考にしましょう。到着後は梱包を慎重に解き、すぐに適切な場所に置いてください。',
    category: 'purchase',
    keywords: ['ミニ盆栽', '通販', 'オンライン', '配送', '注意点']
  },
  {
    question: '盆栽用品（鉢・道具）の選び方のポイントは？',
    answer: '盆栽鉢は樹種と樹形に合わせて選びます。基本道具は剪定ハサミ・針金・ジョウロが必須です。初心者は汎用性の高い道具から揃え、技術向上に合わせて専門道具を追加していくのがおすすめです。',
    category: 'purchase',
    keywords: ['用品', '道具', '鉢', '選び方', 'ハサミ']
  },
  {
    question: '盆栽の中古品購入で注意すべき点は？',
    answer: '中古盆栽購入では、根の状態、病害虫の有無、植え替え時期、過去の管理状況を確認しましょう。写真だけでなく、実際に見て判断できる場合は現物確認をおすすめします。初心者は新品から始める方が安心です。',
    category: 'purchase',
    keywords: ['中古', '注意点', '確認', '状態']
  },
  {
    question: '盆栽の配送・梱包で気をつけることは？',
    answer: '盆栽配送では、枝折れ防止の固定、鉢の転倒防止、土こぼれ対策が重要です。配送業者には「盆栽」であることを明記し、丁寧な取り扱いを依頼しましょう。夏冬は温度管理にも注意が必要です。',
    category: 'purchase',
    keywords: ['配送', '梱包', '輸送', '注意']
  },
  {
    question: '盆栽購入後のアフターケア・サポートは？',
    answer: '購入後のアフターケアとして、育て方指導、植え替えサービス、病気相談などを提供する販売店もあります。特に高価な盆栽を購入する際は、アフターサポートの内容を事前に確認しておくことをおすすめします。',
    category: 'purchase',
    keywords: ['アフターケア', 'サポート', 'サービス']
  }
]

// 🚀 SEO強化: 季節別管理FAQ（検索ボリューム高）
const seasonalFAQs: FAQItem[] = [
  {
    question: '盆栽の春の管理で重要なポイントは？',
    answer: '春は盆栽の成長期の始まりです。植え替え（3-4月）、芽摘み、剪定、施肥開始が主な作業です。水やりも徐々に回数を増やし、新芽の成長を見守りましょう。病害虫の予防として定期的な観察も大切です。',
    category: 'seasonal',
    keywords: ['春', '植え替え', '芽摘み', '管理', '成長期']
  },
  {
    question: '盆栽の秋の紅葉を美しく楽しむ管理方法は？',
    answer: '秋の美しい紅葉には、日中の日当たりと夜間の冷え込みが重要です。9月以降は肥料を控え、水やりも徐々に減らします。昼夜の温度差を作ることで、モミジやケヤキの鮮やかな紅葉が期待できます。',
    category: 'seasonal',
    keywords: ['秋', '紅葉', '管理', '温度差', 'モミジ', 'ケヤキ']
  }
]

// 🚀 SEO強化: トラブルシューティングFAQ（ロングテール対応）
const troubleshootingFAQs: FAQItem[] = [
  {
    question: '盆栽の枝が枯れてきた場合の対処法は？',
    answer: '枝枯れの原因は水不足、根詰まり、病気、害虫が考えられます。まず水やりと根の状態を確認し、必要に応じて植え替えを行います。病気の場合は罹患部を除去し、殺菌剤を散布します。予防には風通しの良い環境作りが重要です。',
    category: 'trouble',
    keywords: ['枝', '枯れ', '対処法', 'トラブル', '原因']
  },
  {
    question: '盆栽にカビが生えた時の対処法は？',
    answer: '盆栽のカビは過湿や風通し不良が原因です。カビの生えた土を取り除き、殺菌剤で処理します。鉢全体を風通しの良い場所に移し、水やりを控えめにします。予防には適切な水やりと環境管理が大切です。',
    category: 'trouble',
    keywords: ['カビ', '対処法', '過湿', '風通し', '殺菌']
  }
]

// 🚀 SEO強化: 技術・テクニックFAQ（専門性アップ）
const techniqueFAQs: FAQItem[] = [
  {
    question: '盆栽の苔の育て方と管理方法は？',
    answer: '盆栽の苔は湿度管理が重要です。朝夕の霧吹きで適度な湿度を保ち、直射日光を避けて半日陰で管理します。苔が茶色くなった場合は、霧吹きの頻度を上げて回復を待ちます。美しい苔は盆栽の趣を大きく向上させます。',
    category: 'technique',
    keywords: ['苔', '育て方', '管理', '湿度', '霧吹き']
  },
  {
    question: '盆栽の根上がりの作り方とコツは？',
    answer: '根上がり盆栽は数年かけて作ります。植え替え時に根を少しずつ上に出し、徐々に土を減らしていきます。太い根を選んで露出させ、細い根は切除します。時間をかけてゆっくり仕上げることが美しい根上がりのコツです。',
    category: 'technique',
    keywords: ['根上がり', '作り方', 'コツ', '技術', '植え替え']
  }
]

// カテゴリ別FAQを取得
export function getFAQsByCategory(category: FAQItem['category']): FAQItem[] {
  const allFAQs = [
    ...generalFAQs,
    ...seasonalFAQs,
    ...troubleshootingFAQs,
    ...techniqueFAQs,
    ...purchaseFAQs
  ]
  return allFAQs.filter(faq => faq.category === category)
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