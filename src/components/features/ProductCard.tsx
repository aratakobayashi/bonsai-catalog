import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, cn } from '@/lib/utils'
import { 
  getSizeDisplay, 
  getDifficultyStars,
  getSeasonalInfo,
  getFeatureBadges 
} from '@/lib/product-ui-helpers'
import { ExternalLink, TreePine, Ruler } from 'lucide-react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
}

function ProductCard({ product, className }: ProductCardProps) {
  const sizeDisplay = getSizeDisplay(product.size_category, product.height_cm, product.width_cm)
  const difficultyStars = getDifficultyStars(product.difficulty_level)
  const seasonalInfo = getSeasonalInfo(product.bloom_months, product.foliage_months)
  const featureBadges = getFeatureBadges(product)

  return (
    <Card className={cn('group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1', className)}>
      <div className="aspect-square relative overflow-hidden bg-neutral-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100">
            <TreePine className="h-16 w-16 text-neutral-400" />
          </div>
        )}
        
        {/* カテゴリバッジ */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="text-xs font-medium bg-white/90 text-primary-700 backdrop-blur-sm">
            {product.category}
          </Badge>
        </div>

        {/* 特徴バッジ */}
        {featureBadges.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {featureBadges.slice(0, 2).map((badge, index) => (
              <div
                key={index}
                className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-700 shadow-sm"
                title={badge.title}
              >
                {badge.icon}
              </div>
            ))}
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* 商品名 */}
        <h3 className="font-semibold text-base leading-tight text-primary-900 line-clamp-2 min-h-[3rem] group-hover:text-accent-600 transition-colors">
          {product.name}
        </h3>

        {/* 価格 - 常に表示 */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-accent-600">
            ¥{product.price.toLocaleString()}
          </div>
          {difficultyStars && (
            <div className="text-sm text-amber-500" title="育成難易度">
              {difficultyStars}
            </div>
          )}
        </div>

        {/* サイズ情報 */}
        {sizeDisplay && (
          <div className="flex items-center text-sm text-neutral-600">
            <Ruler className="h-4 w-4 mr-1.5 text-neutral-400" />
            <span>{sizeDisplay}</span>
          </div>
        )}

        {/* 季節情報 */}
        {seasonalInfo.length > 0 && (
          <div className="space-y-1">
            {seasonalInfo.map((info, index) => (
              <div key={index} className="flex items-center text-sm text-neutral-600">
                <span className="mr-1">{info.icon}</span>
                <span>{info.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* 特徴バッジ（下部表示） */}
        {featureBadges.length > 2 && (
          <div className="flex flex-wrap gap-1">
            {featureBadges.slice(2, 4).map((badge, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-md"
                title={badge.title}
              >
                <span className="mr-1">{badge.icon}</span>
                {badge.text}
              </span>
            ))}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2 pt-2">
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button variant="outline" className="w-full text-sm">
              詳細を見る
            </Button>
          </Link>
          <Link 
            href={product.amazon_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full bg-[#FF9500] hover:bg-[#FF9500]/90 text-white text-sm font-semibold">
              <ExternalLink className="h-4 w-4 mr-1" />
              購入する
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export { ProductCard }