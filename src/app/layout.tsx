import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '盆栽コレクション - 美しい盆栽を見つける',
  description: '美しい盆栽をお探しの方のための商品カタログサイトです。初心者から上級者まで、あなたにぴったりの盆栽を見つけてください。',
  keywords: ['盆栽', 'bonsai', '園芸', 'ガーデニング', '植物', '和風', 'Amazon'],
  authors: [{ name: '盆栽コレクション' }],
  openGraph: {
    title: '盆栽コレクション - 美しい盆栽を見つける',
    description: '美しい盆栽をお探しの方のための商品カタログサイトです。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '盆栽コレクション - 美しい盆栽を見つける',
    description: '美しい盆栽をお探しの方のための商品カタログサイトです。',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}