import Image from 'next/image'
import { isOptimizableImage } from '@/lib/image-utils'

interface ProductThumbProps {
  src: string | null
  alt: string
  sizes: string
  priority?: boolean
  className?: string
  // 楽天の画像を取得するときの一辺のピクセル数（一覧の小さな画像は小さく取得する）
  size?: number
}

function rakutenSized(src: string, size: number) {
  return /[?&]_ex=\d+x\d+/.test(src) ? src.replace(/_ex=\d+x\d+/, `_ex=${size}x${size}`) : `${src}${src.includes('?') ? '&' : '?'}_ex=${size}x${size}`
}

// 楽天の画像は楽天側でサイズ指定済みのためそのまま表示し、それ以外は Next.js の画像最適化を使う
export function ProductThumb({ src, alt, sizes, priority = false, className = 'object-cover', size = 300 }: ProductThumbProps) {
  if (!src) {
    return <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">画像なし</div>
  }
  if (/rakuten\.co\.jp|r10s\.jp/.test(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={rakutenSized(src, size)}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        // @ts-expect-error React 18 の型には fetchpriority がないが、ブラウザには渡される
        fetchpriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={`absolute inset-0 w-full h-full ${className}`}
      />
    )
  }
  if (isOptimizableImage(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" className={`absolute inset-0 w-full h-full ${className}`} />
  )
}
