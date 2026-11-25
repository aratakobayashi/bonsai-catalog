import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { OwnerShell } from '@/components/owner/OwnerShell'

// 盆栽園向けの管理画面。検索結果には出さない
export const metadata: Metadata = {
  title: '掲載園の管理画面 - 盆栽コレクション',
  robots: { index: false, follow: false },
}

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return <OwnerShell>{children}</OwnerShell>
}
