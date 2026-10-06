import type { Metadata } from 'next'

// 掲載情報の実在確認・更新が済むまで検索結果から外す（リンクはたどってもらう）
export const metadata: Metadata = {
  title: '全国の盆栽園一覧 | 盆栽コレクション',
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
