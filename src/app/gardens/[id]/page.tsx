import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Globe, Clock, Car, Star, Instagram, Twitter, Facebook, ExternalLink, Trees, Calendar, Users, ShoppingBag, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Garden, Product, Article } from '@/types'
import { LocalBusinessStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { getArticles } from '@/lib/database/articles'

interface GardenPageProps {
  params: {
    id: string
  }
}

async function getGarden(id: string): Promise<Garden | null> {
  const { data, error } = await supabase
    .from('gardens')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Garden
}

// 関連商品を取得（園の専門分野に基づく）
async function getRelatedProducts(specialties: string[]): Promise<Product[]> {
  if (!specialties || specialties.length === 0) return []

  const { data } = await supabase
    .from('products')
    .select('*')
    .in('category', specialties)
    .eq('is_visible', true)
    .limit(4)

  return (data || []) as Product[]
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

  const { data } = await supabase
    .from('gardens')
    .select('id, name, address, specialties')
    .eq('prefecture', prefecture)
    .neq('id', currentId)
    .limit(3)

  return (data || []) as Garden[]
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
      images: garden.image_url ? [garden.image_url] : undefined,
      type: 'article',
    },
  }
}

export default async function GardenDetailPage({ params }: GardenPageProps) {
  const garden = await getGarden(params.id)

  if (!garden) {
    notFound()
  }

  // 関連データを並行取得
  const [relatedProducts, relatedArticles, nearbyGardens] = await Promise.all([
    getRelatedProducts(garden.specialties || []),
    getRelatedArticles(),
    getNearbyGardens(garden.id, garden.prefecture)
  ])

  const description = generateGardenDescription(garden)

  // パンくずリスト用データ
  const breadcrumbs = [
    { name: 'ホーム', url: 'https://www.bonsai-collection.com/', position: 1 },
    { name: '盆栽園一覧', url: 'https://www.bonsai-collection.com/gardens', position: 2 },
    { name: garden.name, url: `https://www.bonsai-collection.com/gardens/${garden.id}`, position: 3 }
  ]

  return (
    <>
      <LocalBusinessStructuredData
        name={garden.name}
        description={description}
        address={garden.address}
        phone={garden.phone}
        website={garden.website_url}
        image={garden.image_url}
        rating={garden.rating}
        reviewCount={garden.review_count}
        latitude={garden.latitude}
        longitude={garden.longitude}
        businessHours={garden.business_hours}
        specialties={garden.specialties}
        baseUrl="https://www.bonsai-collection.com"
        businessId={garden.id}
      />

      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />

      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* パンくずナビ */}
          <nav className="mb-6" aria-label="パンくずナビ">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-neutral-600 hover:text-primary-600">
                  ホーム
                </Link>
              </li>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
              <li>
                <Link href="/gardens" className="text-neutral-600 hover:text-primary-600">
                  盆栽園一覧
                </Link>
              </li>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
              <li className="text-neutral-900 font-medium">{garden.name}</li>
            </ol>
          </nav>

          {/* ヘッダーセクション */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            {/* 画像がある場合のみ表示 */}
            {garden.image_url && (
              <div className="relative h-48 md:h-64 w-full">
                <img
                  src={garden.image_url}
                  alt={`${garden.name}の外観`}
                  className="w-full h-full object-cover"
                />
                {garden.featured && (
                  <div className="absolute top-4 right-4 bg-accent-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    注目の盆栽園
                  </div>
                )}
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-primary-900 mb-2">
                    {garden.name}
                    {garden.prefecture && (
                      <span className="text-lg font-normal text-neutral-600 ml-2">
                        （{garden.prefecture}）
                      </span>
                    )}
                  </h1>
                  {garden.established_year && (
                    <p className="text-neutral-600 text-sm flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      創業 {garden.established_year}年
                    </p>
                  )}
                </div>

                {garden.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-amber-400 fill-current" />
                      <span className="text-xl font-bold ml-1">{garden.rating}</span>
                    </div>
                    {garden.review_count && (
                      <span className="text-neutral-600 text-sm">
                        ({garden.review_count}件)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* SEO用の独自説明文 */}
              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-primary-900 mb-3">
                  {garden.name}について
                </h2>
                <p className="text-neutral-700 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* 専門分野タグ */}
              {garden.specialties && garden.specialties.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">専門分野</h3>
                  <div className="flex flex-wrap gap-2">
                    {garden.specialties.map((specialty, index) => (
                      <Link
                        key={index}
                        href={`/products?category=${encodeURIComponent(specialty)}`}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
                      >
                        {specialty}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-8">
              {/* 見どころ・展示内容 */}
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
                  <Trees className="w-5 h-5" />
                  見どころ・展示内容
                </h2>
                {garden.specialties && garden.specialties.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-neutral-700">
                      当園では以下の盆栽を中心に取り扱っています：
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {garden.specialties.map((specialty, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                          <Trees className="w-4 h-4 text-primary-600" />
                          <span className="font-medium">{specialty}</span>
                          <Link
                            href={`/guides?search=${encodeURIComponent(specialty)}`}
                            className="ml-auto text-primary-600 hover:text-primary-700 text-sm"
                          >
                            育て方を見る
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-700">
                    様々な種類の盆栽を取り扱っており、四季を通じて美しい盆栽をご覧いただけます。
                  </p>
                )}
              </section>

              {/* 体験・ワークショップ情報 */}
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  体験・ワークショップ
                </h2>
                {garden.experience_programs ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-green-800 mb-1">体験教室を実施中</p>
                        <p className="text-green-700 text-sm">
                          初心者の方でも安心して参加いただける体験教室を開催しています。
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Link
                        href="/guides?search=初心者"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        初心者向けガイドを見る
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-700">
                    体験教室については、直接お問い合わせください。
                  </p>
                )}
              </section>

              {/* 園主メッセージ */}
              {garden.owner_message && (
                <section className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-primary-900 mb-4">
                    園主からのメッセージ
                  </h2>
                  {garden.owner_name && (
                    <p className="text-sm text-neutral-600 mb-3">
                      園主: {garden.owner_name}
                    </p>
                  )}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                      {garden.owner_message}
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-primary-900 mb-4">
                  基本情報
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-neutral-600">住所</p>
                      <p className="text-neutral-900 text-sm">{garden.address}</p>
                      {garden.postal_code && (
                        <p className="text-xs text-neutral-600">〒{garden.postal_code}</p>
                      )}
                    </div>
                  </div>

                  {garden.phone && (
                    <div className="flex gap-3">
                      <Phone className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-neutral-600">電話番号</p>
                        <a
                          href={`tel:${garden.phone}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          {garden.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {garden.business_hours && (
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-neutral-600">営業時間</p>
                        <p className="text-neutral-900 text-sm whitespace-pre-wrap">
                          {garden.business_hours}
                        </p>
                      </div>
                    </div>
                  )}

                  {garden.closed_days && garden.closed_days.length > 0 && (
                    <div className="flex gap-3">
                      <Calendar className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-neutral-600">定休日</p>
                        <p className="text-neutral-900 text-sm">
                          {garden.closed_days.join('、')}
                        </p>
                      </div>
                    </div>
                  )}

                  {garden.website_url && (
                    <div className="flex gap-3">
                      <Globe className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-neutral-600">ウェブサイト</p>
                        <a
                          href={garden.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm break-all flex items-center gap-1"
                        >
                          公式サイト
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* サービス情報 */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium text-neutral-900 mb-3">サービス</h3>
                  <div className="space-y-2">
                    {garden.experience_programs && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-neutral-700">体験教室</span>
                      </div>
                    )}
                    {garden.online_sales && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-neutral-700">オンライン販売</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* アクセス情報 */}
              {(garden.access_info || garden.parking_info) && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-primary-900 mb-4">
                    アクセス情報
                  </h2>
                  <div className="space-y-4">
                    {garden.access_info && (
                      <div>
                        <p className="text-sm text-neutral-600 mb-2">交通アクセス</p>
                        <p className="text-neutral-900 text-sm whitespace-pre-wrap">
                          {garden.access_info}
                        </p>
                      </div>
                    )}
                    {garden.parking_info && (
                      <div className="flex gap-3">
                        <Car className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-neutral-600">駐車場</p>
                          <p className="text-neutral-900 text-sm">
                            {garden.parking_info}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SNSリンク */}
              {(garden.social_instagram || garden.social_twitter || garden.social_facebook) && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-primary-900 mb-4">
                    SNS
                  </h2>
                  <div className="flex gap-3">
                    {garden.social_instagram && (
                      <a
                        href={garden.social_instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {garden.social_twitter && (
                      <a
                        href={garden.social_twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                        aria-label="Twitter"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {garden.social_facebook && (
                      <a
                        href={garden.social_facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                        aria-label="Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 関連コンテンツセクション */}
          <div className="mt-12 space-y-8">
            {/* 関連商品 */}
            {relatedProducts.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    {garden.name}の専門分野に関連する商品
                  </h2>
                  <Link
                    href="/products"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    商品一覧を見る
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group block"
                    >
                      <div className="bg-neutral-50 rounded-lg p-4 group-hover:bg-neutral-100 transition-colors">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        )}
                        <h3 className="font-medium text-neutral-900 text-sm group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-primary-600 font-bold mt-1">
                          ¥{product.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 同じ地域の盆栽園 */}
            {nearbyGardens.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-900">
                    {garden.prefecture}の他の盆栽園
                  </h2>
                  <Link
                    href={`/gardens?prefecture=${encodeURIComponent(garden.prefecture || '')}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {garden.prefecture}の盆栽園一覧
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {nearbyGardens.map((nearbyGarden) => (
                    <Link
                      key={nearbyGarden.id}
                      href={`/gardens/${nearbyGarden.id}`}
                      className="group block p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <h3 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors mb-2">
                        {nearbyGarden.name}
                      </h3>
                      <p className="text-neutral-600 text-sm mb-2">{nearbyGarden.address}</p>
                      {nearbyGarden.specialties && nearbyGarden.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {nearbyGarden.specialties.slice(0, 2).map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 関連記事 */}
            {relatedArticles.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-900">
                    おすすめの盆栽ガイド記事
                  </h2>
                  <Link
                    href="/guides"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    記事一覧を見る
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {relatedArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/guides/${article.slug}`}
                      className="group block"
                    >
                      <div className="bg-neutral-50 rounded-lg p-4 group-hover:bg-neutral-100 transition-colors">
                        {article.featuredImage && (
                          <img
                            src={article.featuredImage.url}
                            alt={article.featuredImage.alt || article.title}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        )}
                        <h3 className="font-medium text-neutral-900 text-sm group-hover:text-primary-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-neutral-600 text-xs mt-2 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  )
}