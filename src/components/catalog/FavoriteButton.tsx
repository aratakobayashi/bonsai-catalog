'use client'

import { useFavorites } from '@/lib/favorites'

// 「気になる」に入れる／外すボタン。variant=icon は商品画像の右下に置くハートだけの表示
// icon：押せる範囲は 44×44px。写真の上でも見えるよう、生成りの丸い下地を敷く（位置は className で指定）
// text：高さ 44px 以上。「気になるに入れました」は途中で折り返さない
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
        className={`flex h-11 w-11 items-center justify-center ${className}`}
      >
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 text-[15px] leading-none shadow-[0_1px_3px_rgba(34,32,28,0.12)] ${
            active ? 'text-gold-dark' : 'text-ink-soft hover:text-gold-dark'
          }`}
        >
          {active ? '♥' : '♡'}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-xs ${active ? 'text-gold-dark' : 'text-ink-muted hover:text-gold-dark'} ${className}`}
    >
      <span aria-hidden="true">{active ? '♥' : '♡'}</span>
      {active ? '気になるに入れました' : '気になるに入れる'}
    </button>
  )
}
