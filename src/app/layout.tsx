import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import '@/styles/editor.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { WebSiteStructuredData, OrganizationStructuredData } from '@/components/seo/StructuredData'
import { Toaster } from 'react-hot-toast'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bonsai-collection.com'), // OGP画像・canonical の基準URL
  title: '盆栽コレクション｜初心者向け盆栽の選び方・育て方と通販ガイド',
  description: '真柏・もみじ・桜など、通販で買える盆栽を樹種・価格・育てやすさから比較できる情報サイトです。初心者向けのミニ盆栽の選び方や、水やり・剪定など季節ごとの手入れ方法も解説します。',
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
    title: '盆栽コレクション｜初心者向け盆栽の選び方・育て方と通販ガイド',
    description: '通販で買える盆栽を樹種・価格・育てやすさから比較。初心者向けミニ盆栽の選び方や季節ごとの手入れ方法も解説します。',
    siteName: '盆栽コレクション',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '盆栽コレクション - 美しい盆栽を見つける',
    description: '通販で買える盆栽の比較と、選び方・育て方のガイドサイトです。',
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
        <GoogleAnalytics />
        {/* 広告スクリプトは表示を妨げないよう、ページ読み込み後に読み込む */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8441554925079357"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <WebSiteStructuredData baseUrl="https://www.bonsai-collection.com" />
        <OrganizationStructuredData baseUrl="https://www.bonsai-collection.com" />
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