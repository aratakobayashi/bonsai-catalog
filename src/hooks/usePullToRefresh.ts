'use client'

import { useRef, useEffect, useState } from 'react'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number
  resistance?: number
  enabled?: boolean
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const {
    onRefresh,
    threshold = 80,
    resistance = 2.5,
    enabled = true
  } = options

  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  
  const touchStartRef = useRef<number | null>(null)
  const scrollElementRef = useRef<HTMLElement | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled) return

    let rafId: number

    const handleTouchStart = (e: TouchEvent) => {
      const scrollElement = scrollElementRef.current || container
      
      // スクロールが一番上にある場合のみ有効
      if (scrollElement.scrollTop <= 0) {
        touchStartRef.current = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || !touchStartRef.current || isRefreshing) return

      const currentY = e.touches[0].clientY
      const distance = Math.max(0, (currentY - touchStartRef.current) / resistance)
      
      // 最大引っ張り距離を制限
      const maxDistance = threshold * 1.5
      const finalDistance = Math.min(distance, maxDistance)
      
      setPullDistance(finalDistance)

      // プルトゥリフレッシュエリアを下に引っ張る際のスクロールを無効化
      if (finalDistance > 0) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      setIsPulling(false)
      
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        
        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh failed:', error)
        } finally {
          // リフレッシュアニメーションを少し見せる
          setTimeout(() => {
            setIsRefreshing(false)
            setPullDistance(0)
          }, 300)
        }
      } else {
        // アニメーション付きで元に戻す
        const animate = () => {
          setPullDistance(prev => {
            const next = prev * 0.8
            if (next > 1) {
              rafId = requestAnimationFrame(animate)
              return next
            }
            return 0
          })
        }
        animate()
      }
      
      touchStartRef.current = null
    }

    // タッチイベントリスナーを追加
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isPulling, pullDistance, threshold, resistance, enabled, onRefresh, isRefreshing])

  return {
    containerRef,
    scrollElementRef,
    isPulling,
    isRefreshing,
    pullDistance,
    isTriggered: pullDistance >= threshold
  }
}