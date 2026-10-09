'use client'

import { Facebook, Twitter, Link as LinkIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ShareButtonsProps {
  url: string
  title: string
  size?: 'small' | 'large'
}

export function ShareButtons({ url, title, size = 'small' }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  // URL をクリップボードにコピー
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URLをコピーしました')
    } catch (err) {
      toast.error('URLのコピーに失敗しました')
    }
  }

  // Twitter シェア
  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  // Facebook シェア
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    window.open(facebookUrl, '_blank', 'noopener,noreferrer')
  }

  // LINE シェア
  const shareOnLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedTitle}`
    window.open(lineUrl, '_blank', 'noopener,noreferrer')
  }

  const btn = 'inline-flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-[13px] text-ink hover:border-ink'
  const iconSize = size === 'large' ? 'h-4 w-4' : 'h-3.5 w-3.5'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={shareOnTwitter} className={btn} aria-label="Xでシェア">
        <Twitter className={`${iconSize} text-ink`} />
        <span>X</span>
      </button>
      <button type="button" onClick={shareOnFacebook} className={btn} aria-label="Facebookでシェア">
        <Facebook className={`${iconSize} text-ink`} />
        <span>Facebook</span>
      </button>
      <button type="button" onClick={shareOnLine} className={btn} aria-label="LINEで送る">
        <span className={`${iconSize} flex items-center justify-center border border-ink text-[9px] font-bold text-ink`}>L</span>
        <span>LINE</span>
      </button>
      <button type="button" onClick={copyToClipboard} className={btn} aria-label="URLをコピー">
        <LinkIcon className={`${iconSize} text-ink-soft`} />
        <span>URLをコピー</span>
      </button>
    </div>
  )
}
