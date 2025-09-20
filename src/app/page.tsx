'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
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

  // カルーセルの状態
  const [currentSlide, setCurrentSlide] = useState(0)

  // ヒーローカルーセルデータ
  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=2940&auto=format&fit=crop',
      title: '松柏類の美学',
      subtitle: '時を超えた伝統美',
      description: '風雪に耐え抜いた力強さと優雅さを併せ持つ松柏類盆栽',
      cta: '松柏類を見る',
      link: '/products?category=松柏類'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2942&auto=format&fit=crop',
      title: '雑木類の季節美',
      subtitle: '四季の移ろいを楽しむ',
      description: '春の新緑から秋の紅葉まで、季節ごとの表情を魅せる雑木類',
      cta: '雑木類を見る',
      link: '/products?category=雑木類'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2946&auto=format&fit=crop',
      title: '花ものの華やかさ',
      subtitle: '咲き誇る美しい瞬間',
      description: '桜や梅など、開花時期の華やかな美しさを堪能する花もの盆栽',
      cta: '花ものを見る',
      link: '/products?category=花もの'
    }
  ]

  // カルーセル制御
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }, [heroSlides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [heroSlides.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  // 自動再生
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000) // 5秒ごと
    return () => clearInterval(interval)
  }, [nextSlide])

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
      {/* Hero Carousel - Ikyu Style */}
      <section className="relative overflow-hidden">
        <div className="relative h-[40vh] md:h-[45vh]">
          {/* Carousel Images */}
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                />
                {/* Elegant Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl">
                      <div className="text-white space-y-6">
                        <div>
                          <p className="text-sm md:text-base font-light tracking-widest text-white/80 mb-2">
                            {slide.subtitle}
                          </p>
                          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-tight mb-4">
                            {slide.title}
                          </h1>
                          <div className="h-px bg-gradient-to-r from-white/60 to-transparent w-32 mb-6"></div>
                        </div>
                        <p className="text-lg md:text-xl font-light leading-relaxed text-white/90 max-w-xl">
                          {slide.description}
                        </p>
                        <div className="pt-4">
                          <Link
                            href={slide.link}
                            className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40"
                          >
                            {slide.cta}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="flex space-x-3">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">

          {/* Premium Search Card */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-4 md:p-8 lg:p-12 hover:shadow-3xl transition-all duration-500">
              <div className="space-y-6 md:space-y-8">
                {/* Category Selection */}
                <div>
                  <h3 className="text-base md:text-lg font-medium text-slate-700 mb-4 md:mb-6 text-center tracking-wide">樹種カテゴリ</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
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
                          group p-3 md:p-5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                          ${selectedCategory === category.value
                            ? 'border-slate-400 bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-600/30'
                            : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-slate-200/50 text-slate-700'
                          }
                        `}
                      >
                        <div className={`text-xl md:text-2xl mb-2 md:mb-3 transition-transform duration-300 group-hover:scale-110 ${
                          selectedCategory === category.value ? '' : 'group-hover:scale-110'
                        }`}>
                          {category.icon}
                        </div>
                        <div className="text-xs md:text-sm font-medium tracking-wide">{category.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-base md:text-lg font-medium text-slate-700 mb-4 md:mb-6 text-center tracking-wide">価格帯</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
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
                          group p-3 md:p-5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                          ${selectedPriceRange === priceRange.value
                            ? 'border-slate-400 bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-600/30'
                            : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-slate-200/50 text-slate-700'
                          }
                        `}
                      >
                        <div className="text-xs md:text-sm font-medium tracking-wide">{priceRange.label}</div>
                      </button>
                    ))}
                  </div>
                </div>


                {/* Premium Search Button */}
                <div className="flex justify-center pt-4 md:pt-6">
                  <button
                    onClick={handleSearch}
                    disabled={!selectedCategory && !selectedPriceRange}
                    className="group relative bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-white font-medium py-3 px-8 md:py-4 md:px-16 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 border border-slate-500/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center gap-2 md:gap-3 text-base md:text-lg tracking-wide">
                      <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="py-16 md:py-20 bg-slate-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4 tracking-wide">
              人気の盆栽
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-32 mx-auto mb-6"></div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-300 group"
            >
              すべて見る
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {popularProducts.length > 0 ? (
              popularProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-100">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500"></div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                        <span className="text-sm font-semibold text-slate-700 tracking-wide">
                          ¥{product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-medium text-slate-800 mb-2 line-clamp-2 text-lg leading-relaxed tracking-wide">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-3 tracking-wide">{product.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 tracking-wide">{product.size_category}</span>
                        {product.beginner_friendly && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                            初心者向け
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
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
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4 tracking-wide">
              人気の記事
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-32 mx-auto mb-6"></div>
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-300 group"
            >
              すべて見る
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {popularArticles.length > 0 ? (
              popularArticles.map((article: Article) => (
                <Link key={article.id} href={`/guides/${article.slug}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 h-full">
                    {article.featuredImage?.url && (
                      <div className="h-56 relative overflow-hidden">
                        <img
                          src={article.featuredImage.url}
                          alt={article.featuredImage.alt || article.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500"></div>
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium tracking-wide">
                          {article.category?.name || 'ガイド'}
                        </span>
                        <span className="text-xs text-slate-400 tracking-wide">
                          {article.readingTime}分読了
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-slate-800 mb-3 line-clamp-2 leading-relaxed tracking-wide">
                        {article.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
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
      <section className="py-16 md:py-20 bg-slate-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4 tracking-wide">
              人気の盆栽園
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-32 mx-auto mb-6"></div>
            <Link
              href="/gardens"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-300 group"
            >
              すべて見る
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {popularGardens.length > 0 ? (
              popularGardens.map((garden) => (
                <Link key={garden.id} href={`/gardens/${garden.id}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 h-full">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-slate-800 mb-3 leading-relaxed tracking-wide">
                        {garden.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 tracking-wide">{garden.prefecture}</p>
                      <p className="text-slate-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                        {garden.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {garden.rating && (
                          <div className="flex items-center">
                            <span className="text-amber-400">★</span>
                            <span className="text-sm text-slate-600 ml-1 font-medium">
                              {garden.rating}
                            </span>
                          </div>
                        )}
                        {garden.specialties && garden.specialties.length > 0 && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium tracking-wide">
                            {garden.specialties[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
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