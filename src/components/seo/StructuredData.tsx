import { Article } from '@/types'

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