'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShoppingBag, ExternalLink } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { AFFILIATE_LINK_REL } from '@/lib/affiliate'

interface RelatedProductsProps {
  products: Product[]
  articleTitle?: string // 記事タイトルを元にしたCTA生成用
}

export function RelatedProducts({ products, articleTitle }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section>
      <div className="flex items-center mb-6">
        <ShoppingBag className="h-5 w-5 text-orange-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">この記事に関連する商品</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-square relative bg-gray-100">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl text-gray-400">🌲</span>
                </div>
              )}
              
              {/* カテゴリバッジ */}
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
                  {product.category}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              {/* 商品名 */}
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-base mb-2 hover:text-accent-600 transition-colors line-clamp-2 leading-tight">
                  {product.name}
                </h3>
              </Link>

              {/* 価格と難易度 */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold text-accent-600">
                  {formatPrice(product.price)}
                </div>
                {product.difficulty_level && (
                  <div className="text-sm text-amber-500" title="育成難易度">
                    {product.difficulty_level === 1 ? '★☆☆' : product.difficulty_level === 2 ? '★★☆' : '★★★'}
                  </div>
                )}
              </div>

              {/* サイズ情報 */}
              <div className="text-sm text-gray-600 mb-4">
                {product.size_category === 'mini' ? 'ミニ' : 
                 product.size_category === 'small' ? '小品' : 
                 product.size_category === 'medium' ? '中品' : 
                 product.size_category === 'large' ? '大品' : '不明'}
                {product.height_cm && ` (${product.height_cm}cm)`}
              </div>

              {/* アクションボタン */}
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/products/${product.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    詳細
                  </Button>
                </Link>
                <Link 
                  href={product.amazon_url} 
                  target="_blank" 
                  rel={AFFILIATE_LINK_REL}
                >
                  <Button size="sm" className="w-full bg-[#FF9500] hover:bg-[#FF9500]/90 text-white">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    購入
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 全商品を見るリンク */}
      <div className="text-center mt-8">
        <Link href="/products">
          <Button variant="outline" size="lg">
            すべての商品を見る
          </Button>
        </Link>
      </div>
    </section>
  )
}