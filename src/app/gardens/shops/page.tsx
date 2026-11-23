import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'
import { heroPhoto } from '@/lib/hero-photo'
import { getGardenList } from '@/lib/gardens-list'
import { getCatalogProducts } from '@/lib/catalog-data'
import type { CatalogProduct } from '@/lib/catalog-model'
import { BONSAI_SHOPS, BONSAI_SHOPS_CHECKED_AT, rakutenShopCode, type BonsaiShop } from '@/lib/bonsai-shops'
import { gardenShop } from '@/lib/garden-shops'
import { byCuratedThenReviews } from '@/components/home/curated'
import { compareGardens } from '@/components/gardens/GardenParts'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'
import { PrDisclosure } from '@/components/ui/PrDisclosure'

// 盆栽園・盆栽専門店から直接買う（/gardens/shops）。
// ①楽天市場に店を出している盆栽園 ②楽天市場の盆栽専門店 ③自社の通販サイトがある盆栽園（src/data/garden-shops.json）
const PATH = '/gardens/shops'

export const metadata: Metadata = {
  title: '盆栽園・盆栽専門店から通販で買う｜楽天市場の店と、自社の通販サイトがある盆栽園 - 盆栽コレクション',
  description: '盆栽を育てている盆栽園や、盆栽を専門に扱う店から通販で買える店をまとめました。楽天市場に店を出している盆栽園と盆栽専門店の商品、自社の通販サイト・BASEなどで販売している全国の盆栽園を、所在地とあわせて紹介します。',
  alternates: { canonical: PATH },
}

const formatDate = (d: string) => { const [y, m, day] = d.split('-').map(Number); return `${y}年${m}月${day}日` }

function ShopBlock({ shop, products, total, place }: { shop: BonsaiShop; products: CatalogProduct[]; total: number; place: string }) {
  return (
    <li className="border-t border-line pt-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-mincho text-[19px] font-bold text-ink lg:text-[21px]">
          {shop.kind === 'garden' && shop.gardenId ? <Link href={`/gardens/${shop.gardenId}`} className="hover:text-gold-dark">{shop.gardenName}</Link> : shop.name}
        </h3>
        <span className="text-[12.5px] text-ink-muted">
          {shop.area}
          {shop.kind === 'garden' && shop.name !== shop.gardenName && `・楽天市場では「${shop.name}」`}
          {shop.note && `・${shop.note}`}
          ・掲載{total}件
        </span>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6 md:grid-cols-4 lg:gap-5">
        {products.map(p => (
          <li key={p.id} className="min-w-0"><CatalogProductCard product={p} buyPlace={place} sizes="(max-width: 767px) 46vw, 220px" /></li>
        ))}
      </ul>
      {shop.kind === 'garden' && shop.gardenId && (
        <Link href={`/gardens/${shop.gardenId}`} className="mt-4 inline-flex min-h-11 items-center text-[13px] text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">{shop.gardenName}の紹介と、ほかの商品を見る ›</Link>
      )}
    </li>
  )
}

export default async function GardenShopsPage() {
  const [products, gardens] = await Promise.all([getCatalogProducts().catch(() => [] as CatalogProduct[]), getGardenList()])
  const byShop = new Map<string, CatalogProduct[]>()
  for (const p of products) {
    const code = rakutenShopCode(p)
    if (!code) continue
    if (!byShop.has(code)) byShop.set(code, [])
    byShop.get(code)!.push(p)
  }
  const blocks = BONSAI_SHOPS.map(shop => {
    const list = (byShop.get(shop.code) ?? []).filter(p => p.imageUrl)
    return { shop, total: list.length, products: [...list].sort(byCuratedThenReviews).slice(0, 4) }
  }).filter(b => b.total > 0)
  const gardenBlocks = blocks.filter(b => b.shop.kind === 'garden')
  const specialistBlocks = blocks.filter(b => b.shop.kind === 'specialist')
  const rakutenTotal = blocks.reduce((n, b) => n + b.total, 0)

  // 自社の通販サイト・BASE などがある盆栽園（公式サイトで確かめたもの）
  const ownShops = gardens
    .map(g => ({ garden: g, shop: gardenShop(g.id) }))
    .filter((x): x is { garden: typeof x.garden; shop: NonNullable<typeof x.shop> } => Boolean(x.shop))
    .sort((a, b) => compareGardens(a.garden, b.garden))

  return (
    <div className={`${CONTAINER} pb-16 lg:pb-24`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽園', url: `${SITE_URL}/gardens`, position: 2 },
          { name: '盆栽園・専門店から直接買う', url: `${SITE_URL}${PATH}`, position: 3 },
        ]}
      />
      <PageHeading
        eyebrow="育てた人から買う"
        photo={heroPhoto('/images/articles/photos/article-12-1.jpg', '盆栽園の棚に並ぶ盆栽')}
        title="盆栽園・専門店から直接買う"
        lead={`盆栽を育てている盆栽園や、盆栽を専門に扱う店の通販をまとめました。楽天市場の${blocks.length}店・${rakutenTotal.toLocaleString()}件と、自社の通販サイトがある${ownShops.length}園を紹介します。`}
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '盆栽園', href: '/gardens' }, { label: '盆栽園・専門店から直接買う' }]}
      />

      <PrDisclosure compact className="mt-5" />

      {/* 盆栽園・専門店から買うよさ */}
      <section aria-labelledby="why" className="mt-8 lg:mt-10">
        <h2 id="why" className="sr-only">盆栽園・専門店から買うよさ</h2>
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
          {[
            { t: '育てた人が選んだ樹', d: '日ごろ盆栽の手入れをしている店が、樹の状態を見て送り出します。' },
            { t: '育て方を相談しやすい', d: '届いたあとの水やりや植え替えを、販売した店にたずねやすくなります。' },
            { t: '盆栽に慣れた梱包', d: '枝や鉢を傷めない送り方に慣れた店が多いのも安心です。' },
          ].map(c => (
            <li key={c.t} className="border border-line bg-white p-4">
              <p className="font-mincho text-[16px] font-bold text-ink">{c.t}</p>
              <p className="mt-1.5 text-[13.5px] leading-[1.8] text-ink-soft">{c.d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] leading-[1.8] text-ink-muted">サービスの内容は店ごとに違います。相談の受け付けや送り方は、各店の案内で確かめてください。</p>
      </section>

      {/* 楽天市場に店を出している盆栽園 */}
      {gardenBlocks.length > 0 && (
        <section aria-labelledby="rakuten-gardens" className="mt-14 lg:mt-20">
          <SectionTitle><span id="rakuten-gardens">楽天市場に店を出している盆栽園</span></SectionTitle>
          <p className="mt-3 max-w-[760px] text-[14px] leading-[1.85] text-ink-soft">当サイトで紹介している盆栽園のうち、楽天市場に店を出している園です。園の紹介ページから、所在地や見学・体験の情報も見られます。</p>
          <ul className="mt-6 space-y-10">
            {gardenBlocks.map(b => <ShopBlock key={b.shop.code} {...b} place="shops_garden" />)}
          </ul>
        </section>
      )}

      {/* 楽天市場の盆栽専門店 */}
      {specialistBlocks.length > 0 && (
        <section aria-labelledby="rakuten-specialists" className="mt-14 lg:mt-20">
          <SectionTitle><span id="rakuten-specialists">楽天市場の盆栽専門店</span></SectionTitle>
          <p className="mt-3 max-w-[760px] text-[14px] leading-[1.85] text-ink-soft">盆栽を専門に扱う楽天市場の店です。商品一覧では「盆栽専門店」の印で見分けられます。</p>
          <ul className="mt-6 space-y-10">
            {specialistBlocks.map(b => <ShopBlock key={b.shop.code} {...b} place="shops_specialist" />)}
          </ul>
        </section>
      )}

      {/* 自社の通販サイトがある盆栽園 */}
      {ownShops.length > 0 && (
        <section aria-labelledby="own-shops" className="mt-14 lg:mt-20">
          <SectionTitle><span id="own-shops">自社の通販サイトがある盆栽園</span></SectionTitle>
          <p className="mt-3 max-w-[760px] text-[14px] leading-[1.85] text-ink-soft">園の公式の通販サイトや、BASE・Yahoo!ショッピングなどで盆栽を販売している園です。購入は各園のサイトで行います。</p>
          <ul className="mt-5 border-t border-line">
            {ownShops.map(({ garden, shop }) => (
              <li key={garden.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line py-3.5">
                <span className="min-w-0 flex-1">
                  <Link href={`/gardens/${garden.id}`} className="font-mincho text-[16px] font-bold text-ink hover:text-gold-dark">{garden.name}</Link>
                  <span className="ml-2 text-[12.5px] text-ink-muted">{garden.prefecture}{garden.city}</span>
                  <span className="ml-2 border border-line bg-paper px-1.5 py-px text-[11px] text-ink-soft">{shop.type}</span>
                </span>
                <a href={shop.url} target="_blank" rel="noopener noreferrer" data-garden-shop={garden.id} className="inline-flex min-h-11 items-center text-[13px] text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">通販サイトを見る<span aria-hidden="true">&nbsp;↗</span></a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="owners" className="mt-14 border border-line bg-paper-deep px-5 py-6 lg:mt-20 lg:px-8">
        <h2 id="owners" className="font-mincho text-[18px] font-bold text-ink">盆栽園・盆栽店の方へ</h2>
        <p className="mt-2 max-w-[760px] text-[14px] leading-[1.85] text-ink-soft">通販サイトをお持ちの園・店は、このページへの掲載を受け付けています（無料）。掲載内容の追加・修正もご連絡ください。</p>
        <Link href="/gardens/owners" className="mt-3 inline-flex min-h-11 items-center border border-ink bg-white px-4 text-[13.5px] font-bold text-ink hover:bg-ink hover:text-white">掲載・修正のお申し込み ›</Link>
      </section>

      <p className="mt-8 text-[12px] leading-[1.8] text-ink-muted">楽天市場の店は、楽天のショップ情報（会社名・所在地）で確かめた店を載せています（{formatDate(BONSAI_SHOPS_CHECKED_AT)}確認）。価格・在庫は取得時点のもので、最新の情報は各販売ページで確かめてください。</p>
    </div>
  )
}
