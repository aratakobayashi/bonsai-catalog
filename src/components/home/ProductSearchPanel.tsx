'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { value: 'cat-shohaku', icon: '🌲', label: '松柏類' },
  { value: 'cat-zouki', icon: '🍂', label: '雑木類' },
  { value: 'cat-hana', icon: '🌸', label: '花もの' },
  { value: 'cat-mi', icon: '🍇', label: '実もの' },
  { value: 'mini', icon: '🪴', label: 'ミニ盆栽' }
]

const PRICE_RANGES = [
  { value: '0-10000', label: '〜1万円' },
  { value: '10000-30000', label: '1万〜3万円' },
  { value: '30000-50000', label: '3万〜5万円' },
  { value: '50000-100000', label: '5万〜10万円' },
  { value: '100000-', label: '10万円〜' }
]

function optionClass(selected: boolean) {
  return `group p-3 md:p-5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
    selected
      ? 'border-slate-400 bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-600/30'
      : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-slate-200/50 text-slate-700'
  }`
}

export function ProductSearchPanel() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedCategory) params.set('species', selectedCategory)
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-')
      if (min && min !== '0') params.set('min', min)
      if (max) params.set('max', max)
    }
    const queryString = params.toString()
    router.push(queryString ? `/products?${queryString}` : '/products')
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h3 className="text-base md:text-lg font-medium text-slate-700 mb-4 md:mb-6 text-center tracking-wide">樹種カテゴリ</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {CATEGORIES.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(selectedCategory === category.value ? '' : category.value)}
              className={optionClass(selectedCategory === category.value)}
            >
              <div className="text-xl md:text-2xl mb-2 md:mb-3 transition-transform duration-300 group-hover:scale-110">
                {category.icon}
              </div>
              <div className="text-xs md:text-sm font-medium tracking-wide">{category.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base md:text-lg font-medium text-slate-700 mb-4 md:mb-6 text-center tracking-wide">価格帯</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {PRICE_RANGES.map(priceRange => (
            <button
              key={priceRange.value}
              onClick={() => setSelectedPriceRange(selectedPriceRange === priceRange.value ? '' : priceRange.value)}
              className={optionClass(selectedPriceRange === priceRange.value)}
            >
              <div className="text-xs md:text-sm font-medium tracking-wide">{priceRange.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4 md:pt-6">
        <button
          onClick={handleSearch}
          disabled={!selectedCategory && !selectedPriceRange}
          className="group relative bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-white font-medium py-3 px-8 md:py-4 md:px-16 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 border border-slate-500/30"
        >
          <span className="relative flex items-center gap-2 md:gap-3 text-base md:text-lg tracking-wide">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            盆栽を探す
          </span>
        </button>
      </div>
    </div>
  )
}
