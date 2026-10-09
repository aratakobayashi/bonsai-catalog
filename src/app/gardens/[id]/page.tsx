import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { GARDEN_VERIFIED_AT, getGardenSources, isGardenHiddenId, isGardenPublished } from '@/lib/garden-verification'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { Garden, Article } from '@/types'
import { normalizeProduct, type CatalogProduct } from '@/lib/catalog'
import { CONTAINER, Breadcrumbs, SectionTitle, Placeholder } from '@/components/ui/design'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { GardenMap } from '@/components/gardens/GardenMap'
import { PrefPlate, gardenArea, gardenRegion, mapAppUrl } from '@/components/gardens/GardenParts'
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

// 関連記事を取得（盆栽園めぐり・見学・購入などの記事を優先）
async function getRelatedArticles(): Promise<Article[]> {
  return getTopicArticles(GARDEN_ARTICLE_TOPICS, 3)
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
    <div className={`isolate overflow-hidden border border-line ${className}`}>
      {hasCoords ? <GardenMap points={mapPoints} showPopup={false} /> : <Placeholder label="地図" className="h-full w-full" />}
    </div>
  )

  const confirmText = garden.website_url ? '公式サイトでご確認ください' : 'お出かけ前に園へご確認ください'
  const linkClass = 'border-b border-ink pb-0.5 hover:text-gold-dark'

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

      <div className={`${CONTAINER} pb-28 pt-4 lg:pb-16 lg:pt-6`}>
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
        <Link href="/gardens" className="text-[13px] text-ink-soft lg:hidden">‹ 盆栽園一覧</Link>

        {hasProducts && <PrDisclosure compact className="mt-2" />}

        {/* ヘッダー：名前・所在地・説明・ボタン／地図（写真がある園は写真） */}
        <div className="mt-4 grid gap-5 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-x-3 text-[11.5px] text-ink-muted">
              {region !== '未分類' && <span>{region}</span>}
              {garden.prefecture && <span>{garden.prefecture}</span>}
              {garden.featured && <span className="text-gold-dark">注目の盆栽園</span>}
            </div>
            <h1 className="mt-2 font-mincho text-[30px] font-bold leading-tight tracking-[0.06em] text-ink lg:mt-3 lg:text-[48px]">{garden.name}</h1>
            <p className="mt-2 text-[13px] text-ink-soft lg:text-sm">{garden.address}</p>
            {specialties.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1">
                {specialties.map(s => (
                  <Link key={s} href={`/products?category=${encodeURIComponent(s)}`} className="text-[11.5px] text-gold-dark hover:underline">
                    {s}
                  </Link>
                ))}
              </div>
            )}

            {/* SPは地図（写真）を説明文の前に */}
            <div className="mt-5 lg:hidden">
              {photo ? (
                <figure className="h-[200px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`${garden.name}の外観`} className="h-full w-full object-cover" />
                </figure>
              ) : (
                mapBox('h-[180px]')
              )}
            </div>

            {garden.description && <p className="mt-5 text-sm leading-[2] text-ink-soft lg:mt-7 lg:text-[15px]">{garden.description}</p>}
            <p className={`${garden.description ? 'mt-3' : 'mt-5 lg:mt-7'} text-sm leading-[2] text-ink-soft lg:text-[15px]`}>{description}</p>

            <div className="mt-7 hidden flex-wrap gap-3 lg:flex">
              {garden.website_url && (
                <a href={garden.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center bg-sumi px-6 text-sm tracking-[0.04em] text-white hover:bg-sumi-light hover:text-white">
                  公式サイトを見る　↗
                </a>
              )}
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center border border-ink bg-white px-6 text-sm text-ink hover:bg-paper-deep">
                地図アプリで開く
              </a>
            </div>
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
                <a href={`tel:${garden.phone}`} className={linkClass}>{garden.phone}</a>
              </InfoRow>
            )}
            <InfoRow label="営業時間">
              {garden.business_hours ? <span className="whitespace-pre-wrap">{garden.business_hours}</span> : confirmText}
            </InfoRow>
            <InfoRow label="定休日">{garden.closed_days && garden.closed_days.length > 0 ? garden.closed_days.join('、') : confirmText}</InfoRow>
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
          {photo && hasCoords && (
            <div className="mt-5">
              {mapBox('h-[240px]')}
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={`mt-3 hidden text-xs text-ink lg:inline-block ${linkClass}`}>
                地図アプリで開く ↗
              </a>
            </div>
          )}
        </Section>

        {canDo.length > 0 && (
          <Section title="この園でできること">
            <div className="grid gap-5 sm:grid-cols-3 lg:gap-7">
              {canDo.map(item => (
                <div key={item.label} className="border-t border-ink pt-3">
                  <div className="text-[11px] text-gold-dark">{item.label}</div>
                  <div className="mt-1 text-sm text-ink lg:text-[15px]">{item.value}</div>
                </div>
              ))}
            </div>
            {garden.experience_programs && (
              <Link href="/guides?search=初心者" className={`mt-5 inline-block text-xs text-ink ${linkClass}`}>
                初心者向けガイドを見る
              </Link>
            )}
          </Section>
        )}

        {/* 同じ都道府県の盆栽園 */}
        {nearbyGardens.length > 0 && (
          <Section
            title="近くの盆栽園"
            note={garden.prefecture && <Link href={prefectureListHref} className="border-b border-ink-muted hover:text-gold-dark">{garden.prefecture}の盆栽園一覧へ</Link>}
          >
            <div className="grid gap-x-8 sm:grid-cols-2">
              {nearbyGardens.map(g => (
                <Link key={g.id} href={`/gardens/${g.id}`} className="group flex items-center gap-4 border-b border-line py-3.5 first:border-t sm:[&:nth-child(2)]:border-t">
                  <PrefPlate garden={g} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate text-[11px] text-ink-muted">{gardenArea(g)}</div>
                    <div className="truncate font-mincho text-base font-bold text-ink group-hover:text-gold-dark">{g.name}</div>
                  </div>
                </Link>
              ))}
            </div>
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
                  <Link href={`/guides/${article.slug}`} className="flex items-center gap-3 py-3.5 text-sm leading-relaxed text-ink hover:text-gold-dark">
                    <span className="line-clamp-2 min-w-0 flex-1">{article.title}</span>
                    <span className="text-ink-muted" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* 関連商品 */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 border-t border-line pt-10">
            <SectionTitle action={<Link href="/products" className={`text-xs text-ink ${linkClass}`}>商品一覧を見る</Link>}>
              {garden.name}の専門分野に関連する商品
            </SectionTitle>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
              {relatedProducts.map(product => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* おすすめ盆栽商品 */}
        {recommendedProducts.length > 0 && (
          <section className="mt-14 border-t border-line pt-10">
            <SectionTitle action={<Link href="/products" className={`text-xs text-ink ${linkClass}`}>すべての商品を見る</Link>}>
              おすすめ盆栽商品
            </SectionTitle>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-6">
              {recommendedProducts.map(product => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* SP：画面下の操作ボタン（下部タブの上に固定） */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex gap-2.5 border-t border-line bg-paper/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-12 items-center justify-center border border-ink bg-white text-sm text-ink ${garden.website_url ? 'w-[38%]' : 'flex-1'}`}
        >
          地図アプリ
        </a>
        {garden.website_url && (
          <a href={garden.website_url} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-1 items-center justify-center bg-sumi text-sm tracking-[0.04em] text-white hover:text-white">
            公式サイト　↗
          </a>
        )}
      </div>
    </>
  )
}
