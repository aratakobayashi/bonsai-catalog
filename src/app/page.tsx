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
      {/* Hero Section with Search - Ikyu Style */}
      <section className="relative bg-white overflow-hidden">
        {/* Elegant background with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50"></div>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a4473' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        }}></div>

        <div className="relative z-10 container mx-auto px-4 pt-24 pb-32">
          {/* Premium Typography */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <h1 className="text-5xl md:text-7xl font-extralight text-slate-800 mb-6 tracking-tight leading-tight">
                最高品質の
                <br />
                <span className="font-light text-6xl md:text-8xl bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-clip-text text-transparent">
                  盆栽
                </span>
                を
              </h1>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-64 mx-auto mb-6"></div>
              <p className="text-xl md:text-2xl text-slate-600 font-light tracking-wide">
                心を込めて選び抜かれた美しい盆栽との出会い
              </p>
            </div>
          </div>

          {/* Premium Search Card */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-8 md:p-12 hover:shadow-3xl transition-all duration-500">
              {/* Search Header */}
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-light text-slate-700 mb-3 tracking-wide">
                  理想の盆栽を見つける
                </h2>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-48 mx-auto"></div>
              </div>
              <div className="space-y-8">
                {/* Category Selection */}
                <div>
                  <h3 className="text-lg font-medium text-slate-700 mb-6 text-center tracking-wide">樹種カテゴリ</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                          group p-5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                          ${selectedCategory === category.value
                            ? 'border-slate-400 bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-600/30'
                            : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-slate-200/50 text-slate-700'
                          }
                        `}
                      >
                        <div className={`text-2xl mb-3 transition-transform duration-300 group-hover:scale-110 ${
                          selectedCategory === category.value ? '' : 'group-hover:scale-110'
                        }`}>
                          {category.icon}
                        </div>
                        <div className="text-sm font-medium tracking-wide">{category.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-lg font-medium text-slate-700 mb-6 text-center tracking-wide">価格帯</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                          group p-5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                          ${selectedPriceRange === priceRange.value
                            ? 'border-slate-400 bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-600/30'
                            : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-slate-200/50 text-slate-700'
                          }
                        `}
                      >
                        <div className="text-sm font-medium tracking-wide">{priceRange.label}</div>
                      </button>
                    ))}
                  </div>
                </div>


                {/* Premium Search Button */}
                <div className="flex justify-center pt-6">
                  <button
                    onClick={handleSearch}
                    disabled={!selectedCategory && !selectedPriceRange}
                    className="group relative bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-white font-medium py-4 px-16 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 border border-slate-500/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center gap-3 text-lg tracking-wide">
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      盆栽を探す
                    </span>
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