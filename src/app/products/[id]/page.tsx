import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatPrice, getSizeCategoryLabel, formatDate } from '@/lib/utils'
import { ArrowLeft, ExternalLink, Tag, Calendar, Package } from 'lucide-react'
import type { Product } from '@/types'

interface ProductPageProps {
  params: {
    id: string
  }
}

async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(limit)

  return data || []
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: '商品が見つかりません - 盆栽コレクション'
    }
  }

  return {
    title: `${product.name} - 盆栽コレクション`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: product.image_url ? [{ url: product.image_url }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || '',
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product)

  return (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 商品画像 */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-lg shadow-sm overflow-hidden">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-8xl text-gray-400">🌲</div>
                </div>
              )}
            </div>
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

            {/* 商品説明 */}
            <div>
              <h2 className="font-semibold text-lg text-gray-900 mb-3">商品説明</h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* 商品詳細 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">商品詳細</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">カテゴリ:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">サイズ:</span>
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
            <div className="space-y-4 pt-4">
              <Button size="lg" className="w-full" asChild>
                <a
                  href={product.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  Amazonで購入する
                </a>
              </Button>
              <p className="text-sm text-gray-500 text-center">
                ※ Amazonのページが開きます。配送や返品については Amazon の規約に従います。
              </p>
            </div>
          </div>
        </div>

        {/* 関連商品 */}
        {relatedProducts.length > 0 && (
          <div>
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
      </div>
    </div>
  )
}