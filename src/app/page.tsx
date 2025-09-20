import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'

interface PopularArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  reading_time: number | null
  seo_title: string | null
  category: string | null
}

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

async function getPopularArticles(): Promise<PopularArticle[]> {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, reading_time, seo_title, category')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return (articles as PopularArticle[]) || []
}

async function getArticleStats() {
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  return count || 0
}

export default async function HomePage() {
  const [popularProducts, popularArticles, popularGardens] = await Promise.all([
    getPopularProducts(),
    getPopularArticles(),
    getPopularGardens()
  ])

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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    種類
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option value="">すべての種類</option>
                    <option value="松柏類">松柏類</option>
                    <option value="雑木類">雑木類</option>
                    <option value="花もの">花もの</option>
                    <option value="実もの">実もの</option>
                    <option value="草もの">草もの</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    価格帯
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option value="">価格を選択</option>
                    <option value="0-10000">〜1万円</option>
                    <option value="10000-30000">1万円〜3万円</option>
                    <option value="30000-50000">3万円〜5万円</option>
                    <option value="50000-100000">5万円〜10万円</option>
                    <option value="100000-">10万円〜</option>
                  </select>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                    検索する
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
            {popularProducts.map((product) => (
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
            ))}
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
            {popularArticles.map((article) => (
              <Link key={article.id} href={`/guides/${article.slug}`}>
                <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {article.category || 'ガイド'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {article.reading_time}分読了
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
            ))}
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
            {popularGardens.map((garden) => (
              <Link key={garden.id} href={`/gardens/${garden.id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  {garden.image_url && (
                    <div className="h-48 relative">
                      <img 
                        src={garden.image_url} 
                        alt={garden.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {garden.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{garden.prefecture}</p>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
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
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}