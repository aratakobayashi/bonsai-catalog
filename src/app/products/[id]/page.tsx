import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { isHiddenProductSource } from '@/lib/affiliate'
import { getShopCategory } from '@/lib/shop-categories'
import { supabaseServer } from '@/lib/supabase-server'
import { filterProducts, getCatalogProducts, normalizeProduct, parseFilters, type CatalogProduct } from '@/lib/catalog'
import { searchRakutenItems } from '@/lib/rakuten'
import { cleanProductName } from '@/lib/product-name'
import { productHeading } from '@/lib/product-heading'
import { soroeruHref, soroeruStateFor } from '@/lib/soroeru'
import { SITE_URL } from '@/lib/site'
import { formatPrice } from '@/lib/utils'
import { getRelatedArticles } from '@/lib/article-helpers'
import { articlesForSpecies, getArticleOverride, thumbnailPath } from '@/lib/article-overrides'
import { ArticleCardGrid, type ArticleCardItem } from '@/components/article/RelatedArticleRows'
import { byCuratedImage } from '@/components/home/curated'
import Image from 'next/image'
import { getCareGuide, getPurchaseChecklist } from '@/lib/care-guides'
import { BreadcrumbStructuredData, ProductStructuredData } from '@/components/seo/StructuredData'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ProductBuyBar, ProductImage, ProductInfo, SeasonBar } from '@/components/catalog/ProductDetailPanel'
import { CareIcon, iconFor } from '@/components/catalog/CareIcon'
import { Breadcrumbs, CONTAINER, SectionTitle } from '@/components/ui/design'
import { SelectionCard } from '@/components/selection/SelectionCard'
import { selectionsForProduct } from '@/lib/selections'
import { categoryLink, isPartProduct } from '@/lib/product-detail'
import { isEvergreen, peakLabel } from '@/lib/seasons'

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
  // 見つからない（PGRST116）ときだけ 404 にする。通信の失敗で 404 がキャッシュされないよう、それ以外はやり直してから例外にする
  let { data, error } = await supabaseServer.from('products').select('*').eq('id', id).maybeSingle()
  if (error) {
    await new Promise(resolve => setTimeout(resolve, 600))
    ;({ data, error } = await supabaseServer.from('products').select('*').eq('id', id).maybeSingle())
    if (error) throw new Error(`商品の取得エラー: ${error.message}`)
  }
  if (!data) return null
  const row = data as Record<string, unknown>
  if (row.is_active === false) return null
  const normalized = normalizeProduct(row)
  // Amazon の掲載を止めている間は、商品ページを樹種のカテゴリ（不明なら商品一覧）へ転送する（検索結果に残る URL のため 404 にはしない）
  if (isHiddenProductSource(row.source)) {
    const speciesCategory = normalized.speciesKey ? getShopCategory(normalized.speciesKey) : undefined
    permanentRedirect(categoryLink(normalized)?.href ?? (speciesCategory ? `/products/category/${speciesCategory.slug}` : '/products'))
  }
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

  const heading = productHeading(product, product.name)
  const title = `${heading.slice(0, 48)}｜価格・特徴・育て方 - 盆栽コレクション`
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

  // 関連商品の一覧は取れなくても、商品そのものは表示する
  const all = await getCatalogProducts().catch(() => [] as CatalogProduct[])
  const isPart = isPartProduct(product)
  const catLink = categoryLink(product)
  const sameGroup = (p: CatalogProduct) =>
    product.syncCategory ? p.syncCategory === product.syncCategory || p.category === product.category : p.category === product.category
  // 樹種のカテゴリがある商品は、カテゴリの一覧と同じ条件・並び順で「ほかの◯◯」を出す（件数も一覧と揃える）
  const categoryProducts =
    catLink?.group === 'tree'
      ? filterProducts(all, { ...parseFilters({}), species: catLink.href.split('/').pop(), type: catLink.href.endsWith('/kokedama') ? 'kokedama' : 'tree' })
      : null
  // 「ほかの◯◯」は同じ樹種だけ（ほかの樹種との寄せ植えなど、樹種の判定が違う商品は出さない）
  const sameSpecies = (p: CatalogProduct) => isPart || !product.speciesKey || p.speciesKey === product.speciesKey
  const related = (categoryProducts ?? all.filter(p => p.productType === product.productType && sameGroup(p)).sort((a, b) => b.reviewCount - a.reviewCount))
    .filter(p => p.id !== product.id && sameSpecies(p))
  // 樹を見ている人には鉢・土・道具を、部品を見ている人には樹をすすめる
  const pairTypes = isPart ? ['tree'] : ['pot', 'soil', 'tool']
  // 鉢・土・道具は、盆栽用と分かるもの（商品名に「盆栽」）を、ほかの植物向け（観葉植物・バラ・多肉など）より先にする。同じならレビューの多い順
  const pairScore = (p: CatalogProduct) => (/盆栽/.test(p.originalName) ? 2 : 0) - (/観葉|バラ|ばら|薔薇|多肉|サボテン|野菜|家庭菜園|花の土|草花/.test(p.originalName) ? 1 : 0)
  const pairs = pairTypes
    .map(type => all.filter(p => p.productType === type).sort((a, b) => byCuratedImage(a, b) || pairScore(b) - pairScore(a) || b.reviewCount - a.reviewCount)[0])
    .filter((p): p is CatalogProduct => Boolean(p))
    .concat(isPart ? all.filter(p => p.productType === 'tree' && p.id !== product.id).sort((a, b) => b.reviewCount - a.reviewCount).slice(1, 4) : [])
    .slice(0, isPart ? 4 : 3)

  // 書き直した記事（src/content/articles）は新しいタイトルで出す
  // この樹種の育て方の記事（一番上に大きく）と、そのほかの関連記事（画像つきのカード）
  const speciesSlugs = !isPart && product.speciesKey ? articlesForSpecies(product.speciesKey) : []
  const mainGuideSlug = speciesSlugs[0]
  const mainGuide = mainGuideSlug
    ? { href: `/guides/${mainGuideSlug}`, title: getArticleOverride(mainGuideSlug)?.title ?? '', image: thumbnailPath(mainGuideSlug), description: getArticleOverride(mainGuideSlug)?.description }
    : null
  const relatedArticles: ArticleCardItem[] = [
    ...speciesSlugs.slice(1),
    ...getRelatedArticles(product.category, product.tags, 6).map(article => article.slug),
  ]
    .filter((slug, i, list) => slug !== mainGuideSlug && list.indexOf(slug) === i)
    .slice(0, 4)
    .map(slug => ({ href: `/guides/${slug}`, title: getArticleOverride(slug)?.title ?? slug, image: thumbnailPath(slug) }))
    .filter(item => item.title !== item.href.split('/').pop())
  const features = selectionsForProduct(product)
  const careGuide = getCareGuide(product.productType, product.category)
  const checklist = getPurchaseChecklist(product.productType)
  const listHref = catLink?.href ?? '/products'
  const species = catLink?.label ?? product.speciesLabel
  const peak = peakLabel(product)
  const title = productHeading(product, product.displayName || product.name)
  const aboutTitle = !isPart && species ? `${species}について` : careGuide?.title
  const guideLink = careGuide?.guideLink && { href: careGuide.guideLink.href, label: !isPart && species ? `${species}の育て方を読む` : careGuide.guideLink.label }

  const breadcrumbs = [
    { name: 'ホーム', url: SITE_URL, position: 1 },
    { name: '盆栽・鉢・道具を探す', url: `${SITE_URL}/products`, position: 2 },
    ...(catLink ? [{ name: catLink.label, url: `${SITE_URL}${catLink.href}`, position: 3 }] : []),
    { name: product.name, url: `${SITE_URL}/products/${product.id}`, position: catLink ? 4 : 3 },
  ]
  const crumbs = [
    { label: '探す', href: '/products' },
    ...(catLink ? [{ label: catLink.label, href: catLink.href }] : []),
    { label: title },
  ]
  const moreLink = (
    <Link href={listHref} className="border-b border-ink pb-0.5 text-[13px] text-ink">
      {catLink ? `${catLink.label}をすべて見る${categoryProducts ? `（${categoryProducts.length.toLocaleString()}件）` : ''}` : '一覧を見る'}
    </Link>
  )

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
      <div className="bg-navy px-4 text-[13.5px] text-white lg:hidden">
        <Link href={listHref} className="-ml-1 inline-flex min-h-11 min-w-11 items-center px-1 text-white hover:text-white">‹ {catLink ? catLink.label : '一覧'}</Link>
      </div>

      {/* スマホの下の余白は、固定の購入バー（ProductBuyBar）が body に付ける */}
      <div className={`${CONTAINER} pb-12 lg:pb-20`}>
        <Breadcrumbs items={crumbs} className="hidden pt-6 lg:block" />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 lg:pt-6">
          <ProductImage product={product} sizes="(max-width: 1024px) 100vw, 60vw" size={800} className="-mx-4 aspect-[4/3] lg:mx-0 lg:aspect-square" />
          <div className="mt-3 lg:sticky lg:top-6 lg:mt-0 lg:self-start">
            <ProductInfo product={product} headingLevel="h1" showDescription pageMode />
          </div>
        </div>

        {aboutTitle && (
          <section className="mt-10 border-t border-line pt-6 lg:mt-20 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16 lg:pt-14">
            <div>
              {!isPart && product.category !== 'その他' && <div className="text-[10.5px] tracking-[0.08em] text-ink-muted lg:text-[11.5px]">{product.category}</div>}
              <h2 className="mt-1 font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[26px]">{aboutTitle}</h2>
              {guideLink && !mainGuide && (
                <Link href={guideLink.href} className="mt-[18px] hidden border-b border-ink pb-0.5 text-[13px] text-ink lg:inline-block">{guideLink.label}</Link>
              )}
            </div>
            <div className="mt-2.5 min-w-0 lg:mt-0">
              {!isPart && catLink?.intro && <p className="text-[13.5px] leading-[2] text-ink-soft lg:text-[15px]">{catLink.intro}</p>}
              {!isPart && peak && !isEvergreen(product) && (
                <div className="mt-5 lg:mt-7">
                  <div className="mb-2 flex items-center gap-1.5 text-[12px] text-ink-soft"><CareIcon name="season" className="h-4 w-4 text-gold-dark" />見頃の目安　<span className="font-bold text-ink">{peak}</span></div>
                  <SeasonBar product={product} />
                </div>
              )}
              {/* 育て方の目安（アイコン・太字の見出し・短い説明のカード） */}
              {careGuide && (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-8 lg:gap-4">
                  {careGuide.items.map(item => (
                    <li key={item.label} className="flex gap-3 bg-paper-deep/60 px-4 py-3.5">
                      <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-paper text-gold-dark">
                        <CareIcon name={iconFor(item.label)} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-bold text-ink">{item.label}</span>
                        <span className="mt-0.5 block text-[13px] leading-[1.8] text-ink-soft">{item.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-[11px] text-ink-muted">一般的な目安です。品種や地域によって異なるため、商品ごとの説明もあわせてご確認ください。</p>
              <details className="group mt-4 border-y border-line">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-[13px] text-ink [&::-webkit-details-marker]:hidden">
                  購入前に販売ページで確かめたいこと
                  <span aria-hidden="true" className="text-ink-muted group-open:rotate-180">⌄</span>
                </summary>
                <ul className="space-y-1 pb-3 text-[13px] leading-[1.8] text-ink-soft">
                  {checklist.map(item => <li key={item}>・{item}</li>)}
                </ul>
              </details>

              {/* この樹種の育て方（記事のサムネイルを大きく） */}
              {mainGuide ? (
                <Link href={mainGuide.href} className="group mt-7 block border border-line bg-[#fbfaf7] hover:border-gold sm:flex sm:items-center">
                  {mainGuide.image && (
                    <span className="relative block aspect-[40/21] overflow-hidden bg-paper-deep sm:w-[52%] sm:flex-none">
                      <Image src={mainGuide.image} alt="" fill sizes="(max-width: 639px) 100vw, 340px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    </span>
                  )}
                  <span className="block px-4 py-4 sm:px-5">
                    <span className="block text-[11.5px] tracking-[0.12em] text-gold-dark">{species ? `${species}の育て方` : '育て方'}</span>
                    <span className="mt-1.5 block font-mincho text-[15.5px] font-bold leading-[1.6] text-ink group-hover:text-gold-dark">{mainGuide.title}</span>
                    <span className="mt-2 block text-[12.5px] text-ink-soft">記事を読む ›</span>
                  </span>
                </Link>
              ) : (
                guideLink && <Link href={guideLink.href} className="mt-4 inline-block border-b border-ink pb-0.5 text-[13px] text-ink">{guideLink.label}</Link>
              )}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-10 lg:mt-20">
            <SectionTitle action={<span className="hidden lg:inline">{moreLink}</span>}>{species && !isPart ? `ほかの${species}` : '似ている商品'}</SectionTitle>
            <div className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6 lg:mt-6 lg:grid-cols-4 lg:gap-6">
              {related.slice(0, 4).map(p => <CatalogProductCard key={p.id} product={p} />)}
            </div>
            <div className="mt-5 lg:hidden">{moreLink}</div>
          </section>
        )}

        {features.length > 0 && (
          <section className="mt-12 lg:mt-20">
            <SectionTitle action={<Link href="/selection" className="border-b border-ink pb-0.5 text-[13px] text-ink">特集をすべて見る</Link>}>この商品が載っている特集</SectionTitle>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:mt-6">
              {features.map(selection => <SelectionCard key={selection.slug} selection={selection} compact />)}
            </div>
          </section>
        )}

        {relatedArticles.length > 0 && (
          <section className="mt-12 lg:mt-20">
            <SectionTitle action={<Link href="/guides" className="border-b border-ink pb-0.5 text-[13px] text-ink">育て方の記事をすべて見る</Link>}>あわせて読みたい</SectionTitle>
            <div className="mt-4 lg:mt-6">
              <ArticleCardGrid items={relatedArticles} />
            </div>
          </section>
        )}

        {pairs.length > 0 && (
          <section className="mt-12 lg:mt-20">
            <SectionTitle action={!isPart ? <Link href={soroeruHref(soroeruStateFor(product))} className="border-b border-ink pb-0.5 text-[13px] text-ink">合う鉢・土・道具をまとめて見る</Link> : undefined}>{isPart ? 'この鉢・道具と合わせたい盆栽' : 'あわせて揃えたい鉢・土・道具'}</SectionTitle>
            <div className={`mt-4 grid gap-x-3.5 gap-y-6 lg:mt-6 lg:gap-6 ${isPart ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3 lg:grid-cols-6'}`}>
              {pairs.map(p => <CatalogProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

      </div>

      <ProductBuyBar product={product} />
    </>
  )
}
