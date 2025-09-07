import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SizeCategory } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

export function getSizeCategoryLabel(size: SizeCategory): string {
  const labels: Record<SizeCategory, string> = {
    mini: 'ミニ',
    small: '小',
    medium: '中',
    large: '大',
    unknown: '不明',
  }
  return labels[size]
}

// Regional mapping for gardens filtering
export const PREFECTURE_TO_REGION: Record<string, string> = {
  // 関東
  '東京都': '関東',
  '神奈川県': '関東', 
  '埼玉県': '関東',
  '千葉県': '関東',
  '茨城県': '関東',
  '栃木県': '関東',
  '群馬県': '関東',

  // 関西
  '大阪府': '関西',
  '京都府': '関西',
  '兵庫県': '関西',
  '奈良県': '関西',
  '滋賀県': '関西',
  '和歌山県': '関西',

  // 中部
  '愛知県': '中部',
  '静岡県': '中部',
  '岐阜県': '中部',
  '三重県': '中部',
  '長野県': '中部',
  '山梨県': '中部',
  '新潟県': '中部',
  '富山県': '中部',
  '石川県': '中部',
  '福井県': '中部',

  // 九州・沖縄
  '福岡県': '九州・沖縄',
  '佐賀県': '九州・沖縄',
  '長崎県': '九州・沖縄',
  '熊本県': '九州・沖縄',
  '大分県': '九州・沖縄',
  '宮崎県': '九州・沖縄',
  '鹿児島県': '九州・沖縄',
  '沖縄県': '九州・沖縄',

  // 四国
  '香川県': '四国',
  '徳島県': '四国',
  '愛媛県': '四国',
  '高知県': '四国',

  // 中国
  '広島県': '中国',
  '岡山県': '中国',
  '鳥取県': '中国',
  '島根県': '中国',
  '山口県': '中国',

  // 東北
  '青森県': '東北',
  '岩手県': '東北',
  '宮城県': '東北',
  '秋田県': '東北',
  '山形県': '東北',
  '福島県': '東北',

  // 北海道
  '北海道': '北海道',
}

export const REGIONS = {
  '関東': { 
    count: 21, 
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    icon: '🏙️'
  },
  '関西': { 
    count: 18, 
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200', 
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    icon: '🏛️'
  },
  '中部': { 
    count: 12, 
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    icon: '⛰️'
  },
  '九州・沖縄': { 
    count: 10, 
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    buttonColor: 'bg-orange-600 hover:bg-orange-700',
    icon: '🌺'
  },
  '四国': { 
    count: 8, 
    color: 'bg-teal-500',
    lightColor: 'bg-teal-100',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    buttonColor: 'bg-teal-600 hover:bg-teal-700',
    icon: '🌲'
  },
  '東北': { 
    count: 6, 
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-100',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
    icon: '🏔️'
  },
  '中国': { 
    count: 5, 
    color: 'bg-red-500',
    lightColor: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    icon: '🦌'
  },
  '北海道': { 
    count: 2, 
    color: 'bg-gray-500',
    lightColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    buttonColor: 'bg-gray-600 hover:bg-gray-700',
    icon: '🐻'
  }
} as const

export function getRegionFromPrefecture(prefecture: string): string {
  return PREFECTURE_TO_REGION[prefecture] || '未分類'
}

export function getRegionTheme(region: string) {
  return REGIONS[region as keyof typeof REGIONS] || {
    count: 0,
    color: 'bg-gray-400',
    lightColor: 'bg-gray-50',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200',
    buttonColor: 'bg-gray-500 hover:bg-gray-600',
    icon: '🌿'
  }
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}