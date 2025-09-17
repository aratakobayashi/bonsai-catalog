import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/editor.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { WebSiteStructuredData } from '@/components/seo/StructuredData'
import { WebVitals } from '@/components/performance/WebVitals'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://bonsai-catalog.vercel.app'), // OGP画像・SEO最適化
  title: '盆栽初心者から上級者まで - 盆栽コレクション | 育て方ガイド付き通販',
  description: '盆栽初心者におすすめ！真柏・ケヤキ・モミジなど人気の盆栽を育て方ガイド付きで販売。室内でも楽しめるミニ盆栽セットから本格派まで豊富な品揃え。水やり・手入れ方法も詳しく解説します。',
  keywords: [
    // メインキーワード（高検索ボリューム）
    '盆栽', '盆栽 初心者', '盆栽 育て方', 'ミニ盆栽',
    // 購入意向キーワード（商業価値高）
    '盆栽 セット', '盆栽 通販', '盆栽 おすすめ',
    // 樹種別キーワード（専門性）
    '真柏', 'ケヤキ', 'モミジ', '桜 盆栽',
    // ロングテールキーワード（競合少・コンバージョン高）
    '室内 盆栽', '盆栽 手入れ', '盆栽 水やり', '盆栽 管理',
    // 基本キーワード
    'bonsai', '和風', '園芸'
  ],
  authors: [{ name: '盆栽コレクション' }],
  category: 'gardening',
  referrer: 'origin-when-cross-origin',
  openGraph: {
    title: '盆栽初心者から上級者まで - 盆栽コレクション | 育て方ガイド付き',
    description: '盆栽初心者におすすめ！真柏・ケヤキ・モミジなど人気の盆栽を育て方ガイド付きで販売。室内でも楽しめるミニ盆栽セットから本格派まで豊富な品揃え。',
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
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