import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Globe, Clock, Car, Star, Instagram, Twitter, Facebook, ExternalLink, Trees, Calendar, Users, ShoppingBag, ChevronRight } from 'lucide-react'
import { supabaseServer } from '@/lib/supabase-server'
import { Garden, Product, Article } from '@/types'
import { LocalBusinessStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { getArticles } from '@/lib/database/articles'

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

  if (error || !data) {
    return null
  }

  return data as Garden
}

// 関連商品を取得（園の専門分野に基づく）
async function getRelatedProducts(specialties: string[]): Promise<Product[]> {
  if (!specialties || specialties.length === 0) return []

  const { data } = await supabaseServer
    .from('products')
    .select('*')
    .in('category', specialties)
    .eq('is_visible', true)
    .limit(4)

  return (data || []) as Product[]
}

// おすすめ盆栽商品を取得
async function getRecommendedProducts(): Promise<Product[]> {
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

  return visibleProducts as Product[]
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

// 盆栽コレクションからの評価レビューを生成
function generateReviewFromBonsaiCollection(garden: Garden): string {
  const reviews = [
    `${garden.name}は、品質の高い盆栽と丁寧な管理で定評があります。`,
    `特に${garden.specialties?.[0] || '盆栽'}の品揃えが充実しており、初心者から上級者まで満足できる盆栽園です。`,
    `${garden.experience_programs ? '体験教室も充実しており、' : ''}スタッフの知識が豊富で、適切なアドバイスをいただけます。`,
    `盆栽愛好家にぜひ訪れていただきたい、信頼できる盆栽園のひとつです。`
  ]

  // 園の特徴に応じてレビューをカスタマイズ
  if (garden.established_year && garden.established_year < 1980) {
    reviews[0] = `${garden.name}は、長年の経験と伝統に裏打ちされた確かな技術で、多くの盆栽愛好家から信頼されています。`
  }

  if (garden.rating && garden.rating >= 4.5) {
    reviews[3] = `高い評価をいただいている通り、品質・サービスともに優れた、おすすめの盆栽園です。`
  }

  return reviews.join('')
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

// 盆栽園の静的画像マッピング
const gardenImageMap: Record<string, string> = {
  // 初期実装園
  '3000a4b6-0a10-4896-9ff2-b3a9d09c14db': '/images/gardens/kawaguchi-ryokuka-center-jurian.svg', // 川口緑化センター 樹里安
  '8f99da6b-ee77-4c5f-86a9-92b0f5c7f99d': '/images/gardens/kyukaen.svg',        // 九霞園
  '60842140-ce64-4848-a55c-5457a8703d33': '/images/gardens/tojuen.svg',         // 藤樹園
  'e695fdf3-4e1c-4b6b-b20b-59e17cba279a': '/images/gardens/seikaen.svg',       // 清香園
  'eb263d7a-701b-4b4b-9b01-776a8ea2cdf4': '/images/gardens/manseien.svg',      // 蔓青園
  '75779219-963c-49eb-942a-c2f6caa3c7a1': '/images/gardens/fuyoen.svg',        // 芙蓉園

  // プレミアム園（第2弾）
  '20702388-f8b8-408e-8d6e-dd158031b048': '/images/gardens/shunkaen-bonsai-museum.svg', // 春花園BONSAI美術館
  'a23957ee-4154-4d59-9bb8-f18ee1c8ca26': '/images/gardens/nakanishi-chinshouen.svg', // 中西珍松園
  'f0f86407-1a4b-4100-987c-2743b441fcee': '/images/gardens/yoshunen.svg', // 陽春園
  'b5305c48-7ebe-4486-8391-622f282ebfbc': '/images/gardens/kyoto-dentou-teien-center.svg', // 京都伝統庭園センター
  '5e7de278-e355-42be-943d-3e877f04bfcf': '/images/gardens/okinawa-bonsai-en.svg', // 沖縄盆栽園
  '1cdef4ba-d729-47c4-be31-86c879ea0aa2': '/images/gardens/kansai-bonsai-center.svg', // 関西盆栽センター
  'f61bc0fe-53e8-4ec3-a3a8-29bfff2c0870': '/images/gardens/kyoto-bonsai-kaikan.svg', // 京都盆栽会館
  '34ba6634-3e68-4ed6-a766-07ac2d3aba33': '/images/gardens/musashino-bonsai-en.svg', // 武蔵野盆栽園
  '5266402a-5bda-4a5b-bfbd-eaf58e8d9f99': '/images/gardens/kamakura-bonsai-en.svg', // 鎌倉盆栽苑
  'cfd47538-d3b2-4c33-869a-68652c2d0563': '/images/gardens/asakusa-bonsai-koubou.svg', // 浅草盆栽工房
  // フェーズ3（地域多様性コレクション）
  '3c4f5845-c6f7-47e7-87d5-d68b5cafc0ae': '/images/gardens/matsuo-engei.svg', // まつおえんげい
  'd59a502e-61cb-427e-ac93-bb4da4dfc5f6': '/images/gardens/yoshoen.svg', // 養庄園
  '253b3027-463f-4bd9-847e-90547715cb9b': '/images/gardens/solso-farm.svg', // SOLSO FARM
  '9a1819fd-05a1-4d66-9877-bc07607ba19a': '/images/gardens/mimoto-engei.svg', // 見元園芸
  '323ae2c8-82a0-480a-a0bf-3eeab52baa3a': '/images/gardens/kaze-no-sanpomichi-salon.svg', // ガーデニングサロン 風の散歩道
  'aec3cb3b-ff22-476a-9728-b52547ab3a98': '/images/gardens/matsue-bonsai-center.svg', // 松江盆栽センター
  '40a5e7c5-8cb6-46ef-bd83-cb830d7da0cd': '/images/gardens/bonsai-shiki-no-mori.svg', // 盆栽四季の杜
  '929b849b-0b11-45b7-b5d8-9bf09cfd64d0': '/images/gardens/kobe-bonsai-kan.svg', // 神戸盆栽館
  'b81646b0-261b-4e3b-b6f3-8ebfb2fb0cb9': '/images/gardens/sanuki-bonsai-no-sato.svg', // さぬき盆栽の郷
  '29a49dbc-e5e1-4201-afe9-0b4a09223095': '/images/gardens/yamato-damashii-bonsai.svg', // 大和魂盆栽
  // フェーズ4（全国拡充コレクション）
  '299bced1-91e7-424b-bdd3-6391ccc5c622': '/images/gardens/ozaki-flower-park.svg', // オザキフラワーパーク
  '34dd9a7c-45cd-467b-9650-dd919ef51373': '/images/gardens/yamashiro-aisen-en.svg', // 山城愛仙園
  '43bef990-75ae-431b-bcd9-3627879cf4eb': '/images/gardens/awa-en.svg', // 阿波園
  '96aa3db9-0ea0-4f13-9768-1c81f6ad3416': '/images/gardens/hana-hiroba.svg', // 花ひろば
  '97e7553f-109d-4631-939a-8d292eeb625b': '/images/gardens/hanju-en-green-center.svg', // 班樹園グリーンセンター
  'f3418bb6-eef6-47a7-8c54-905ed1d6d3cb': '/images/gardens/hamakita-eino-ryokka-center.svg', // 浜北営農緑花木センター
  'c461d493-c16b-4b45-9a26-e3e15624e3c4': '/images/gardens/koju-en.svg', // 古樹園
  '1f54a5e8-d50a-438f-aecd-67b9f2499903': '/images/gardens/takamatsu-bonsai-no-sato.svg', // 高松盆栽の郷
  'a38daf6e-445f-481b-a9a8-55ea631428e3': '/images/gardens/kamakura-kibana-so.svg', // かまくら木花草
  '7cb38263-35fd-4fdb-b0a5-9c31227d6ebc': '/images/gardens/kawaguchi-bonsai-mura.svg', // 川口BONSAI村
  '2a93e2ed-3bea-4855-b69c-9d5df4d0d1e3': '/images/gardens/nasu-kogen-bonsai-center.svg', // 那須高原盆栽センター
  '0a120c74-2bf1-4ca1-a16c-b34865967245': '/images/gardens/yokohama-kohoku-bonsai-en.svg', // 横浜港北盆栽苑
  'd432d4bf-908e-4952-86c5-b8c5798a1225': '/images/gardens/ueno-green-club.svg', // 上野グリーンクラブ
  '6897be01-8059-41b6-9749-436eebb5e678': '/images/gardens/nagoya-bonsai-kaikan.svg', // 名古屋盆栽会館
  '71d984be-89d6-427c-a27c-0139fbc3e889': '/images/gardens/sagano-bonsai-en.svg', // 嵯峨野盆栽苑
}

export default async function GardenDetailPage({ params }: GardenPageProps) {
  const garden = await getGarden(params.id)

  if (!garden) {
    notFound()
  }

  // 関連データを並行取得
  const [relatedProducts, recommendedProducts, relatedArticles, nearbyGardens] = await Promise.all([
    getRelatedProducts(garden.specialties || []),
    getRecommendedProducts(),
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
            {(garden.image_url || gardenImageMap[garden.id]) && (
              <div className="relative h-48 md:h-64 w-full">
                <img
                  src={gardenImageMap[garden.id] || garden.image_url}
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

              {/* 盆栽コレクションからのレビュー */}
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  盆栽コレクションからの評価
                </h2>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-l-4 border-amber-400">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">盆</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-600 mb-2">
                        盆栽コレクション編集部より
                      </p>
                      <p className="text-neutral-700 leading-relaxed">
                        {generateReviewFromBonsaiCollection(garden)}
                      </p>
                      {garden.rating && (
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-amber-200">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(garden.rating!)
                                  ? 'text-amber-400 fill-current'
                                  : 'text-neutral-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-neutral-600 ml-2">
                            総合評価 {garden.rating}/5.0
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
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

            {/* おすすめ盆栽商品 */}
            {recommendedProducts.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    おすすめ盆栽商品
                  </h2>
                  <Link
                    href="/products"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                  >
                    商品一覧を見る
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <p className="text-neutral-600 text-sm mb-6">
                  盆栽コレクションが厳選したおすすめの盆栽商品をご紹介します。
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group block bg-neutral-50 rounded-lg p-4 hover:bg-neutral-100 transition-colors"
                    >
                      {product.image_url && (
                        <div className="relative mb-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-40 object-cover rounded-md"
                          />
                          {product.beginner_friendly && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                              初心者向け
                            </div>
                          )}
                        </div>
                      )}
                      <div className="space-y-2">
                        <h3 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-neutral-600 text-xs line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-primary-600 font-bold">
                            ¥{product.price.toLocaleString()}
                          </p>
                          {product.size_category && (
                            <span className="px-2 py-1 bg-neutral-200 text-neutral-700 rounded text-xs">
                              {product.size_category}
                            </span>
                          )}
                        </div>
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    すべての商品を見る
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  )
}