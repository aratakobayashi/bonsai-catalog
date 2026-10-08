import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { getCatalogProducts, normalizeProduct, type CatalogProduct } from '@/lib/catalog'
import { searchRakutenItems } from '@/lib/rakuten'
import { PRODUCT_TYPE_LABELS } from '@/lib/product-classify'
import { cleanProductName } from '@/lib/product-name'
import { getCareGuide, getPurchaseChecklist } from '@/lib/care-guides'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { AFFILIATE_LINK_REL } from '@/lib/affiliate'
import { SITE_URL } from '@/lib/site'
import { formatPrice } from '@/lib/utils'
import { getRelatedArticles } from '@/lib/article-helpers'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { BreadcrumbStructuredData, ProductStructuredData } from '@/components/seo/StructuredData'
import { CatalogProductCard, SOURCE_LABELS, SourceBadge } from '@/components/catalog/CatalogProductCard'
import { ProductThumb } from '@/components/catalog/ProductThumb'

interface ProductPageProps {
  params: { id: string }
}

// 初回アクセス時に生成してキャッシュし、1時間ごとに再生成（ISR）
export const revalidate = 3600

export function generateStaticParams() {
  return []
}

const SIZE_LABELS: Record<string, string> = {
  mini: 'ミニ（樹高15cm程度まで）',
  small: '小品（樹高25cm程度まで）',
  medium: '中品（樹高45cm程度まで）',
  large: '大品',
  unknown: '記載なし（商品ページでご確認ください）',
}

interface ProductDetail extends CatalogProduct {
  description: string
  externalId: string | null
}

async function getProduct(id: string): Promise<ProductDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data, error } = await supabaseServer.from('products').select('*').eq('id', id).single()
  if (error || !data) return null
  const row = data as Record<string, unknown>
  if (row.is_active === false) return null
  const normalized = normalizeProduct(row)
  return {
    ...normalized,
    // 見出し用は一覧より長めに残す
    name: normalized.source === 'rakuten' ? cleanProductName(normalized.originalName, 60) : normalized.name,
    description: typeof row.description === 'string' ? row.description : '',
    externalId: typeof row.external_id === 'string' ? row.external_id : null,
  }
}

// 楽天の商品は、表示時に最新の価格・レビューを取り直す（6時間キャッシュ）
async function withLatestRakutenInfo(product: ProductDetail): Promise<ProductDetail & { soldOut: boolean }> {
  if (product.source !== 'rakuten' || !product.externalId) return { ...product, soldOut: false }
  const { items, error } = await searchRakutenItems({ itemCode: product.externalId, hits: 1 })
  if (error) return { ...product, soldOut: false }
  const latest = items[0]
  if (!latest) return { ...product, soldOut: true }
  return {
    ...product,
    price: latest.price,
    reviewCount: latest.reviewCount,
    reviewAverage: latest.reviewAverage,
    freeShipping: latest.freeShipping,
    buyUrl: latest.url || product.buyUrl,
    soldOut: false,
  }
}

// 販売店の説明文から HTML タグを除き、読みやすい長さに切る
function plainDescription(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 600)
}

function categoryLink(product: CatalogProduct) {
  const slug = product.syncCategory || SHOP_CATEGORIES.find(c => c.group === 'tree' && product.originalName.includes(c.name))?.slug
  const category = SHOP_CATEGORIES.find(c => c.slug === slug)
  return category ? { href: `/products/category/${category.slug}`, label: category.name } : null
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id)
  if (!product) return { title: '商品が見つかりません - 盆栽コレクション' }

  const title = `${product.name.slice(0, 48)}｜価格・特徴・育て方 - 盆栽コレクション`
  const description = `${product.name.slice(0, 60)}の価格（${formatPrice(product.price)}〜）、サイズ、送料、販売ショップ、育て方の目安をまとめています。`
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.id}` },
    // 楽天から自動取得した商品は内容が販売ページとほぼ同じになるため、検索結果には出さない
    ...(product.source === 'rakuten' && { robots: { index: false, follow: true } }),
    openGraph: { title, description, images: product.imageUrl ? [{ url: product.imageUrl }] : [] },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const stored = await getProduct(params.id)
  if (!stored) notFound()
  const product = await withLatestRakutenInfo(stored)

  const all = await getCatalogProducts()
  const isPart = ['pot', 'soil', 'tool', 'wire', 'fertilizer'].includes(product.productType)
  const related = all
    .filter(p => p.id !== product.id && p.productType === product.productType &&
      (product.syncCategory ? p.syncCategory === product.syncCategory || p.category === product.category : p.category === product.category))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 8)
  // 樹を見ている人には鉢・土・道具を、部品を見ている人には樹をすすめる
  const pairTypes = isPart ? ['tree'] : ['pot', 'soil', 'tool']
  const pairs = pairTypes
    .map(type => all.filter(p => p.productType === type).sort((a, b) => b.reviewCount - a.reviewCount)[0])
    .filter((p): p is CatalogProduct => Boolean(p))
    .concat(isPart ? all.filter(p => p.productType === 'tree' && p.id !== product.id).sort((a, b) => b.reviewCount - a.reviewCount).slice(1, 4) : [])
    .slice(0, 4)

  const careGuide = getCareGuide(product.productType, product.category)
  const checklist = getPurchaseChecklist(product.productType)
  const description = plainDescription(product.description)
  const relatedArticles = getRelatedArticles(product.category, product.tags, 3)
  const catLink = categoryLink(product)
  const shopLabel = SOURCE_LABELS[product.source]

  const breadcrumbs = [
    { name: 'ホーム', url: SITE_URL, position: 1 },
    { name: '盆栽・鉢・道具を探す', url: `${SITE_URL}/products`, position: 2 },
    ...(catLink ? [{ name: catLink.label, url: `${SITE_URL}${catLink.href}`, position: 3 }] : []),
    { name: product.name, url: `${SITE_URL}/products/${product.id}`, position: catLink ? 4 : 3 },
  ]

  const specs: { label: string; value: string }[] = [
    { label: '種類', value: PRODUCT_TYPE_LABELS[product.productType] },
    ...(!isPart ? [{ label: '分類', value: product.category }] : []),
    ...(!isPart ? [{ label: 'サイズの目安', value: product.heightCm ? `樹高 約${product.heightCm}cm（${SIZE_LABELS[product.sizeCategory].split('（')[0]}）` : SIZE_LABELS[product.sizeCategory] }] : []),
    { label: '販売ショップ', value: `${product.shopName}（${shopLabel}）` },
    ...(product.originalName !== product.name ? [{ label: '販売ページの商品名', value: product.originalName }] : []),
    { label: '送料', value: product.freeShipping === true ? '送料無料' : product.freeShipping === false ? '送料別（ショップにより異なります）' : '商品ページでご確認ください' },
    { label: 'レビュー', value: product.reviewCount > 0 ? `★${product.reviewAverage.toFixed(1)}（${product.reviewCount.toLocaleString()}件・${shopLabel}）` : 'まだありません' },
  ]

  return (
    <>
      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />
      <ProductStructuredData
        name={product.name}
        description={description.slice(0, 300)}
        image={product.imageUrl || ''}
        category={product.category}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <nav className="text-sm text-gray-500 mb-4 truncate">
            <Link href="/" className="hover:text-gray-700">ホーム</Link>
            <span className="mx-2">›</span>
            <Link href="/products" className="hover:text-gray-700">盆栽・鉢・道具を探す</Link>
            {catLink && (
              <>
                <span className="mx-2">›</span>
                <Link href={catLink.href} className="hover:text-gray-700">{catLink.label}</Link>
              </>
            )}
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-sm">
              <ProductThumb src={product.imageUrl} alt={product.name} sizes="(max-width: 1024px) 100vw, 50vw" priority className="object-contain" />
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <SourceBadge source={product.source} />
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{PRODUCT_TYPE_LABELS[product.productType]}</span>
                {!isPart && product.category !== 'その他' && (
                  <span className="text-xs bg-green-50 text-green-800 px-2 py-0.5 rounded">{product.category}</span>
                )}
                {product.freeShipping && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">送料無料</span>}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-snug">{product.name}</h1>
              <p className="text-sm text-gray-600 mb-4">販売：{product.shopName}</p>

              <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
                <p className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                {product.reviewCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">★{product.reviewAverage.toFixed(1)}（{product.reviewCount.toLocaleString()}件）</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {product.source === 'rakuten'
                    ? '価格・レビューは楽天市場から数時間ごとに取得しています。最新の価格・在庫・送料は商品ページでご確認ください。'
                    : '参考価格（掲載時点）です。最新の価格・在庫・送料は商品ページでご確認ください。'}
                </p>
                {product.soldOut && (
                  <p className="text-sm text-amber-700 mt-2">現在、販売されていない可能性があります。</p>
                )}
                {product.buyUrl && (
                  <a
                    href={product.buyUrl}
                    target="_blank"
                    rel={AFFILIATE_LINK_REL}
                    className={`mt-4 block text-center text-lg font-semibold text-white rounded-xl py-3 ${
                      product.source === 'rakuten' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    {shopLabel}で詳細を見る
                  </a>
                )}
              </div>
              <PrDisclosure />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            <section className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">商品の情報</h2>
              <table className="w-full text-sm">
                <tbody>
                  {specs.map(spec => (
                    <tr key={spec.label} className="border-t first:border-t-0">
                      <th className="text-left font-medium text-gray-600 py-2 pr-4 w-32 align-top">{spec.label}</th>
                      <td className="py-2 text-gray-900">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {description && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">販売店の商品説明（抜粋）</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{description}{product.description.length > 600 ? '…' : ''}</p>
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">購入前にチェックしたいこと</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                {checklist.map(item => (
                  <li key={item} className="flex gap-2"><span className="text-green-600">✓</span><span>{item}</span></li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-3">いずれも販売ページの説明やショップへの問い合わせで確認できます。</p>
            </section>
          </div>

          {careGuide && (
            <section className="bg-white rounded-xl shadow-sm p-6 mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{careGuide.title}</h2>
              <dl className="grid md:grid-cols-2 gap-4">
                {careGuide.items.map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-4">
                    <dt className="font-semibold text-gray-900 mb-1">{item.label}</dt>
                    <dd className="text-sm text-gray-700 leading-relaxed">{item.text}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-gray-500 mt-3">一般的な目安です。品種や地域によって異なるため、商品ごとの説明もあわせてご確認ください。</p>
              {careGuide.guideLink && (
                <Link href={careGuide.guideLink.href} className="inline-block mt-3 text-sm text-blue-700 hover:underline">
                  {careGuide.guideLink.label} →
                </Link>
              )}
            </section>
          )}

          {pairs.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{isPart ? 'この鉢・道具と合わせたい盆栽' : 'あわせて揃えたい鉢・土・道具'}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pairs.map(p => <CatalogProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">似ている商品</h2>
                {catLink && <Link href={catLink.href} className="text-sm text-blue-700 hover:underline">{catLink.label}をもっと見る →</Link>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map(p => <CatalogProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}

          {relatedArticles.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">関連する育て方ガイド</h2>
              <ul className="grid md:grid-cols-3 gap-4">
                {relatedArticles.map(article => (
                  <li key={article.slug}>
                    <Link href={`/guides/${article.slug}`} className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md h-full">
                      <span className="text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded">{article.category}</span>
                      <p className="mt-2 text-sm font-medium text-gray-900 line-clamp-3">{article.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {product.source === 'rakuten' && (
            <p className="text-xs text-gray-500">
              楽天市場の商品情報は{' '}
              <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
            </p>
          )}
        </div>
      </div>
    </>
  )
}
