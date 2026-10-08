import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { getCatalogProducts, normalizeProduct, type CatalogProduct } from '@/lib/catalog'
import { searchRakutenItems } from '@/lib/rakuten'
import { cleanProductName } from '@/lib/product-name'
import { SITE_URL } from '@/lib/site'
import { formatPrice } from '@/lib/utils'
import { getRelatedArticles } from '@/lib/article-helpers'
import { BreadcrumbStructuredData, ProductStructuredData } from '@/components/seo/StructuredData'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ProductBuyBar, ProductDetailPanel } from '@/components/catalog/ProductDetailPanel'
import { SectionTitle, Tag } from '@/components/ui/design'
import { categoryLink, isPartProduct } from '@/lib/product-detail'
import { ProductThumb } from '@/components/catalog/ProductThumb'

interface ProductPageProps {
  params: { id: string }
}

// 初回アクセス時に生成してキャッシュし、1時間ごとに再生成（ISR）
export const revalidate = 3600

export function generateStaticParams() {
  return []
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
  const latest = await withLatestRakutenInfo(stored)
  const description = plainDescription(stored.description)
  const product = { ...latest, description: description ? `${description}${stored.description.length > 600 ? '…' : ''}` : '' }

  const all = await getCatalogProducts()
  const isPart = isPartProduct(product)
  const sameGroup = (p: CatalogProduct) =>
    product.syncCategory ? p.syncCategory === product.syncCategory || p.category === product.category : p.category === product.category
  const related = all
    .filter(p => p.id !== product.id && p.productType === product.productType && sameGroup(p))
    .sort((a, b) => b.reviewCount - a.reviewCount)
  // 樹を見ている人には鉢・土・道具を、部品を見ている人には樹をすすめる
  const pairTypes = isPart ? ['tree'] : ['pot', 'soil', 'tool']
  const pairs = pairTypes
    .map(type => all.filter(p => p.productType === type).sort((a, b) => b.reviewCount - a.reviewCount)[0])
    .filter((p): p is CatalogProduct => Boolean(p))
    .concat(isPart ? all.filter(p => p.productType === 'tree' && p.id !== product.id).sort((a, b) => b.reviewCount - a.reviewCount).slice(1, 4) : [])
    .slice(0, 4)

  const relatedArticles = getRelatedArticles(product.category, product.tags, 3)
  const catLink = categoryLink(product)
  const listHref = catLink?.href ?? '/products'
  const sideList = [product, ...related.slice(0, 11)]

  const breadcrumbs = [
    { name: 'ホーム', url: SITE_URL, position: 1 },
    { name: '盆栽・鉢・道具を探す', url: `${SITE_URL}/products`, position: 2 },
    ...(catLink ? [{ name: catLink.label, url: `${SITE_URL}${catLink.href}`, position: 3 }] : []),
    { name: product.name, url: `${SITE_URL}/products/${product.id}`, position: catLink ? 4 : 3 },
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

      {/* スマホ：一覧へ戻る */}
      <div className="bg-navy px-4 py-2.5 text-sm text-white lg:hidden">
        <Link href={listHref}>‹ {catLink ? `${catLink.label}の一覧` : '一覧'}（{(related.length + 1).toLocaleString()}件）</Link>
      </div>

      <div className="mx-auto max-w-[1280px] pb-36 lg:grid lg:grid-cols-[440px_minmax(0,1fr)] lg:border-x lg:border-line lg:pb-0">
        {/* PC：同じカテゴリの商品の一覧 */}
        <aside className="hidden border-r border-line bg-white lg:block">
          <div className="px-5 pb-3 pt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-navy">{catLink ? catLink.label : '似ている商品'}</span>
              <Link href={listHref} className="ml-auto text-xs font-bold text-navy underline">一覧を見る →</Link>
            </div>
          </div>
          {sideList.map(p => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              aria-current={p.id === product.id ? 'page' : undefined}
              className={`flex gap-4 border-b border-line px-5 py-4 ${p.id === product.id ? 'border-l-[3px] border-l-gold bg-[#fbf7ef] pl-[17px]' : 'hover:bg-paper'}`}
            >
              <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-[#f1eee8]">
                <ProductThumb src={p.imageUrl} alt="" sizes="72px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] leading-snug text-ink">{p.name}</p>
                <p className="mt-1 text-sm font-bold text-ink">{formatPrice(p.price)}</p>
              </div>
            </Link>
          ))}
        </aside>

        <div className="min-w-0 px-4 pt-0 lg:px-9 lg:py-8">
          <ProductDetailPanel product={product} headingLevel="h1" showDescription />

          {pairs.length > 0 && (
            <section className="mt-10">
              <SectionTitle>{isPart ? 'この鉢・道具と合わせたい盆栽' : 'あわせて揃えたい鉢・土・道具'}</SectionTitle>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {pairs.map(p => <CatalogProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-10">
              <SectionTitle action={catLink && <Link href={catLink.href} className="font-bold text-navy underline">{catLink.label}をもっと見る →</Link>}>
                似ている商品
              </SectionTitle>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {related.slice(0, 8).map(p => <CatalogProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}

          {relatedArticles.length > 0 && (
            <section className="mt-10 pb-10">
              <SectionTitle>関連する育て方ガイド</SectionTitle>
              <ul className="mt-4 grid gap-3 md:grid-cols-3">
                {relatedArticles.map(article => (
                  <li key={article.slug}>
                    <Link href={`/guides/${article.slug}`} className="block h-full rounded-xl border border-line bg-white p-4 hover:shadow-md">
                      <Tag>{article.category}</Tag>
                      <p className="mt-2 line-clamp-3 font-mincho text-[15px] font-bold leading-snug text-ink">{article.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <ProductBuyBar product={product} />
    </>
  )
}
