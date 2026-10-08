import { PR_DISCLOSURE_TEXT } from '@/lib/affiliate'

// 広告を含むページの冒頭に表示する PR 表記
export function PrDisclosure({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <p className={`rounded-lg bg-[#efeadf] px-3 py-2 text-xs leading-relaxed text-ink-soft ${className}`}>
      <span className="mr-1 font-bold text-ink">PR</span>
      {compact ? '本ページはプロモーション（広告）を含みます。' : PR_DISCLOSURE_TEXT}
    </p>
  )
}
