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