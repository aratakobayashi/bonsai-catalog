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