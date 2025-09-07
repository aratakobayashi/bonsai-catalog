/**
 * Product UI Helper Functions
 * 商品の拡張情報を表示用に変換するヘルパー関数
 */

import { Product } from '@/types'

/**
 * 難易度レベルをアイコン表示に変換
 */
export function getDifficultyIcon(level?: number): string {
  switch (level) {
    case 1: return '🌱'
    case 2: return '🌿'
    case 3: return '🌲'
    default: return '🌿'
  }
}

/**
 * 難易度レベルをテキストに変換
 */
export function getDifficultyText(level?: number): string {
  switch (level) {
    case 1: return '初心者OK'
    case 2: return '中級者向け'
    case 3: return '上級者向け'
    default: return '中級者向け'
  }
}

/**
 * 難易度レベルをアイコン+テキストで表示
 */
export function getDifficultyDisplay(level?: number): string {
  return `${getDifficultyIcon(level)} ${getDifficultyText(level)}`
}

/**
 * 難易度レベルの色を取得
 */
export function getDifficultyColor(level?: number): string {
  switch (level) {
    case 1: return 'text-green-600'
    case 2: return 'text-yellow-600'
    case 3: return 'text-red-600'
    default: return 'text-yellow-600'
  }
}

/**
 * サイズ表示テキストを生成
 */
export function getSizeDisplayText(product: Product): string {
  const sizeCategory = getSizeCategoryLabel(product.size_category)
  if (product.height_cm) {
    return `${sizeCategory}(${product.height_cm}cm)`
  }
  return sizeCategory
}

/**
 * サイズカテゴリのラベルを取得（既存関数を移植）
 */
export function getSizeCategoryLabel(category: string): string {
  switch (category) {
    case 'mini': return 'ミニ'
    case 'small': return '小品'
    case 'medium': return '中品'
    case 'large': return '大品'
    default: return '不明'
  }
}

/**
 * 開花月表示を生成
 */
export function getBloomDisplay(months?: number[]): string | null {
  if (!months || months.length === 0) return null
  
  if (months.length === 1) {
    return `🌸${months[0]}月開花`
  } else if (months.length === 2) {
    return `🌸${months[0]}-${months[1]}月開花`
  } else {
    return `🌸${months[0]}-${months[months.length - 1]}月開花`
  }
}

/**
 * 紅葉月表示を生成
 */
export function getFoliageDisplay(months?: number[]): string | null {
  if (!months || months.length === 0) return null
  
  if (months.length === 1) {
    return `🍂${months[0]}月紅葉`
  } else if (months.length === 2) {
    return `🍂${months[0]}-${months[1]}月紅葉`
  } else {
    return `🍂${months[0]}-${months[months.length - 1]}月紅葉`
  }
}

/**
 * 特徴バッジの配列を生成
 */
export function getFeatureBadges(product: Product): Array<{ text: string; color: string; icon: string }> {
  const badges = []
  
  // 室内栽培可能
  if (product.indoor_suitable) {
    badges.push({ text: '室内OK', color: 'bg-green-100 text-green-800', icon: '🏠' })
  }
  
  // ギフト適正
  if (product.gift_suitable) {
    badges.push({ text: 'ギフト向け', color: 'bg-pink-100 text-pink-800', icon: '🎁' })
  }
  
  // 初心者向け
  if (product.beginner_friendly) {
    badges.push({ text: '初心者向け', color: 'bg-blue-100 text-blue-800', icon: '👶' })
  }
  
  // セット商品
  if (product.name.toLowerCase().includes('セット')) {
    badges.push({ text: 'セット商品', color: 'bg-purple-100 text-purple-800', icon: '📦' })
  }
  
  return badges
}

/**
 * 季節表示（開花・紅葉）を取得
 */
export function getSeasonDisplay(product: Product): string | null {
  const bloom = getBloomDisplay(product.bloom_months)
  const foliage = getFoliageDisplay(product.foliage_months)
  
  if (bloom && foliage) {
    return `${bloom} ${foliage}`
  } else if (bloom) {
    return bloom
  } else if (foliage) {
    return foliage
  }
  
  return null
}

/**
 * 詳細サイズ情報を取得
 */
export function getDetailedSize(product: Product): {
  height: string
  width: string
  potSize: string
  description: string
} {
  const height = product.height_cm ? `約${product.height_cm}cm` : '不明'
  const width = product.width_cm ? `約${product.width_cm}cm` : '不明'
  const potSize = product.pot_diameter_cm ? `直径${product.pot_diameter_cm}cm` : '不明'
  
  let description = ''
  if (product.size_category === 'mini') {
    description = '手のひらサイズ・デスクに最適'
  } else if (product.size_category === 'small') {
    description = '卓上サイズ・室内に最適'
  } else if (product.size_category === 'medium') {
    description = 'リビング向け・存在感あり'
  } else if (product.size_category === 'large') {
    description = '本格展示用・迫力あり'
  }
  
  return { height, width, potSize, description }
}

/**
 * 育成環境情報を取得
 */
export function getCareEnvironment(product: Product): {
  sunlight: string
  watering: string
  frequency: string
  location: string
} {
  const sunlightMap: Record<string, string> = {
    'full_sun': '日向',
    'partial_shade': '半日陰',
    'shade': '日陰'
  }
  
  const wateringMap: Record<string, string> = {
    'daily': '毎日',
    'when_dry': '土が乾いたら',
    'weekly': '週1回'
  }
  
  const frequencyMap: Record<string, string> = {
    'daily': '毎日',
    'weekly': '週1回',
    'monthly': '月1回'
  }
  
  return {
    sunlight: sunlightMap[product.sunlight_requirement || 'partial_shade'] || '半日陰',
    watering: wateringMap[product.watering_frequency || 'when_dry'] || '土が乾いたら',
    frequency: frequencyMap[product.care_frequency || 'weekly'] || '週1回',
    location: product.indoor_suitable ? '室内・屋外両方OK' : '屋外推奨'
  }
}