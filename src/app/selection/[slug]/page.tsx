import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { SELECTIONS, getSelection, pickSelectionProducts } from '@/lib/selections'
import { formatPrice, getSizeCategoryLabel } from '@/lib/utils'
import { getDifficultyText } from '@/lib/product-ui-helpers'
import { normalizeProduct } from '@/lib/catalog-model'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { SITE_URL } from '@/lib/site'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import type { Product } from '@/types'

interface SelectionPageProps {
  params: { slug: string }
}

export const revalidate = 3600
export const dynamicParams = false

export function generateStaticParams() {
  return SELECTIONS.map(selection => ({ slug: selection.slug }))
}

export function generateMetadata({ params }: SelectionPageProps): Metadata {
  const selection = getSelection(params.slug)
  if (!selection) return {}
  return {
    title: selection.title,
    description: selection.description,
    alternates: { canonical: `/selection/${selection.slug}` },
    openGraph: {
      title: selection.h1,
      description: selection.description,
      type: 'article',
      url: `/selection/${selection.slug}`,
    },
  }
}

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('商品データの取得エラー:', error)
    return []
  }
  return (data as Product[]) || []
}

function priceRangeBySize(products: Product[]) {
  const bySize = new Map<string, number[]>()
  products.forEach(p => {
    const prices = bySize.get(p.size_category) || []
    prices.push(p.price)
    bySize.set(p.size_category, prices)
  })
  return Array.from(bySize.entries()).map(([size, prices]) => ({
    size,
    min: Math.min(...prices),
    max: Math.max(...prices),
    count: prices.length,
  }))
}

export default async function SelectionPage({ params }: SelectionPageProps) {
  const selection = getSelection(params.slug)
  if (!selection) notFound()

  const products = pickSelectionProducts(selection, await getProducts())
  const priceRanges = priceRangeBySize(products)
  const pageUrl = `${SITE_URL}/selection/${selection.slug}`

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: selection.listHeading,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/products/${product.id}`,
      name: normalizeProduct(product).name,
    })),
  }

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: selection.h1, url: pageUrl, position: 2 },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="bg-gray-50 min-h-screen">
        <article className="container mx-auto px-4 py-10 max-w-4xl">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">ホーム</Link>
            <span className="mx-2">›</span>
            <span>{selection.h1}</span>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{selection.h1}</h1>
            <p className="text-gray-700 leading-relaxed">{selection.lead}</p>
            <PrDisclosure className="mt-4" />
          </header>

          {selection.sections.map(section => (
            <section key={section.heading} className="mb-8 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{section.heading}</h2>
              {section.paragraphs.map(paragraph => (
                <p key={paragraph} className="text-gray-700 leading-relaxed mb-3">{paragraph}</p>
              ))}
              {section.points && (
                <ul className="list-disc ml-5 space-y-2 text-gray-700">
                  {section.points.map(point => <li key={point} className="leading-relaxed">{point}</li>)}
                </ul>
              )}
            </section>
          ))}

          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{selection.listHeading}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {products.length}件を掲載（楽天市場・Amazon）。価格は取得時点の情報です。最新の価格・在庫・発送時期はリンク先でご確認ください。
            </p>

            {priceRanges.length > 0 && (
              <p className="text-sm text-gray-700 mb-4">
                サイズ別の参考価格：
                {priceRanges.map(range => (
                  <span key={range.size} className="inline-block mr-3">
                    {getSizeCategoryLabel(range.size as Product['size_category'])}
                    {' '}{formatPrice(range.min)}〜{formatPrice(range.max)}
                  </span>
                ))}
              </p>
            )}

            {/* 比較表 */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm mb-8">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2">商品</th>
                    <th className="text-left px-3 py-2 whitespace-nowrap">分類</th>
                    <th className="text-left px-3 py-2 whitespace-nowrap">サイズ</th>
                    <th className="text-left px-3 py-2 whitespace-nowrap">難易度</th>
                    <th className="text-right px-3 py-2 whitespace-nowrap">参考価格</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-t">
                      <td className="px-3 py-2">
                        <Link href={`/products/${product.id}`} className="text-blue-700 hover:underline">
                          {normalizeProduct(product).name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{product.category}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {getSizeCategoryLabel(product.size_category)}
                        {product.height_cm ? `（高さ約${product.height_cm}cm）` : ''}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{getDifficultyText(product.difficulty_level)}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">{formatPrice(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 商品カード */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <CatalogProductCard key={product.id} product={normalizeProduct(product)} priority={index < 2} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              楽天市場の商品情報は{' '}
              <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">あわせて読みたい</h2>
            <ul className="space-y-2 text-blue-700">
              {SELECTIONS.filter(other => other.slug !== selection.slug).map(other => (
                <li key={other.slug}>
                  <Link href={`/selection/${other.slug}`} className="hover:underline">{other.h1}</Link>
                </li>
              ))}
              <li><Link href="/guides" className="hover:underline">盆栽の育て方ガイド一覧</Link></li>
              <li><Link href="/products" className="hover:underline">盆栽の商品カタログ</Link></li>
            </ul>
          </section>
        </article>
      </div>
    </>
  )
}
