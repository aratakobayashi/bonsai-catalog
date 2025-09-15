import type { Product, Article } from '@/types'

// 盆栽の戦略的キーワードデータベース
const BONSAI_KEYWORDS = {
  // 基本キーワード
  base: ['盆栽', 'bonsai', '育て方', '手入れ', '管理'],

  // 購入意向キーワード
  commercial: ['通販', 'セット', 'おすすめ', '販売', '価格'],

  // レベル別キーワード
  beginner: ['初心者', '初心者向け', '簡単', '育てやすい'],
  advanced: ['上級者', '本格派', '高品質'],

  // 環境別キーワード
  environment: ['室内', '屋外', 'ベランダ', 'マンション'],

  // 樹種別キーワード（人気順）
  species: {
    '真柏': ['真柏', 'シンパク', '針葉樹', '常緑'],
    'ケヤキ': ['ケヤキ', '欅', '落葉樹', '芽摘み'],
    'モミジ': ['モミジ', '楓', '紅葉', '山もみじ'],
    '桜': ['桜', 'さくら', '花もの', '春'],
    '松': ['松', '黒松', '赤松', '針葉樹'],
    '梅': ['梅', '花もの', '実もの', '春'],
    'ガジュマル': ['ガジュマル', '観葉植物', '室内', '初心者']
  }
}

// 商品の自動SEO最適化
export function generateProductSEO(product: Product) {
  const name = product.name
  const category = product.category
  const difficulty = product.difficulty_level

  // 樹種を特定
  const detectedSpecies = Object.keys(BONSAI_KEYWORDS.species).find(species =>
    name.includes(species)
  )

  // 難易度に基づくキーワード選択（数値を文字列に変換）
  const difficultyLevel = difficulty === 1 ? 'beginner' : difficulty === 3 ? 'advanced' : 'intermediate'
  const levelKeywords = difficultyLevel === 'beginner' ? BONSAI_KEYWORDS.beginner :
                       difficultyLevel === 'advanced' ? BONSAI_KEYWORDS.advanced :
                       [...BONSAI_KEYWORDS.beginner, ...BONSAI_KEYWORDS.advanced]

  // 動的キーワード生成
  const keywords = [
    ...BONSAI_KEYWORDS.base,
    ...BONSAI_KEYWORDS.commercial,
    ...levelKeywords,
    // 樹種固有キーワード
    ...(detectedSpecies ? (BONSAI_KEYWORDS.species as any)[detectedSpecies] || [] : []),
    // カテゴリキーワード
    category,
    // 商品名から抽出
    name
  ]

  // SEO最適化されたタイトル生成
  const title = generateProductTitle(name, detectedSpecies, difficultyLevel)

  // SEO最適化された説明文生成
  const description = generateProductDescription(product, detectedSpecies)

  return {
    title,
    description,
    keywords: [...new Set(keywords)], // 重複除去
    openGraph: {
      title,
      description,
      type: 'product' as const,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
    }
  }
}

// 商品タイトルの戦略的生成
function generateProductTitle(name: string, species?: string, difficulty?: string): string {
  const difficultyText = difficulty === 'beginner' ? '初心者向け' :
                        difficulty === 'advanced' ? '上級者向け' : ''

  const speciesKeyword = species ? `${species}の盆栽` : '盆栽'

  // パターン1: [樹種]の盆栽 - [難易度] | 育て方ガイド付き通販
  if (species && difficulty) {
    return `${name} - ${difficultyText}${speciesKeyword} | 育て方ガイド付き通販`
  }

  // パターン2: [商品名] | 盆栽通販
  return `${name} | 盆栽通販 - 育て方ガイド付き`
}

// 商品説明文の戦略的生成
function generateProductDescription(product: Product, species?: string): string {
  const name = product.name
  const difficulty = product.difficulty_level
  const category = product.category
  const price = product.price

  // 基本説明
  let description = `${name}の通販ページ。`

  // 樹種別特徴
  if (species) {
    const speciesFeatures = getSpeciesFeatures(species)
    description += `${speciesFeatures}`
  }

  // 難易度別アピール（数値から変換）
  const difficultyLevel = difficulty === 1 ? 'beginner' : difficulty === 3 ? 'advanced' : 'intermediate'
  if (difficultyLevel === 'beginner') {
    description += '盆栽初心者の方にもおすすめの育てやすい品種です。'
  } else if (difficultyLevel === 'advanced') {
    description += '盆栽愛好家・上級者向けの本格的な品種です。'
  }

  // 価格・価値提案
  if (price) {
    description += `価格${price.toLocaleString()}円。`
  }

  // 標準サービス内容
  description += '育て方ガイド・手入れ方法付き。水やり・管理のコツも詳しく解説します。'

  return description
}

// 樹種別特徴説明
function getSpeciesFeatures(species: string): string {
  const features = {
    '真柏': '最も育てやすく枯らしにくい針葉樹。盆栽初心者に最適。',
    'ケヤキ': '芽摘み・葉刈りが楽しめる人気の落葉樹。四季の変化が美しい。',
    'モミジ': '秋の紅葉が絶景の落葉樹。初心者でも育てやすい人気種。',
    '桜': '春の開花が楽しめる花もの盆栽。季節感たっぷり。',
    '松': '盆栽の王道・伝統的な針葉樹。本格的な盆栽を楽しみたい方に。',
    '梅': '早春の花と香りが楽しめる花もの盆栽。実も楽しめる。',
    'ガジュマル': '室内栽培に最適な観葉植物タイプ。マンション・ベランダでも安心。'
  }

  return (features as any)[species] || '美しい樹形が楽しめる盆栽。'
}

// 記事の自動SEO最適化
export function generateArticleSEO(article: Article) {
  const title = article.title
  const category = article.category.name
  const tags = article.tags?.map(tag => tag.name) || []

  // 記事タイプを判定
  const articleType = detectArticleType(title, category, tags)

  // 記事タイプ別キーワード生成
  const keywords = generateArticleKeywords(title, articleType, category, tags)

  // SEO最適化されたタイトル生成
  const seoTitle = generateArticleTitle(title, articleType)

  // SEO最適化された説明文生成
  const seoDescription = generateArticleDescription(article, articleType)

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [...new Set(keywords)],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article' as const,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: seoTitle,
      description: seoDescription,
    }
  }
}

// 記事タイプ検出
function detectArticleType(title: string, category: string, tags: string[]): string {
  const content = `${title} ${category} ${tags.join(' ')}`.toLowerCase()

  if (content.includes('育て方') || content.includes('手入れ') || content.includes('管理')) {
    return 'how-to'
  }
  if (content.includes('初心者') || content.includes('ガイド') || content.includes('始め方')) {
    return 'beginner-guide'
  }
  if (content.includes('種類') || content.includes('品種') || content.includes('選び方')) {
    return 'variety-guide'
  }
  if (content.includes('おすすめ') || content.includes('ランキング') || content.includes('比較')) {
    return 'recommendation'
  }

  return 'general'
}

// 記事キーワード生成
function generateArticleKeywords(title: string, type: string, category: string, tags: string[]): string[] {
  const baseKeywords = [...BONSAI_KEYWORDS.base, category, ...tags]

  const typeKeywords = {
    'how-to': ['育て方', '手入れ', '管理', '方法', 'やり方', 'コツ'],
    'beginner-guide': [...BONSAI_KEYWORDS.beginner, 'ガイド', '始め方', '入門'],
    'variety-guide': ['種類', '品種', '選び方', 'おすすめ', '人気'],
    'recommendation': ['おすすめ', 'ランキング', '比較', '選び方', '人気'],
    'general': []
  }

  return [...baseKeywords, ...((typeKeywords as any)[type] || [])]
}

// 記事タイトル生成
function generateArticleTitle(title: string, type: string): string {
  // 既にSEO最適化されている場合はそのまま
  if (title.includes('|') || title.includes('-') || title.includes('完全ガイド')) {
    return title
  }

  const suffixes = {
    'how-to': '完全ガイド | 盆栽コレクション',
    'beginner-guide': '初心者向け完全ガイド | 盆栽コレクション',
    'variety-guide': '種類・選び方ガイド | 盆栽コレクション',
    'recommendation': 'おすすめランキング | 盆栽コレクション',
    'general': '| 盆栽コレクション'
  }

  return `${title} - ${(suffixes as any)[type] || suffixes.general}`
}

// 記事説明文生成
function generateArticleDescription(article: Article, type: string): string {
  const title = article.title
  const excerpt = article.excerpt

  if (excerpt && excerpt.length > 50) {
    return excerpt
  }

  const templates = {
    'how-to': `${title}を詳しく解説。初心者でもわかりやすい手順・コツ・注意点を画像付きで説明します。盆栽の基本から応用まで完全ガイド。`,
    'beginner-guide': `盆栽初心者必見！${title}を基礎から詳しく解説。失敗しないコツ・おすすめの品種・必要な道具まで完全ガイドします。`,
    'variety-guide': `${title}を種類別に詳しく解説。特徴・育てやすさ・価格帯を比較して、あなたにぴったりの盆栽選びをサポートします。`,
    'recommendation': `${title}を専門家目線で厳選。初心者から上級者まで、目的・予算別におすすめを詳しく解説します。`,
    'general': `${title}について詳しく解説。盆栽愛好家・初心者の方に役立つ情報をわかりやすくお伝えします。`
  }

  return (templates as any)[type] || templates.general
}

// How-to構造化データの自動生成
export function generateHowToStructuredData(article: Article) {
  const title = article.title
  const content = article.content

  // "How-to"タイプの記事でない場合はnullを返す
  const articleType = detectArticleType(title, article.category.name, article.tags?.map(tag => tag.name) || [])
  if (articleType !== 'how-to') {
    return null
  }

  // コンテンツから手順を自動抽出
  const steps = extractStepsFromContent(content, title)

  if (steps.length === 0) {
    return null
  }

  // 盆栽育成に必要な道具・材料を自動推定
  const { supplies, tools, estimatedTime } = inferBonsaiRequirements(content, title)

  return {
    title,
    description: article.excerpt || `${title}の詳しい手順を解説。初心者でもわかりやすい盆栽の育て方ガイドです。`,
    steps,
    totalTime: estimatedTime,
    suppliesNeeded: supplies,
    toolsNeeded: tools
  }
}

// コンテンツから手順を抽出
function extractStepsFromContent(content: string, title: string): Array<{name: string, description: string, image?: string}> {
  const steps: Array<{name: string, description: string, image?: string}> = []

  // マークダウン形式の手順を検出
  const stepPatterns = [
    /(?:^|\n)(?:##\s+)?(?:\d+\.?\s*)?(.+?(?:方法|手順|やり方|ステップ).*?)\n((?:(?!(?:^|\n)##|\n\d+\.)[\s\S])*)/gm,
    /(?:^|\n)(?:##\s+)?(.+?(?:準備|植え替え|剪定|水やり|手入れ|管理).*?)\n((?:(?!(?:^|\n)##)[\s\S])*)/gm,
    /(?:^|\n)(?:\d+\.\s*)(.+?)\n((?:(?!\n\d+\.)[\s\S])*)/gm
  ]

  for (const pattern of stepPatterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const stepName = match[1].trim()
      const stepDescription = match[2].trim().substring(0, 300) // 最初の300文字

      if (stepName.length > 0 && stepDescription.length > 0) {
        steps.push({
          name: stepName,
          description: stepDescription
        })
      }
    }

    if (steps.length > 0) break // 最初にマッチしたパターンを使用
  }

  // 汎用的な盆栽手順を生成（内容に手順が明確でない場合）
  if (steps.length === 0) {
    const genericSteps = generateGenericBonsaiSteps(title)
    steps.push(...genericSteps)
  }

  return steps.slice(0, 8) // 最大8ステップまで
}

// 盆栽の一般的な手順生成
function generateGenericBonsaiSteps(title: string): Array<{name: string, description: string}> {
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes('水やり')) {
    return [
      { name: '土の状態を確認', description: '土の表面が乾いているかチェックします。' },
      { name: '適量の水を用意', description: 'ぬるま湯程度の温度の水を準備します。' },
      { name: 'ゆっくりと水やり', description: '土全体に均等に水が行き渡るようにゆっくりと水やりします。' },
      { name: '排水を確認', description: '鉢底から水が流れ出ることを確認します。' }
    ]
  }

  if (lowerTitle.includes('剪定')) {
    return [
      { name: '剪定ばさみを準備', description: '清潔で鋭い剪定ばさみを用意します。' },
      { name: '不要な枝を選定', description: '枯れた枝や形を乱す枝を特定します。' },
      { name: '切り口に注意して剪定', description: '芽の上で斜めにカットし、切り口を清潔に保ちます。' },
      { name: '全体のバランスを整える', description: '樹形を確認し、全体のバランスを調整します。' }
    ]
  }

  if (lowerTitle.includes('植え替え')) {
    return [
      { name: '新しい土と鉢を準備', description: '盆栽用の土と適切なサイズの鉢を用意します。' },
      { name: '古い土を除去', description: '根を傷つけないよう注意して古い土を取り除きます。' },
      { name: '根の整理', description: '伸びすぎた根や傷んだ根を丁寧にカットします。' },
      { name: '新しい鉢に植え付け', description: '新しい土を使って鉢に植え付けます。' }
    ]
  }

  // デフォルトの育て方手順
  return [
    { name: '置き場所の選定', description: '適切な日当たりと風通しの場所を選びます。' },
    { name: '水やりの管理', description: '土の状態を見ながら適切に水やりを行います。' },
    { name: '定期的な観察', description: '葉の色や枝の状態を定期的にチェックします。' },
    { name: '季節に応じたケア', description: '季節の変化に合わせて管理方法を調整します。' }
  ]
}

// 盆栽育成の必要物品を推定
function inferBonsaiRequirements(content: string, title: string): {
  supplies: string[]
  tools: string[]
  estimatedTime: string
} {
  const supplies: string[] = []
  const tools: string[] = []

  const contentLower = (content + title).toLowerCase()

  // 材料の推定
  if (contentLower.includes('土') || contentLower.includes('植え替え')) {
    supplies.push('盆栽用土')
  }
  if (contentLower.includes('肥料')) {
    supplies.push('盆栽用肥料')
  }
  if (contentLower.includes('水')) {
    supplies.push('水')
  }
  if (contentLower.includes('鉢') || contentLower.includes('植え替え')) {
    supplies.push('適切なサイズの鉢')
  }

  // 道具の推定
  if (contentLower.includes('剪定') || contentLower.includes('切る')) {
    tools.push('剪定ばさみ')
  }
  if (contentLower.includes('植え替え')) {
    tools.push('植え替え用ヘラ', '根かき')
  }
  if (contentLower.includes('水やり')) {
    tools.push('水やり用じょうろ')
  }
  if (contentLower.includes('針金') || contentLower.includes('整形')) {
    tools.push('盆栽用針金')
  }

  // 時間の推定
  let estimatedTime = 'PT30M' // デフォルト30分
  if (contentLower.includes('植え替え')) {
    estimatedTime = 'PT2H' // 植え替えは2時間
  } else if (contentLower.includes('剪定')) {
    estimatedTime = 'PT1H' // 剪定は1時間
  } else if (contentLower.includes('水やり')) {
    estimatedTime = 'PT10M' // 水やりは10分
  }

  return {
    supplies: [...new Set(supplies)],
    tools: [...new Set(tools)],
    estimatedTime
  }
}