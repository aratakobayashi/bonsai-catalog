import { Article } from '@/types'
import type { FAQItem } from '@/lib/faq-data'

interface ArticleStructuredDataProps {
  article: Article
  baseUrl: string
}

export function ArticleStructuredData({ article, baseUrl }: ArticleStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.seoDescription || article.excerpt || article.title,
    "image": article.featuredImage ? article.featuredImage.url : `${baseUrl}/og-image.jpg`,
    "author": {
      "@type": "Organization",
      "name": "盆栽コレクション",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "盆栽コレクション",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/guides/${article.slug}`
    },
    "articleSection": article.category.name,
    "keywords": article.tags?.map(tag => tag.name).join(', '),
    "inLanguage": "ja-JP"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

interface ProductStructuredDataProps {
  name: string
  description: string
  image: string
  price: number
  category: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  brand?: string
}

export function ProductStructuredData({
  name,
  description,
  image,
  price,
  category,
  availability = 'InStock',
  brand = '盆栽コレクション'
}: ProductStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": image,
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "category": category,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "JPY",
      "availability": `https://schema.org/${availability}`,
      "seller": {
        "@type": "Organization",
        "name": "盆栽コレクション"
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

interface WebSiteStructuredDataProps {
  baseUrl: string
}

export function WebSiteStructuredData({ baseUrl }: WebSiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "盆栽コレクション",
    "description": "美しい盆栽をお探しの方のための商品カタログサイトです。",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "盆栽コレクション",
      "url": baseUrl
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

interface HowToStructuredDataProps {
  title: string
  description: string
  steps: {
    name: string
    description: string
    image?: string
  }[]
  totalTime?: string
  suppliesNeeded?: string[]
  toolsNeeded?: string[]
  baseUrl: string
  articleSlug: string
}

export function HowToStructuredData({
  title,
  description,
  steps,
  totalTime,
  suppliesNeeded = [],
  toolsNeeded = [],
  baseUrl,
  articleSlug
}: HowToStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "image": `${baseUrl}/og-image.jpg`,
    ...(totalTime && { "totalTime": totalTime }),
    ...(suppliesNeeded.length > 0 && {
      "supply": suppliesNeeded.map(supply => ({
        "@type": "HowToSupply",
        "name": supply
      }))
    }),
    ...(toolsNeeded.length > 0 && {
      "tool": toolsNeeded.map(tool => ({
        "@type": "HowToTool",
        "name": tool
      }))
    }),
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.description,
      ...(step.image && {
        "image": {
          "@type": "ImageObject",
          "url": step.image
        }
      })
    })),
    "author": {
      "@type": "Organization",
      "name": "盆栽コレクション",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "盆栽コレクション",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/guides/${articleSlug}`
    },
    "inLanguage": "ja-JP"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

interface BreadcrumbStructuredDataProps {
  breadcrumbs: {
    name: string
    url: string
    position: number
  }[]
}

export function BreadcrumbStructuredData({ breadcrumbs }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map(breadcrumb => ({
      "@type": "ListItem",
      "position": breadcrumb.position,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

interface FAQStructuredDataProps {
  faqs: FAQItem[]
  baseUrl?: string
}

export function FAQStructuredData({ faqs, baseUrl = 'https://www.bonsai-collection.com' }: FAQStructuredDataProps) {
  if (!faqs || faqs.length === 0) return null

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

interface LocalBusinessStructuredDataProps {
  name: string
  description: string
  address?: string
  phone?: string
  website?: string
  image?: string
  rating?: number
  reviewCount?: number
  latitude?: number
  longitude?: number
  businessHours?: string
  specialties?: string[]
  baseUrl: string
  businessId: string
}

export function LocalBusinessStructuredData({
  name,
  description,
  address,
  phone,
  website,
  image,
  rating,
  reviewCount,
  latitude,
  longitude,
  businessHours,
  specialties = [],
  baseUrl,
  businessId
}: LocalBusinessStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": name,
    "description": description,
    "url": `${baseUrl}/gardens/${businessId}`,
    ...(image && { "image": image }),
    ...(address && { "address": address }),
    ...(phone && { "telephone": phone }),
    ...(website && { "sameAs": [website] }),
    ...(latitude && longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": latitude,
        "longitude": longitude
      }
    }),
    ...(businessHours && { "openingHours": businessHours }),
    ...(rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating,
        "bestRating": 5,
        "worstRating": 1,
        ...(reviewCount && { "reviewCount": reviewCount })
      }
    }),
    ...(specialties.length > 0 && {
      "makesOffer": specialties.map(specialty => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `${specialty}専門サービス`,
          "category": specialty
        }
      }))
    }),
    "priceRange": "$$",
    "servesCuisine": "盆栽・園芸",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/gardens/${businessId}`
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

interface OrganizationStructuredDataProps {
  baseUrl: string
}

export function OrganizationStructuredData({ baseUrl }: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "盆栽コレクション",
    "description": "盆栽初心者から上級者まで、美しい盆栽とその育て方をご案内する専門サイトです。",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["Japanese"]
    },
    "sameAs": [
      // SNSアカウントがあれば追加
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}