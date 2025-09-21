import { Metadata } from 'next'
import { Suspense } from 'react'
import EventsPageClient from './EventsPageClient'

export const metadata: Metadata = {
  title: '盆栽イベント情報 | 展示会・即売会・ワークショップ一覧',
  description: '全国の盆栽イベント情報をカレンダー形式で掲載。展示会、即売会、ワークショップ、講習会など様々なイベントを地域・開催日・種別で検索できます。',
  keywords: [
    '盆栽イベント', '盆栽展示会', '盆栽即売会', 'ワークショップ',
    '盆栽講習会', '国風盆栽展', '大宮盆栽まつり', 'イベント情報',
    '盆栽体験', '盆栽教室', '展示', '即売', '講習'
  ],
  openGraph: {
    title: '盆栽イベント情報 | 展示会・即売会・ワークショップ一覧',
    description: '全国の盆栽イベント情報をカレンダー形式で掲載。展示会、即売会、ワークショップ、講習会など様々なイベントを地域・開催日・種別で検索できます。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '盆栽イベント情報',
    description: '全国の盆栽イベント情報をお届け',
  },
}

export default function EventsPage() {
  return (
    <>
      {/* JSON-LD for Events */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "盆栽イベント情報",
            "description": "全国の盆栽イベント情報をカレンダー形式で掲載",
            "url": "https://bonsai-catalog.vercel.app/events",
            "mainEntity": {
              "@type": "ItemList",
              "name": "盆栽イベント一覧",
              "description": "展示会、即売会、ワークショップ、講習会などの盆栽関連イベント"
            }
          })
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* ヘッダーセクション */}
        <div className="bg-gradient-primary text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                盆栽イベント情報
              </h1>
              <p className="text-lg text-primary-100 leading-relaxed">
                全国各地で開催される盆栽関連イベントを一覧で確認できます。展示会、即売会、ワークショップ、講習会など、あなたの興味に合わせてイベントを探してみましょう。
              </p>

              {/* 統計情報 */}
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-200">8+</div>
                  <div className="text-sm text-primary-200">今月のイベント</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-200">47</div>
                  <div className="text-sm text-primary-200">都道府県をカバー</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-200">4</div>
                  <div className="text-sm text-primary-200">イベント種別</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          }>
            <EventsPageClient />
          </Suspense>
        </div>

        {/* イベント開催案内 */}
        <div className="bg-white border-t">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                イベント主催者の方へ
              </h2>
              <p className="text-gray-600 mb-6">
                盆栽関連のイベントを当サイトに掲載をご希望の方は、お気軽にお問い合わせください。
                展示会、即売会、ワークショップ、講習会など、盆栽愛好家の皆様に有益な情報をお待ちしています。
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                イベント掲載のお問い合わせ
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}