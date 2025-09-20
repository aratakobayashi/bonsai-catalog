import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase'

async function getPopularArticles() {
  const supabase = createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, reading_time, seo_title, category')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  return articles || []
}

async function getArticleStats() {
  const supabase = createClient()
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  return count || 0
}

export default async function HomePage() {
  const [popularArticles, articleCount] = await Promise.all([
    getPopularArticles(),
    getArticleStats()
  ])
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
              📚 {articleCount}記事の専門ガイド付き
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="text-primary-900">盆栽を</span>
            <span className="text-gradient">学ぶ、選ぶ、育てる</span><br />
            <span className="text-primary-900">完全ガイド</span>
          </h1>

          <p className="text-xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            初心者から上級者まで、豊富な専門記事で学び、<br className="hidden sm:block" />
            厳選された盆栽を選んで、確実に育てる方法をお教えします。
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button size="xl" variant="luxury" asChild className="shadow-premium">
              <Link href="/guides">
                📖 ガイドを読む
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="/products">
                🛍️ 商品を見る
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="/gardens">
                🏮 盆栽園を探す
              </Link>
            </Button>
          </div>
          
          {/* 統計情報 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-800 mb-2">{articleCount}+</div>
              <div className="text-sm text-neutral-600 font-medium">専門記事</div>
            </div>
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
          </div>
        </div>
      </section>

      {/* 3ステップセクション */}
      <section className="py-20 bg-gradient-to-r from-bonsai-green-50 to-accent-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6">
              盆栽をはじめる3ステップ
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              初心者でも安心。学習から購入、育成まで完全サポート
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6 text-3xl">
                📚
              </div>
              <div className="bg-primary-600 text-white text-sm font-bold py-1 px-3 rounded-full inline-block mb-4">
                STEP 1
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">学ぶ</h3>
              <p className="text-gray-600 mb-6">
                {articleCount}記事の豊富なガイドで基礎から応用まで学習。
                初心者向けから専門技術まで網羅した内容です。
              </p>
              <Button variant="outline" asChild>
                <Link href="/guides">ガイドを見る</Link>
              </Button>
            </div>

            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-bonsai-green-100 rounded-full flex items-center justify-center mb-6 text-3xl">
                🛍️
              </div>
              <div className="bg-bonsai-green-600 text-white text-sm font-bold py-1 px-3 rounded-full inline-block mb-4">
                STEP 2
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">選ぶ</h3>
              <p className="text-gray-600 mb-6">
                学んだ知識をもとに、あなたにぴったりの盆栽を選択。
                厳選された商品の中から最適なものを見つけます。
              </p>
              <Button variant="outline" asChild>
                <Link href="/products">商品を見る</Link>
              </Button>
            </div>

            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mb-6 text-3xl">
                🌱
              </div>
              <div className="bg-accent-600 text-white text-sm font-bold py-1 px-3 rounded-full inline-block mb-4">
                STEP 3
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">育てる</h3>
              <p className="text-gray-600 mb-6">
                詳細な管理ガイドで確実に育成。季節ごとのお手入れ方法や
                トラブル解決まで完全サポートします。
              </p>
              <Button variant="outline" asChild>
                <Link href="/guides?category=管理">管理法を学ぶ</Link>
              </Button>
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
              盆栽カタログの特徴
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              学習から購入、育成まで、盆栽のすべてをサポートする理由
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <CardTitle className="text-xl">豊富な専門記事</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {articleCount}記事の専門ガイドで初心者から上級者まで対応。
                  基礎知識から高度な技術まで学べます。
                </p>
              </CardContent>
            </Card>

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
                  品質の高い盆栽のみを厳選してご紹介。
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">完全サポート</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  購入後の管理方法からトラブル解決まで、
                  継続的にサポートいたします。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 人気記事セクション */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-accent-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
              専門知識
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6">
              人気ガイド記事
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              初心者から上級者まで役立つ、読者に選ばれた記事をご紹介
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-accent-600 font-medium uppercase tracking-wide">
                      {article.category || 'ガイド'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {article.reading_time}分読了
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-snug line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/guides/${article.slug}`}>
                      記事を読む
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/guides">
                すべての記事を見る ({articleCount}記事)
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* カテゴリセクション */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            人気のカテゴリ
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: '松柏類', href: '/products?category=松柏類', emoji: '🌲', description: '松、真柏、杜松など針葉樹' },
              { name: '雑木類', href: '/products?category=雑木類', emoji: '🍂', description: 'もみじ、欅、ブナなど落葉樹' },
              { name: '花もの', href: '/products?category=花もの', emoji: '🌸', description: '桜、梅、ツツジなど花を楽しむ' },
              { name: '実もの', href: '/products?category=実もの', emoji: '🍇', description: '柿、南天、ピラカンサなど実を楽しむ' },
              { name: '草もの', href: '/products?category=草もの', emoji: '🌿', description: '山野草、苔、多肉植物など' },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className="text-4xl mb-2">{category.emoji}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-bonsai-green-600 transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-gradient-to-r from-bonsai-green-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            盆栽の世界を始めませんか？
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {articleCount}記事の専門ガイドで学び、厳選された商品から選んで、
            確実に育てる。すべてがここにあります。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/guides">
                📚 まずは学ぶ
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-white border-white hover:bg-white hover:text-bonsai-green-600">
              <Link href="/products">
                🛍️ 商品を見る
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}