'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  productName: string
  className?: string
}

export function ImageGallery({ images, productName, className }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  // 画像が1つしかない場合の対応
  const imageList = images.length > 0 ? images : ['/placeholder-bonsai.jpg']

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setZoomPosition({ x, y })
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* メイン画像表示エリア */}
      <div className="relative group">
        <div 
          className={cn(
            'aspect-square relative bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl overflow-hidden shadow-luxury',
            'transition-all duration-300 ease-luxury',
            isZoomed && 'cursor-zoom-out'
          )}
          onMouseMove={handleMouseMove}
          onClick={toggleZoom}
        >
          <Image
            src={imageList[currentImageIndex]}
            alt={`${productName} - 画像 ${currentImageIndex + 1}`}
            fill
            className={cn(
              'object-cover transition-all duration-500 ease-luxury',
              isZoomed 
                ? 'scale-200 cursor-zoom-out' 
                : 'group-hover:scale-105 cursor-zoom-in'
            )}
            style={
              isZoomed 
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
            priority={currentImageIndex === 0}
          />
          
          {/* ズームインジケーター */}
          {!isZoomed && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="p-2 bg-black/50 text-white rounded-lg backdrop-blur-sm">
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* ズーム時の閉じるボタン */}
          {isZoomed && (
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsZoomed(false)
                }}
                className="p-2 bg-black/70 text-white rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ナビゲーションボタン（複数画像がある場合のみ） */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-luxury hover:shadow-hover transition-all duration-200 opacity-0 group-hover:opacity-100"
              disabled={isZoomed}
            >
              <ChevronLeft className="h-5 w-5 text-primary-700" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-luxury hover:shadow-hover transition-all duration-200 opacity-0 group-hover:opacity-100"
              disabled={isZoomed}
            >
              <ChevronRight className="h-5 w-5 text-primary-700" />
            </button>
          </>
        )}

        {/* 画像インジケーター */}
        {imageList.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {imageList.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  currentImageIndex === index 
                    ? 'bg-accent-500 w-6' 
                    : 'bg-white/50 hover:bg-white/80'
                )}
                disabled={isZoomed}
              />
            ))}
          </div>
        )}
      </div>

      {/* サムネイル一覧（複数画像がある場合のみ） */}
      {imageList.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2 custom-scrollbar">
          {imageList.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                'flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden border-2 transition-all duration-200',
                currentImageIndex === index
                  ? 'border-accent-500 ring-2 ring-accent-200'
                  : 'border-neutral-200 hover:border-accent-300'
              )}
            >
              <Image
                src={image}
                alt={`${productName} - サムネイル ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* 画像情報 */}
      <div className="text-center">
        <p className="text-sm text-neutral-600">
          {imageList.length > 1 ? `${currentImageIndex + 1} / ${imageList.length}` : '1 / 1'}
        </p>
        {!isZoomed && (
          <p className="text-xs text-neutral-500 mt-1">
            クリックで拡大表示
          </p>
        )}
      </div>
    </div>
  )
}