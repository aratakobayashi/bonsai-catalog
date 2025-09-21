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
  // フェーズ5（総合拡充コレクション）
  'fe68bd0f-0a04-4c35-b721-ae89c2963247': '/images/gardens/naniwa-bonsai-en.svg', // 浪華盆栽園
  '7163682f-97fd-4178-bf2f-f64683af32fc': '/images/gardens/sogou-engei-barns.svg', // 総合園芸 Barns
  'a45f1770-9d15-40c7-a9b3-332f9edc0530': '/images/gardens/shikoku-green-center.svg', // 四国グリーンセンター
  '4557fb2e-7e5f-488e-8ef4-55b3a95dd60d': '/images/gardens/kitayama-nursery.svg', // 北山ナーセリー
  'd85b297c-528c-4861-8f7b-e07a6beef5d1': '/images/gardens/garden-marche-shimonoseki.svg', // ガーデンマルシェ 下関店
  'fc9f4072-151e-463f-8acc-e20935740398': '/images/gardens/fujisan-roku-garden-center.svg', // 富士山麓ガーデンセンター
  '7d49d321-50a2-4729-b6bd-8f100dbc7e19': '/images/gardens/sakata-no-tane-sagamihara.svg', // サカタのタネガーデンセンター相模原
  'a7c48e64-0ab4-46ed-9e85-6d533364ba4f': '/images/gardens/houkoen.svg', // 有限会社豊香園
  '58e02c92-8918-4212-9560-c56e31606724': '/images/gardens/ryokuka-ki-ichiba.svg', // 緑花木市場
  '5ec52f80-073d-45d0-aae2-b72f11672721': '/images/gardens/gardening-club-hanamidori.svg', // ガーデニング倶楽部花みどり
  '1c839911-a0bb-40cd-9733-5945a1192270': '/images/gardens/kobayashi-nouen.svg', // 小林農園
  'c8ddaa61-7922-40b8-8133-7b1e0ab36e9c': '/images/gardens/shikoku-garden.svg', // 四国ガーデン
  'c5abd99b-808b-48fd-b5f2-8353385ac719': '/images/gardens/nihon-line-kaboku-center.svg', // 協同組合日本ライン花木センター
  '77a2d6e0-8b2a-455e-af37-7d4cd89257c7': '/images/gardens/fujikawa-kouka-en.svg', // 藤川光花園
  '1191e28b-15ef-4363-b43e-8ed007154b22': '/images/gardens/shohin-bonsai-ki-no-kaze.svg', // 小品盆栽 季の風
  '29d8a441-bdd5-4fc5-8514-164ff37e3234': '/images/gardens/taiyo-green.svg', // 大洋グリーン
  'c62357fb-f3de-4aa4-add5-eb1bb7f95922': '/images/gardens/nasu-kogen-bonsai-no-sato.svg', // 那須高原盆栽の里
  'b2974592-38df-4f4b-907b-e5fe1df60620': '/images/gardens/bonsai-fukushima-en.svg', // 盆栽福島園
  'd890f754-cf36-4724-bdd0-ee07b95b4a88': '/images/gardens/shohin-bonsai-yamato-en.svg', // 小品盆栽専門店 やまと園
  '9edd8075-1637-4f74-8f42-8b3f689785bc': '/images/gardens/manju-en.svg', // 萬樹園
  // フェーズ6（究極拡充コレクション）
  'aa02f356-72e3-49dd-9511-fea249002fdf': '/images/gardens/bonsai-no-mori-tsukuba.svg', // 盆栽の森つくば
  'f7d24f87-828d-40ab-a330-8c03b7879a28': '/images/gardens/sagamihara-bonsai-no-mori.svg', // 相模原盆栽の森
  '1da87f61-d5cc-456c-827b-8a2ef675b68a': '/images/gardens/greenscape.svg', // GREENSCAPE
  '8d33d8ac-60a3-49e7-a7b8-4507cfaf0a13': '/images/gardens/yokohama-chinatown-bonsai-kan.svg', // 横浜中華街盆栽館
  '8a3ce3f8-8503-4dd7-beee-bbc4d45bf5d3': '/images/gardens/mikawa-bonsai-en.svg', // 三河盆栽園
  'fa96de24-e49e-4dc6-a969-d7e81462a0d5': '/images/gardens/sainokuni-bonsai-center.svg', // 彩の国盆栽センター
  '639402ee-a9e5-459f-8772-463ab6413598': '/images/gardens/edogawa-bonsai-mura.svg', // 江戸川盆栽村
  '588e5f53-2541-489d-b991-6b28375df649': '/images/gardens/garden-plaza-hana.svg', // ガーデンプラザ華
  '5825c02c-84a3-4a56-85fe-e816103aef06': '/images/gardens/utsunomiya-engei-center.svg', // 宇都宮園芸センター
  'e4ac72e0-8a4b-410e-9e99-d9f6778b7b9f': '/images/gardens/okayama-green-center.svg', // 岡山グリーンセンター
  '9d395b67-bad0-44fe-87fb-7b4df3417307': '/images/gardens/akagisan-bonsai-koubou.svg', // 赤城山盆栽工房
  '500e6ae7-92bd-4758-8550-a50ca2baaa60': '/images/gardens/the-garden-yoneyama-plantation.svg', // ザ・ガーデン 本店 ヨネヤマプランテイション
  '5f6ef2d7-6540-4a1c-9739-1dc48254fa8e': '/images/gardens/yamanaka-juraku-en.svg', // 山中樹楽園
  'bc8f2e83-04cb-48a0-b213-75d1e6b09fee': '/images/gardens/ayumino-nokyo-angyou-engei-center.svg', // あゆみ野農協安行園芸センター
  '5f2057cb-4757-428f-befc-4af8e6bef25b': '/images/gardens/joshu-bonsai-en.svg', // 上州盆栽園
  'aaab7bde-68f9-4ccb-8e78-871ca5ee8fc5': '/images/gardens/inbanuma-bonsai-en.svg', // 印旛沼盆栽園
  '8c90b21d-54dd-4811-b5b7-1282f3fb1f25': '/images/gardens/satsuma-engei-center.svg', // 薩摩園芸センター
  '3cc5336e-28ba-4555-b834-351436bdbca0': '/images/gardens/omi-engei-center.svg', // 近江園芸センター
  '8ed687ca-0e7a-470a-9960-5dfa1592d088': '/images/gardens/nakatsutaya.svg', // 株式会社ナカツタヤ
  '9a9dc214-6dd8-4d31-ba99-a2e475d302f8': '/images/gardens/kasuga-ryokka.svg', // 春日緑化株式会社
  '174b8907-df0e-492c-a93a-adf2bc868081': '/images/gardens/kasumigaura-bonsai-en.svg', // 霞ヶ浦盆栽園
  '78e25ed5-8a97-4a3e-9f3d-77fdd5054e8b': '/images/gardens/green-farm-higashiosaka.svg', // グリーンファーム東大阪
  '6b9181e5-f2df-4c32-a2ad-5700ac7f866f': '/images/gardens/uekiya-honpo.svg', // 植木屋本舗
  '63515450-e9f3-40f6-852d-b726e7ea7552': '/images/gardens/hana-no-niwa.svg', // 花の庭
  'a035baf6-e9e9-427c-8245-10e6d0c11435': '/images/gardens/nakagawa-zouen.svg', // 中川造園
  // フェーズ7（完全制覇コレクション）
  'c0447fc7-a3fb-41e5-8a2f-3412d9ca8334': '/images/gardens/nagasaki-ryokuju-center.svg', // ながさき緑樹センター
  'ab79571b-1b5d-4506-8b44-185006d97df5': '/images/gardens/hana-no-yamato-hiroomote.svg', // 花のヤマト 広面本店
  '6f7b4c0f-576b-4a45-b2e8-daab0be9a41f': '/images/gardens/kaou-koku-aichi-garden-center.svg', // 花王国愛知ガーデンセンター
  '264b713f-5d1a-4eba-b72b-7bac3c7aefbf': '/images/gardens/shibuya-engei-nerima.svg', // 渋谷園芸練馬本店
  '6d77d1c5-4093-4741-90cd-2bdf5395d5e6': '/images/gardens/land-garden.svg', // ランド・ガーデン
  '41e3139a-cc9e-4002-a9d9-f196355fe597': '/images/gardens/sakata-no-tane-yokohama.svg', // サカタのタネガーデンセンター横浜
  'f157053e-1a0c-4952-ac48-f3c2bc3fa7c5': '/images/gardens/nakayama-nouen.svg', // 中山農園
  '3b6b5be3-3a03-424b-b9e1-3d715e331402': '/images/gardens/hirosaki-ringo-kouen.svg', // 弘前市りんご公園
  'a5a67276-c380-4939-9f91-de9d64a44993': '/images/gardens/kamiyama-nouen.svg', // 神山農園
  'ae781a4a-4c9c-46fc-bf99-f591d12a08f0': '/images/gardens/shinshu-alps-engei.svg', // 信州アルプス園芸
  'ca267915-f5fa-4aa5-a797-bb5931d65dcc': '/images/gardens/seikou-engei.svg', // 清光園芸
  '5567c35f-b596-4023-b48d-f2246bf1f56d': '/images/gardens/aisai-kazoku.svg', // 愛栽家族
  'b642b59f-2c76-4084-8bc4-7a7908d52f57': '/images/gardens/minori-kaboku-center-interpark.svg', // みのり花木センターインターパーク店
  '47db77f2-c1f6-44b7-bdbd-453642111eb3': '/images/gardens/hana-no-tobitsuka.svg', // 花のとびつか
  'c37bab9a-f025-4dec-b4d6-75361eb768b8': '/images/gardens/koi-garden-square.svg', // 己斐ガーデンスクエア
  'bb8f1c23-4d67-4892-a123-456789abcdef': '/images/gardens/shiki-no-mori-garden.svg', // 四季の森ガーデン
  'cc9e2d34-5e78-5903-b234-56789abcde01': '/images/gardens/yamagata-engei-center.svg', // 山形園芸センター
  'dd0f3e45-6f89-6014-c345-6789abcdef12': '/images/gardens/shinetsu-green-farm.svg', // 信越グリーンファーム
  'ee1041567-7890-7125-d456-789abcdef123': '/images/gardens/hida-takayama-engei.svg', // 飛騨高山園芸
  'ff215678-8901-8236-e567-89abcdef1234': '/images/gardens/izu-hantou-garden.svg', // 伊豆半島ガーデン
  '00326789-9012-9347-f678-9abcdef12345': '/images/gardens/omi-hachiman-engei-center.svg', // 近江八幡園芸センター
  '1143789a-a123-a458-0789-abcdef123456': '/images/gardens/tanba-sasayama-garden.svg', // 丹波篠山ガーデン
  '22548ab-b234-b569-1890-bcdef1234567': '/images/gardens/uda-matsuyama-engei.svg', // 宇陀松山園芸
  '3365a9bc-c345-c670-2901-cdef12345678': '/images/gardens/awajishima-green-park.svg', // 淡路島グリーンパーク
  '447bacd-d456-d781-3012-def123456789': '/images/gardens/izumo-taisha-engei-center.svg', // 出雲大社園芸センター
  '558bcde-e567-e892-4123-ef1234567890': '/images/gardens/sanuki-udon-ken-engei.svg', // 讃岐うどん県園芸
  '669cdef-f678-f903-5234-f12345678901': '/images/gardens/ehime-mikan-engei-center.svg', // 愛媛みかん園芸センター
  '770def0-0789-0014-6345-012345678912': '/images/gardens/tosa-seiryu-engei.svg', // 土佐清流園芸
  '881ef01-1890-1125-7456-123456789123': '/images/gardens/chikushino-garden-center.svg', // 筑紫野ガーデンセンター
  '992f012-2901-2236-8567-234567891234': '/images/gardens/amakusa-shotou-engei-farm.svg', // 天草諸島園芸ファーム

  // フェーズ8（最終拡充コレクション）
  '32f621fa-68bd-436e-82e0-d97a483f322d': '/images/gardens/enomotosatsukien.svg', // 榎本皐月園
  'a84680ba-4aa4-44e1-a878-94d20c805649': '/images/gardens/hana.svg', // 花伝
  'b59cb7db-2804-4486-b2ac-483fea1d792d': '/images/gardens/bonsaitakumi.svg', // 盆栽の匠
  'e2c19d95-5d0f-4f68-9a6e-637776703a85': '/images/gardens/tsukubasanrokubonsaien.svg', // 筑波山麓盆栽園
  '1463d7db-74d7-44cf-ac4c-78f8696dc8e9': '/images/gardens/itoyaen.svg', // 伊東屋園芸
  'bd12fb51-7998-4576-952d-081c242d4905': '/images/gardens/kofuen.svg', // 香風園
  'ffc6d15a-d3a2-4fde-b556-dfed23b8919a': '/images/gardens/ichirakuen.svg', // 一楽園
  '447f6eea-99d2-4a32-8a66-57d2af66061e': '/images/gardens/marukyobonsaiauction.svg', // 丸京盆栽オークション
  '256a3959-064d-4146-a7b7-ba84069bcd5b': '/images/gardens/shonanbonsaicenter.svg', // 湘南盆栽センター
  'ce0c2233-da20-4f84-8540-9e37415c60ce': '/images/gardens/yashimabonsaicenter.svg', // 屋島盆栽センター
  '75c14be8-3105-4b40-8575-2498859c6de8': '/images/gardens/awajibonsaisato.svg', // 淡路盆栽の里
  '9198cb49-3338-4f96-8fd0-3e63e5bc3d5b': '/images/gardens/komorien.svg', // 小森造園
  '98b9a95c-09df-4a33-a49b-776560a8d90f': '/images/gardens/nurseries.svg', // ナーセリーズ
  'ed0ceac0-f2fa-4f27-8970-10fbe720ff39': '/images/gardens/niitsuflowerland.svg', // 新津フラワーランド
  '5a3bdecf-5c77-4552-b619-2ec61541d095': '/images/gardens/togashihakuyoen.svg', // とがし白陽園
  'f1b5582d-56ae-4cb4-9625-d95ad486709e': '/images/gardens/tsutsuien.svg', // 筒井造園
  '02730e03-63d8-4530-876b-a353e256a4d4': '/images/gardens/nishinomiyagardenplaza.svg', // 西宮ガーデンプラザ
  '094d5670-7da7-4b4a-9e6a-860b035dd994': '/images/gardens/ltden.svg', // 有限会社宮崎園芸
  '5b96fdd2-471b-47fd-874b-3982a1e7d5f2': '/images/gardens/saniberu-gardencenter.svg', // さにべる ガーデンセンター
  '4f694d8a-67ba-4a0c-8144-8ffb2ed5d494': '/images/gardens/gardenplaza.svg', // 京都ガーデンプラザ
  '7e5804c7-8401-4db8-95aa-d2af1886d157': '/images/gardens/uechuu.svg', // 植忠
  'f9283387-4c71-47b9-b641-45c514d27117': '/images/gardens/the-gardenkohokutownten.svg', // ザ・ガーデン港北ニュータウン店
  '3efc1c32-1014-4cc0-a14b-db971bffa621': '/images/gardens/yamaichien.svg', // やまいち園芸
  '0b082ac1-084a-4f81-9fce-20fb974461a9': '/images/gardens/shofuen.svg', // 松風園
  '537542f3-cea3-424f-908a-6d8b3c0d25d8': '/images/gardens/midoritsurugaten.svg', // 緑香庭敦賀店
  '1d28d60c-d2e5-4d13-b20a-5d4ddaf9af2e': '/images/gardens/fujigokoshokubutsuen.svg', // 富士五湖植物園
  '9724f853-3659-4c80-bbec-bd411021b872': '/images/gardens/izumiparktowngardencenter.svg', // 泉パークタウンガーデンセンター
  '9ae13df5-9bfc-4ca3-b137-5535f5b34f39': '/images/gardens/greenterrace.svg', // グリーンテラスマツイ
  'e72b0605-065d-4a70-9223-54a868d8fef3': '/images/gardens/hanakicenter.svg', // 花木センター
  '21baaa4e-9d4b-4df6-9de9-cb51fe455a26': '/images/gardens/meikoen.svg', // 明幸園
  'f2c3e16a-6274-48eb-9847-77ff098f6960': '/images/gardens/kawaikosoen.svg', // 河合香艸園
  'bfa4fe8a-c414-4a5b-9dc9-c3de4b0dcb6b': '/images/gardens/kurumemidorihanacenter.svg', // くるめ緑花センター
  '8d9f01bf-4644-4f53-8198-783ae1232529': '/images/gardens/mutsumienkicorp.svg', // むつみ造園土木株式会社
  '91f0525a-be18-4bac-b162-373d4bc03d3e': '/images/gardens/toyotagarden.svg', // 豊田ガーデン
  '201fd0b1-e40c-41ac-83c6-a871ce540972': '/images/gardens/umaharaenkensetsu.svg', // 馬原造園建設
  '92ff30aa-bcdd-4323-b2a6-1fea440138cc': '/images/gardens/onegarden.svg', // ワンガーデン
  '49f0eef9-43e7-4881-8f7d-169467c114db': '/images/gardens/corpsansogreen.svg', // 株式会社三創グリーン
  '89151019-0e22-4a6f-81dd-dee6f9ab0123': '/images/gardens/yamagataencenter.svg', // 山形園芸センター
  '31142d3a-2209-449d-aa74-d9e3e80a6e38': '/images/gardens/midorien.svg', // 緑昇園
  '99ccb893-5976-423a-8773-220bb7efe6b6': '/images/gardens/kinakan.svg', // 紀菜柑
};

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