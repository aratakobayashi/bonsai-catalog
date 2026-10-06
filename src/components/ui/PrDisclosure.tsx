import { PR_DISCLOSURE_TEXT } from '@/lib/affiliate'

// 広告を含むページの冒頭に表示する PR 表記
export function PrDisclosure({ className = '' }: { className?: string }) {
  return (
    <p
      className={`text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2 ${className}`}
    >
      <span className="font-semibold text-gray-700 mr-1">PR</span>
      {PR_DISCLOSURE_TEXT}
    </p>
  )
}
