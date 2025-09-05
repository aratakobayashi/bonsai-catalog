'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  initialValue?: string
}

export function SearchBar({ placeholder = "商品名で検索...", onSearch, initialValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
        >
          検索
        </Button>
      </div>
    </form>
  )
}