'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/features/ProductCard'
import { SearchBar } from '@/components/features/SearchBar'
import { ProductFilter } from '@/components/features/ProductFilter'
import { Button } from '@/components/ui/Button'
import type { Product, ProductFilters } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<ProductFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'created_at'>('created_at')

  const searchParams = useSearchParams()
  const router = useRouter()

  // 商品データの取得
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('商品データの取得エラー:', error)
        return
      }

      if (data) {
        setProducts(data)
        
        // カテゴリとタグの一覧を生成
        const categories = [...new Set(data.map(p => p.category))].sort()
        setAvailableCategories(categories)
        
        const allTags = data.flatMap(p => p.tags || [])
        const uniqueTags = [...new Set(allTags)].sort()
        setAvailableTags(uniqueTags)
      }
      setIsLoading(false)
    }

    fetchProducts()
  }, [])

  // URLパラメータからフィルターを初期化
  useEffect(() => {
    const initialFilters: ProductFilters = {}
    
    if (searchParams.get('category')) {
      initialFilters.category = searchParams.get('category')!
    }
    if (searchParams.get('size_category')) {
      initialFilters.size_category = searchParams.get('size_category') as any
    }
    if (searchParams.get('search')) {
      initialFilters.search = searchParams.get('search')!
    }
    if (searchParams.get('tags')) {
      initialFilters.tags = searchParams.get('tags')!.split(',')
    }
    if (searchParams.get('price_min')) {
      initialFilters.price_min = parseInt(searchParams.get('price_min')!)
    }
    if (searchParams.get('price_max')) {
      initialFilters.price_max = parseInt(searchParams.get('price_max')!)
    }

    setFilters(initialFilters)
  }, [searchParams])

  // フィルタリングとソート
  useEffect(() => {
    let filtered = [...products]

    // カテゴリフィルター
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }

    // サイズフィルター
    if (filters.size_category) {
      filtered = filtered.filter(p => p.size_category === filters.size_category)
    }

    // 価格フィルター
    if (filters.price_min !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.price_min!)
    }
    if (filters.price_max !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.price_max!)
    }

    // タグフィルター
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(p => 
        filters.tags!.some(tag => p.tags?.includes(tag))
      )
    }

    // 検索フィルター
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ja')
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredProducts(filtered)
  }, [products, filters, sortBy])

  // フィルターをURLに反映
  const updateURL = (newFilters: ProductFilters) => {
    const params = new URLSearchParams()
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','))
        } else {
          params.set(key, value.toString())
        }
      }
    })

    const newURL = params.toString() 
      ? `/products?${params.toString()}`
      : '/products'
    
    router.push(newURL)
  }

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, search: query || undefined }
    handleFiltersChange(newFilters)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">商品データを読み込み中...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">商品一覧</h1>
          <SearchBar
            onSearch={handleSearch}
            initialValue={filters.search || ''}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* フィルターサイドバー */}
          <div className="w-full md:w-80 flex-shrink-0">
            <ProductFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableCategories={availableCategories}
              availableTags={availableTags}
            />
          </div>

          {/* 商品一覧 */}
          <div className="flex-1">
            {/* ソートとカウント */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredProducts.length}件の商品が見つかりました
              </p>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600">並び順:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="created_at">新着順</option>
                  <option value="name">商品名順</option>
                  <option value="price_asc">価格の安い順</option>
                  <option value="price_desc">価格の高い順</option>
                </select>
              </div>
            </div>

            {/* 商品グリッド */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  該当する商品が見つかりませんでした
                </h3>
                <p className="text-gray-600 mb-4">
                  検索条件を変更してお試しください
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleFiltersChange({})}
                >
                  フィルターをクリア
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}