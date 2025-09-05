'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchWithAutocompleteProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  products?: Array<{ name: string; category: string }>
}

interface SearchSuggestion {
  type: 'product' | 'category' | 'recent'
  value: string
  category?: string
}

export function SearchWithAutocomplete({
  onSearch,
  placeholder = '商品名で検索...',
  className,
  products = []
}: SearchWithAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ローカルストレージから検索履歴を読み込み
  useEffect(() => {
    const saved = localStorage.getItem('bonsai-search-history')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse search history:', error)
      }
    }
  }, [])

  // 検索履歴の保存
  const saveToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return
    
    const updated = [searchTerm, ...recentSearches.filter(item => item !== searchTerm)]
      .slice(0, 5) // 最新5件のみ保存
    
    setRecentSearches(updated)
    localStorage.setItem('bonsai-search-history', JSON.stringify(updated))
  }

  // サジェスト生成
  useEffect(() => {
    if (!query.trim()) {
      // クエリが空の場合は最近の検索を表示
      setSuggestions(
        recentSearches.map(search => ({
          type: 'recent',
          value: search
        }))
      )
      return
    }

    const newSuggestions: SearchSuggestion[] = []
    const queryLower = query.toLowerCase()

    // 商品名から検索
    const productMatches = products
      .filter(product => product.name.toLowerCase().includes(queryLower))
      .slice(0, 4)
      .map(product => ({
        type: 'product' as const,
        value: product.name,
        category: product.category
      }))

    // カテゴリから検索
    const categoryMatches = [...new Set(products.map(p => p.category))]
      .filter(category => category.toLowerCase().includes(queryLower))
      .slice(0, 2)
      .map(category => ({
        type: 'category' as const,
        value: category
      }))

    newSuggestions.push(...productMatches, ...categoryMatches)
    setSuggestions(newSuggestions.slice(0, 6))
  }, [query, products, recentSearches])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else if (query.trim()) {
          handleSearch()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query)
      saveToHistory(query)
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const searchValue = suggestion.value
    setQuery(searchValue)
    onSearch(searchValue)
    saveToHistory(searchValue)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const clearQuery = () => {
    setQuery('')
    onSearch('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const clearHistory = () => {
    setRecentSearches([])
    localStorage.removeItem('bonsai-search-history')
  }

  // 外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return <Search className="h-4 w-4 text-neutral-400" />
      case 'category':
        return <TrendingUp className="h-4 w-4 text-accent-500" />
      case 'recent':
        return <Clock className="h-4 w-4 text-neutral-400" />
      default:
        return <Search className="h-4 w-4 text-neutral-400" />
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-white border-2 border-neutral-200 rounded-xl text-base placeholder-neutral-500 focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-100 transition-all duration-200"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        )}
      </div>

      {/* サジェスト一覧 */}
      {isOpen && (suggestions.length > 0 || (!query && recentSearches.length > 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-luxury z-50 overflow-hidden">
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-700">最近の検索</span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-neutral-500 hover:text-accent-600 transition-colors"
                >
                  クリア
                </button>
              </div>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors',
                  selectedIndex === index && 'bg-accent-50 border-l-4 border-accent-500'
                )}
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {suggestion.value}
                  </div>
                  {suggestion.category && (
                    <div className="text-xs text-neutral-500 truncate">
                      {suggestion.category}で検索
                    </div>
                  )}
                  {suggestion.type === 'recent' && (
                    <div className="text-xs text-neutral-500">検索履歴</div>
                  )}
                </div>
                {suggestion.type === 'category' && (
                  <div className="text-xs text-accent-600 font-medium">カテゴリ</div>
                )}
              </button>
            ))}
          </div>

          {query && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-neutral-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
              <p className="text-sm">該当する商品が見つかりませんでした</p>
              <p className="text-xs">別のキーワードで検索してみてください</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}