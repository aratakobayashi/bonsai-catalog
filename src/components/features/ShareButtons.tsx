'use client'

import { toast } from 'react-hot-toast'

interface ShareButtonsProps {
  url: string
  title: string
  // 互換のため残している（見た目は同じ）
  size?: 'small' | 'large'
  className?: string
}

// 記事の共有（文字だけの控えめなリンクの並び。押しやすいよう高さは 44px）
export function ShareButtons({ url, title, className = '' }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URLをコピーしました')
    } catch {
      toast.error('URLのコピーに失敗しました')
    }
  }

  const open = (shareUrl: string) => window.open(shareUrl, '_blank', 'noopener,noreferrer')

  const items = [
    { label: 'X', aria: 'Xでシェア', onClick: () => open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`) },
    { label: 'LINE', aria: 'LINEで送る', onClick: () => open(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedTitle}`) },
    { label: 'Facebook', aria: 'Facebookでシェア', onClick: () => open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`) },
    { label: 'リンクをコピー', aria: 'URLをコピー', onClick: copyToClipboard },
  ]

  return (
    <div className={`flex flex-wrap items-center gap-x-1 text-[13px] text-ink-muted ${className}`}>
      <span className="mr-2 text-[12px] tracking-[0.08em]">共有</span>
      {items.map(item => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          aria-label={item.aria}
          className="inline-flex min-h-11 items-center px-2.5 text-ink-soft underline decoration-line underline-offset-4 hover:text-ink hover:decoration-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
