import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Globe, Phone, ExternalLink, Users, Calendar } from 'lucide-react'
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
  // 都道府県別のテーマ色・アイコン設定
  const getPrefectureTheme = (prefecture: string) => {
    switch (prefecture) {
      case '埼玉県':
        return {
          icon: '🏛️',
          gradient: 'from-blue-100 to-indigo-100',
          accent: 'text-blue-600',
          border: 'border-blue-200',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        }
      case '香川県':
        return {
          icon: '🌲',
          gradient: 'from-green-100 to-emerald-100',
          accent: 'text-green-600',
          border: 'border-green-200',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        }
      case '東京都':
        return {
          icon: '🎋',
          gradient: 'from-purple-100 to-pink-100',
          accent: 'text-purple-600',
          border: 'border-purple-200',
          buttonColor: 'bg-purple-600 hover:bg-purple-700'
        }
      default:
        return {
          icon: '🌿',
          gradient: 'from-gray-100 to-slate-100',
          accent: 'text-gray-600',
          border: 'border-gray-200',
          buttonColor: 'bg-gray-600 hover:bg-gray-700'
        }
    }
  }

  const theme = getPrefectureTheme(garden.prefecture || '')

  return (
    <Card className={`h-full hover:shadow-lg transition-all duration-300 ${theme.border} hover:scale-[1.02]`}>
      {/* ビジュアルヘッダー */}
      <div className={`bg-gradient-to-br ${theme.gradient} p-6 relative overflow-hidden`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{theme.icon}</div>
            <div>
              <div className={`text-sm font-semibold ${theme.accent}`}>
                {garden.prefecture}
              </div>
              <div className="text-xs text-gray-600">
                {garden.city}
              </div>
            </div>
          </div>
          
          {/* 注目園バッジ */}
          {garden.featured && (
            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              ⭐ 注目園
            </span>
          )}
        </div>
        
        {/* 装飾パターン */}
        <div className="absolute -top-2 -right-2 text-2xl opacity-20">
          🌿🍃
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-gray-800">
          {garden.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 専門分野タグ */}
        {garden.specialties && garden.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {garden.specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border"
              >
                {specialty}
              </span>
            ))}
            {garden.specialties.length > 3 && (
              <span className="text-xs text-gray-500">
                +{garden.specialties.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 説明文 */}
        <p className="text-sm text-gray-700 line-clamp-2">
          {garden.description}
        </p>

        {/* サービス情報 */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {garden.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>電話対応</span>
            </div>
          )}
          {garden.experience_programs && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>体験可能</span>
            </div>
          )}
          {garden.business_hours && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{garden.business_hours}</span>
            </div>
          )}
        </div>

        {/* アクションボタンエリア */}
        <div className="pt-4 border-t space-y-2">
          {/* 公式サイトボタン - 最優先 */}
          {garden.website_url && (
            <Button
              asChild
              className={`w-full ${theme.buttonColor} text-white`}
            >
              <a 
                href={garden.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Globe className="h-4 w-4" />
                公式サイトを見る
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
          
          {/* 電話ボタン - セカンダリー */}
          {garden.phone && (
            <Button
              asChild
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <a href={`tel:${garden.phone}`} className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                {garden.phone}
              </a>
            </Button>
          )}

          {/* サイトがない場合の住所表示 */}
          {!garden.website_url && (
            <div className="text-xs text-gray-500 flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5" />
              <span>{garden.address}</span>
            </div>
          )}
        </div>
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