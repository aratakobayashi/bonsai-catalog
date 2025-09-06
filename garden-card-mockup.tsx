// 画像なし盆栽園カードのモックアップ
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MapPin, Phone, Globe, Star, Calendar, Users } from 'lucide-react'

function ImagelessGardenCard({ garden }: { garden: Garden }) {
  // 都道府県別のアイコン・色テーマ
  const getPrefectureTheme = (prefecture: string) => {
    switch (prefecture) {
      case '埼玉県':
        return {
          icon: '🏛️',
          gradient: 'from-blue-100 to-indigo-100',
          accent: 'text-blue-600',
          border: 'border-blue-200'
        }
      case '香川県':
        return {
          icon: '🌲',
          gradient: 'from-green-100 to-emerald-100',
          accent: 'text-green-600',
          border: 'border-green-200'
        }
      case '東京都':
        return {
          icon: '🎋',
          gradient: 'from-purple-100 to-pink-100',
          accent: 'text-purple-600',
          border: 'border-purple-200'
        }
      default:
        return {
          icon: '🌿',
          gradient: 'from-gray-100 to-slate-100',
          accent: 'text-gray-600',
          border: 'border-gray-200'
        }
    }
  }

  const theme = getPrefectureTheme(garden.prefecture || '')

  return (
    <Card className={`h-full hover:shadow-lg transition-all duration-300 ${theme.border} hover:scale-[1.02]`}>
      {/* ビジュアルヘッダー - 画像の代わり */}
      <div className={`bg-gradient-to-br ${theme.gradient} p-8 relative overflow-hidden`}>
        {/* メインアイコン */}
        <div className="text-center">
          <div className="text-6xl mb-2">{theme.icon}</div>
          <div className={`text-sm font-semibold ${theme.accent}`}>
            {garden.prefecture}
          </div>
        </div>
        
        {/* 装飾パターン */}
        <div className="absolute -top-4 -right-4 text-4xl opacity-20">
          🌿🌿🌿
        </div>
        <div className="absolute -bottom-4 -left-4 text-4xl opacity-20">
          🍃🍃🍃
        </div>
        
        {/* 注目園バッジ */}
        {garden.featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              ⭐ 注目園
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          {garden.name}
          {garden.rating && (
            <span className="text-sm text-yellow-600 flex items-center">
              <Star className="h-4 w-4 fill-current" />
              {garden.rating}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 住所 */}
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
          <span>{garden.address}</span>
        </div>

        {/* 説明 */}
        <p className="text-sm text-gray-700 line-clamp-2">
          {garden.description}
        </p>

        {/* 専門分野タグ */}
        {garden.specialties && garden.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {garden.specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs ${theme.accent} bg-opacity-10`}
                style={{ backgroundColor: `${theme.accent.replace('text-', '')}` }}
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        {/* 連絡先・サービス情報 */}
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
          {garden.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>電話</span>
            </div>
          )}
          {garden.website_url && (
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>Web</span>
            </div>
          )}
          {garden.experience_programs && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>体験</span>
            </div>
          )}
          {garden.business_hours && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>営業中</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}