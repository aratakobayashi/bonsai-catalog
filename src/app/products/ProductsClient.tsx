'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/features/ProductCard'
import { SearchWithAutocomplete } from '@/components/features/SearchWithAutocomplete'
import { AdvancedFilter } from '@/components/features/AdvancedFilter'
import { Button } from '@/components/ui/Button'
import { PullToRefreshIndicator } from '@/components/ui/PullToRefreshIndicator'
import { Grid, List, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import type { Product, ProductFilters, SizeCategory } from '@/types'

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<ProductFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'created_at'>('created_at')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  // 商品データの取得
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('商品データの取得エラー:', error)
      return
    }

    if (data && data.length > 0) {
      setProducts(data as Product[])

      // カテゴリとタグの一覧を生成
      const categories = Array.from(new Set((data as Product[]).map(p => p.category))).filter(Boolean).sort()
      setAvailableCategories(categories)

      const allTags = (data as Product[]).flatMap(p => p.tags || [])
      const uniqueTags = Array.from(new Set(allTags)).sort()
      setAvailableTags(uniqueTags)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // URLパラメータからフィルターを復元
  useEffect(() => {
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const size = searchParams.get('size')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const season = searchParams.get('season')
    const location = searchParams.get('location')

    const newFilters: ProductFilters = {}
    if (category) newFilters.category = category
    if (tag) newFilters.tags = [tag]
    if (size) newFilters.size_category = size as SizeCategory
    if (minPrice) newFilters.price_min = Number(minPrice)
    if (maxPrice) newFilters.price_max = Number(maxPrice)
    if (season) newFilters.season = season.split(',')
    if (location) newFilters.location = location.split(',')

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

    // 季節でフィルタ（カラムベース + フォールバック）- 複数選択OR検索対応
    if (filters.season && filters.season.length > 0) {
      filtered = filtered.filter(p => {
        return filters.season!.some(selectedSeason => {
          // カラムが存在する場合はカラム値を優先
          if (p.season) {
            return p.season === selectedSeason
          }
          
          // フォールバック: タグと説明文からの推定
          if (selectedSeason !== 'all-season') {
            const seasonKeywords = {
              'spring': ['春', '新緑', '芽吹き', '花', '桜', 'さくら', '開花'],
              'summer': ['夏', '青葉', '緑', '涼', '避暑'],
              'autumn': ['秋', '紅葉', '実', 'もみじ', '黄葉', '楓'],
              'winter': ['冬', '常緑', '雪', '寒', '耐寒']
            }
            
            const keywords = seasonKeywords[selectedSeason as keyof typeof seasonKeywords] || []
            const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`
            return keywords.some(keyword => searchText.includes(keyword))
          }
          
          return true
        })
      })
    }

    // 置き場所でフィルタ（カラムベース + フォールバック）- 複数選択OR検索対応
    if (filters.location && filters.location.length > 0) {
      filtered = filtered.filter(p => {
        return filters.location!.some(selectedLocation => {
          // カラムが存在する場合はカラム値を優先
          if (p.location) {
            return p.location === selectedLocation
          }
          
          // フォールバック: タグと説明文からの推定
          const locationKeywords = {
            'indoor': ['室内', '屋内', 'インドア', '部屋', '内'],
            'outdoor': ['屋外', '庭', 'アウトドア', '日向', '日当たり', '外', '野外'],
            'semi-shade': ['半日陰', '日陰', '明るい日陰', '半陰', '陰']
          }
          
          const keywords = locationKeywords[selectedLocation as keyof typeof locationKeywords] || []
          const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`
          return keywords.some(keyword => searchText.includes(keyword))
        })
      })
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
    if (newFilters.season && newFilters.season.length > 0) params.set('season', newFilters.season.join(','))
    if (newFilters.location && newFilters.location.length > 0) params.set('location', newFilters.location.join(','))

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

  // プルトゥリフレッシュ機能
  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      await fetchProducts()
    },
    threshold: 80,
    enabled: true
  })

  return (
    <div 
      ref={pullToRefresh.containerRef}
      className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 relative overflow-hidden"
    >
      {/* プルトゥリフレッシュインジケーター */}
      {(pullToRefresh.isPulling || pullToRefresh.isRefreshing) && (
        <PullToRefreshIndicator
          pullDistance={pullToRefresh.pullDistance}
          threshold={80}
          isRefreshing={pullToRefresh.isRefreshing}
          isTriggered={pullToRefresh.isTriggered}
        />
      )}
      
      <div className="container mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-primary-900">商品</span>
            <span className="text-gradient">カタログ</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            厳選された盆栽を豊富に取り揃えています。あなたにぴったりの一品を見つけてください。
          </p>
        </div>

        {/* 検索バー */}
        <div className="mb-8 max-w-2xl mx-auto">
          <SearchWithAutocomplete
            onSearch={handleSearch}
            placeholder="商品名やカテゴリで検索..."
            products={products.map(p => ({ name: p.name, category: p.category }))}
          />
        </div>

        {/* レイアウト */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* フィルターサイドバー（デスクトップ） */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <AdvancedFilter
              filters={filters}
              onFiltersChange={handleFilterChange}
              availableCategories={availableCategories}
              availableTags={availableTags}
            />
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 min-w-0">
            {/* モバイルフィルター＋コントロールバー */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              {/* モバイルフィルターボタン */}
              <div className="lg:hidden">
                <AdvancedFilter
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                  availableCategories={availableCategories}
                  availableTags={availableTags}
                  isMobile={true}
                />
              </div>

              {/* 結果情報とコントロール */}
              <div className="flex items-center justify-between w-full">
                {!isLoading && (
                  <span className="text-neutral-600 font-medium">
                    {filteredProducts.length}件の商品
                  </span>
                )}

                <div className="flex items-center gap-4">
                  {/* 表示モード切り替え */}
                  <div className="hidden sm:flex bg-white rounded-lg border border-neutral-200 p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-2 rounded-md transition-all duration-200',
                        viewMode === 'grid'
                          ? 'bg-accent-100 text-accent-700'
                          : 'text-neutral-500 hover:text-neutral-700'
                      )}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 rounded-md transition-all duration-200',
                        viewMode === 'list'
                          ? 'bg-accent-100 text-accent-700'
                          : 'text-neutral-500 hover:text-neutral-700'
                      )}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* ソート */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="created_at">新着順</option>
                    <option value="name">名前順</option>
                    <option value="price_asc">価格が安い順</option>
                    <option value="price_desc">価格が高い順</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 商品一覧 */}
            {isLoading ? (
              <div className="text-center py-24 animate-fade-in">
                <div className="relative mb-6">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-accent-200"></div>
                  <div className="absolute inset-0 inline-block animate-pulse rounded-full h-16 w-16 border-t-4 border-accent-600"></div>
                </div>
                <div className="animate-pulse-glow">
                  <p className="text-xl text-neutral-600 mb-2">商品を読み込み中</p>
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce-gentle"></div>
                      <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce-gentle" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce-gentle" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={cn(
                'transition-all duration-300',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'
                  : 'space-y-6'
              )}>
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-slide-up"
                    style={{ 
                      animationDelay: `${Math.min(index * 0.1, 1)}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      category={product.category}
                      difficulty_level={product.difficulty_level?.toString()}
                      height_cm={product.height_cm}
                      featured_image={product.image_url}
                      amazon_url={product.amazon_url}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 animate-fade-in">
                <div className="text-8xl text-neutral-300 mb-8 animate-float">🔍</div>
                <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                  <h3 className="text-2xl font-bold text-primary-800 mb-4">
                    商品が見つかりません
                  </h3>
                  <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                    検索条件を変更するか、フィルターをクリアしてお試しください
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
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
      </div>
    </div>
  )
}