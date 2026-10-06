import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'よくある質問 - 盆栽コレクション',
  description: '盆栽に関するよくある質問と回答をまとめました。初心者の方から上級者まで、盆栽の育て方、選び方、購入方法など幅広い質問にお答えします。',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'よくある質問 - 盆栽コレクション',
    description: '盆栽に関するよくある質問と回答をまとめました。初心者から上級者まで役立つ情報満載。',
    type: 'website',
    url: '/faq',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
