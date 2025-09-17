'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Star, ShoppingBag } from 'lucide-react'

interface ProductCardProps {
  id: string
  name: string
  price: number
  category: string
  difficulty_level?: string
  height_cm?: number
  featured_image?: string
  amazon_url?: string
  className?: string
  compact?: boolean
}

export function ProductCard({
  id,
  name,
  price,
  category,
  difficulty_level,
  height_cm,
  featured_image,
  amazon_url,
  className = "",
  compact = false
}: ProductCardProps) {

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case '初心者向け': return 'bg-green-100 text-green-800'
      case '中級者向け': return 'bg-yellow-100 text-yellow-800'
      case '上級者向け': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyStars = (level?: string) => {
    switch (level) {
      case '初心者向け': return 1
      case '中級者向け': return 2
      case '上級者向け': return 3
      default: return 1
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (compact) {
    return (
      <div className={`border rounded-lg p-4 bg-white hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-start gap-3">
          {featured_image && (
            <Link href={`/products/${id}`}>
              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer">
                <Image
                  src={featured_image}
                  alt={name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
              {name}
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-accent-600">
                {formatPrice(price)}
              </span>
              {difficulty_level && (
                <Badge variant="secondary" className={`text-xs ${getDifficultyColor(difficulty_level)}`}>
                  {'⭐'.repeat(getDifficultyStars(difficulty_level))}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/products/${id}`}>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  詳細を見る
                </Button>
              </Link>
              {amazon_url && (
                <a href={amazon_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="text-xs h-7 bg-orange-500 hover:bg-orange-600">
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    購入
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}>
      {/* 商品画像 - クリック可能 */}
      <Link href={`/products/${id}`}>
        <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100 cursor-pointer">
          {featured_image ? (
            <Image
              src={featured_image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
              <span className="text-4xl">🌲</span>
            </div>
          )}

          {/* 価格バッジ */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 backdrop-blur-sm shadow-sm text-gray-900 font-bold">
              {formatPrice(price)}
            </Badge>
          </div>

          {/* 難易度バッジ */}
          {difficulty_level && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className={`${getDifficultyColor(difficulty_level)} backdrop-blur-sm`}>
                {'⭐'.repeat(getDifficultyStars(difficulty_level))}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* 商品情報 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {category}
          </span>
          {height_cm && (
            <span className="text-xs text-gray-500">
              高さ {height_cm}cm
            </span>
          )}
        </div>

        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-accent-600 transition-colors mb-3 line-clamp-2 leading-tight">
            {name}
          </h3>
        </Link>

        {/* 価格と難易度 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-accent-600">
            {formatPrice(price)}
          </span>

          {difficulty_level && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 3 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < getDifficultyStars(difficulty_level)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 ml-1">
                {difficulty_level}
              </span>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2">
          <Link href={`/products/${id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              詳細を見る
            </Button>
          </Link>
          {amazon_url && (
            <a href={amazon_url} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                <ShoppingBag className="w-4 h-4 mr-1" />
                購入する
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}