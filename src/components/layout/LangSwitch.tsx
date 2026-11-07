'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { englishPathFor, japanesePathFor } from '@/lib/locale-links'

// ヘッダーの言語の切り替え。日本語のページでは「EN」、英語のページでは「日本語」
// 内容の近いページがあればそこへ移る（例：盆栽イベント → 英語の盆栽展のページ）
export function LangSwitch({ to, className = '' }: { to: 'en' | 'ja'; className?: string }) {
  const path = usePathname()
  if (to === 'en') {
    return (
      <Link href={englishPathFor(path)} hrefLang="en" lang="en" aria-label="English" title="English" className={`inline-flex items-center justify-center border border-white/45 font-sans text-[11.5px] font-bold tracking-[0.08em] text-white hover:border-white hover:bg-white/10 hover:text-white ${className}`}>
        EN
      </Link>
    )
  }
  return (
    <Link href={japanesePathFor(path)} hrefLang="ja" lang="ja" aria-label="日本語のサイトへ" className={`inline-flex items-center justify-center border border-white/45 text-[12.5px] text-white hover:border-white hover:bg-white/10 hover:text-white ${className}`}>
      日本語
    </Link>
  )
}
