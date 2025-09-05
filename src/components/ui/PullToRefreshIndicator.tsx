'use client'

import { RefreshCw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshIndicatorProps {
  pullDistance: number
  threshold: number
  isRefreshing: boolean
  isTriggered: boolean
}

export function PullToRefreshIndicator({
  pullDistance,
  threshold,
  isRefreshing,
  isTriggered
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1)
  const opacity = Math.min(pullDistance / (threshold * 0.5), 1)

  return (
    <div 
      className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-10"
      style={{
        transform: `translateY(${Math.max(pullDistance - 60, -60)}px)`,
        opacity: opacity
      }}
    >
      <div className={cn(
        "bg-white/95 backdrop-blur-md rounded-full shadow-luxury p-3 border border-neutral-200",
        "transition-all duration-200",
        isTriggered && "bg-accent-50 border-accent-300"
      )}>
        {isRefreshing ? (
          <RefreshCw className="h-6 w-6 text-accent-600 animate-spin" />
        ) : (
          <div className="relative">
            <ChevronDown 
              className={cn(
                "h-6 w-6 transition-all duration-200",
                isTriggered ? "text-accent-600 rotate-180" : "text-neutral-500"
              )}
              style={{
                transform: `rotate(${progress * 180}deg)`
              }}
            />
            {/* プログレスリング */}
            <div 
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{
                background: `conic-gradient(from 0deg, #d4a574 ${progress * 360}deg, transparent 0deg)`,
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 1px))',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 1px))'
              }}
            />
          </div>
        )}
      </div>
      
      {/* テキスト表示 */}
      <div className="absolute top-full mt-2 text-center">
        <p className={cn(
          "text-sm font-medium transition-all duration-200",
          isTriggered ? "text-accent-600" : "text-neutral-600"
        )}>
          {isRefreshing 
            ? "更新中..." 
            : isTriggered 
              ? "離すと更新します" 
              : "引っ張って更新"
          }
        </p>
      </div>
    </div>
  )
}