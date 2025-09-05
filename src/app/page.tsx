import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="relative py-32 overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] opacity-60"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent-100 text-accent-800 text-sm font-medium mb-6">
              ✨ 日本の伝統美をあなたの手に
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="text-primary-900">美しい</span>
            <span className="text-gradient">盆栽</span>
            <span className="text-primary-900">を</span><br />
            <span className="text-primary-900">あなたのお手元に</span>
          </h1>
          
          <p className="text-xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            初心者から上級者まで。丁寧に育てられた盆栽を、<br className="hidden sm:block" />
            信頼できる盆栽園から厳選してご紹介します。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button size="xl" variant="luxury" asChild className="shadow-premium">
              <Link href="/products">
                商品を見る
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="/gardens">
                盆栽園を探す
              </Link>
            </Button>
          </div>
          
          {/* 統計情報 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-800 mb-2">500+</div>
              <div className="text-sm text-neutral-600 font-medium">厳選商品</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-800 mb-2">50+</div>
              <div className="text-sm text-neutral-600 font-medium">提携盆栽園</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-800 mb-2">98%</div>
              <div className="text-sm text-neutral-600 font-medium">満足度</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-800 mb-2">24h</div>
              <div className="text-sm text-neutral-600 font-medium">配送対応</div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-accent-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
              なぜ選ばれるのか
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6">
              盆栽コレクションの特徴
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              お客様に最高の盆栽体験をお届けするための、こだわりのポイント
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
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