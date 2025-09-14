'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/features/ProductCard'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  price: number
  category: string
  difficulty_level?: string
  height_cm?: number
  featured_image?: string
  amazon_url?: string
}

interface ProductRecommendationProps {
  title?: string
  productIds?: string[]
  priceRange?: [number, number]
  category?: string
  difficultyLevel?: string
  limit?: number
  compact?: boolean
  className?: string
}

export function ProductRecommendation({
  title = "おすすめ商品",
  productIds,
  priceRange,
  category,
  difficultyLevel,
  limit = 3,
  compact = false,
  className = ""
}: ProductRecommendationProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_visible', true)

        // 特定商品IDが指定されている場合
        if (productIds && productIds.length > 0) {
          query = query.in('id', productIds)
        } else {
          // フィルター条件を適用
          if (priceRange) {
            query = query.gte('price', priceRange[0]).lte('price', priceRange[1])
          }
          if (category) {
            query = query.eq('category', category)
          }
          if (difficultyLevel) {
            query = query.eq('difficulty_level', difficultyLevel)
          }
        }

        query = query.limit(limit).order('price', { ascending: true })

        const { data, error } = await query

        if (error) {
          console.error('商品取得エラー:', error)
          return
        }

        setProducts(data || [])
      } catch (error) {
        console.error('商品取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [productIds, priceRange, category, difficultyLevel, limit])

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className={`grid ${compact ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
          {Array.from({ length: limit }, (_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 my-8 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🎯</span>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <div className={`grid ${
        compact
          ? 'grid-cols-1 gap-4'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      }`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            category={product.category}
            difficulty_level={product.difficulty_level}
            height_cm={product.height_cm}
            featured_image={product.featured_image}
            amazon_url={product.amazon_url}
            compact={compact}
          />
        ))}
      </div>

      {!compact && products.length >= 3 && (
        <div className="text-center mt-6">
          <a
            href="/products"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            他の商品も見る →
          </a>
        </div>
      )}
    </div>
  )
}