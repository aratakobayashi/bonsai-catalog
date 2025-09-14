'use client'

import { Facebook, Twitter, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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

  const buttonSize = size === 'large' ? 'md' : 'sm'
  const iconSize = size === 'large' ? 'h-5 w-5' : 'h-4 w-4'

  return (
    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
      {/* Twitter */}
      <Button
        variant="outline"
        size={buttonSize}
        onClick={shareOnTwitter}
        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
      >
        <Twitter className={`${iconSize} text-blue-500`} />
        {size === 'large' && <span className="hidden md:inline">Twitter</span>}
      </Button>

      {/* Facebook */}
      <Button
        variant="outline"
        size={buttonSize}
        onClick={shareOnFacebook}
        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-600"
      >
        <Facebook className={`${iconSize} text-blue-600`} />
        {size === 'large' && <span className="hidden md:inline">Facebook</span>}
      </Button>

      {/* LINE */}
      <Button
        variant="outline"
        size={buttonSize}
        onClick={shareOnLine}
        className="flex items-center gap-2 hover:bg-green-50 hover:border-green-500"
      >
        <div className={`${iconSize} bg-green-500 rounded-sm flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">L</span>
        </div>
        {size === 'large' && <span className="hidden md:inline">LINE</span>}
      </Button>

      {/* URL コピー */}
      <Button
        variant="outline"
        size={buttonSize}
        onClick={copyToClipboard}
        className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-400"
      >
        <LinkIcon className={`${iconSize} text-gray-600`} />
        {size === 'large' && <span className="hidden md:inline">URLをコピー</span>}
      </Button>
    </div>
  )
}