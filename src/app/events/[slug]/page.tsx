import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { AMAZON_ENABLED } from '@/lib/affiliate'
import { Event, EventArticle, Product, Article } from '@/types'
import EventDetailClient from './EventDetailClient'
import { getEventBySlug } from '@/lib/events'
import { EVENT_ARTICLE_TOPICS, getTopicArticles } from '@/app/gardens/related-articles'
import { SITE_URL } from '@/lib/site'
import { getEventMeta, isTentativeEvent } from '@/lib/event-display'
import { eventPeriodText } from '@/components/features/EventShared'

interface EventDetailPageProps {
  params: { slug: string }
}

// 人気商品を取得
async function getPopularProducts(limit = 6): Promise<Product[]> {
  let query = supabaseServer.from('products').select('id, name, price, image_url, slug, category, description, created_at')
  // Amazon の掲載を止めている間は楽天市場の商品だけ（src/lib/affiliate.ts）
  if (!AMAZON_ENABLED) query = query.eq('source', 'rakuten')
  const { data } = await query.order('created_at', { ascending: false }).limit(limit)

  return data || []
}

// おすすめ記事を取得（展示会・イベント関連の記事を優先し、足りない分は新着）
async function getRecommendedArticles(limit = 4): Promise<Article[]> {
  return getTopicArticles(EVENT_ARTICLE_TOPICS, limit)
}

// 自サイトのAPIを外部URL経由で呼ばず、DBから直接取得する
async function getEventDetail(slug: string) {
  try {
    return await getEventBySlug(slug)
  } catch (error) {
    console.error('Failed to fetch event detail:', error)
    return null
  }
}

// 初回アクセス時に生成してキャッシュし、1時間ごとに再生成（ISR）
export const revalidate = 3600

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const data = await getEventDetail(params.slug)

  if (!data?.event) {
    return {
      title: 'イベントが見つかりません',
      description: '指定されたイベントは存在しません。'
    }
  }

  const event: Event = data.event
  const startDate = new Date(event.start_date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const endDate = event.start_date !== event.end_date
    ? new Date(event.end_date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })
    : null

  const dateRange = isTentativeEvent(event) ? eventPeriodText(event, true) : endDate ? `${startDate} - ${endDate}` : startDate
  const title = `${event.title} | ${dateRange} | ${event.prefecture}`
  const description = `${event.title}が${dateRange}に${event.prefecture}${event.venue_name ? `の${event.venue_name}` : ''}で開催。${event.description || '詳細はこちらをご確認ください。'}`

  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: `/events/${event.slug}` },
    // 公式情報で確認したイベントだけを検索結果に出す
    ...(!getEventMeta(event.slug) && { robots: { index: false, follow: true } }),
    keywords: [
      event.title,
      event.prefecture,
      event.venue_name,
      ...event.types,
      '盆栽イベント',
      '展示会',
      '即売会',
      'ワークショップ',
      '講習会'
    ].filter((keyword): keyword is string => Boolean(keyword)),
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: event.created_at,
      modifiedTime: event.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const [data, popularProducts, recommendedArticles] = await Promise.all([
    getEventDetail(params.slug),
    getPopularProducts(),
    getRecommendedArticles()
  ])

  if (!data?.event) {
    notFound()
  }

  const { event, event_articles, related_events } = data

  // JSON-LD for Event
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.start_date,
    "endDate": event.end_date,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event.venue_name || event.prefecture,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.prefecture,
        "addressRegion": event.prefecture,
        "addressCountry": "JP"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": event.organizer_name || "主催者"
    },
    "offers": getEventMeta(event.slug)?.priceKnown === false ? undefined : event.price_type === 'free' ? {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY",
      "availability": "https://schema.org/InStock"
    } : {
      "@type": "Offer",
      "description": event.price_note || "有料",
      "priceCurrency": "JPY",
      "availability": "https://schema.org/InStock"
    },
    "url": `${SITE_URL}/events/${event.slug}`
  }

  if (event.address) {
    (eventJsonLd.location as any).address = {
      "@type": "PostalAddress",
      "streetAddress": event.address,
      "addressLocality": event.prefecture,
      "addressRegion": event.prefecture,
      "addressCountry": "JP"
    }
  }

  return (
    <>
      {/* 日程が未発表のイベントは、日付が正確でないため構造化データを出さない */}
      {!isTentativeEvent(event) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(eventJsonLd)
          }}
        />
      )}

      <EventDetailClient
        event={event}
        eventArticles={event_articles}
        relatedEvents={related_events}
        popularProducts={popularProducts}
        recommendedArticles={recommendedArticles}
      />
    </>
  )
}