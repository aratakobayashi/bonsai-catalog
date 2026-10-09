import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { GARDEN_VERIFIED_AT, getGardenSources, isGardenHiddenId, isGardenPublished } from '@/lib/garden-verification'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { AMAZON_ENABLED } from '@/lib/affiliate'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { Garden, Article } from '@/types'
import { normalizeProduct, type CatalogProduct } from '@/lib/catalog'
import { CONTAINER, Breadcrumbs, Placeholder } from '@/components/ui/design'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { GardenMap } from '@/components/gardens/GardenMap'
import {
  FactChips,
  compareGardens,
  distanceKm,
  formatKm,
  gardenArea,
  gardenFacts,
  gardenRegion,
  hasCoords,
  mapAppUrl,
  telHref,
} from '@/components/gardens/GardenParts'
import { LocalBusinessStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { GARDEN_ARTICLE_TOPICS, getTopicArticles } from '../related-articles'

// 仮の画像サービス（via.placeholder.com）やダミーURL（example.com）は写真として扱わない
function isRealPhoto(url?: string | null): boolean {
  return Boolean(url) && !/via\.placeholder\.com|example\.com/.test(url!)
}

interface GardenPageProps {
  params: {
    id: string
  }
}

// 詳細ページで使う項目だけを取得する
const GARDEN_COLUMNS = [
  'id', 'name', 'prefecture', 'city', 'address', 'postal_code', 'description', 'image_url', 'website_url', 'phone',
  'latitude', 'longitude', 'business_hours', 'closed_days', 'specialties', 'established_year', 'owner_name',
  'access_info', 'parking_info', 'experience_programs', 'online_sales', 'featured',
  'social_instagram', 'social_twitter', 'social_facebook',
].join(', ')

async function getGarden(id: string): Promise<Garden | null> {
  const { data, error } = await supabaseServer.from('gardens').select(GARDEN_COLUMNS).eq('id', id).single()

  // 実在が確認できない・閉園した園は表示しない
  if (error || !data || !isGardenPublished(data as unknown as Garden)) {
    return null
  }

  return data as unknown as Garden
}

// 園の取り扱い（specialties）のうち、通販のカテゴリ（/products/category/[slug]）と名前が一致するもの
// 例：「五葉松」→ 五葉松、「皐月」→ さつき。一致しないもの（「盆栽教室」「水石」など）は出さない
const SPECIALTY_TO_CATEGORY: Record<string, string> = {
  皐月: 'satsuki',
  さつき: 'satsuki',
  サツキ: 'satsuki',
  梅: 'ume',
  もみじ: 'momiji',
  紅葉: 'momiji',
  モミジ: 'momiji',
  ミニ盆栽: 'mini',
  豆盆栽: 'mini',
  実もの: 'mimono',
  実物盆栽: 'mimono',
  実もの盆栽: 'mimono',
}
function gardenShopCategories(specialties: string[]) {
  const slugs: string[] = []
  for (const s of specialties) {
    const slug = SPECIALTY_TO_CATEGORY[s] ?? SHOP_CATEGORIES.find(c => c.group === 'tree' && (c.name === s || c.name.replace(/（.*）/, '') === s))?.slug
    if (slug && !slugs.includes(slug)) slugs.push(slug)
  }
  return slugs.map(slug => SHOP_CATEGORIES.find(c => c.slug === slug)!).filter(Boolean)
}

const PRODUCT_COLUMNS = [
  'id', 'name', 'price', 'image_url', 'source', 'amazon_url', 'rakuten_url', 'shop_name', 'product_type',
  'category', 'size_category', 'height_cm', 'review_count', 'review_average', 'free_shipping', 'is_active',
  'created_at', 'last_synced_at', 'sync_category', 'tags', 'indoor_suitable', 'gift_suitable',
  'beginner_friendly', 'difficulty_level',
].join(', ')

// 園が扱う樹種の通販商品（樹種が一致するときだけ。関係のない「おすすめ商品」は出さない）
// 商品が1件もない樹種のカテゴリにはリンクしないよう、樹種ごとの件数も数える
function productQuery(columns: string, options?: { count: 'exact'; head: true }) {
  let query = supabaseServer.from('products').select(columns, options).or('is_active.is.null,is_active.eq.true')
  // Amazon の掲載を止めている間は楽天市場の商品だけ（src/lib/affiliate.ts）
  if (!AMAZON_ENABLED) query = query.eq('source', 'rakuten')
  return query
}
async function getSpeciesProducts(slugs: string[]): Promise<{ products: CatalogProduct[]; availableSlugs: string[] }> {
  if (slugs.length === 0) return { products: [], availableSlugs: [] }
  const [list, ...counts] = await Promise.all([
    productQuery(PRODUCT_COLUMNS).in('sync_category', slugs).order('review_count', { ascending: false, nullsFirst: false }).limit(4),
    ...slugs.map(slug => productQuery('id', { count: 'exact', head: true }).eq('sync_category', slug)),
  ])
  if (list.error) console.error('盆栽園ページの商品取得エラー:', list.error)
  return {
    products: (list.data || []).map(normalizeProduct),
    availableSlugs: slugs.filter((_, i) => (counts[i].count ?? 0) > 0),
  }
}

// 関連記事を取得（盆栽園めぐり・見学・購入などの記事を優先）
async function getRelatedArticles(): Promise<Article[]> {
  return getTopicArticles(GARDEN_ARTICLE_TOPICS, 3)
}

type NearbyGarden = Pick<Garden, 'id' | 'name' | 'prefecture' | 'city' | 'latitude' | 'longitude'> & { distance?: number }

// 近くの盆栽園（座標があれば距離の近い順、なければ同じ都道府県）
async function getNearbyGardens(garden: Garden): Promise<NearbyGarden[]> {
  const { data } = await supabaseServer.from('gardens').select('id, name, prefecture, city, latitude, longitude').neq('id', garden.id)
  const others = ((data || []) as NearbyGarden[]).filter(g => isGardenPublished(g))
  if (hasCoords(garden)) {
    const here = { lat: garden.latitude, lng: garden.longitude }
    return others
      .filter(hasCoords)
      .map(g => ({ ...g, distance: distanceKm(here, { lat: g.latitude, lng: g.longitude }) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6)
  }
  if (!garden.prefecture) return []
  return others.filter(g => g.prefecture === garden.prefecture).sort(compareGardens).slice(0, 6)
}

// 検索結果・構造化データ用の説明（データにある事実だけで作る。定型の宣伝文は付けない）
function metaDescription(garden: Garden): string {
  const area = gardenArea(garden)
  const facts = [
    garden.experience_programs && '体験・教室あり',
    garden.online_sales && 'オンライン購入可',
  ].filter(Boolean)
  const head = `${garden.name}${area ? `（${area}）` : ''}の所在地・地図・営業時間・アクセス。`
  const body = (garden.description || '').replace(/\s*\n\s*/g, '')
  return `${head}${body}${facts.length > 0 ? `${facts.join('・')}。` : ''}`
}

// 初回アクセス時に生成してキャッシュし、1時間ごとに再生成（ISR）
export const revalidate = 3600

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: GardenPageProps): Promise<Metadata> {
  const garden = await getGarden(params.id)

  if (!garden) {
    return {
      title: '盆栽園が見つかりません',
    }
  }

  const description = metaDescription(garden)
  const location = garden.prefecture ? `（${garden.prefecture}${garden.city || ''}）` : ''

  return {
    title: `${garden.name}${location}｜盆栽園ガイド | 盆栽コレクション`,
    description: description.substring(0, 160),
    keywords: [
      garden.name,
      garden.prefecture || '',
      garden.city || '',
      '盆栽園',
      ...(garden.specialties || []),
      '盆栽',
      'bonsai'
    ].filter(Boolean),
    openGraph: {
      title: `${garden.name}${location} - 盆栽園ガイド`,
      description: description.substring(0, 200),
      images: isRealPhoto(garden.image_url) ? [garden.image_url!] : undefined,
      type: 'article',
    },
    alternates: { canonical: `/gardens/${garden.id}` },
  }
}

// 基本情報の1行（値がない行は出さない）
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-line py-3.5 text-[13.5px] lg:py-[14px]">
      <dt className="w-[76px] flex-shrink-0 text-ink-muted lg:w-[110px]">{label}</dt>
      <dd className="min-w-0 flex-1 break-words leading-relaxed text-ink">{children}</dd>
    </div>
  )
}

// PCは左に見出し、右に中身の2カラム。SPは縦に積む
function Section({ title, note, children }: { title: string; note?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-10 grid gap-3 lg:mt-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
      <div>
        <h2 className="font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-xl">{title}</h2>
        {note && <div className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">{note}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export default async function GardenDetailPage({ params }: GardenPageProps) {
  // 掲載をやめた園（実在を確認できない・閉園・盆栽を扱わない）のページは、盆栽園一覧へ転送する
  if (isGardenHiddenId(params.id)) permanentRedirect('/gardens')
  const garden = await getGarden(params.id)

  if (!garden) {
    notFound()
  }
  const sources = getGardenSources(garden)
  const specialties = garden.specialties || []
  const matchedCategories = gardenShopCategories(specialties)

  // 関連データを並行取得
  const [species, relatedArticles, nearbyGardens] = await Promise.all([
    getSpeciesProducts(matchedCategories.map(c => c.slug)),
    getRelatedArticles(),
    getNearbyGardens(garden),
  ])
  const speciesProducts = species.products
  const shopCategories = matchedCategories.filter(c => species.availableSlugs.includes(c.slug))
  const hasProducts = speciesProducts.length > 0 && shopCategories.length > 0

  // パンくずリスト用データ
  const breadcrumbs = [
    { name: 'ホーム', url: 'https://www.bonsai-collection.com/', position: 1 },
    { name: '盆栽園一覧', url: 'https://www.bonsai-collection.com/gardens', position: 2 },
    { name: garden.name, url: `https://www.bonsai-collection.com/gardens/${garden.id}`, position: 3 }
  ]

  const region = gardenRegion(garden)
  const photo = isRealPhoto(garden.image_url) ? garden.image_url! : null
  const coords = hasCoords(garden)
  const mapPoints = coords
    ? [{ id: garden.id, name: garden.name, lat: garden.latitude!, lng: garden.longitude!, area: gardenArea(garden) }]
    : []
  const mapUrl = mapAppUrl(garden)
  const prefectureListHref = `/gardens?prefecture=${encodeURIComponent(garden.prefecture || '')}`
  const facts = gardenFacts(garden)

  const socials = [
    garden.social_instagram && { label: 'Instagram', href: garden.social_instagram },
    garden.social_twitter && { label: 'X（Twitter）', href: garden.social_twitter },
    garden.social_facebook && { label: 'Facebook', href: garden.social_facebook },
  ].filter(Boolean) as { label: string; href: string }[]

  const mapBox = (className: string) => (
    <div className={`isolate overflow-hidden border border-line ${className}`}>
      {coords ? <GardenMap points={mapPoints} showPopup={false} /> : <Placeholder label="地図（座標の情報がありません）" className="h-full w-full" />}
    </div>
  )

  const confirmText = garden.website_url ? '公式サイトでご確認ください' : 'お出かけ前に園へご確認ください'
  const linkClass = 'border-b border-ink pb-0.5 hover:text-gold-dark'
  const primaryButton = 'inline-flex h-12 items-center justify-center gap-1.5 bg-sumi px-5 text-sm tracking-[0.04em] text-white hover:bg-sumi-light hover:text-white'
  const secondaryButton = 'inline-flex h-12 items-center justify-center gap-1.5 border border-ink bg-white px-5 text-sm text-ink hover:bg-paper-deep'

  return (
    <>
      <LocalBusinessStructuredData
        name={garden.name}
        description={metaDescription(garden)}
        address={garden.address}
        phone={garden.phone}
        website={garden.website_url}
        image={photo ?? undefined}
        latitude={garden.latitude}
        longitude={garden.longitude}
        businessHours={garden.business_hours}
        specialties={garden.specialties}
        baseUrl="https://www.bonsai-collection.com"
        businessId={garden.id}
      />

      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />

      <div className={`${CONTAINER} pb-16 pt-4 lg:pt-6`}>
        <Breadcrumbs
          className="hidden lg:block"
          items={[
            { label: 'ホーム', href: '/' },
            { label: '出かける', href: '/gardens' },
            { label: '盆栽園', href: '/gardens' },
            ...(garden.prefecture ? [{ label: garden.prefecture, href: prefectureListHref }] : []),
            { label: garden.name },
          ]}
        />
        <Link href={garden.prefecture ? prefectureListHref : '/gardens'} className="inline-flex min-h-11 items-center text-[13px] text-ink-soft lg:hidden">
          ‹ {garden.prefecture ? `${garden.prefecture}の盆栽園` : '盆栽園一覧'}
        </Link>

        {hasProducts && <PrDisclosure compact className="mt-1 lg:mt-2" />}

        {/* ヘッダー：名前・所在地・できること・ボタン／地図（写真がある園は写真） */}
        <div className="mt-1 grid gap-5 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-x-3 text-[12px] text-ink-muted">
              {region !== '未分類' && <span>{region}</span>}
              {(garden.prefecture || garden.city) && <span>{gardenArea(garden)}</span>}
              {garden.featured && <span className="text-gold-dark">注目の盆栽園</span>}
            </div>
            <h1 className="mt-1.5 font-mincho text-[28px] font-bold leading-tight tracking-[0.06em] text-ink lg:mt-3 lg:text-[44px]">{garden.name}</h1>
            <p className="mt-2 text-[13px] text-ink-soft lg:text-sm">{garden.address}</p>
            <FactChips items={facts} className="mt-3" />

            {/* 主な操作（SPでも最初の画面に入るよう、地図より前に置く） */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:mt-7 lg:gap-3">
              {garden.website_url && (
                <a href={garden.website_url} target="_blank" rel="noopener noreferrer" className={`${primaryButton} col-span-2 sm:col-span-1`}>
                  公式サイトを見る <span aria-hidden="true">↗</span>
                </a>
              )}
              {garden.phone && (
                <a href={telHref(garden.phone)} className={secondaryButton} aria-label={`電話する（${garden.phone}）`}>
                  電話する
                </a>
              )}
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} ${garden.phone ? '' : 'col-span-2 sm:col-span-1'}`}>
                地図アプリで開く <span aria-hidden="true">↗</span>
              </a>
            </div>

            {/* SPは地図（写真）をボタンの後に */}
            <div className="mt-5 lg:hidden">
              {photo ? (
                <figure className="h-[200px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`${garden.name}の外観`} className="h-full w-full object-cover" />
                </figure>
              ) : (
                mapBox('h-[200px]')
              )}
            </div>

            {garden.description && <p className="mt-5 text-sm leading-[2] text-ink-soft lg:mt-7 lg:text-[15px]">{garden.description}</p>}
          </div>
          <div className="hidden lg:block">
            {photo ? (
              <figure className="h-full max-h-[420px] min-h-[340px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`${garden.name}の外観`} className="h-full w-full object-cover" />
              </figure>
            ) : (
              mapBox('h-[380px]')
            )}
          </div>
        </div>

        <Section
          title="基本情報"
          note={
            <>
              訪問前に{garden.website_url ? '公式サイトで' : ''}最新情報をご確認ください。
              <br />
              <Link href="/contact" className="border-b border-ink-muted hover:text-gold-dark">情報の修正を依頼する</Link>
            </>
          }
        >
          <dl className="border-t border-line">
            <InfoRow label="住所">
              {garden.postal_code && <span className="mr-1">〒{garden.postal_code}</span>}
              {garden.address}
            </InfoRow>
            {garden.phone && (
              <InfoRow label="電話">
                <a href={telHref(garden.phone)} className={linkClass}>{garden.phone}</a>
              </InfoRow>
            )}
            <InfoRow label="営業時間">
              {garden.business_hours ? <span className="whitespace-pre-wrap">{garden.business_hours}</span> : confirmText}
            </InfoRow>
            <InfoRow label="定休日">{garden.closed_days && garden.closed_days.length > 0 ? garden.closed_days.join('、') : confirmText}</InfoRow>
            {specialties.length > 0 && <InfoRow label="取り扱い">{specialties.join('、')}</InfoRow>}
            {garden.experience_programs && <InfoRow label="体験・教室">あり</InfoRow>}
            {garden.online_sales && <InfoRow label="購入">オンライン購入可</InfoRow>}
            {garden.access_info && <InfoRow label="アクセス"><span className="whitespace-pre-wrap">{garden.access_info}</span></InfoRow>}
            {garden.parking_info && <InfoRow label="駐車場">{garden.parking_info}</InfoRow>}
            {garden.established_year && <InfoRow label="創業">{garden.established_year}年</InfoRow>}
            {garden.owner_name && <InfoRow label="園主">{garden.owner_name}</InfoRow>}
            {garden.website_url && (
              <InfoRow label="公式サイト">
                <a href={garden.website_url} target="_blank" rel="noopener noreferrer" className={linkClass}>公式サイトを見る ↗</a>
              </InfoRow>
            )}
            {socials.length > 0 && (
              <InfoRow label="SNS">
                {socials.map((s, i) => (
                  <span key={s.href}>
                    {i > 0 && '・'}
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{s.label}</a>
                  </span>
                ))}
              </InfoRow>
            )}
          </dl>
          {/* 写真がある園は地図をここに */}
          {photo && coords && <div className="mt-5">{mapBox('h-[240px]')}</div>}
        </Section>

        {/* 近くの盆栽園（座標があれば距離の近い順） */}
        {nearbyGardens.length > 0 && (
          <Section
            title="近くの盆栽園"
            note={garden.prefecture && <Link href={prefectureListHref} className="border-b border-ink-muted hover:text-gold-dark">{garden.prefecture}の盆栽園一覧へ</Link>}
          >
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {nearbyGardens.map(g => (
                <li key={g.id} className="border-b border-line first:border-t sm:[&:nth-child(2)]:border-t">
                  <Link href={`/gardens/${g.id}`} className="group flex min-h-11 items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mincho text-[15px] font-bold text-ink group-hover:text-gold-dark">{g.name}</div>
                      <div className="truncate text-[11.5px] text-ink-muted">{gardenArea(g)}</div>
                    </div>
                    {g.distance != null && <span className="flex-shrink-0 text-[12px] text-gold-dark">{formatKm(g.distance)}</span>}
                    <span className="text-ink-muted" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* 掲載情報の確認日と出典 */}
        <Section title="掲載情報について">
          <div className="text-xs leading-relaxed text-ink-soft">
            <p>
              {GARDEN_VERIFIED_AT && sources.length > 0
                ? `${new Date(GARDEN_VERIFIED_AT).toLocaleDateString('ja-JP')}に、公式サイトなどの公開情報をもとに確認しました。`
                : '公開情報をもとに掲載しています。'}
              営業時間・定休日などは変わることがあるため、お出かけ前に{garden.website_url ? '公式サイトで' : '各園へ'}最新情報をご確認ください。
            </p>
            {sources.length > 0 && (
              <ul className="mt-2 space-y-1">
                {sources.slice(0, 3).map(url => (
                  <li key={url} className="break-all">
                    出典：<a href={url} target="_blank" rel="nofollow noopener noreferrer" className="border-b border-ink-muted hover:text-gold-dark">{url.replace(/^https?:\/\//, '')}</a>
                  </li>
                ))}
              </ul>
            )}
            {!photo && (
              <p className="mt-3 text-ink-muted">
                写真は準備中です。<Link href="/contact" className="border-b border-ink-muted hover:text-gold-dark">園の方からの写真提供を受け付けています</Link>
              </p>
            )}
          </div>
        </Section>

        {relatedArticles.length > 0 && (
          <Section title="あわせて読む" note={<Link href="/guides" className="border-b border-ink-muted hover:text-gold-dark">記事一覧を見る</Link>}>
            <ul className="border-t border-line">
              {relatedArticles.map(article => (
                <li key={article.id} className="border-b border-line">
                  <Link href={`/guides/${article.slug}`} className="flex min-h-11 items-center gap-3 py-3.5 text-sm leading-relaxed text-ink hover:text-gold-dark">
                    <span className="line-clamp-2 min-w-0 flex-1">{article.title}</span>
                    <span className="text-ink-muted" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* この園が扱う樹種の通販（樹種が一致するときだけ。広告を含む） */}
        {shopCategories.length > 0 && (
          <Section
            title="取り扱い樹種を通販で見る"
            note={`${garden.name}の取り扱い（${shopCategories.map(c => c.name).join('・')}）と同じ樹種の盆栽です。園の商品ではありません。`}
          >
            {hasProducts && <PrDisclosure compact className="mb-3" />}
            <ul className="flex flex-wrap gap-2">
              {shopCategories.map(c => (
                <li key={c.slug}>
                  <Link href={`/products/category/${c.slug}`} className="inline-flex min-h-11 items-center border border-line bg-white px-3.5 text-[13px] text-ink hover:border-ink lg:min-h-9">
                    {c.name}の盆栽一覧 ›
                  </Link>
                </li>
              ))}
            </ul>
            {hasProducts && (
              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
                {speciesProducts.map(product => (
                  <CatalogProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </Section>
        )}
      </div>
    </>
  )
}
