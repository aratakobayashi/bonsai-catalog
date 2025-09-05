import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Globe, Phone, ExternalLink } from 'lucide-react'
import type { Garden } from '@/types'

export const metadata: Metadata = {
  title: '盆栽園紹介 - 盆栽コレクション',
  description: '信頼できる盆栽園をご紹介。歴史ある老舗から現代的な盆栽園まで、質の高い盆栽を扱う園をピックアップしています。',
  keywords: ['盆栽園', '盆栽店', '園芸店', 'ガーデニング', '植物', '和風'],
}

async function getGardens(): Promise<Garden[]> {
  const { data, error } = await supabaseServer
    .from('gardens')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('盆栽園データの取得エラー:', error)
    return []
  }

  return data || []
}

function GardenCard({ garden }: { garden: Garden }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      {/* 盆栽園画像 */}
      <div className="aspect-video relative bg-gray-100">
        {garden.image_url ? (
          <Image
            src={garden.image_url}
            alt={garden.name}
            fill
            className="object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bonsai-green-100 to-earth-brown-100">
            <div className="text-6xl text-bonsai-green-400">🏛️</div>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-xl text-bonsai-green-800">
          {garden.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 住所 */}
        {garden.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
            <span className="text-sm text-gray-600">{garden.address}</span>
          </div>
        )}

        {/* 電話番号 */}
        {garden.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <a
              href={`tel:${garden.phone}`}
              className="text-sm text-gray-600 hover:text-bonsai-green-600 transition-colors"
            >
              {garden.phone}
            </a>
          </div>
        )}

        {/* 説明文 */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
          {garden.description}
        </p>

        {/* ウェブサイトボタン */}
        {garden.website_url && (
          <div className="pt-2">
            <a
              href={garden.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full h-9 px-3 text-sm rounded-md border border-bonsai-green-600 text-bonsai-green-600 hover:bg-bonsai-green-50 transition-colors"
            >
              <Globe className="h-4 w-4" />
              ウェブサイトを見る
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default async function GardensPage() {
  const gardens = await getGardens()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            盆栽園紹介
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            信頼できる盆栽園をご紹介。歴史ある老舗から現代的な盆栽園まで、
            質の高い盆栽を扱う園をピックアップしています。
          </p>
        </div>

        {/* 特徴セクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-bonsai-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">厳選された盆栽園</h3>
            <p className="text-gray-600 text-sm">
              長年の経験と実績を持つ、信頼できる盆栽園のみをご紹介しています。
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-earth-brown-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">専門知識</h3>
            <p className="text-gray-600 text-sm">
              経験豊富な職人による、丁寧な盆栽の手入れと育成指導が受けられます。
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-bonsai-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">品質保証</h3>
            <p className="text-gray-600 text-sm">
              健康で美しい盆栽を、適切な価格でご提供いただいています。
            </p>
          </Card>
        </div>

        {/* 盆栽園一覧 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            提携盆栽園一覧
          </h2>
          
          {gardens.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {gardens.map((garden) => (
                  <GardenCard key={garden.id} garden={garden} />
                ))}
              </div>

              {/* お問い合わせセクション */}
              <Card className="bg-bonsai-green-50 border-bonsai-green-200">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-bonsai-green-800 mb-4">
                    盆栽園の掲載をお考えの方へ
                  </h3>
                  <p className="text-bonsai-green-700 mb-6 max-w-2xl mx-auto">
                    品質の高い盆栽を提供されている盆栽園様の掲載を随時受け付けております。
                    掲載をご希望の方は、お気軽にお問い合わせください。
                  </p>
                  <Button variant="secondary">
                    掲載についてお問い合わせ
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <span className="text-6xl">🏛️</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                盆栽園データを準備中です
              </h3>
              <p className="text-gray-600">
                信頼できる盆栽園の情報を収集・準備中です。しばらくお待ちください。
              </p>
            </div>
          )}
        </div>

        {/* CTAセクション */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-bonsai-green-600 to-earth-brown-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                お気に入りの盆栽を見つけませんか？
              </h3>
              <p className="text-lg mb-6 opacity-90">
                厳選された商品を豊富に取り揃えています
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products">
                  商品一覧を見る
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}