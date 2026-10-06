import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ | 盆栽コレクション',
  description: '盆栽コレクションへのご質問・ご意見・掲載のご相談はこちらから。',
  alternates: { canonical: '/contact' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
