'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/features/ProductCard'
import { SearchBar } from '@/components/features/SearchBar'
import { ProductFilter } from '@/components/features/ProductFilter'
import { Button } from '@/components/ui/Button'
import type { Product, ProductFilters, SizeCategory } from '@/types'

export default function ProductsClient() {
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
      }

      if (data) {
        setProducts(data)
        
        // カテゴリとタグの一覧を生成
        const categories = Array.from(new Set(data.map(p => p.category))).sort()
        setAvailableCategories(categories)
        
        const allTags = data.flatMap(p => p.tags || [])
        const uniqueTags = Array.from(new Set(allTags)).sort()
        setAvailableTags(uniqueTags)
      }
      setIsLoading(false)
    }

    fetchProducts()
  }, [])

  // URLパラメータからフィルターを復元
  useEffect(() => {
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const size = searchParams.get('size')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const newFilters: ProductFilters = {}
    if (category) newFilters.category = category
    if (tag) newFilters.tags = [tag]
    if (size) newFilters.size_category = size as SizeCategory
    if (minPrice) newFilters.price_min = Number(minPrice)
    if (maxPrice) newFilters.price_max = Number(maxPrice)

    setFilters(newFilters)
  }, [searchParams])

  // フィルタリングとソート
  useEffect(() => {
    let filtered = [...products]

    // カテゴリでフィルタ
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }

    // タグでフィルタ
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags && filters.tags!.some(tag => p.tags?.includes(tag))
      )
    }

    // サイズでフィルタ
    if (filters.size_category) {
      filtered = filtered.filter(p => p.size_category === filters.size_category)
    }

    // 価格でフィルタ
    if (filters.price_min) {
      filtered = filtered.filter(p => p.price >= filters.price_min!)
    }
    if (filters.price_max) {
      filtered = filtered.filter(p => p.price <= filters.price_max!)
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
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

  // URLパラメータを更新
  const updateURLParams = (newFilters: ProductFilters) => {
    const params = new URLSearchParams()
    
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.tags && newFilters.tags[0]) params.set('tag', newFilters.tags[0])
    if (newFilters.size_category) params.set('size', newFilters.size_category)
    if (newFilters.price_min) params.set('minPrice', newFilters.price_min.toString())
    if (newFilters.price_max) params.set('maxPrice', newFilters.price_max.toString())

    const queryString = params.toString()
    const url = queryString ? `/products?${queryString}` : '/products'
    router.push(url)
  }

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters)
    updateURLParams(newFilters)
  }

  const handleSearch = (query: string) => {
    if (query) {
      const searched = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredProducts(searched)
    } else {
      setFilteredProducts(products)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">商品カタログ</h1>
          <p className="text-xl text-gray-600">
            厳選された盆栽を豊富に取り揃えています
          </p>
        </div>

        {/* 検索バー */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} placeholder="商品名や説明文で検索..." />
        </div>

        {/* フィルターとソート */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <ProductFilter
              filters={filters}
              onFiltersChange={handleFilterChange}
              availableCategories={availableCategories}
              availableTags={availableTags}
            />
          </div>
          <div className="md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bonsai-green-500"
            >
              <option value="created_at">新着順</option>
              <option value="name">名前順</option>
              <option value="price_asc">価格が安い順</option>
              <option value="price_desc">価格が高い順</option>
            </select>
          </div>
        </div>

        {/* 商品一覧 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bonsai-green-600"></div>
            <p className="mt-4 text-gray-600">商品を読み込み中...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="mb-4 text-gray-600">
              {filteredProducts.length}件の商品が見つかりました
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-6xl">🌲</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              商品が見つかりません
            </h3>
            <p className="text-gray-600 mb-6">
              検索条件を変更してお試しください
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({})
                updateURLParams({})
              }}
            >
              フィルターをクリア
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}