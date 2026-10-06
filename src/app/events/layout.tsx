import type { Metadata } from 'next'

// 掲載情報の実在確認・更新が済むまで検索結果から外す（リンクはたどってもらう）
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
