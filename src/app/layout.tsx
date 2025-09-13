import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { WebSiteStructuredData } from '@/components/seo/StructuredData'
import { WebVitals } from '@/components/performance/WebVitals'
import { Toaster } from 'react-hot-toast'

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
  robots: 'index, follow',
  verification: {
    google: 'zkHWVAFAw_7BRYulA99Qz4JquEu0fWINAsurXfLTdng',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <WebSiteStructuredData baseUrl="https://www.bonsai-collection.com" />
        <WebVitals />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNavigation />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </body>
    </html>
  )
}