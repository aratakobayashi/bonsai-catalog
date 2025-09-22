import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { Event, EventArticle, Product, Article } from '@/types'
import EventDetailClient from './EventDetailClient'

interface EventDetailPageProps {
  params: { slug: string }
}

// 人気商品を取得
async function getPopularProducts(limit = 6): Promise<Product[]> {
  const { data } = await supabaseServer
    .from('products')
    .select('id, name, price, image_url, slug, category, description')
    .eq('published', true)
    .order('view_count', { ascending: false })
    .limit(limit)

  return data || []
}

// おすすめ記事を取得
async function getRecommendedArticles(limit = 6): Promise<Article[]> {
  const { data } = await supabaseServer
    .from('articles')
    .select('id, title, slug, excerpt, featuredImage, category, publishedAt')
    .eq('published', true)
    .order('view_count', { ascending: false })
    .limit(limit)

  return data || []
}

async function getEventDetail(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://bonsai-catalog.vercel.app'}/api/events/${slug}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch event detail:', error)
    return null
  }
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

  const dateRange = endDate ? `${startDate} - ${endDate}` : startDate
  const title = `${event.title} | ${dateRange} | ${event.prefecture}`
  const description = `${event.title}が${dateRange}に${event.prefecture}${event.venue_name ? `の${event.venue_name}` : ''}で開催。${event.description || '詳細はこちらをご確認ください。'}`

  return {
    title,
    description: description.slice(0, 160),
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
    "offers": event.price_type === 'free' ? {
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
    "url": `https://bonsai-catalog.vercel.app/events/${event.slug}`
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventJsonLd)
        }}
      />

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