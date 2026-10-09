import type { Metadata } from 'next'
import './globals.css'
import '@/styles/editor.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { FavoritesDock } from '@/components/catalog/CompareBar'
import { WebSiteStructuredData, OrganizationStructuredData } from '@/components/seo/StructuredData'
import { Toaster } from 'react-hot-toast'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { AdSenseLoader } from '@/components/analytics/AdSenseLoader'

// 本文は端末の標準の日本語フォント。見出しのしっぽり明朝（太字）は、表示を止めないよう描画のあとで読み込む
// （読み込むまでは端末の明朝体で表示）。next/font だと 95KB の @font-face の CSS が描画を止めるため使わない
const MINCHO_CSS = 'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@700&display=swap'
const loadMincho = `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='${MINCHO_CSS}';l.media='print';l.onload=function(){l.media='all'};document.head.appendChild(l)})()`

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script dangerouslySetInnerHTML={{ __html: loadMincho }} />
        <noscript>
          <link rel="stylesheet" href={MINCHO_CSS} />
        </noscript>
      </head>
      <body>
        <GoogleAnalytics />
        <AdSenseLoader />
        <WebSiteStructuredData baseUrl="https://www.bonsai-collection.com" />
        <OrganizationStructuredData baseUrl="https://www.bonsai-collection.com" />
        <div className="min-h-screen flex flex-col">
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:bg-sumi focus:px-4 focus:py-3 focus:text-sm focus:text-white">
            本文へスキップ
          </a>
          <Header />
          <main id="main" className="flex-1 pb-16 lg:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNavigation />
          <FavoritesDock />
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