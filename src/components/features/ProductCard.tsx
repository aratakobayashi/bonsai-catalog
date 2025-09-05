import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, getSizeCategoryLabel, cn } from '@/lib/utils'
import { generateAffiliateURL, trackAffiliateClick } from '@/lib/amazon'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  // アフィリエイトリンクを生成
  const affiliateUrl = generateAffiliateURL(product.amazon_url)
  
  // アフィリエイトクリック追跡用の関数
  const handleAffiliateClick = () => {
    trackAffiliateClick(product.id, affiliateUrl, product.category)
  }
  return (
    <Card className={cn(
      "group relative overflow-hidden",
      "transition-all duration-300 ease-luxury",
      "hover:shadow-hover hover:-translate-y-2",
      "animate-fade-in"
    )}>
      {/* 商品画像セクション - 高級感のある表示 */}
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <div className="aspect-[4/3] relative bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-luxury"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-6xl text-neutral-300">🌲</div>
              </div>
            )}
            
            {/* オーバーレイ - ホバー時に表示される操作ボタン */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-slide-down">
                <button className={cn(
                  "p-2 bg-white/90 hover:bg-white rounded-full shadow-luxury hover:shadow-hover",
                  "transition-all duration-200 hover:scale-110 active:scale-95",
                  "hover:animate-heartbeat focus:ring-2 focus:ring-accent-500 focus:outline-none"
                )}
                aria-label={`${product.name}をお気に入りに追加`}
                type="button"
                >
                  <Heart className="h-4 w-4 text-neutral-600 hover:text-accent-500 transition-colors" />
                  <span className="sr-only">お気に入り</span>
                </button>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-scale-in">
                <Button variant="ghost" size="sm" className={cn(
                  "bg-white/90 text-primary-700 hover:bg-white",
                  "animate-bounce-gentle hover:animate-none"
                )}>
                  <Eye className="h-4 w-4 mr-2" />
                  詳細を見る
                </Button>
              </div>
            </div>
          </div>
        </Link>

        {/* 価格バッジ - 左上に配置 */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-slide-down">
          <div className={cn(
            "bg-gradient-accent text-white px-3 py-1 rounded-lg shadow-luxury font-bold text-lg",
            "animate-pulse-glow hover:animate-wiggle transition-all duration-200"
          )}>
            {formatPrice(product.price)}
          </div>
        </div>
      </div>

      {/* 商品情報セクション */}
      <CardContent className="p-6">
        {/* カテゴリ・サイズバッジ */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-nature-100 text-nature-800">
            {product.category}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
            {getSizeCategoryLabel(product.size_category)}
          </span>
        </div>

        {/* 商品名 */}
        <Link 
          href={`/products/${product.id}`}
          className="focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 rounded-md"
          aria-label={`${product.name}の詳細を見る`}
        >
          <h3 className="font-bold text-xl mb-3 text-primary-800 hover:text-accent-600 transition-colors duration-200 line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* タグ表示 */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                  "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                  "transition-all duration-200 hover:scale-105 hover:animate-wiggle",
                  "focus:ring-2 focus:ring-neutral-300"
                )}
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 2 && (
              <span className="text-xs text-neutral-500 self-center animate-fade-in">+{product.tags.length - 2}個</span>
            )}
          </div>
        )}

        {/* 商品説明 */}
        <p className="text-neutral-600 text-sm line-clamp-2 mb-6 leading-relaxed">
          {product.description}
        </p>

        {/* アクションボタン */}
        <div className="space-y-3">
          {/* Amazonボタン - メインアクション */}
          <Button 
            variant="luxury" 
            size="md" 
            asChild 
            className="w-full justify-center"
          >
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
              aria-label={`${product.name}をAmazonで購入する（新しいタブで開きます）`}
              onClick={handleAffiliateClick}
            >
              <ShoppingBag className="h-4 w-4 mr-2" aria-hidden="true" />
              Amazonで購入
            </a>
          </Button>

          {/* 詳細ボタン - サブアクション */}
          <Button 
            variant="outline" 
            size="md" 
            asChild 
            className="w-full justify-center"
          >
            <Link 
              href={`/products/${product.id}`} 
              className="flex items-center"
              aria-label={`${product.name}の詳細情報を見る`}
            >
              <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
              詳細を見る
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}