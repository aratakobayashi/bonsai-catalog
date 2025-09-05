import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, getSizeCategoryLabel } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
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
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-bonsai-green-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block bg-bonsai-green-100 text-bonsai-green-800 text-xs px-2 py-1 rounded">
            {product.category}
          </span>
          <span className="inline-block bg-earth-brown-100 text-earth-brown-800 text-xs px-2 py-1 rounded">
            {getSizeCategoryLabel(product.size_category)}
          </span>
        </div>
        
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{product.tags.length - 3}</span>
            )}
          </div>
        )}
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {product.description}
        </p>
        
        <div className="text-2xl font-bold text-bonsai-green-600 mb-4">
          {formatPrice(product.price)}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/products/${product.id}`}>
              詳細を見る
            </Link>
          </Button>
          <Button size="sm" asChild className="flex-1">
            <a
              href={product.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Amazonで購入
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}