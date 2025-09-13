/**
 * 記事内容から関連商品を智能推薦するシステム
 */

import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

// 記事キーワードから商品カテゴリへのマッピング
const KEYWORD_TO_CATEGORY_MAP = {
  'ミニ盆栽': ['ミニ盆栽', '初心者向け盆栽', '室内植物'],
  '豆盆栽': ['豆盆栽', 'ミニ盆栽', '小型盆栽'],
  '松': ['松類', '針葉樹', '盆栽'],
  '桜': ['花木', '桜', '春の盆栽'],
  '梅': ['花木', '梅', '冬春盆栽'],
  '椿': ['花木', '椿', '冬盆栽'],
  '南天': ['実物盆栽', '南天', '縁起物'],
  '姫リンゴ': ['実物盆栽', 'リンゴ', '果樹盆栽'],
  '苔玉': ['苔玉', '和雑貨', 'インテリア'],
  '用土': ['用土', '盆栽用品', '土・肥料'],
  '鉢': ['盆栽鉢', '植木鉢', '盆栽用品'],
  '剪定': ['盆栽道具', '剪定鋏', '手入れ用品'],
  '初心者': ['初心者向け盆栽', 'スターターセット', '入門用'],
  'ギフト': ['ギフト盆栽', 'プレゼント', '贈り物'],
  '育て方': ['栽培用品', '肥料', '盆栽書籍']
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
      .eq('status', 'active')

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
      .eq('status', 'active')
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