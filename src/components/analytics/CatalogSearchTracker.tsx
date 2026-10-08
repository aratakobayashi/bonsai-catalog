'use client'

import { useEffect } from 'react'

type Gtag = (...args: unknown[]) => void

// 商品一覧で「検索された言葉」「使われた絞り込み条件」「0件だったか」を GA4 に送る
export function CatalogSearchTracker({
  searchTerm,
  filterKeys,
  resultCount,
}: {
  searchTerm?: string
  filterKeys: string
  resultCount: number
}) {
  useEffect(() => {
    if (!searchTerm && !filterKeys) return
    let tries = 0
    // 計測タグの読み込みを待ってから送る（最大5秒）
    const timer = setInterval(() => {
      const gtag = (window as unknown as { gtag?: Gtag }).gtag
      if (!gtag && ++tries < 25) return
      clearInterval(timer)
      if (!gtag) return
      if (searchTerm) gtag('event', 'search', { search_term: searchTerm, result_count: resultCount })
      if (filterKeys) gtag('event', 'catalog_filter', { filter_keys: filterKeys.slice(0, 100), result_count: resultCount })
      if (resultCount === 0) gtag('event', 'search_no_results', { search_term: searchTerm ?? '', filter_keys: filterKeys.slice(0, 100) })
    }, 200)
    return () => clearInterval(timer)
  }, [searchTerm, filterKeys, resultCount])
  return null
}
