import Link from 'next/link'
import type { Selection } from '@/lib/selections'
import { SelectionThumb } from './SelectionThumb'

// 特集へのカード。写真のサムネイル（特集名入り）を大きく見せ、下に一言と掲載件数を添える
export function SelectionCard({
  selection,
  compact = false,
  count,
  sizes,
  priority = false,
}: {
  selection: Selection
  compact?: boolean
  count?: number
  sizes?: string
  priority?: boolean
}) {
  return (
    <Link href={`/selection/${selection.slug}`} className="group block">
      <div className="relative aspect-[40/21] overflow-hidden bg-ink">
        <SelectionThumb
          selection={selection}
          sizes={sizes}
          priority={priority}
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className={compact ? 'mt-2' : 'mt-3'}>
        <div className={`font-mincho font-bold leading-snug tracking-[0.04em] text-ink group-hover:text-gold-dark ${compact ? 'text-[14px]' : 'text-base lg:text-[17px]'}`}>
          {selection.shortTitle}
        </div>
        {!compact && (
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {selection.tagline}
            {count !== undefined && count > 0 && <span className="ml-2 text-ink-muted">{count.toLocaleString()}件</span>}
          </p>
        )}
      </div>
    </Link>
  )
}
