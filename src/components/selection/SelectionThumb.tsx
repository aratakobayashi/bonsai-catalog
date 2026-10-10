import Image from 'next/image'
import type { Selection } from '@/lib/selections'

// 特集のサムネイル（写真＋特集名の画像、1200×630。public/images/selections/thumbs）
export function SelectionThumb({
  selection,
  priority = false,
  sizes = '(max-width: 1023px) 50vw, 400px',
  className = '',
}: {
  selection: Pick<Selection, 'thumbnail' | 'shortTitle'>
  priority?: boolean
  sizes?: string
  className?: string
}) {
  return (
    <Image
      src={selection.thumbnail}
      alt={selection.shortTitle}
      width={1200}
      height={630}
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  )
}
