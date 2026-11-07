'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

// /en から始まるページ（訪日客向けの英語のページ）では、英語のヘッダー・フッターに切り替える
// usePathname はビルド時の書き出しでも使えるため、英語のページの HTML には最初から英語の部品が入る（ちらつかない）
export const isEnglishPath = (path: string | null) => path === '/en' || Boolean(path?.startsWith('/en/'))

export function ForLocale({ ja, en = null }: { ja: ReactNode; en?: ReactNode }) {
  const path = usePathname()
  return <>{isEnglishPath(path) ? en : ja}</>
}

// 英語のページでは <html lang> を en にする（読み上げ・翻訳の判定のため）
export function HtmlLang() {
  const path = usePathname()
  useEffect(() => {
    document.documentElement.lang = isEnglishPath(path) ? 'en' : 'ja'
  }, [path])
  return null
}
