/**
 * 記事内容から関連商品を智能推薦するシステム
 */

import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

// 記事キーワードから商品カテゴリへのマッピング（実際のDBカテゴリに基づく）
const KEYWORD_TO_CATEGORY_MAP = {
  'ミニ盆栽': ['花もの', '実もの', '松柏類', '雑木類'],
  '豆盆栽': ['花もの', '実もの', '松柏類'],
  '松': ['松柏類'],
  '五葉松': ['松柏類'],
  '真柏': ['松柏類'],
  '桜': ['花もの'],
  '梅': ['花もの'],
  '椿': ['花もの'],
  '長寿梅': ['花もの'],
  '南天': ['実もの'],
  '姫リンゴ': ['実もの'],
  'りんご': ['実もの'],
  'もみじ': ['雑木類'],
  '山もみじ': ['雑木類'],
  '楓': ['雑木類'],
  '初心者': ['花もの', '松柏類'], // 育てやすい種類
  'ギフト': ['花もの', '実もの'],
  '花': ['花もの'],
  '実': ['実もの'],
  '針葉樹': ['松柏類'],
  '落葉樹': ['雑木類']
} as const

// 季節キーワードマッピング
const SEASONAL_KEYWORDS = {
  spring: ['桜', '梅', '春', '新芽', '開花'],
  summer: ['緑', '夏', '涼しげ', '室内'],
  autumn: ['紅葉', '実', '秋', '収穫'],
  winter: ['椿', '南天', '正月', '縁起']
} as const

/**
 * 記事タイトルと内容から関連商品を推薦
 */
export async function getRecommendedProducts(
  title: string,
  content: string,
  limit: number = 4
): Promise<Product[]> {
  try {
    const keywords = extractKeywords(title, content)
    const categories = mapKeywordsToCategories(keywords)
    const seasonalBoost = getSeasonalBoost()

    // 商品検索クエリを構築
    let query = supabase
      .from('products')
      .select('*')

    // カテゴリでフィルタリング
    if (categories.length > 0) {
      query = query.or(
        categories.map(cat => `category.ilike.%${cat}%`).join(',')
      )
    }

    const { data: products, error } = await query.limit(limit * 2)

    if (error || !products) {
      console.error('商品取得エラー:', error)
      return await getFallbackProducts(limit)
    }

    // 関連度スコアで並び替え
    const scoredProducts = products.map(product => ({
      ...product,
      relevanceScore: calculateRelevanceScore(product, keywords, seasonalBoost)
    }))

    return scoredProducts
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

  } catch (error) {
    console.error('商品推薦エラー:', error)
    return await getFallbackProducts(limit)
  }
}

/**
 * 記事内容からキーワードを抽出
 */
function extractKeywords(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase()
  const keywords: string[] = []

  // 定義済みキーワードマッピングから検索
  Object.keys(KEYWORD_TO_CATEGORY_MAP).forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      keywords.push(keyword)
    }
  })

  // 季節キーワードを検索
  Object.values(SEASONAL_KEYWORDS).flat().forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      keywords.push(keyword)
    }
  })

  return [...new Set(keywords)] // 重複除去
}

/**
 * キーワードから商品カテゴリにマッピング
 */
function mapKeywordsToCategories(keywords: string[]): string[] {
  const categories: string[] = []

  keywords.forEach(keyword => {
    const mappedCategories = KEYWORD_TO_CATEGORY_MAP[keyword as keyof typeof KEYWORD_TO_CATEGORY_MAP]
    if (mappedCategories) {
      categories.push(...mappedCategories)
    }
  })

  return [...new Set(categories)]
}

/**
 * 季節に基づくブーストスコア
 */
function getSeasonalBoost(): Record<string, number> {
  const now = new Date()
  const month = now.getMonth() + 1

  const seasonMap = {
    spring: [3, 4, 5],   // 3-5月
    summer: [6, 7, 8],   // 6-8月
    autumn: [9, 10, 11], // 9-11月
    winter: [12, 1, 2]   // 12-2月
  }

  const boost: Record<string, number> = {}
  Object.entries(seasonMap).forEach(([season, months]) => {
    boost[season] = months.includes(month) ? 1.5 : 1.0
  })

  return boost
}

/**
 * 商品の関連度スコアを計算
 */
function calculateRelevanceScore(
  product: Product,
  keywords: string[],
  seasonalBoost: Record<string, number>
): number {
  let score = 0

  // 商品名とキーワードの一致度
  keywords.forEach(keyword => {
    if (product.name.toLowerCase().includes(keyword.toLowerCase())) {
      score += 10
    }
    if (product.category?.toLowerCase().includes(keyword.toLowerCase())) {
      score += 8
    }
    if (product.tags?.some(tag => 
      tag.toLowerCase().includes(keyword.toLowerCase())
    )) {
      score += 5
    }
  })

  // 季節ブースト
  Object.entries(seasonalBoost).forEach(([season, boost]) => {
    const seasonKeywords = SEASONAL_KEYWORDS[season as keyof typeof SEASONAL_KEYWORDS]
    if (seasonKeywords.some(sk => 
      product.name.toLowerCase().includes(sk) ||
      product.category?.toLowerCase().includes(sk)
    )) {
      score *= boost
    }
  })

  // 価格帯による調整（初心者向け記事なら安価な商品を優先）
  if (keywords.includes('初心者') && product.price && product.price < 5000) {
    score += 3
  }

  return score
}

/**
 * フォールバック：人気商品を返す
 */
async function getFallbackProducts(limit: number): Promise<Product[]> {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    return products || []
  } catch (error) {
    console.error('フォールバック商品取得エラー:', error)
    return []
  }
}

/**
 * 記事に最適化されたCTAメッセージを生成
 */
export function generateProductCTA(
  articleTitle: string,
  productName: string
): string {
  const templates = [
    `「${articleTitle}」で紹介した${productName}をチェック`,
    `${productName}で実際に始めてみませんか？`,
    `記事で学んだことを${productName}で実践`,
    `${productName}があれば、すぐに始められます`
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}