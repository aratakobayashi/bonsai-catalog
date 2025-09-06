// 修正版: 評価なし + 公式サイト導線強化
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Phone, Globe, Calendar, Users, ExternalLink } from 'lucide-react'

function RevisedGardenCard({ garden }: { garden: Garden }) {
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
                className={`px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border`}
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

        {/* アクションボタンエリア（新規追加） */}
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