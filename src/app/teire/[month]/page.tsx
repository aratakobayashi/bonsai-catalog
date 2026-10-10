import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCatalogProducts } from '@/lib/catalog'
import type { CatalogProduct } from '@/lib/catalog-model'
import { CARE_GROUPS, getMonthCare, MONTH_NUMBERS } from '@/lib/care-calendar'
import { SPECIES_PEAKS, jstMonth, seasonOfMonth } from '@/lib/seasons'
import { SPECIES_TRAITS } from '@/lib/species-traits'
import { getShopCategory } from '@/lib/shop-categories'
import { SITE_URL } from '@/lib/site'
import { articleCards, guideLinks } from '@/lib/teire-server'
import { byCuratedThenReviews } from '@/components/home/curated'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ArticleCardGrid } from '@/components/article/RelatedArticleRows'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER, NavyPanel, PageHeading, SectionTitle, chipClass } from '@/components/ui/design'
import { GroupCareCard, MonthStrip, TaskRow } from '@/components/teire/TeireParts'

interface TeireMonthPageProps {
  params: { month: string }
}

export const revalidate = 3600

// ビルド時にまとめて商品を取ると失敗しやすいため、初回アクセス時に作る（存在しない slug・月は notFound）
export function generateStaticParams() {
  return []
}

function parseMonth(value: string): number | null {
  if (!/^(?:[1-9]|1[0-2])$/.test(value)) return null
  return Number(value)
}

export function generateMetadata({ params }: TeireMonthPageProps): Metadata {
  const month = parseMonth(params.month)
  if (!month) return {}
  return {
    title: `${month}月の盆栽の手入れ｜樹種別の水やり・置き場所・作業 - 盆栽コレクション`,
    description: `${month}月の盆栽の手入れを、松柏類・雑木類・花もの・実もの・さつき・室内向きの樹種グループ別にまとめました。水やりの回数の目安、置き場所、肥料、剪定や植え替えなどの作業と、${month}月に見頃の樹種を紹介します。時期は関東の平地の目安です。`,
    alternates: { canonical: `/teire/${month}` },
  }
}

// その月が見頃の樹種（SPECIES_TRAITS の並び順）
function peakSpecies(month: number) {
  return SPECIES_TRAITS.filter(t => SPECIES_PEAKS[t.key]?.months.includes(month)).map(t => ({
    key: t.key,
    label: t.label,
    peak: SPECIES_PEAKS[t.key].label,
    href: getShopCategory(t.key) ? `/products/category/${t.key}` : null,
  }))
}

// 見頃の樹の商品を、樹種が偏らないよう交互に並べる（写真のきれいな商品・レビューの多い商品を先に）
function pickInSeason(products: CatalogProduct[], month: number, limit = 8): CatalogProduct[] {
  const bySpecies = new Map<string, CatalogProduct[]>()
  products
    .filter(p => p.productType === 'tree' && p.speciesKey && SPECIES_PEAKS[p.speciesKey]?.months.includes(month))
    .sort(byCuratedThenReviews)
    .forEach(p => {
      const key = p.speciesKey as string
      bySpecies.set(key, [...(bySpecies.get(key) ?? []), p])
    })
  const lists = Array.from(bySpecies.values())
  const picked: CatalogProduct[] = []
  for (let i = 0; picked.length < limit && lists.some(list => list.length > i); i++) {
    for (const list of lists) {
      if (list[i] && picked.length < limit) picked.push(list[i])
    }
  }
  return picked
}

export default async function TeireMonthPage({ params }: TeireMonthPageProps) {
  const month = parseMonth(params.month)
  if (!month) notFound()

  const care = getMonthCare(month)
  const current = jstMonth()
  const peaks = peakSpecies(month)
  let products: CatalogProduct[] = []
  try {
    products = pickInSeason(await getCatalogProducts(), month)
  } catch {
    products = []
  }
  const articles = articleCards(care.articles)
  const prev = month === 1 ? 12 : month - 1
  const next = month === 12 ? 1 : month + 1
  const pageUrl = `${SITE_URL}/teire/${month}`

  return (
    <div className={`${CONTAINER} pb-12 lg:pb-20`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '今月の手入れ', url: `${SITE_URL}/teire`, position: 2 },
          { name: `${month}月の手入れ`, url: pageUrl, position: 3 },
        ]}
      />
      <PageHeading
        title={`${month}月の盆栽の手入れ`}
        lead={
          <>
            <span className="mr-2 inline-block border border-gold-dark px-1.5 text-[12px] font-bold leading-[20px] text-gold-dark">{care.phase}</span>
            {care.lead}
          </>
        }
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '今月の手入れ', href: '/teire' }, { label: `${month}月` }]}
      />
      {products.length > 0 && <PrDisclosure compact className="mt-3" />}

      <MonthStrip active={month} current={current} className="mt-6 lg:mt-8" />

      {/* どの樹にも共通すること */}
      <section aria-labelledby="common" className="mt-8 border-l-2 border-gold bg-white px-4 py-3 lg:mt-10 lg:px-6">
        <h2 id="common" className="font-mincho text-[17px] font-bold tracking-[0.06em] text-ink">どの樹にも共通すること</h2>
        <ul className="divide-y divide-line">
          {care.common.map(task => (
            <TaskRow key={task.title} task={task} />
          ))}
        </ul>
      </section>

      {/* 樹種グループごとの手入れ */}
      <section aria-labelledby="groups" className="mt-10 lg:mt-14">
        <SectionTitle>
          <span id="groups">樹種グループ別の手入れ</span>
        </SectionTitle>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">時期は関東の平地の目安です。寒い地域は春の作業を2〜3週間遅らせ、冬の準備を早めます。水やりの回数は目安で、土が乾いたかを見て与えます。</p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
          {CARE_GROUPS.map(group => (
            <GroupCareCard key={group.key} group={group} care={care.groups[group.key]} guides={guideLinks(group.guides)} />
          ))}
        </div>
      </section>

      {/* 見頃の樹種 */}
      {peaks.length > 0 && (
        <section aria-labelledby="peaks" className="mt-12 lg:mt-16">
          <SectionTitle>
            <span id="peaks">{month}月に見頃の樹種</span>
          </SectionTitle>
          <ul className="mt-4 flex flex-wrap gap-2">
            {peaks.map(p => (
              <li key={p.key}>
                {p.href ? (
                  <Link href={p.href} className={`${chipClass()} min-h-11 gap-2`}>
                    <span className="font-bold">{p.label}</span>
                    <span className="text-[12px] text-ink-muted">{p.peak}</span>
                  </Link>
                ) : (
                  <span className={`${chipClass()} min-h-11 gap-2`}>
                    <span className="font-bold">{p.label}</span>
                    <span className="text-[12px] text-ink-muted">{p.peak}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-ink-muted">見頃は一般的な目安です。品種や地域、その年の気温で前後します。</p>
        </section>
      )}

      {/* 見頃の盆栽（商品） */}
      {products.length > 0 && (
        <section aria-labelledby="products" className="mt-12 lg:mt-16">
          <SectionTitle
            action={
              <Link href={`/products?type=tree&season=${seasonOfMonth(month)}`} className="inline-flex min-h-11 items-center text-ink hover:text-gold-dark">
                もっと見る ›
              </Link>
            }
          >
            <span id="products">{month}月に見頃の盆栽</span>
          </SectionTitle>
          <div className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6 md:grid-cols-3 lg:mt-6 lg:grid-cols-4 lg:gap-6">
            {products.map(product => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-muted">価格・在庫は各ショップの商品ページでご確認ください。</p>
        </section>
      )}

      {/* 関連する記事 */}
      {articles.length > 0 && (
        <section aria-labelledby="articles" className="mt-12 lg:mt-16">
          <SectionTitle>
            <span id="articles">{month}月の手入れにくわしい記事</span>
          </SectionTitle>
          <div className="mt-5">
            <ArticleCardGrid items={articles} />
          </div>
        </section>
      )}

      {/* 前後の月・ノート */}
      <nav aria-label="前後の月" className="mt-12 grid grid-cols-2 gap-3 lg:mt-16">
        <Link href={`/teire/${prev}`} className="flex min-h-12 items-center border border-line bg-white px-4 text-sm text-ink hover:border-ink">
          ‹ {prev}月の手入れ
        </Link>
        <Link href={`/teire/${next}`} className="flex min-h-12 items-center justify-end border border-line bg-white px-4 text-sm text-ink hover:border-ink">
          {next}月の手入れ ›
        </Link>
      </nav>
      <NavyPanel
        href="/note"
        eyebrow="わたしの盆栽ノート"
        title="育てている盆栽を登録すると、その樹の今月やることだけを表示します ›"
        className="mt-4"
      />
    </div>
  )
}
