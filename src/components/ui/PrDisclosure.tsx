import { PR_DISCLOSURE_TEXT } from '@/lib/affiliate'

// 広告を含むページの冒頭に表示する PR 表記
export function PrDisclosure({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <p className={`text-[11.5px] leading-[1.8] text-ink-muted ${className}`}>
      <span className="mr-2 text-ink-soft">PR</span>
      {compact ? '本ページはプロモーション（広告）を含みます。' : PR_DISCLOSURE_TEXT}
    </p>
  )
}
