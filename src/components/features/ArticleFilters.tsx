'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// 条件を書き換えて一覧を開き直す（ページ番号はリセット）
function useUpdateFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  return (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `/guides?${qs}` : '/guides')
  }
}

// 記事の検索窓
export function ArticleSearchBox({ initialQuery = '' }: { initialQuery?: string }) {
  const updateFilters = useUpdateFilters()
  const [query, setQuery] = useState(initialQuery)

  return (
    <form
      role="search"
      onSubmit={e => {
        e.preventDefault()
        updateFilters({ search: query.trim() || undefined })
      }}
      className="relative"
    >
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="記事を検索"
        aria-label="記事を検索"
        className="h-11 w-full appearance-none rounded-none border-0 border-b border-ink bg-transparent pl-0 pr-10 text-[13.5px] text-ink placeholder:text-ink-muted focus:border-gold-dark focus:ring-0"
      />
      <button type="submit" aria-label="検索" className="absolute inset-y-0 right-0 flex w-10 items-center justify-end text-ink-muted hover:text-ink">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  )
}

const SORT_OPTIONS = [
  { value: 'publishedAt', label: '新しい順' },
  { value: 'updatedAt', label: '更新順' },
  { value: 'readingTime', label: '短く読める順' },
  { value: 'title', label: 'タイトル順' },
]

// 件数と並び順（「147件・新しい順 ▾」）
export function ArticleSortSelect({ totalCount, sortBy }: { totalCount: number; sortBy?: string }) {
  const updateFilters = useUpdateFilters()
  const current = sortBy || 'publishedAt'

  return (
    <label className="relative inline-flex items-center whitespace-nowrap text-xs text-ink-muted">
      <span>{totalCount.toLocaleString()}件・</span>
      <select
        value={current}
        onChange={e => updateFilters({ sortBy: e.target.value })}
        aria-label="並び順"
        className="cursor-pointer appearance-none bg-transparent pr-4 text-xs text-ink-muted"
      >
        {SORT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-0 text-[10px]" aria-hidden="true">▾</span>
    </label>
  )
}
