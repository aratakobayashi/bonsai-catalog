// 記事関連のヘルパー関数

interface ArticleLink {
  slug: string
  title: string
  category: string
  tags?: string[]
}

// 記事データ（将来的にはデータベースから取得）
export const articleDatabase: ArticleLink[] = [
  {
    slug: 'article-1',
    title: '【2025年版】もみじ盆栽の育て方｜紅葉を100倍美しくする7つの管理法',
    category: 'お手入れ・管理',
    tags: ['もみじ', '紅葉', '剪定', '管理']
  },
  {
    slug: 'article-2',
    title: '【初心者完全版】姫リンゴの盆栽の育て方｜可愛い実を楽しむ剪定と管理法',
    category: 'お手入れ・管理',
    tags: ['姫リンゴ', '実もの', '初心者']
  },
  {
    slug: 'article-3',
    title: '【完全版】長寿梅の盆栽入門｜初心者に人気の花咲く育て方・剪定ポイント',
    category: '初心者向け',
    tags: ['長寿梅', '花もの', '初心者']
  },
  {
    slug: 'article-4',
    title: 'ミニ盆栽の始め方完全ガイド｜人気の種類と育て方のコツをやさしく解説',
    category: '初心者向け',
    tags: ['ミニ盆栽', '初心者', '始め方']
  },
  {
    slug: 'article-5',
    title: '【初心者向け】ギフトにも最適なミニ盆栽・豆盆栽とは？育て方と人気の種類を解説',
    category: '初心者向け',
    tags: ['ミニ盆栽', 'ギフト', '豆盆栽']
  },
  {
    slug: 'article-6',
    title: '五葉松の盆栽の育て方｜剪定・水やり・管理のコツ【初心者〜中級者向け】',
    category: 'お手入れ・管理',
    tags: ['五葉松', '松', '剪定', '管理']
  },
  {
    slug: 'article-7',
    title: '初心者でもわかる！盆栽の剪定・芽摘み・針金かけ入門｜基礎からやさしく解説',
    category: '初心者向け',
    tags: ['剪定', '芽摘み', '針金', '技術']
  },
  {
    slug: 'article-10',
    title: '初心者でも安心！黒松の盆栽育て方マニュアル｜水やり・剪定・管理の基本',
    category: 'お手入れ・管理',
    tags: ['黒松', '松', '初心者', '管理']
  },
  {
    slug: 'article-11',
    title: '【2025年最新】盆栽の始め方完全ガイド｜初心者が失敗しない5ステップ',
    category: '初心者向け',
    tags: ['初心者', '始め方', '基礎']
  },
  {
    slug: 'article-12',
    title: '初心者必見！盆栽の置き場所ガイド｜屋外・室内で育てるコツと注意点',
    category: '初心者向け',
    tags: ['置き場所', '管理', '初心者']
  },
  {
    slug: 'article-13',
    title: '梅の盆栽完全ガイド｜開花を促す剪定・年間管理・育て方の基本',
    category: 'お手入れ・管理',
    tags: ['梅', '花もの', '剪定', '開花']
  },
  {
    slug: 'article-14',
    title: '盆栽が枯れる原因10選｜90%の初心者がやる失敗と今すぐできる対策',
    category: 'トラブル対策',
    tags: ['枯れる', 'トラブル', '初心者', '対策']
  },
  {
    slug: 'article-15',
    title: '【2025年夏】盆栽が枯れない！猛暑対策3つの鉄則と水やりタイミング',
    category: 'お手入れ・管理',
    tags: ['夏', '暑さ対策', '水やり', '管理']
  },
  {
    slug: 'article-16',
    title: '盆栽の植え替えガイド｜失敗しないタイミングと手順【初心者向け】',
    category: 'お手入れ・管理',
    tags: ['植え替え', '初心者', '手順']
  },
  {
    slug: 'article-18',
    title: '盆栽の水やり完全マニュアル2025｜1日1分でわかる季節別タイミング',
    category: 'お手入れ・管理',
    tags: ['水やり', '管理', '季節']
  },
  {
    slug: 'article-19',
    title: '盆栽の土選び完全ガイド2025｜樹種別ベスト配合レシピ10選',
    category: 'お手入れ・管理',
    tags: ['土', '配合', '樹種別']
  },
  {
    slug: 'article-20',
    title: '真柏の盆栽の育て方｜曲げ・剪定・年間管理のコツ【初心者～中級者向け】',
    category: 'お手入れ・管理',
    tags: ['真柏', '剪定', '曲げ', '管理']
  },
  {
    slug: 'article-23',
    title: '【2025年決定版】盆栽が枯れない水やり自動化システム5選｜旅行・出張でも安心',
    category: 'お手入れ・管理',
    tags: ['水やり', '自動化', '便利グッズ']
  },
  {
    slug: 'article-24',
    title: '【2025年版】100均で作る盆栽入門セット｜総額1,100円で始める本格盆栽',
    category: '初心者向け',
    tags: ['100均', '初心者', '節約', '始め方']
  },
  {
    slug: 'article-25',
    title: '【2025年最新】室内で育てる盆栽おすすめ5選｜マンション・アパートOK',
    category: '初心者向け',
    tags: ['室内', 'マンション', 'アパート', '初心者', 'おすすめ']
  },
  {
    slug: 'article-26',
    title: '【2025年母の日】お母さんが喜ぶ盆栽ギフト5選｜感謝を込めた特別な贈り物',
    category: '初心者向け',
    tags: ['母の日', 'ギフト', '花もの', 'プレゼント', '桜']
  }
]

// 商品カテゴリと記事を関連付けるマッピング
const categoryToArticleMapping: Record<string, string[]> = {
  '松柏類': ['松', '五葉松', '黒松', '真柏'],
  '雑木類': ['もみじ', 'ケヤキ', '紅葉'],
  '花もの': ['梅', '長寿梅', '桜', '開花'],
  '実もの': ['姫リンゴ', '実もの'],
  'ミニ盆栽': ['ミニ盆栽', '豆盆栽'],
}

// 商品に関連する記事を取得
export function getRelatedArticles(
  productCategory: string,
  productTags?: string[],
  limit: number = 3
): ArticleLink[] {
  const relatedArticles: ArticleLink[] = []
  const addedSlugs = new Set<string>()

  // カテゴリマッピングから関連キーワードを取得
  const relatedKeywords = categoryToArticleMapping[productCategory] || []

  // 商品名やタグから関連キーワードを追加
  const allKeywords = [
    ...relatedKeywords,
    productCategory,
    ...(productTags || [])
  ].map(keyword => keyword.toLowerCase())

  // スコアリングして関連度の高い記事を選択
  const scoredArticles = articleDatabase.map(article => {
    let score = 0

    // カテゴリマッチ
    if (productCategory === '初心者向け' && article.category === '初心者向け') {
      score += 3
    }

    // タグマッチ
    const articleTags = (article.tags || []).map(tag => tag.toLowerCase())
    allKeywords.forEach(keyword => {
      articleTags.forEach(tag => {
        if (tag.includes(keyword) || keyword.includes(tag)) {
          score += 2
        }
      })
    })

    // タイトルマッチ
    const titleLower = article.title.toLowerCase()
    allKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) {
        score += 1
      }
    })

    return { article, score }
  })

  // スコアの高い順にソート
  scoredArticles.sort((a, b) => b.score - a.score)

  // 上位の記事を選択
  for (const { article, score } of scoredArticles) {
    if (score > 0 && !addedSlugs.has(article.slug)) {
      relatedArticles.push(article)
      addedSlugs.add(article.slug)
      if (relatedArticles.length >= limit) break
    }
  }

  // 関連記事が少ない場合は人気記事を追加
  if (relatedArticles.length < limit) {
    const popularArticles = [
      'article-11', // 盆栽の始め方
      'article-18', // 水やり完全マニュアル
      'article-14', // 枯れる原因と対策
    ]

    for (const slug of popularArticles) {
      if (relatedArticles.length >= limit) break
      if (!addedSlugs.has(slug)) {
        const article = articleDatabase.find(a => a.slug === slug)
        if (article) {
          relatedArticles.push(article)
          addedSlugs.add(slug)
        }
      }
    }
  }

  return relatedArticles.slice(0, limit)
}

// 初心者向けの基本記事を取得
export function getBeginnerArticles(limit: number = 3): ArticleLink[] {
  return articleDatabase
    .filter(article =>
      article.category === '初心者向け' ||
      article.tags?.includes('初心者')
    )
    .slice(0, limit)
}

// カテゴリ別記事を取得
export function getArticlesByCategory(category: string, limit: number = 5): ArticleLink[] {
  return articleDatabase
    .filter(article => article.category === category)
    .slice(0, limit)
}