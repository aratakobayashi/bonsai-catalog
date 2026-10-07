import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCatalogProducts, type CatalogProduct } from '@/lib/catalog'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { getArticles } from '@/lib/database/articles'
import { isOptimizableImage } from '@/lib/image-utils'
import { HeroCarousel, type HeroSlide } from '@/components/home/HeroCarousel'
import { ProductSearchPanel } from '@/components/home/ProductSearchPanel'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { SELECTIONS } from '@/lib/selections'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { isArticleIndexable } from '@/lib/content-policy'
import type { Article } from '@/types'

// 1時間ごとに再生成（ISR）。ページを開いた直後のHTMLに商品・記事が入る
export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop',
    title: '松柏類の美学',
    subtitle: '時を超えた伝統美',
    description: '風雪に耐え抜いた力強さと優雅さを併せ持つ松柏類盆栽',
    cta: '松柏類を見る',
    link: '/products?species=cat-shohaku'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop',
    title: '雑木類の季節美',
    subtitle: '四季の移ろいを楽しむ',
    description: '春の新緑から秋の紅葉まで、季節ごとの表情を魅せる雑木類',
    cta: '雑木類を見る',
    link: '/products?species=cat-zouki'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop',
    title: '花ものの華やかさ',
    subtitle: '咲き誇る美しい瞬間',
    description: '桜や梅など、開花時期の華やかな美しさを堪能する花もの盆栽',
    cta: '花ものを見る',
    link: '/products?species=cat-hana'
  }
]

// 新着の盆栽（樹）。楽天の自動取得分も含め、画像のあるものから選ぶ
async function getNewProducts(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts()
  return products
    .filter(p => p.productType === 'tree' && p.imageUrl)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 8)
}

async function getPopularArticles(): Promise<Article[]> {
  try {
    // noindex 指定の記事はトップに出さない
    const { articles } = await getArticles({ limit: 24, sortBy: 'publishedAt', sortOrder: 'desc' })
    return (articles || []).filter(article => isArticleIndexable(article.slug)).slice(0, 6)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4 tracking-wide">{title}</h2>
      <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-32 mx-auto mb-6"></div>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-300 group"
      >
        すべて見る
        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

export default async function HomePage() {
  const [popularProducts, popularArticles] = await Promise.all([
    getNewProducts(),
    getPopularArticles()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroCarousel slides={heroSlides} />

      {/* 検索 */}
      <section className="relative bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-medium text-slate-800 text-center mb-3 tracking-wide">
              初心者から楽しめる盆栽の選び方・育て方ガイド
            </h1>
            <p className="text-center text-slate-600 mb-8 leading-relaxed">
              樹種や価格帯から盆栽を探せます。育て方の基本や季節ごとの手入れもまとめています。
            </p>
            <div className="bg-white/90 rounded-2xl shadow-2xl border border-slate-200/50 p-4 md:p-8 lg:p-12">
              <ProductSearchPanel />
            </div>
          </div>
        </div>
      </section>

      {/* 目的から選ぶ */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-light text-slate-800 mb-6 text-center tracking-wide">目的から選ぶ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SELECTIONS.map(selection => (
              <Link
                key={selection.slug}
                href={`/selection/${selection.slug}`}
                className="block rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-400 transition-all"
              >
                <h3 className="font-medium text-slate-800 mb-2">{selection.h1}</h3>
                <p className="text-sm text-slate-600 line-clamp-3">{selection.lead}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 楽天市場から探す */}
      <section className="py-12 bg-slate-50/50 border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-light text-slate-800 mb-2 text-center tracking-wide">樹種・道具から探す</h2>
          <p className="text-center text-slate-600 mb-6 text-sm">楽天市場とAmazonの盆栽・鉢・土・道具を、価格やレビュー件数で比べられます。</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SHOP_CATEGORIES.map(category => (
              <Link
                key={category.slug}
                href={`/products/category/${category.slug}`}
                className="bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-700 hover:border-slate-500"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 新着の盆栽 */}
      <section className="py-16 md:py-20 bg-slate-50/30">
        <div className="container mx-auto px-4">
          <SectionHeading title="新着の盆栽" href="/products" />
          <PrDisclosure className="max-w-3xl mx-auto mb-8" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {popularProducts.length > 0 ? (
              popularProducts.map((product, index) => (
                <CatalogProductCard key={product.id} product={product} priority={index < 2} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">盆栽商品を準備中です...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 新着記事 */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeading title="新着の育て方ガイド" href="/guides" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {popularArticles.length > 0 ? (
              popularArticles.map(article => (
                <Link key={article.id} href={`/guides/${article.slug}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 h-full">
                    {isOptimizableImage(article.featuredImage?.url) && (
                      <div className="h-56 relative overflow-hidden">
                        <Image
                          src={article.featuredImage!.url}
                          alt={article.featuredImage!.alt || article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                          {article.category?.name || 'ガイド'}
                        </span>
                        {article.readingTime ? (
                          <span className="text-xs text-slate-400">{article.readingTime}分で読めます</span>
                        ) : null}
                      </div>
                      <h3 className="text-lg font-medium text-slate-800 mb-3 line-clamp-2 leading-relaxed">
                        {article.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">{article.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">記事を準備中です...</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
