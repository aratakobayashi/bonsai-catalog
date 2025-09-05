import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-bonsai-green-50 to-earth-brown-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-bonsai-green-800 mb-6">
            美しい盆栽を<br />あなたのお手元に
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            初心者から上級者まで。丁寧に育てられた盆栽を、
            信頼できる盆栽園から厳選してご紹介します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/products">
                商品を見る
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/gardens">
                盆栽園を探す
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            盆栽コレクションの特徴
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-bonsai-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-bonsai-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">厳選された商品</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  経験豊富な盆栽職人が丁寧に育てた、
                  品質の高い盆栽のみを取り扱っています。
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-earth-brown-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-earth-brown-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">簡単検索</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  カテゴリ、サイズ、価格帯など、
                  様々な条件であなたにぴったりの盆栽を見つけられます。
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-bonsai-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-bonsai-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">安心購入</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Amazonでの購入なので、
                  配送や返品も安心。すぐにお手元に届けられます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* カテゴリセクション */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            人気のカテゴリ
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: '松類', href: '/products?category=松類', emoji: '🌲' },
              { name: '落葉樹', href: '/products?category=落葉樹', emoji: '🍂' },
              { name: '花木', href: '/products?category=花木', emoji: '🌸' },
              { name: '針葉樹', href: '/products?category=針葉樹', emoji: '🌿' },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className="text-4xl mb-2">{category.emoji}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-bonsai-green-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-bonsai-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            あなたの理想の盆栽を見つけませんか？
          </h2>
          <p className="text-xl mb-8 opacity-90">
            豊富なラインナップからお選びいただけます
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/products">
              今すぐ商品を見る
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}