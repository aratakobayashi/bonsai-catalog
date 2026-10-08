import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { GARDEN_VERIFIED_AT, getGardenSources, isGardenHiddenId, isGardenPublished } from '@/lib/garden-verification'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { Garden, Article } from '@/types'
import { normalizeProduct, type CatalogProduct } from '@/lib/catalog'
import { CONTAINER, Breadcrumbs, Card, SectionTitle, Tag, Placeholder } from '@/components/ui/design'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { GardenMap } from '@/components/gardens/GardenMap'
import { PrefPlate, gardenArea, gardenRegion, mapAppUrl } from '@/components/gardens/GardenParts'
import { LocalBusinessStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { getArticles } from '@/lib/database/articles'

// 仮の画像サービス（via.placeholder.com）やダミーURL（example.com）は写真として扱わない
function isRealPhoto(url?: string | null): boolean {
  return Boolean(url) && !/via\.placeholder\.com|example\.com/.test(url!)
}

interface GardenPageProps {
  params: {
    id: string
  }
}

async function getGarden(id: string): Promise<Garden | null> {
  const { data, error } = await supabaseServer
    .from('gardens')
    .select('*')
    .eq('id', id)
    .single()

  // 実在が確認できない・閉園した園は表示しない
  if (error || !data || !isGardenPublished(data as Garden)) {
    return null
  }

  return data as Garden
}

// 関連商品を取得（園の専門分野に基づく）
async function getRelatedProducts(specialties: string[]): Promise<CatalogProduct[]> {
  if (!specialties || specialties.length === 0) return []

  const { data } = await supabaseServer
    .from('products')
    .select('*')
    .in('category', specialties)
    .eq('is_visible', true)
    .limit(4)

  return (data || []).map(normalizeProduct)
}

// おすすめ盆栽商品を取得
async function getRecommendedProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching recommended products:', error)
    return []
  }

  // Filter visible products in JavaScript since is_visible field may not exist or be properly set
  const visibleProducts = (data || []).filter((product: any) =>
    product.is_visible !== false && product.is_visible !== null
  )

  return visibleProducts.map(normalizeProduct)
}

// 関連記事を取得
async function getRelatedArticles(): Promise<Article[]> {
  const articlesData = await getArticles({
    limit: 3,
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  })

  return articlesData.articles
}

// 同じ地域の他の盆栽園を取得
async function getNearbyGardens(currentId: string, prefecture?: string): Promise<Garden[]> {
  if (!prefecture) return []

  const { data } = await supabaseServer
    .from('gardens')
    .select('*')
    .eq('prefecture', prefecture)
    .neq('id', currentId)
    .limit(6)

  return ((data || []) as Garden[]).filter(g => isGardenPublished(g)).slice(0, 3)
}

// 園の独自説明文を生成（SEO用）
function generateGardenDescription(garden: Garden): string {
  const parts = []

  if (garden.established_year) {
    const yearsInBusiness = new Date().getFullYear() - garden.established_year
    parts.push(`創業${garden.established_year}年、${yearsInBusiness}年以上の歴史を持つ`)
  }

  parts.push(`${garden.prefecture || ''}の${garden.name}は`)

  if (garden.specialties && garden.specialties.length > 0) {
    const mainSpecialty = garden.specialties[0]
    parts.push(`${mainSpecialty}を中心に`)
    if (garden.specialties.length > 1) {
      parts.push(`${garden.specialties.slice(1).join('、')}なども取り扱う専門園です。`)
    } else {
      parts.push('特化した専門園です。')
    }
  } else {
    parts.push('幅広い盆栽を取り扱っています。')
  }

  if (garden.experience_programs) {
    parts.push('初心者向けの体験教室も開催しており、')
  }

  if (garden.online_sales) {
    parts.push('オンラインでの購入にも対応。')
  }

  if (garden.prefecture) {
    parts.push(`${garden.prefecture}で盆栽園をお探しの方におすすめです。`)
  }

  return parts.join('')
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

  const description = generateGardenDescription(garden)
  const location = garden.prefecture ? `（${garden.prefecture}）` : ''

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
    <div className="flex gap-3 border-b border-line py-2.5 text-[13px] last:border-b-0">
      <dt className="w-[72px] flex-shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 flex-1 break-words text-ink">{children}</dd>
    </div>
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

  // 関連データを並行取得
  const [relatedProducts, recommendedAll, relatedArticles, nearbyGardens] = await Promise.all([
    getRelatedProducts(garden.specialties || []),
    getRecommendedProducts(),
    getRelatedArticles(),
    getNearbyGardens(garden.id, garden.prefecture)
  ])
  const relatedIds = new Set(relatedProducts.map(p => p.id))
  const recommendedProducts = recommendedAll.filter(p => !relatedIds.has(p.id))
  const hasProducts = relatedProducts.length > 0 || recommendedProducts.length > 0

  const description = generateGardenDescription(garden)

  // パンくずリスト用データ
  const breadcrumbs = [
    { name: 'ホーム', url: 'https://www.bonsai-collection.com/', position: 1 },
    { name: '盆栽園一覧', url: 'https://www.bonsai-collection.com/gardens', position: 2 },
    { name: garden.name, url: `https://www.bonsai-collection.com/gardens/${garden.id}`, position: 3 }
  ]

  const region = gardenRegion(garden)
  const photo = isRealPhoto(garden.image_url) ? garden.image_url! : null
  const hasCoords = typeof garden.latitude === 'number' && typeof garden.longitude === 'number'
  const mapPoints = hasCoords
    ? [{ id: garden.id, name: garden.name, lat: garden.latitude!, lng: garden.longitude!, area: gardenArea(garden) }]
    : []
  const specialties = garden.specialties || []
  const mapUrl = mapAppUrl(garden)
  const prefectureListHref = `/gardens?prefecture=${encodeURIComponent(garden.prefecture || '')}`

  // この園でできること（データがあるものだけ）
  const canDo = [
    specialties.length > 0 && { label: '見る', value: specialties.slice(0, 2).join('・') },
    garden.experience_programs && { label: '体験する', value: '体験・教室あり' },
    garden.online_sales && { label: '買う', value: 'オンライン購入可' },
  ].filter(Boolean) as { label: string; value: string }[]

  const socials = [
    garden.social_instagram && { label: 'Instagram', href: garden.social_instagram },
    garden.social_twitter && { label: 'X（Twitter）', href: garden.social_twitter },
    garden.social_facebook && { label: 'Facebook', href: garden.social_facebook },
  ].filter(Boolean) as { label: string; href: string }[]

  const mapBox = (className: string) => (
    <div className={`isolate overflow-hidden ${className}`}>
      {hasCoords ? <GardenMap points={mapPoints} showPopup={false} /> : <Placeholder label="地図" className="h-full w-full" />}
    </div>
  )

  return (
    <>
      <LocalBusinessStructuredData
        name={garden.name}
        description={description}
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

      <div className={`${CONTAINER} pb-24 pt-4 lg:pb-14 lg:pt-8`}>
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
        <Link href="/gardens" className="text-[13px] text-navy lg:hidden">‹ 盆栽園一覧</Link>

        {hasProducts && <PrDisclosure compact className="mt-3" />}

        {/* ヘッダー：名前・所在地・ボタン／地図（写真がある園は写真） */}
        <Card className="mt-3 overflow-hidden lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="p-4 lg:p-8">
            <div className="flex flex-wrap gap-1.5">
              {region !== '未分類' && <span className="rounded bg-navy px-1.5 py-0.5 text-[11px] font-bold text-white">{region}</span>}
              {garden.prefecture && <Tag tone="gray">{garden.prefecture}</Tag>}
              {garden.featured && <Tag tone="gold">注目の盆栽園</Tag>}
            </div>
            <h1 className="mt-2 font-mincho text-[28px] font-bold leading-tight text-navy lg:mt-3 lg:text-[40px]">{garden.name}</h1>
            <p className="mt-1 text-sm text-ink-soft">{garden.address}</p>
            {specialties.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {specialties.map(s => (
                  <Link
                    key={s}
                    href={`/products?category=${encodeURIComponent(s)}`}
                    className="rounded bg-[#f1eee8] px-1.5 py-0.5 text-[11px] text-ink-soft hover:bg-gold-light hover:text-gold-dark"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
              {garden.website_url && (
                <a href={garden.website_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-navy px-5 py-3 text-sm font-bold text-white hover:bg-navy-light">
                  公式サイトを見る ↗
                </a>
              )}
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-navy bg-white px-5 py-3 text-sm font-bold text-navy hover:bg-gold-light">
                地図アプリで開く
              </a>
            </div>
            {!photo && (
              <p className="mt-4 hidden text-xs text-ink-muted lg:block">
                写真は準備中です。<Link href="/contact" className="text-navy underline hover:text-gold-dark">園の方からの写真提供を受け付けています</Link>
              </p>
            )}
          </div>
          <div className="px-4 pb-4 lg:p-0">
            {photo ? (
              <figure className="h-[200px] overflow-hidden rounded-xl lg:h-full lg:min-h-[300px] lg:rounded-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`${garden.name}の外観`} className="h-full w-full object-cover" />
              </figure>
            ) : (
              mapBox('h-[180px] rounded-xl lg:h-full lg:min-h-[300px] lg:rounded-none')
            )}
            {!photo && (
              <p className="mt-2 text-xs text-ink-muted lg:hidden">
                写真は準備中です。<Link href="/contact" className="text-navy underline">写真提供を受け付けています</Link>
              </p>
            )}
          </div>
        </Card>

        <div className="mt-4 grid gap-4 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          {/* メイン */}
          <div className="space-y-4 lg:space-y-5">
            <Card className="p-4 lg:p-6">
              <h2 className="font-mincho text-lg font-bold text-navy lg:text-xl">{garden.name}について</h2>
              {garden.description && <p className="mt-3 text-sm leading-[1.9] text-ink lg:text-[15px]">{garden.description}</p>}
              <p className="mt-3 text-sm leading-[1.9] text-ink lg:text-[15px]">{description}</p>
              {(garden.established_year || garden.owner_name) && (
                <p className="mt-3 text-xs text-ink-muted">
                  {garden.established_year && <>創業 {garden.established_year}年</>}
                  {garden.established_year && garden.owner_name && '　'}
                  {garden.owner_name && <>園主 {garden.owner_name}</>}
                </p>
              )}
            </Card>

            {canDo.length > 0 && (
              <Card className="p-4 lg:p-6">
                <h2 className="font-mincho text-lg font-bold text-navy lg:text-xl">この園でできること</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {canDo.map(item => (
                    <div key={item.label} className="rounded-lg bg-[#f7f4ee] px-3.5 py-3">
                      <div className="text-[11px] text-gold-dark">{item.label}</div>
                      <div className="mt-0.5 text-sm font-bold text-ink">{item.value}</div>
                    </div>
                  ))}
                </div>
                {garden.experience_programs && (
                  <Link href="/guides?search=初心者" className="mt-3 inline-block text-xs font-bold text-navy underline hover:text-gold-dark">
                    初心者向けガイドを見る
                  </Link>
                )}
              </Card>
            )}

            {/* 同じ都道府県の盆栽園 */}
            {nearbyGardens.length > 0 && (
              <section className="pt-2">
                <SectionTitle
                  action={garden.prefecture && <Link href={prefectureListHref} className="text-xs text-navy hover:text-gold-dark">{garden.prefecture}の盆栽園一覧 →</Link>}
                >
                  近くの盆栽園
                </SectionTitle>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {nearbyGardens.map(g => (
                    <Link key={g.id} href={`/gardens/${g.id}`} className="group flex items-center gap-3 rounded-xl border border-line bg-white p-3 hover:shadow-md">
                      <PrefPlate garden={g} size="sm" />
                      <div className="min-w-0">
                        <div className="truncate text-[11px] text-ink-muted">{gardenArea(g)}</div>
                        <div className="truncate font-mincho text-[15px] font-bold text-navy group-hover:text-gold-dark">{g.name}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* サイドバー */}
          <aside className="space-y-4">
            <Card className="p-4 lg:p-5">
              <h2 className="text-sm font-bold text-navy">基本情報</h2>
              <dl className="mt-2">
                <InfoRow label="住所">
                  {garden.postal_code && <span className="mr-1">〒{garden.postal_code}</span>}
                  {garden.address}
                </InfoRow>
                {garden.phone && (
                  <InfoRow label="電話">
                    <a href={`tel:${garden.phone}`} className="text-navy underline hover:text-gold-dark">{garden.phone}</a>
                  </InfoRow>
                )}
                {garden.business_hours && <InfoRow label="営業時間"><span className="whitespace-pre-wrap">{garden.business_hours}</span></InfoRow>}
                {garden.closed_days && garden.closed_days.length > 0 && <InfoRow label="定休日">{garden.closed_days.join('、')}</InfoRow>}
                {garden.experience_programs && <InfoRow label="体験・教室">あり</InfoRow>}
                {garden.online_sales && <InfoRow label="購入">オンライン購入可</InfoRow>}
                {garden.access_info && <InfoRow label="アクセス"><span className="whitespace-pre-wrap">{garden.access_info}</span></InfoRow>}
                {garden.parking_info && <InfoRow label="駐車場">{garden.parking_info}</InfoRow>}
                {garden.website_url && (
                  <InfoRow label="公式サイト">
                    <a href={garden.website_url} target="_blank" rel="noopener noreferrer" className="text-navy underline hover:text-gold-dark">公式サイトを見る ↗</a>
                  </InfoRow>
                )}
                {socials.length > 0 && (
                  <InfoRow label="SNS">
                    {socials.map((s, i) => (
                      <span key={s.href}>
                        {i > 0 && '・'}
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-navy underline hover:text-gold-dark">{s.label}</a>
                      </span>
                    ))}
                  </InfoRow>
                )}
              </dl>
              <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
                営業時間・定休日などは変わることがあるため、お出かけ前に{garden.website_url ? '公式サイトで' : '各園へ'}最新情報をご確認ください。
                <Link href="/contact" className="text-navy underline hover:text-gold-dark">情報の修正を依頼する</Link>
              </p>
            </Card>

            {/* 写真がある園はここに地図 */}
            {photo && hasCoords && (
              <Card className="overflow-hidden">
                {mapBox('h-[220px]')}
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-xs font-bold text-navy hover:text-gold-dark">
                  地図アプリで開く ↗
                </a>
              </Card>
            )}

            {/* 掲載情報の確認日と出典 */}
            <Card className="p-4 text-xs leading-relaxed text-ink-soft lg:p-5">
              <h2 className="text-sm font-bold text-navy">掲載情報について</h2>
              <p className="mt-2">
                {GARDEN_VERIFIED_AT && sources.length > 0
                  ? `${new Date(GARDEN_VERIFIED_AT).toLocaleDateString('ja-JP')}に、公式サイトなどの公開情報をもとに確認しました。`
                  : '公開情報をもとに掲載しています。'}
              </p>
              {sources.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {sources.slice(0, 3).map(url => (
                    <li key={url} className="truncate">
                      出典：<a href={url} target="_blank" rel="nofollow noopener noreferrer" className="text-navy underline hover:text-gold-dark">{url.replace(/^https?:\/\//, '')}</a>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {relatedArticles.length > 0 && (
              <div className="rounded-xl border border-[#eadfc9] bg-[#fbf7ef] p-4 lg:p-5">
                <h2 className="font-mincho text-[15px] font-bold text-navy">あわせて読む</h2>
                <ul className="mt-2 space-y-2">
                  {relatedArticles.map(article => (
                    <li key={article.id}>
                      <Link href={`/guides/${article.slug}`} className="line-clamp-2 text-[13px] leading-relaxed text-ink hover:text-gold-dark">
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/guides" className="mt-3 inline-block text-xs text-navy hover:text-gold-dark">記事一覧を見る →</Link>
              </div>
            )}
          </aside>
        </div>

        {/* 関連商品 */}
        {relatedProducts.length > 0 && (
          <section className="mt-10">
            <SectionTitle action={<Link href="/products" className="text-xs text-navy hover:text-gold-dark">商品一覧を見る →</Link>}>
              {garden.name}の専門分野に関連する商品
            </SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {relatedProducts.map(product => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* おすすめ盆栽商品 */}
        {recommendedProducts.length > 0 && (
          <section className="mt-10">
            <SectionTitle action={<Link href="/products" className="text-xs text-navy hover:text-gold-dark">すべての商品を見る →</Link>}>
              おすすめ盆栽商品
            </SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {recommendedProducts.map(product => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* SP：画面下の操作ボタン（下部タブの上に固定） */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex gap-2 border-t border-line bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-lg border border-navy bg-white py-2.5 text-center text-sm font-bold text-navy ${garden.website_url ? 'w-[40%]' : 'flex-1'}`}
        >
          地図アプリ
        </a>
        {garden.website_url && (
          <a href={garden.website_url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-navy py-2.5 text-center text-sm font-bold text-white">
            公式サイト ↗
          </a>
        )}
      </div>
    </>
  )
}
