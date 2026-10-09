import Link from 'next/link'
import type { Selection } from '@/lib/selections'
import { SelectionThumb } from './SelectionThumb'

// 特集へのカード（サムネイル＋短い名前＋一言）。枠や影はつけず、写真と文字だけで見せる
export function SelectionCard({ selection, compact = false, count }: { selection: Selection; compact?: boolean; count?: number }) {
  return (
    <Link href={`/selection/${selection.slug}`} className="group block">
      <div className="aspect-[16/10] overflow-hidden bg-paper-deep">
        <SelectionThumb selection={selection} className="h-full w-full transition-opacity group-hover:opacity-90" />
      </div>
      <div className={compact ? 'mt-2' : 'mt-3'}>
        <div className="text-[11px] tracking-[0.08em] text-gold-dark">
          {selection.eyebrow}
          {count !== undefined && count > 0 && <span className="ml-2 text-ink-muted">{count.toLocaleString()}件</span>}
        </div>
        <div className={`mt-0.5 font-mincho font-bold leading-snug tracking-[0.04em] text-ink group-hover:text-gold-dark ${compact ? 'text-[14px]' : 'text-base lg:text-[17px]'}`}>
          {selection.shortTitle}
        </div>
        {!compact && <p className="mt-1 text-xs leading-relaxed text-ink-soft">{selection.tagline}</p>}
      </div>
    </Link>
  )
}
