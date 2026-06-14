import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '盆栽コレクションについて | 運営者情報・サイトの目的',
  description: '盆栽コレクションは、盆栽の魅力を多くの方に伝えるために運営する情報サイトです。育て方ガイド・樹種別解説・盆栽園情報を通じて、初心者から愛好家まで盆栽ライフをサポートします。',
  openGraph: {
    title: '盆栽コレクションについて | 運営者情報',
    description: '盆栽コレクションの運営方針・コンテンツポリシー・運営者情報をご紹介します。',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="bg-primary-900 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="flex items-center space-x-2 text-sm text-primary-300 mb-6">
            <Link href="/" className="hover:text-white transition-colors">ホーム</Link>
            <span>/</span>
            <span className="text-white">このサイトについて</span>
          </nav>
          <h1 className="text-4xl font-bold mb-4">このサイトについて</h1>
          <p className="text-primary-200 text-lg leading-relaxed">
            盆栽の世界を、もっと身近に。<br />
            初心者から熟練者まで、すべての盆栽愛好家のための情報プラットフォームです。
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-12">

          {/* サイトの目的 */}
          <section className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-primary-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">🌿</span>
              盆栽コレクションとは
            </h2>
            <div className="space-y-4 text-neutral-700 leading-relaxed">
              <p>
                <strong>盆栽コレクション</strong>は、日本の伝統文化である盆栽をより多くの方に楽しんでいただくために
                開設した盆栽専門の情報サイトです。
              </p>
              <p>
                「盆栽は難しそう」「どこから始めればいいかわからない」——そんな声をよく聞きます。
                このサイトでは、初めて盆栽に触れる方でも安心して始められるよう、
                水やりの基本から剪定のコツ、樹種ごとの育て方まで、わかりやすく解説しています。
              </p>
              <p>
                また、全国の盆栽園情報・展示会・イベントカレンダーも随時更新しており、
                盆栽を「見て・買って・育てる」すべての体験をサポートしています。
              </p>
            </div>
          </section>

          {/* 運営者情報 */}
          <section className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-primary-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">👤</span>
              運営者について
            </h2>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-5xl">
                  🎋
                </div>
              </div>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <div>
                  <p className="font-semibold text-primary-800 text-lg">盆栽コレクション 編集部</p>
                  <p className="text-sm text-neutral-500 mt-1">盆栽愛好家・植物コンテンツライター</p>
                </div>
                <p>
                  盆栽歴10年以上。松・もみじ・梅を中心に、現在20鉢以上を管理しています。
                  「盆栽は生き物」という実感から、毎日の観察と記録を大切にしています。
                </p>
                <p>
                  盆栽を始めたきっかけは、祖父が大切にしていた黒松でした。
                  最初は手入れの仕方もわからず枯らしてしまいそうになりましたが、
                  地元の盆栽園の方に教えていただき、少しずつ知識を深めてきました。
                  その経験から「わかりやすい盆栽情報を届けたい」という想いでこのサイトを始めました。
                </p>
                <p>
                  全国の盆栽展・即売会にも足を運び、生産者の方々から直接学んだ知識や
                  実際に育てて得た気づきをコンテンツに反映しています。
                </p>
              </div>
            </div>
          </section>

          {/* コンテンツポリシー */}
          <section className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-primary-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              コンテンツポリシー
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-primary-50 rounded-xl p-5">
                <h3 className="font-semibold text-primary-700 mb-2">✅ 正確な情報の提供</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  樹種の特性・管理方法は、実際の栽培経験と専門書・盆栽園のアドバイスをもとに
                  執筆しています。情報に誤りが判明した場合は速やかに修正します。
                </p>
              </div>
              <div className="bg-accent-50 rounded-xl p-5">
                <h3 className="font-semibold text-accent-700 mb-2">📅 定期的な更新</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  季節に合わせた管理情報やイベント情報を定期更新しています。
                  古い情報が残らないよう、各記事の更新日を明記しています。
                </p>
              </div>
              <div className="bg-primary-50 rounded-xl p-5">
                <h3 className="font-semibold text-primary-700 mb-2">🔗 アフィリエイト開示</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  当サイトはAmazonアソシエイト・プログラムに参加しており、
                  商品リンクから購入いただいた場合に紹介料を受け取ることがあります。
                  ご紹介する商品の選定は、品質・評判を基準にしています。
                </p>
              </div>
              <div className="bg-accent-50 rounded-xl p-5">
                <h3 className="font-semibold text-accent-700 mb-2">💬 読者の声を反映</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  お問い合わせや読者の方からのご意見・ご質問を参考に、
                  必要な情報を追加・改善しています。ご意見はお気軽にどうぞ。
                </p>
              </div>
            </div>
          </section>

          {/* サイト概要 */}
          <section className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-primary-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              サイト概要
            </h2>
            <dl className="divide-y divide-neutral-100">
              {[
                { dt: 'サイト名', dd: '盆栽コレクション' },
                { dt: 'URL', dd: 'https://bonsai-collection.com' },
                { dt: '運営開始', dd: '2024年9月' },
                { dt: '主なコンテンツ', dd: '盆栽育て方ガイド・樹種別解説・盆栽園情報・イベントカレンダー' },
                { dt: '対象読者', dd: '盆栽初心者〜上級者、盆栽に興味のある方全般' },
                { dt: 'お問い合わせ', dd: 'お問い合わせフォームよりご連絡ください' },
              ].map(({ dt, dd }) => (
                <div key={dt} className="py-4 flex flex-col sm:flex-row gap-2">
                  <dt className="text-sm font-semibold text-neutral-500 sm:w-40 flex-shrink-0">{dt}</dt>
                  <dd className="text-neutral-700">{dd}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* CTAセクション */}
          <section className="bg-primary-800 text-white rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold mb-3">ご質問・ご意見はこちら</h2>
            <p className="text-primary-200 mb-6 text-sm leading-relaxed">
              コンテンツの誤り、掲載希望の盆栽園・イベント情報など、<br />
              お気軽にお問い合わせください。
            </p>
            <Link
              href="/contact"
              className="inline-block bg-accent-500 hover:bg-accent-400 text-white font-semibold px-8 py-3 rounded-full transition-colors"
            >
              お問い合わせフォームへ →
            </Link>
          </section>

        </div>
      </div>
    </div>
  )
}
