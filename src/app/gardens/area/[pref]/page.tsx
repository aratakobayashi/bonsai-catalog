import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { getGardenList } from '@/lib/gardens-list'
import { getCatalogProducts } from '@/lib/catalog-data'
import { prefectureFromSlug, prefectureSlug, prefectureAreaHref } from '@/lib/prefectures'
import { getRegionFromPrefecture } from '@/lib/utils'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'
import { heroPhoto } from '@/lib/hero-photo'
import { FactChips, gardenFacts, hasCoords } from '@/components/gardens/GardenParts'
import { GardenAreaLinks } from '@/components/gardens/GardenAreaLinks'
import { GardenShopBridge, pickBridgeProducts } from '@/components/gardens/GardenShopBridge'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { AreaMap } from './AreaMap'

const SITE = 'https://www.bonsai-collection.com'

interface PageProps {
  params: { pref: string }
}

// 盆栽園のある都道府県だけ、ビルド時に作り置きする（園のない県のページは作らない）
export const dynamicParams = false

export async function generateStaticParams() {
  const gardens = await getGardenList()
  const slugs = new Set(gardens.map(g => (g.prefecture ? prefectureSlug(g.prefecture) : undefined)).filter((s): s is string => Boolean(s)))
  return Array.from(slugs).map(pref => ({ pref }))
}

async function areaData(slug: string) {
  const prefecture = prefectureFromSlug(slug)
  if (!prefecture) return null
  const all = await getGardenList()
  const gardens = all.filter(g => g.prefecture === prefecture)
  if (gardens.length === 0) return null
  return { prefecture, gardens, all }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await areaData(params.pref)
  if (!data) return {}
  const { prefecture, gardens } = data
  const cities = Array.from(new Set(gardens.map(g => g.city).filter(Boolean))).slice(0, 4).join('・')
  return {
    title: `${prefecture}の盆栽園・盆栽店（${gardens.length}件）｜所在地・地図・体験教室 - 盆栽コレクション`,
    description: `${prefecture}で盆栽を見たり買ったりできる盆栽園・盆栽店${gardens.length}件の所在地・地図・公式サイト・電話番号をまとめました。${cities ? `${cities}など。` : ''}体験教室やオンライン購入の有無、近くの県の盆栽園、通販で買える盆栽も紹介します。`,
    alternates: { canonical: `/gardens/area/${params.pref}` },
  }
}

// これから開かれる、その都道府県の盆栽展・イベント（取れなかったときは出さない）
async function upcomingEvents(prefecture: string) {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabaseServer
    .from('events')
    .select('slug, title, start_date, end_date, venue_name')
    .eq('prefecture', prefecture)
    .gte('end_date', today)
    .order('start_date', { ascending: true })
    .limit(6)
  if (error) return []
  return ((data || []) as { slug: string | null; title: string; start_date: string; end_date: string; venue_name?: string | null }[]).filter(e => e.slug)
}

const formatDate = (iso: string) => {
  const [, m, d] = iso.split('-')
  return `${Number(m)}月${Number(d)}日`
}

export default async function GardenAreaPage({ params }: PageProps) {
  const data = await areaData(params.pref)
  if (!data) notFound()
  const { prefecture, gardens, all } = data
  const [events, products] = await Promise.all([upcomingEvents(prefecture), getCatalogProducts()])
  const region = getRegionFromPrefecture(prefecture)
  const cities = Array.from(new Set(gardens.map(g => g.city).filter(Boolean)))
  const experience = gardens.filter(g => g.experience_programs).length
  const online = gardens.filter(g => g.online_sales).length
  // 同じ地方のほかの都道府県（園のあるところだけ）
  const neighbors = Array.from(new Set(all.filter(g => g.prefecture && g.prefecture !== prefecture && getRegionFromPrefecture(g.prefecture) === region).map(g => g.prefecture as string)))
  const points = gardens.filter(hasCoords).map(g => ({ id: g.id, name: g.name, lat: g.latitude as number, lng: g.longitude as number, area: `${g.prefecture}${g.city ?? ''}`, href: `/gardens/${g.id}` }))
  const pageUrl = `${SITE}/gardens/area/${params.pref}`

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${prefecture}の盆栽園`,
    itemListElement: gardens.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/gardens/${g.id}`, name: g.name })),
  }

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: `${SITE}/`, position: 1 },
          { name: '盆栽園一覧', url: `${SITE}/gardens`, position: 2 },
          { name: `${prefecture}の盆栽園`, url: pageUrl, position: 3 },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <div className={`${CONTAINER} pb-16`}>
        <PageHeading
          eyebrow="出かける"
          photo={heroPhoto('/images/articles/photos/article-15-1.jpg', '棚に盆栽が並ぶ盆栽園')}
          crumbs={[{ label: 'ホーム', href: '/' }, { label: '盆栽園', href: '/gardens' }, { label: prefecture }]}
          title={`${prefecture}の盆栽園・盆栽店`}
          lead={`${prefecture}で、盆栽を見たり買ったりできる盆栽園・盆栽店を${gardens.length}件まとめました。${experience > 0 ? `体験・教室のある園が${experience}件、` : ''}${online > 0 ? `オンラインで購入できる園が${online}件あります。` : ''}`}
        />

        <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
          {/* 園の一覧 */}
          <section aria-labelledby="area-list">
            <h2 id="area-list" className="font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-[22px]">
              {prefecture}の盆栽園（{gardens.length}件）
            </h2>
            {cities.length > 0 && <p className="mt-1.5 text-[12.5px] text-ink-muted">{cities.join('・')}</p>}
            <ul className="mt-4 border-t border-line">
              {gardens.map(g => (
                <li key={g.id} className="border-b border-line py-4">
                  <Link href={`/gardens/${g.id}`} className="group block">
                    <span className="block font-mincho text-[16.5px] font-bold leading-snug tracking-[0.03em] text-ink group-hover:text-gold-dark">{g.name}</span>
                    <span className="mt-0.5 block text-[12.5px] text-ink-muted">{g.prefecture}{g.city}{g.address && !g.address.startsWith(g.prefecture || '') ? ` ${g.address}` : ''}</span>
                    {g.summary && <span className="mt-1.5 block text-[13px] leading-[1.8] text-ink-soft">{g.summary}</span>}
                  </Link>
                  <FactChips items={gardenFacts(g)} className="mt-2" />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-ink-muted">
              掲載情報は公式サイトなどの公開情報をもとに確認しています。営業時間や定休日は変わることがあるため、お出かけ前に各園へご確認ください。
            </p>
          </section>

          {/* 地図 */}
          {points.length > 0 && (
            <div className="lg:order-2">
              <div className="lg:sticky lg:top-[72px]">
                <div className="isolate h-[320px] overflow-hidden border border-line lg:h-[480px]">
                  <AreaMap points={points} />
                </div>
              </div>
            </div>
          )}
        </div>

        {events.length > 0 && (
          <section className="mt-12 lg:mt-16">
            <SectionTitle action={<Link href="/events" className="border-b border-ink pb-0.5 text-[13px] text-ink">イベント一覧</Link>}>{prefecture}の盆栽展・イベント</SectionTitle>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {events.map(e => (
                <li key={e.slug}>
                  <Link href={`/events/${e.slug}`} className="flex min-h-[56px] flex-col justify-center border border-line bg-white px-4 py-2.5 hover:border-ink">
                    <span className="text-[12px] text-gold-dark">{formatDate(e.start_date)}{e.end_date !== e.start_date ? `〜${formatDate(e.end_date)}` : ''}</span>
                    <span className="font-bold leading-snug text-ink">{e.title}</span>
                    {e.venue_name && <span className="text-[12px] text-ink-muted">{e.venue_name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {neighbors.length > 0 && (
          <section className="mt-12 lg:mt-16">
            <SectionTitle>{region}のほかの盆栽園</SectionTitle>
            <div className="mt-4 flex flex-wrap gap-2">
              {neighbors.map(p => (
                <Link key={p} href={prefectureAreaHref(p)} className="inline-flex min-h-11 items-center border border-line bg-white px-3.5 text-[13.5px] text-ink hover:border-ink">
                  {p}の盆栽園<span className="ml-1 text-[11.5px] text-ink-muted">（{all.filter(g => g.prefecture === p).length}）</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <GardenShopBridge products={pickBridgeProducts(products)} title={`${prefecture}の園に行けないとき・すぐ欲しいときは、通販でも選べます`} className="mt-12 lg:mt-16" />

        <section className="mt-12 lg:mt-16">
          <SectionTitle>盆栽園に出かける前に</SectionTitle>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              { href: '/guides/bonsai-garden-tour-guide', label: '盆栽園の訪ね方', note: '出かける前の確認、園でのマナーと季節ごとの見どころ' },
              { href: '/hajimete', label: 'はじめての1か月', note: '盆栽を買って帰った日から、1か月の世話をチェックしながら' },
            ].map(link => (
              <li key={link.href}>
                <Link href={link.href} className="flex min-h-[56px] flex-col justify-center border border-line bg-white px-4 py-2.5 hover:border-ink">
                  <span className="font-bold text-ink">{link.label}</span>
                  <span className="text-[12px] text-ink-muted">{link.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <GardenAreaLinks gardens={all} current={prefecture} title="ほかの都道府県の盆栽園" className="mt-14 lg:mt-20" />
      </div>
    </>
  )
}
