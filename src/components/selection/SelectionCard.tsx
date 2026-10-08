import Link from 'next/link'
import type { Selection } from '@/lib/selections'
import { SelectionThumb } from './SelectionThumb'

// 特集へのカード（サムネイル＋短い名前＋一言）
export function SelectionCard({ selection, compact = false }: { selection: Selection; compact?: boolean }) {
  return (
    <Link href={`/selection/${selection.slug}`} className="group block overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-md">
      <div className="aspect-[16/10] overflow-hidden bg-[#f3ebdd]">
        <SelectionThumb selection={selection} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]" />
      </div>
      <div className={compact ? 'px-3 py-2.5' : 'px-4 py-3'}>
        <div className="text-[11px] tracking-[0.08em] text-gold-dark">{selection.eyebrow}</div>
        <div className={`mt-0.5 font-mincho font-bold text-navy ${compact ? 'text-[14px]' : 'text-[15.5px]'}`}>{selection.shortTitle}</div>
        {!compact && <p className="mt-0.5 text-xs text-ink-muted">{selection.tagline}</p>}
      </div>
    </Link>
  )
}
