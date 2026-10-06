'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { ProductCard } from '@/components/features/ProductCard'
import { SearchWithAutocomplete } from '@/components/features/SearchWithAutocomplete'
import { AdvancedFilter } from '@/components/features/AdvancedFilter'
import { Button } from '@/components/ui/Button'
import { PullToRefreshIndicator } from '@/components/ui/PullToRefreshIndicator'
import { Grid, List, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import type { Product, ProductFilters, SizeCategory } from '@/types'

// useSearchParams を使う部分だけを Suspense で切り出し、
// 商品一覧そのものはサーバー側で描画されるようにする
function SearchParamsSync({ onChange }: { onChange: (params: URLSearchParams) => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    onChange(new URLSearchParams(searchParams.toString()))
  }, [searchParams, onChange])
  return null
}

function uniqueCategories(products: Product[]) {
  return Array.from(new Set(products.map(p => p.category))).filter(Boolean).sort()
}

function uniqueTags(products: Product[]) {
  return Array.from(new Set(products.flatMap(p => p.tags || []))).sort()
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [filters, setFilters] = useState<ProductFilters>({})
  const isLoading = false
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => uniqueCategories(initialProducts))
  const [availableTags, setAvailableTags] = useState<string[]>(() => uniqueTags(initialProducts))
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'created_at'>('created_at')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // ページネーション関連のstate
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 18 // 18件/ページ

  const router = useRouter()

  // サーバーから最新の商品一覧を受け取ったら反映する（プルトゥリフレッシュ後など）
  useEffect(() => {
    setProducts(initialProducts)
    setAvailableCategories(uniqueCategories(initialProducts))
    setAvailableTags(uniqueTags(initialProducts))
  }, [initialProducts])

  // URLパラメータからフィルターを復元
  const applySearchParams = useCallback((searchParams: URLSearchParams) => {
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const size = searchParams.get('size')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const season = searchParams.get('season')
    const location = searchParams.get('location')
    const beginnerFriendly = searchParams.get('beginnerFriendly')
    const page = searchParams.get('page')

    const newFilters: ProductFilters = {}
    if (category) newFilters.category = category
    if (tag) newFilters.tags = [tag]
    if (size) newFilters.size_category = size as SizeCategory
    if (minPrice) newFilters.price_min = Number(minPrice)
    if (maxPrice) newFilters.price_max = Number(maxPrice)
    if (season) newFilters.season = season.split(',')
    if (location) newFilters.location = location.split(',')
    if (beginnerFriendly === 'true') newFilters.beginner_friendly = true

    // ページ番号の復元
    const pageNum = page ? Math.max(1, parseInt(page)) : 1
    setCurrentPage(pageNum)

    setFilters(newFilters)
  }, [])

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

    // 初心者向けでフィルタ
    if (filters.beginner_friendly) {
      filtered = filtered.filter(p => p.beginner_friendly === true)
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
    // フィルター変更時はページを1にリセット
    if (currentPage > 1 && filtered.length <= ITEMS_PER_PAGE) {
      setCurrentPage(1)
    }
  }, [products, filters, sortBy, currentPage])

  // URLパラメータを更新
  const updateURLParams = (newFilters: ProductFilters, page: number = 1) => {
    const params = new URLSearchParams()

    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.tags && newFilters.tags[0]) params.set('tag', newFilters.tags[0])
    if (newFilters.size_category) params.set('size', newFilters.size_category)
    if (newFilters.price_min) params.set('minPrice', newFilters.price_min.toString())
    if (newFilters.price_max) params.set('maxPrice', newFilters.price_max.toString())
    if (newFilters.season && newFilters.season.length > 0) params.set('season', newFilters.season.join(','))
    if (newFilters.location && newFilters.location.length > 0) params.set('location', newFilters.location.join(','))
    if (newFilters.beginner_friendly) params.set('beginnerFriendly', 'true')
    if (page > 1) params.set('page', page.toString())

    const queryString = params.toString()
    const url = queryString ? `/products?${queryString}` : '/products'
    router.push(url)
  }

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // フィルター変更時はページを1にリセット
    updateURLParams(newFilters, 1)
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
    setCurrentPage(1) // 検索時はページを1にリセット
  }

  // ページネーション計算
  const totalItems = filteredProducts.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPageProducts = filteredProducts.slice(startIndex, endIndex)

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      updateURLParams(filters, page)
      // ページ変更時はトップにスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // プルトゥリフレッシュ機能
  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      router.refresh()
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
      
      <Suspense fallback={null}>
        <SearchParamsSync onChange={applySearchParams} />
      </Suspense>

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
          <PrDisclosure className="max-w-2xl mx-auto mt-6 text-left" />
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
                    {totalItems}件中 {startIndex + 1}-{Math.min(endIndex, totalItems)}件を表示
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
            ) : currentPageProducts.length > 0 ? (
              <>
                <div className={cn(
                  'transition-all duration-300',
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-6'
                )}>
                  {currentPageProducts.map((product, index) => (
                  <div
                    key={product.id}
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
                      priority={index < 2}
                    />
                  </div>
                  ))}
                </div>

                {/* ページネーションUI */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12 pt-8 border-t border-neutral-200">
                    {/* 前へボタン */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      前へ
                    </button>

                    {/* ページ番号ボタン */}
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const visiblePages = []
                        const maxVisible = 7
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                        let endPage = Math.min(totalPages, startPage + maxVisible - 1)

                        // 範囲調整
                        if (endPage - startPage < maxVisible - 1) {
                          startPage = Math.max(1, endPage - maxVisible + 1)
                        }

                        // 最初のページを表示
                        if (startPage > 1) {
                          visiblePages.push(
                            <button
                              key={1}
                              onClick={() => handlePageChange(1)}
                              className="px-3 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                            >
                              1
                            </button>
                          )
                          if (startPage > 2) {
                            visiblePages.push(
                              <span key="ellipsis1" className="px-2 text-neutral-400">
                                ...
                              </span>
                            )
                          }
                        }

                        // 中間のページを表示
                        for (let i = startPage; i <= endPage; i++) {
                          visiblePages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={cn(
                                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                currentPage === i
                                  ? 'bg-primary-600 text-white'
                                  : 'text-neutral-600 bg-white border border-neutral-300 hover:bg-neutral-50'
                              )}
                            >
                              {i}
                            </button>
                          )
                        }

                        // 最後のページを表示
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            visiblePages.push(
                              <span key="ellipsis2" className="px-2 text-neutral-400">
                                ...
                              </span>
                            )
                          }
                          visiblePages.push(
                            <button
                              key={totalPages}
                              onClick={() => handlePageChange(totalPages)}
                              className="px-3 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                            >
                              {totalPages}
                            </button>
                          )
                        }

                        return visiblePages
                      })()}
                    </div>

                    {/* 次へボタン */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      次へ
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                )}
              </>
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