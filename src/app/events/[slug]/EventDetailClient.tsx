'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Event, EventArticle, Product, Article } from '@/types'
import { cn } from '@/lib/utils'
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  ExternalLink,
  Phone,
  Globe,
  ArrowLeft,
  Share2,
  Bookmark
} from 'lucide-react'
import { EventCard } from '@/components/features/EventCard'

const eventTypeConfig = {
  exhibition: { color: 'text-green-600 bg-green-50', icon: '🌳', label: '展示' },
  sale: { color: 'text-blue-600 bg-blue-50', icon: '🛒', label: '即売' },
  workshop: { color: 'text-orange-600 bg-orange-50', icon: '✂️', label: 'ワークショップ' },
  lecture: { color: 'text-purple-600 bg-purple-50', icon: '📖', label: '講習' }
}

interface EventDetailClientProps {
  event: Event
  eventArticles: EventArticle[]
  relatedEvents: Event[]
  popularProducts: Product[]
  recommendedArticles: Article[]
}

export default function EventDetailClient({
  event,
  eventArticles,
  relatedEvents,
  popularProducts,
  recommendedArticles
}: EventDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'announcement' | 'report' | 'summary'>('announcement')

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate)
    const end = formatDate(endDate)
    return startDate === endDate ? start : `${start} - ${end}`
  }

  // 記事を種類別にグループ化
  const articlesGrouped = {
    announcement: eventArticles.filter(ea => ea.relation_type === 'announcement'),
    report: eventArticles.filter(ea => ea.relation_type === 'report'),
    summary: eventArticles.filter(ea => ea.relation_type === 'summary'),
  }

  const tabs = [
    { key: 'announcement', label: '開催案内', count: articlesGrouped.announcement.length },
    { key: 'report', label: 'レポート', count: articlesGrouped.report.length },
    { key: 'summary', label: 'まとめ', count: articlesGrouped.summary.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* パンくずナビ */}
        <nav className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            イベント一覧に戻る
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* イベント基本情報 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* ヘッダー */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {event.types.map((type) => (
                        <span
                          key={type}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                            eventTypeConfig[type as keyof typeof eventTypeConfig]?.color || 'text-gray-600 bg-gray-50'
                          )}
                        >
                          <span className="text-sm">
                            {eventTypeConfig[type as keyof typeof eventTypeConfig]?.icon || '📅'}
                          </span>
                          {eventTypeConfig[type as keyof typeof eventTypeConfig]?.label || type}
                        </span>
                      ))}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
                    <p className="text-gray-600">{getDateRange(event.start_date, event.end_date)}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Bookmark className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* 基本情報グリッド */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">開催期間</p>
                      <p className="font-medium">{getDateRange(event.start_date, event.end_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">開催地</p>
                      <p className="font-medium">{event.prefecture}</p>
                      {event.venue_name && (
                        <p className="text-sm text-gray-600">{event.venue_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">参加費</p>
                      <p className="font-medium">
                        {event.price_type === 'free' ? '無料' : event.price_note || '有料'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">主催者</p>
                      <p className="font-medium">{event.organizer_name || '要確認'}</p>
                    </div>
                  </div>
                </div>

                {/* 住所 */}
                {event.address && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">住所</p>
                    <p className="text-sm">{event.address}</p>
                  </div>
                )}
              </div>

              {/* イベント詳細説明 */}
              {event.description && (
                <div className="p-6 border-b border-gray-200">
                  <h2 className="font-bold text-gray-900 mb-3">イベント詳細</h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}

              {/* 外部リンク */}
              {event.official_url && (
                <div className="p-6 border-b border-gray-200">
                  <h2 className="font-bold text-gray-900 mb-3">お問い合わせ・詳細情報</h2>
                  <div className="space-y-3">
                    <a
                      href={event.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
                    >
                      <Globe className="h-4 w-4" />
                      公式サイト
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* イベント記事タブ */}
              {eventArticles.length > 0 && (
                <div className="p-6">
                  <h2 className="font-bold text-gray-900 mb-4">関連記事</h2>

                  {/* タブナビゲーション */}
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                      {tabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key as any)}
                          className={cn(
                            'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                            activeTab === tab.key
                              ? 'border-green-500 text-green-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          )}
                        >
                          {tab.label}
                          {tab.count > 0 && (
                            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                              {tab.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* タブコンテンツ */}
                  <div className="space-y-4">
                    {articlesGrouped[activeTab].length > 0 ? (
                      articlesGrouped[activeTab].map((eventArticle) => (
                        <div key={eventArticle.id} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{eventArticle.article?.title || 'タイトルなし'}</h3>
                          {eventArticle.article?.content && (
                            <div className="prose prose-sm max-w-none">
                              <p className="text-gray-700">{eventArticle.article.content}</p>
                            </div>
                          )}
                          <div className="mt-3 text-xs text-gray-500">
                            {new Date(eventArticle.created_at).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        {tabs.find(t => t.key === activeTab)?.label}記事はまだありません
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* おすすめ記事 */}
            {recommendedArticles.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">おすすめ記事</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedArticles.slice(0, 6).map((article) => (
                    <Link
                      key={article.id}
                      href={`/guides/${article.slug}`}
                      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-300"
                    >
                      {/* 画像部分 */}
                      <div className="relative h-40 bg-gradient-to-br from-green-50 to-green-100">
                        {article.featuredImage?.url ? (
                          <Image
                            src={article.featuredImage.url}
                            alt={article.title || ''}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="text-3xl mb-2">📖</div>
                              <p className="text-sm text-green-600 font-medium">記事</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* コンテンツ部分 */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {article.category?.name || 'ガイド'}
                          </span>
                          {article.publishedAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/guides"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    記事一覧を見る
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* おすすめ商品セクション */}
            {popularProducts.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">おすすめ商品</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularProducts.slice(0, 6).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-300"
                    >
                      {/* 商品画像 */}
                      <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="text-3xl mb-2">🌿</div>
                              <p className="text-sm text-green-600 font-medium">商品</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 商品情報 */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            ¥{product.price?.toLocaleString()}
                          </span>
                          {product.category && (
                            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                              {product.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    商品一覧を見る
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 開催情報まとめ */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">開催情報</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">期間</p>
                    <p className="text-sm font-medium">{getDateRange(event.start_date, event.end_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">場所</p>
                    <p className="text-sm font-medium">{event.prefecture}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">参加費</p>
                    <p className="text-sm font-medium">
                      {event.price_type === 'free' ? '無料' : event.price_note || '有料'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 関連イベント */}
            {relatedEvents.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  {event.prefecture}の関連イベント
                </h3>
                <div className="space-y-3">
                  {relatedEvents.slice(0, 3).map((relatedEvent) => (
                    <EventCard
                      key={relatedEvent.id}
                      event={relatedEvent}
                      layout="compact"
                    />
                  ))}
                </div>
                {relatedEvents.length > 3 && (
                  <Link
                    href={`/events?prefecture=${encodeURIComponent(event.prefecture)}`}
                    className="block text-center text-green-600 hover:text-green-700 font-medium text-sm mt-4"
                  >
                    {event.prefecture}のイベントをもっと見る
                  </Link>
                )}
              </div>
            )}

            {/* お役立ちリンク */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">お役立ちリンク</h3>
              <div className="space-y-3">
                <Link
                  href={`/events?prefecture=${encodeURIComponent(event.prefecture)}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <MapPin className="h-4 w-4" />
                  {event.prefecture}のイベント一覧
                </Link>
                <Link
                  href={`/events?types=${event.types.join(',')}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Calendar className="h-4 w-4" />
                  同じタイプのイベント
                </Link>
                <Link
                  href="/events"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  イベント一覧
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}