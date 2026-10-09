'use client'

import { useFavorites } from '@/lib/favorites'

// 「気になる」に入れる／外すボタン。variant=icon は商品画像の右下に置くハートだけの表示
export function FavoriteButton({
  productId,
  productName,
  variant = 'text',
  className = '',
}: {
  productId: string
  productName: string
  variant?: 'icon' | 'text'
  className?: string
}) {
  const { has, toggle } = useFavorites()
  const active = has(productId)
  const label = active ? `${productName}を気になるから外す` : `${productName}を気になるに入れる`

  const onClick = (e: React.MouseEvent) => {
    // カード全体がリンクのときに、ページ移動しないようにする
    e.preventDefault()
    e.stopPropagation()
    toggle(productId)
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        className={`flex h-9 w-9 items-center justify-center text-[15px] leading-none ${active ? 'text-gold-dark' : 'text-ink-muted/70 hover:text-gold-dark'} ${className}`}
      >
        <span aria-hidden="true">{active ? '♥' : '♡'}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`inline-flex items-center gap-1 text-xs ${active ? 'text-gold-dark' : 'text-ink-muted hover:text-gold-dark'} ${className}`}
    >
      <span aria-hidden="true">{active ? '♥' : '♡'}</span>
      {active ? '気になるに入れました' : '気になるに入れる'}
    </button>
  )
}
