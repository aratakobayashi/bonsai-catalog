'use client'

import { useEffect } from 'react'
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals'

export function WebVitals() {
  useEffect(() => {
    const reportWebVital = (metric: any) => {
      // 開発環境では console.log で確認
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          delta: metric.delta,
          rating: metric.rating,
          entries: metric.entries
        })
      }

      // Google Analytics 4 に送信（GA4が設定されている場合）
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        })
      }

      // Vercel Analytics に送信
      if (typeof window !== 'undefined' && (window as any).va) {
        ;(window as any).va('track', 'web-vital', {
          name: metric.name,
          value: metric.value,
          rating: metric.rating
        })
      }
    }

    // Core Web Vitals を測定
    getCLS(reportWebVital)
    getFCP(reportWebVital)  
    getFID(reportWebVital)
    getLCP(reportWebVital)
    getTTFB(reportWebVital)

  }, [])

  return null // UIは表示しない
}

// パフォーマンス改善のためのユーティリティ関数
export const performanceUtils = {
  // プリロード用のlink要素を作成
  preloadResource: (href: string, as: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      document.head.appendChild(link)
    }
  },

  // 重要でないリソースの遅延読み込み
  deferNonCritical: (callback: () => void) => {
    if (typeof window !== 'undefined') {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(callback)
      } else {
        setTimeout(callback, 1)
      }
    }
  },

  // 画像の遅延読み込み設定
  getLazyLoadingProps: (priority?: boolean) => ({
    loading: priority ? 'eager' as const : 'lazy' as const,
    priority,
  })
}