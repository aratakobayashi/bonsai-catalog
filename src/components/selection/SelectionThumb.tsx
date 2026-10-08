import type { Selection } from '@/lib/selections'

// 特集のサムネイル（public/images/selections の SVG イラスト）
export function SelectionThumb({ selection, priority = false, className = '' }: { selection: Pick<Selection, 'thumbnail' | 'shortTitle'>; priority?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={selection.thumbnail}
      alt=""
      width={800}
      height={500}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-cover ${className}`}
    />
  )
}
