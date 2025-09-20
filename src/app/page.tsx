'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { getArticles } from '@/lib/database/articles'
import type { Article } from '@/types'

interface PopularProduct {
  id: string
  name: string
  description: string
  price: number
  category: string
  size_category: string
  image_url: string
  beginner_friendly: boolean | null
}

interface PopularGarden {
  id: string
  name: string
  description: string
  prefecture: string | null
  image_url: string | null
  rating: number | null
  specialties: string[] | null
}

async function getPopularProducts(): Promise<PopularProduct[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price, category, size_category, image_url, beginner_friendly')
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (products as PopularProduct[]) || []
}

async function getPopularGardens(): Promise<PopularGarden[]> {
  const { data: gardens, error } = await supabase
    .from('gardens')
    .select('id, name, description, prefecture, image_url, rating, specialties')
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching gardens:', error)
    return []
  }

  return (gardens as PopularGarden[]) || []
}

async function getPopularArticles() {
  try {
    const articlesData = await getArticles({
      limit: 6,
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    })

    return articlesData.articles || []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

async function getArticleStats() {
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  return count || 0
}

export default function HomePage() {
  const router = useRouter()
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([])
  const [popularArticles, setPopularArticles] = useState<Article[]>([])
  const [popularGardens, setPopularGardens] = useState<PopularGarden[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 検索フォームの状態
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, articles, gardens] = await Promise.all([
          getPopularProducts(),
          getPopularArticles(),
          getPopularGardens()
        ])
        setPopularProducts(products)
        setPopularArticles(articles)
        setPopularGardens(gardens)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // 検索ボタンクリック時の処理
  const handleSearch = () => {
    const params = new URLSearchParams()

    if (selectedCategory) {
      params.set('category', selectedCategory)
    }

    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-')
      if (min && min !== '0') params.set('minPrice', min)
      if (max && max !== '') params.set('maxPrice', max)
    }


    const queryString = params.toString()
    const url = queryString ? `/products?${queryString}` : '/products'
    router.push(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <section className="relative bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50"></div>
        
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-4">
              盆栽を探す
            </h1>
            <p className="text-xl text-gray-600">
              お気に入りの盆栽を見つけましょう
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700 p-8 backdrop-blur-sm">
              <div className="space-y-8">
                {/* Category Selection */}
                <div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-6 text-center tracking-wide">種類を選ぶ</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { value: '松柏類', icon: '🌲', label: '松柏類' },
                      { value: '雑木類', icon: '🍂', label: '雑木類' },
                      { value: '花もの', icon: '🌸', label: '花もの' },
                      { value: '実もの', icon: '🍇', label: '実もの' },
                      { value: '草もの', icon: '🌿', label: '草もの' }
                    ].map((category) => (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(selectedCategory === category.value ? '' : category.value)}
                        className={`
                          p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/25 hover:scale-105
                          ${selectedCategory === category.value
                            ? 'border-slate-400 bg-gradient-to-br from-slate-600 to-slate-700 text-slate-100 shadow-lg shadow-slate-500/30'
                            : 'border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 hover:border-slate-400 hover:text-slate-100'
                          }
                        `}
                      >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium">{category.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-6 text-center tracking-wide">価格帯を選ぶ</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { value: '0-10000', label: '〜1万円' },
                      { value: '10000-30000', label: '1万〜3万円' },
                      { value: '30000-50000', label: '3万〜5万円' },
                      { value: '50000-100000', label: '5万〜10万円' },
                      { value: '100000-', label: '10万円〜' }
                    ].map((priceRange) => (
                      <button
                        key={priceRange.value}
                        onClick={() => setSelectedPriceRange(selectedPriceRange === priceRange.value ? '' : priceRange.value)}
                        className={`
                          p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/25 hover:scale-105
                          ${selectedPriceRange === priceRange.value
                            ? 'border-slate-400 bg-gradient-to-br from-slate-600 to-slate-700 text-slate-100 shadow-lg shadow-slate-500/30'
                            : 'border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 hover:border-slate-400 hover:text-slate-100'
                          }
                        `}
                      >
                        <div className="text-sm font-medium">{priceRange.label}</div>
                      </button>
                    ))}
                  </div>
                </div>


                {/* Search Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 hover:from-slate-500 hover:via-slate-400 hover:to-slate-500 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/50 hover:shadow-2xl hover:shadow-slate-900/60 hover:scale-105 border border-slate-400/30"
                    disabled={!selectedCategory && !selectedPriceRange}
                  >
                    <span className="text-lg">🔍 検索する</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-light text-gray-900">人気の盆栽</h2>
            <Button variant="outline" asChild>
              <Link href="/products">すべて見る</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.length > 0 ? (
              popularProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-medium">
                        ¥{product.price.toLocaleString()}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{product.size_category}</span>
                        {product.beginner_friendly && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                            初心者向け
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">盆栽商品を準備中です...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Articles Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-light text-gray-900">人気の記事</h2>
            <Button variant="outline" asChild>
              <Link href="/guides">すべて見る</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularArticles.length > 0 ? (
              popularArticles.map((article: Article) => (
                <Link key={article.id} href={`/guides/${article.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow duration-300 h-full overflow-hidden">
                    {article.featuredImage?.url && (
                      <div className="h-48 relative">
                        <img
                          src={article.featuredImage.url}
                          alt={article.featuredImage.alt || article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                          {article.category?.name || 'ガイド'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {article.readingTime}分読了
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {article.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">記事を準備中です...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Gardens Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-light text-gray-900">人気の盆栽園</h2>
            <Button variant="outline" asChild>
              <Link href="/gardens">すべて見る</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularGardens.length > 0 ? (
              popularGardens.map((garden) => (
                <Link key={garden.id} href={`/gardens/${garden.id}`}>
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {garden.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">{garden.prefecture}</p>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {garden.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {garden.rating && (
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm text-gray-600 ml-1">
                              {garden.rating}
                            </span>
                          </div>
                        )}
                        {garden.specialties && garden.specialties.length > 0 && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                            {garden.specialties[0]}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">盆栽園情報を準備中です...</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}