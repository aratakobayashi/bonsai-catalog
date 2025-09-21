'use client'

import { useState, useMemo } from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Globe, Phone, ExternalLink, Users, Calendar } from 'lucide-react'
import { REGIONS, getRegionFromPrefecture, getRegionTheme } from '@/lib/utils'
import type { Garden } from '@/types'

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
  // 地域別テーマを取得
  const region = getRegionFromPrefecture(garden.prefecture || '')
  const theme = getRegionTheme(region)

  return (
    <Link href={`/gardens/${garden.id}`} className="block h-full">
      <Card className={`h-full hover:shadow-lg transition-all duration-300 ${theme.borderColor} hover:scale-[1.02]`}>
      {/* ビジュアルヘッダー */}
      <div className={`bg-gradient-to-br ${theme.lightColor} p-6 relative overflow-hidden`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{theme.icon}</div>
            <div>
              <div className={`text-sm font-semibold ${theme.textColor}`}>
                {garden.prefecture}
              </div>
              <div className="text-xs text-gray-600">
                {garden.city}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {region}地方
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
    </Link>
  )
}

function GardensPageClient({ gardens }: { gardens: Garden[] }) {
  const [selectedRegion, setSelectedRegion] = useState<string>('全て')
  
  // Filter gardens by selected region
  const filteredGardens = useMemo(() => {
    if (selectedRegion === '全て') return gardens
    return gardens.filter(garden => 
      getRegionFromPrefecture(garden.prefecture || '') === selectedRegion
    )
  }, [gardens, selectedRegion])

  // Count gardens by region for current data
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    gardens.forEach(garden => {
      const region = getRegionFromPrefecture(garden.prefecture || '')
      counts[region] = (counts[region] || 0) + 1
    })
    return counts
  }, [gardens])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            盆栽園紹介
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            信頼できる盆栽園をご紹介。歴史ある老舗から現代的な盆栽園まで、
            質の高い盆栽を扱う園をピックアップしています。
          </p>
        </div>

        {/* コンパクト特徴セクション */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-4 max-w-4xl">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-medium text-gray-700">厳選された盆栽園</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-lg">👥</span>
              <span className="text-sm font-medium text-gray-700">専門知識</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-lg">🌱</span>
              <span className="text-sm font-medium text-gray-700">品質保証</span>
            </div>
          </div>
        </div>

        {/* 地方フィルター */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {/* 全て表示ボタン */}
            <button
              onClick={() => setSelectedRegion('全て')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedRegion === '全て'
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              全て ({gardens.length})
            </button>
            
            {/* 地方別フィルターボタン */}
            {Object.entries(REGIONS).map(([regionName, regionData]) => {
              const count = regionCounts[regionName] || 0
              if (count === 0) return null
              
              const theme = getRegionTheme(regionName)
              
              return (
                <button
                  key={regionName}
                  onClick={() => setSelectedRegion(regionName)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedRegion === regionName
                      ? `${theme.color} text-white shadow-md`
                      : `bg-white ${theme.textColor} hover:${theme.lightColor} border ${theme.borderColor}`
                  }`}
                >
                  <span>{theme.icon}</span>
                  {regionName} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* 盆栽園一覧 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            提携盆栽園一覧
          </h2>
          
          {/* フィルター結果表示 */}
          <p className="text-center text-gray-600 mb-8">
            {selectedRegion === '全て' 
              ? `全国の盆栽園 ${filteredGardens.length}件を表示中`
              : `${selectedRegion}地方の盆栽園 ${filteredGardens.length}件を表示中`
            }
          </p>
          
          {filteredGardens.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredGardens.map((garden) => (
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
                {selectedRegion}地方の盆栽園データを準備中です
              </h3>
              <p className="text-gray-600">
                現在{selectedRegion}地方の盆栽園情報を収集中です。しばらくお待ちください。
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

export default async function GardensPage() {
  const gardens = await getGardens()

  return <GardensPageClient gardens={gardens} />
}