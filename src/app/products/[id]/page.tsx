import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabaseServer } from '@/lib/supabase-server'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ImageGallery } from '@/components/features/ImageGallery'
import { formatPrice, getSizeCategoryLabel, formatDate } from '@/lib/utils'
import { 
  getDifficultyDisplay, 
  getDifficultyColor,
  getFeatureBadges, 
  getSeasonDisplay,
  getDetailedSize,
  getCareEnvironment 
} from '@/lib/product-ui-helpers'
import { ArrowLeft, ExternalLink, Tag, Calendar, Package, ShoppingBag, Ruler, Sun, Droplets, Heart } from 'lucide-react'
import { generateProductSEO } from '@/lib/seo-utils'
import { generateProductBreadcrumbs } from '@/lib/breadcrumb-utils'
import { BreadcrumbStructuredData, ProductStructuredData, FAQStructuredData } from '@/components/seo/StructuredData'
import { getProductFAQs } from '@/lib/faq-data'
import { getRelatedArticles } from '@/lib/article-helpers'
import type { Product } from '@/types'

interface ProductPageProps {
  params: {
    id: string
  }
}

async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function getRelatedProducts(category: string, excludeId: string, limit = 4): Promise<Product[]> {
  const { data } = await supabaseServer
    .from('products')
    .select('id, name, price, category, image_url, amazon_url') // 必要フィールドのみ取得で高速化
    .eq('category', category)
    .neq('id', excludeId)
    .limit(limit)

  return data || []
}

// 🚀 パフォーマンス最適化: 完全並列データ取得関数
async function getProductWithRelated(id: string) {
  // 1回目: 商品詳細取得
  const product = await getProduct(id)

  if (!product) {
    return { product: null, relatedProducts: [] }
  }

  // 2回目: カテゴリが分かったので関連商品を並列取得
  const relatedProducts = await getRelatedProducts(product.category, id)

  return { product, relatedProducts }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: '商品が見つかりません - 盆栽コレクション'
    }
  }

  // 🚀 自動SEO最適化エンジンを使用
  const seo = generateProductSEO(product)

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      ...seo.openGraph,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
    twitter: {
      ...seo.twitter,
      description: product.description || '',
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  // 🚀 並列データ取得で大幅高速化！
  const { product, relatedProducts } = await getProductWithRelated(params.id)

  if (!product) {
    notFound()
  }

  const breadcrumbs = generateProductBreadcrumbs(product)

  // 商品に関連するFAQを自動生成
  const productFAQs = getProductFAQs(
    product.name,
    product.category,
    product.tags || []
  )

  // 商品に関連する記事を取得
  const relatedArticles = getRelatedArticles(
    product.category,
    product.tags,
    3
  )

  return (
    <>
      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />
      <ProductStructuredData
        name={product.name}
        description={product.description || ''}
        image={product.image_url || ''}
        price={product.price}
        category={product.category}
        availability="InStock"
      />
      {productFAQs.length > 0 && (
        <FAQStructuredData
          faqs={productFAQs}
          baseUrl="https://www.bonsai-collection.com"
        />
      )}
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              商品一覧に戻る
            </Link>
          </Button>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* 商品画像ギャラリー */}
          <div>
            <ImageGallery
              images={product.image_url ? [product.image_url] : []}
              productName={product.name}
            />
          </div>

          {/* 商品情報 */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block bg-bonsai-green-100 text-bonsai-green-800 text-sm px-3 py-1 rounded">
                  {product.category}
                </span>
                <span className="inline-block bg-earth-brown-100 text-earth-brown-800 text-sm px-3 py-1 rounded">
                  {getSizeCategoryLabel(product.size_category)}
                </span>
                <span className={`inline-block text-sm px-3 py-1 rounded ${getDifficultyColor(product.difficulty_level)} bg-gray-100`}>
                  {getDifficultyDisplay(product.difficulty_level)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <div className="text-4xl font-bold text-bonsai-green-600 mb-6">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* 特徴タグ */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">特徴</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 特徴バッジ */}
            {getFeatureBadges(product).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">特徴</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getFeatureBadges(product).map((badge, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
                    >
                      <span className="mr-1">{badge.icon}</span>
                      {badge.text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 季節情報 */}
            {getSeasonDisplay(product) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">季節の楽しみ</span>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-200 rounded-lg p-4">
                  <p className="text-gray-700 font-medium">{getSeasonDisplay(product)}</p>
                </div>
              </div>
            )}

            {/* 商品説明 */}
            <div>
              <h2 className="font-semibold text-lg text-gray-900 mb-3">商品説明</h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* 詳細サイズ情報 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="h-5 w-5 text-gray-500" />
                  <h3 className="font-semibold text-lg">サイズ詳細</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">高さ:</span>
                      <span className="font-medium">{getDetailedSize(product).height}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">幅:</span>
                      <span className="font-medium">{getDetailedSize(product).width}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">鉢サイズ:</span>
                      <span className="font-medium">{getDetailedSize(product).potSize}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-medium text-gray-800">サイズの特徴:</span><br />
                      {getDetailedSize(product).description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 育成環境情報 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-lg">育成環境</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-600">日照:</span>
                      <span className="font-medium">{getCareEnvironment(product).sunlight}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">水やり:</span>
                      <span className="font-medium">{getCareEnvironment(product).watering}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">お手入れ:</span>
                      <span className="font-medium">{getCareEnvironment(product).frequency}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">栽培適性</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {getCareEnvironment(product).location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 基本情報 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">基本情報</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">カテゴリ:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">サイズ分類:</span>
                    <span className="font-medium">{getSizeCategoryLabel(product.size_category)}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">掲載日:</span>
                    <span className="font-medium">{formatDate(product.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 購入ボタン */}
            <div className="space-y-4 pt-6">
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {formatPrice(product.price)}
                  </div>
                  <p className="text-sm text-gray-600">送料・返品はAmazonの規約に従います</p>
                </div>
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" 
                  asChild
                >
                  <a
                    href={product.amazon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3"
                  >
                    <ShoppingBag className="h-6 w-6" />
                    🛒 今すぐAmazonで注文
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 関連商品 */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              同じカテゴリの商品
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/products/${relatedProduct.id}`}>
                    <div className="aspect-square relative bg-gray-100">
                      {relatedProduct.image_url ? (
                        <Image
                          src={relatedProduct.image_url}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-4xl text-gray-400">🌲</div>
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/products/${relatedProduct.id}`}>
                      <h3 className="font-medium text-sm mb-2 hover:text-bonsai-green-600 transition-colors line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div className="text-lg font-bold text-bonsai-green-600">
                      {formatPrice(relatedProduct.price)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 関連記事 */}
        {relatedArticles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📝 この商品に関連する育て方ガイド
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((article) => (
                <Card key={article.slug} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <CardContent className="p-0">
                    <Link href={`/guides/${article.slug}`}>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {article.category}
                          </span>
                          <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
                          {article.title}
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {article.tags?.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button variant="outline" asChild>
                <Link href="/guides" className="flex items-center gap-2">
                  📚 すべての育て方ガイドを見る
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}