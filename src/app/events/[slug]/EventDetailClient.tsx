'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Event, EventArticle, Product } from '@/types'
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
}

export default function EventDetailClient({
  event,
  eventArticles,
  relatedEvents
}: EventDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'announcement' | 'report' | 'summary'>('announcement')
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // 人気商品を取得
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await fetch('/api/popular-products')
        if (response.ok) {
          const data = await response.json()
          setPopularProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error fetching popular products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchPopularProducts()
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const getDateRange = () => {
    if (event.start_date === event.end_date) {
      return formatDate(event.start_date)
    }
    return `${formatDate(event.start_date)} 〜 ${formatDate(event.end_date)}`
  }

  const isUpcoming = () => {
    const today = new Date()
    const startDate = new Date(event.start_date)
    return startDate >= today
  }

  const isPast = () => {
    const today = new Date()
    const endDate = new Date(event.end_date)
    return endDate < today
  }

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `${event.title} - ${event.description?.slice(0, 100)}...`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('URLをクリップボードにコピーしました')
    }
  }

  const articlesGrouped = {
    announcement: eventArticles.filter(ea => ea.relation_type === 'announcement'),
    report: eventArticles.filter(ea => ea.relation_type === 'report'),
    summary: eventArticles.filter(ea => ea.relation_type === 'summary')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* パンくずナビ */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <nav className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-gray-900 flex-shrink-0">ホーム</Link>
            <span className="flex-shrink-0">/</span>
            <Link href="/events" className="hover:text-gray-900 flex-shrink-0">イベント</Link>
            <span className="flex-shrink-0">/</span>
            <span className="text-gray-900 font-medium truncate">
              {event.title.length > 20 ? event.title.slice(0, 20) + '...' : event.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-8">
              {/* 戻るボタン */}
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                イベント一覧に戻る
              </Link>

              {/* ヘッダー */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {event.types.map((type) => (
                        <span
                          key={type}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded-full',
                            eventTypeConfig[type].color
                          )}
                        >
                          {eventTypeConfig[type].icon}
                          <span className="hidden sm:inline">{eventTypeConfig[type].label}</span>
                        </span>
                      ))}

                      {isUpcoming() && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                          開催予定
                        </span>
                      )}

                      {isPast() && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                          終了
                        </span>
                      )}
                    </div>

                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                      {event.title}
                    </h1>

                    <p className="text-base md:text-lg text-gray-600">
                      {event.prefecture} • {getDateRange()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <button
                      onClick={handleShare}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation active:scale-95"
                      title="シェア"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="ブックマーク"
                    >
                      <Bookmark className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* 概要 */}
                {event.description && (
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>
                  </div>
                )}
              </div>

              {/* 開催情報 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">開催情報</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 日時 */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">開催日時</h3>
                      <p className="text-gray-700">{getDateRange()}</p>
                    </div>
                  </div>

                  {/* 会場 */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">会場</h3>
                      <p className="text-gray-700">
                        {event.venue_name && <span className="block">{event.venue_name}</span>}
                        {event.address && <span className="block text-sm">{event.address}</span>}
                        <span className="text-sm">{event.prefecture}</span>
                      </p>
                    </div>
                  </div>

                  {/* 料金 */}
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">参加費</h3>
                      <p className="text-gray-700">
                        {event.price_type === 'free' ? '無料' : '有料'}
                        {event.price_note && (
                          <span className="block text-sm">{event.price_note}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 主催者 */}
                  {event.organizer_name && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">主催者</h3>
                        <p className="text-gray-700">{event.organizer_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 公式サイト */}
                {event.official_url && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a
                      href={event.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      公式サイトで詳細を見る
                    </a>
                  </div>
                )}
              </div>

              {/* アクセス情報 */}
              {event.address && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">アクセス</h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">住所</h3>
                      <p className="text-gray-700">{event.address}</p>
                    </div>

                    {/* Google Maps埋め込み (座標がある場合) */}
                    {event.lat && event.lng && (
                      <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${event.lat},${event.lng}&zoom=15`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 関連記事 */}
              {eventArticles.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">関連記事</h2>

                  {/* タブ */}
                  <div className="flex border-b border-gray-200 mb-6">
                    {[
                      { key: 'announcement', label: '開催案内', count: articlesGrouped.announcement.length },
                      { key: 'report', label: 'レポート', count: articlesGrouped.report.length },
                      { key: 'summary', label: 'まとめ', count: articlesGrouped.summary.length }
                    ].map(({ key, label, count }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key as any)}
                        className={cn(
                          'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                          activeTab === key
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        )}
                      >
                        {label} ({count})
                      </button>
                    ))}
                  </div>

                  {/* 記事一覧 - 画像付きカード表示 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articlesGrouped[activeTab].length > 0 ? (
                      articlesGrouped[activeTab].map((eventArticle) => (
                        <Link
                          key={eventArticle.id}
                          href={`/guides/${eventArticle.article?.slug}`}
                          className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-300"
                        >
                          {/* 画像部分 */}
                          <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100">
                            {eventArticle.article?.featured_image ? (
                              <Image
                                src={eventArticle.article.featured_image}
                                alt={eventArticle.article.title || ''}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                  <div className="text-4xl mb-2">📰</div>
                                  <p className="text-sm text-green-600 font-medium">記事</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* コンテンツ部分 */}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                              {eventArticle.article?.title}
                            </h3>
                            {eventArticle.article?.excerpt && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {eventArticle.article.excerpt}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-full text-gray-600 text-center py-8">
                        <div className="text-4xl mb-2">📝</div>
                        <p>
                          {activeTab === 'announcement' && '開催案内記事はまだありません'}
                          {activeTab === 'report' && 'レポート記事はまだありません'}
                          {activeTab === 'summary' && 'まとめ記事はまだありません'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* サイドバー */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* 関連盆栽園 */}
                {event.garden && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">関連盆栽園</h3>
                    <Link
                      href={`/gardens/${event.garden.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {event.garden.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        📍 {event.garden.prefecture}
                      </p>
                      {event.garden.address && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.garden.address}
                        </p>
                      )}
                    </Link>
                  </div>
                )}

                {/* 人気盆栽商品 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">人気の盆栽商品</h3>
                  {loadingProducts ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 h-20 rounded-lg mb-2"></div>
                          <div className="bg-gray-200 h-4 rounded mb-1"></div>
                          <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : popularProducts.length > 0 ? (
                    <div className="space-y-4">
                      {popularProducts.slice(0, 3).map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="group block border border-gray-200 rounded-lg overflow-hidden hover:border-green-300 hover:shadow-md transition-all"
                        >
                          <div className="flex">
                            {/* 商品画像 */}
                            <div className="relative w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 flex-shrink-0">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <span className="text-2xl">🌿</span>
                                </div>
                              )}
                            </div>

                            {/* 商品情報 */}
                            <div className="flex-1 p-3">
                              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-lg font-bold text-green-600 mt-1">
                                ¥{product.price?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href="/products"
                        className="block text-center text-sm text-green-600 hover:text-green-700 font-medium py-2"
                      >
                        商品一覧を見る →
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-3xl mb-2">🌿</div>
                      <p className="text-sm">商品を準備中です</p>
                    </div>
                  )}
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
                      同じ種別のイベント
                    </Link>
                    <Link
                      href="/gardens"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <Users className="h-4 w-4" />
                      盆栽園一覧
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}