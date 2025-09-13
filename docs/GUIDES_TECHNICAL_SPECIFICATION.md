# ⚙️ ガイド記事統合プロジェクト - 技術仕様書

## 1. 技術スタック

### 1.1 フロントエンド
| 技術 | バージョン | 用途 |
|------|----------|------|
| Next.js | 14.0+ | React フレームワーク |
| React | 18.0+ | UI ライブラリ |
| TypeScript | 5.0+ | 型安全性 |
| Tailwind CSS | 3.0+ | スタイリング |
| TanStack Query | 4.0+ | サーバー状態管理 |

### 1.2 バックエンド・データ
| 技術 | バージョン | 用途 |
|------|----------|------|
| WordPress | 6.0+ | CMS |
| WordPress REST API | v2 | 記事データ API |
| Supabase | Latest | 商品データベース |
| PostgreSQL | 15.0+ | リレーショナルDB |

### 1.3 インフラ・デプロイ
| サービス | 用途 |
|---------|------|
| Vercel | ホスティング・デプロイ |
| Vercel Edge Runtime | エッジ関数 |
| Vercel Analytics | アクセス解析 |
| WordPress Hosting | CMS ホスティング |

## 2. ディレクトリ構成

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── guides/
│       ├── layout.tsx              # ガイドセクション共通レイアウト
│       ├── page.tsx               # 記事一覧 (/guides)
│       ├── [slug]/
│       │   └── page.tsx          # 記事詳細 (/guides/[slug])
│       ├── category/
│       │   └── [category]/
│       │       └── page.tsx      # カテゴリー別一覧
│       ├── tag/
│       │   └── [tag]/
│       │       └── page.tsx      # タグ別一覧
│       └── search/
│           └── page.tsx          # 検索結果
├── components/
│   ├── ui/                       # 汎用UIコンポーネント
│   ├── layout/                   # レイアウトコンポーネント
│   ├── features/
│   │   ├── products/             # 商品関連
│   │   └── guides/               # 記事関連
│   │       ├── ArticleCard.tsx
│   │       ├── ArticleList.tsx
│   │       ├── ArticleDetail.tsx
│   │       ├── ArticleFilters.tsx
│   │       ├── ArticleSearch.tsx
│   │       ├── CategoryNav.tsx
│   │       ├── TagCloud.tsx
│   │       ├── RelatedProducts.tsx
│   │       ├── RelatedArticles.tsx
│   │       ├── TableOfContents.tsx
│   │       └── ShareButtons.tsx
│   └── common/                   # 共通コンポーネント
├── lib/
│   ├── wordpress/                # WordPress API関連
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── supabase/                # Supabase関連
│   ├── utils/                   # ユーティリティ
│   └── hooks/                   # カスタムフック
├── types/
│   ├── wordpress.ts             # WordPress型定義
│   ├── guides.ts               # ガイド関連型定義
│   └── api.ts                  # API型定義
└── constants/
    ├── wordpress.ts            # WordPress設定
    └── guides.ts              # ガイド設定
```

## 3. WordPress API 実装

### 3.1 API クライアント

```typescript
// lib/wordpress/api.ts
import { Article, Category, Tag, MediaObject } from '@/types/wordpress'

const WP_API_BASE = process.env.WORDPRESS_API_URL || 'https://bonsai-guidebook.net/wp-json/wp/v2'

export class WordPressAPI {
  private baseURL: string

  constructor(baseURL: string = WP_API_BASE) {
    this.baseURL = baseURL
  }

  async fetchArticles(params: ArticleParams = {}): Promise<{
    articles: Article[]
    totalPages: number
    totalPosts: number
  }> {
    const queryParams = new URLSearchParams({
      _embed: 'true',
      per_page: String(params.perPage || 12),
      page: String(params.page || 1),
      orderby: params.orderBy || 'date',
      order: params.order || 'desc',
      ...params.categories && { categories: params.categories.join(',') },
      ...params.tags && { tags: params.tags.join(',') },
      ...params.search && { search: params.search },
    })

    const response = await fetch(`${this.baseURL}/posts?${queryParams}`, {
      next: { revalidate: 3600 } // 1時間キャッシュ
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    const articles = await response.json()
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1')
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0')

    return {
      articles: articles.map(this.transformArticle),
      totalPages,
      totalPosts
    }
  }

  async fetchArticleBySlug(slug: string): Promise<Article | null> {
    const response = await fetch(
      `${this.baseURL}/posts?slug=${slug}&_embed=true`,
      {
        next: { revalidate: 86400 } // 24時間キャッシュ
      }
    )

    if (!response.ok) return null

    const articles = await response.json()
    if (articles.length === 0) return null

    return this.transformArticle(articles[0])
  }

  async fetchCategories(): Promise<Category[]> {
    const response = await fetch(`${this.baseURL}/categories?per_page=100`, {
      next: { revalidate: 604800 } // 1週間キャッシュ
    })

    if (!response.ok) {
      throw new Error(`Categories fetch error: ${response.status}`)
    }

    return response.json()
  }

  async fetchTags(): Promise<Tag[]> {
    const response = await fetch(`${this.baseURL}/tags?per_page=100`, {
      next: { revalidate: 604800 } // 1週間キャッシュ
    })

    if (!response.ok) {
      throw new Error(`Tags fetch error: ${response.status}`)
    }

    return response.json()
  }

  private transformArticle(rawArticle: any): Article {
    const featuredMedia = rawArticle._embedded?.['wp:featuredmedia']?.[0]
    const categories = rawArticle._embedded?.['wp:term']?.[0] || []
    const tags = rawArticle._embedded?.['wp:term']?.[1] || []
    const author = rawArticle._embedded?.author?.[0]

    return {
      id: rawArticle.id,
      slug: rawArticle.slug,
      title: rawArticle.title.rendered,
      content: rawArticle.content.rendered,
      excerpt: this.stripHtml(rawArticle.excerpt.rendered),
      date: rawArticle.date,
      modified: rawArticle.modified,
      featuredImage: {
        url: featuredMedia?.source_url || '/images/default-article.jpg',
        alt: featuredMedia?.alt_text || rawArticle.title.rendered,
        width: featuredMedia?.media_details?.width || 800,
        height: featuredMedia?.media_details?.height || 600
      },
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      })),
      tags: tags.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      })),
      author: {
        id: author?.id || 1,
        name: author?.name || '盆栽コレクション',
        avatar: author?.avatar_urls?.['96'] || '/images/default-avatar.jpg'
      },
      readingTime: this.calculateReadingTime(rawArticle.content.rendered),
      seo: {
        title: rawArticle.yoast_head_json?.title || rawArticle.title.rendered,
        description: rawArticle.yoast_head_json?.description || this.stripHtml(rawArticle.excerpt.rendered),
        canonical: `https://bonsai-collection.com/guides/${rawArticle.slug}`
      }
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 500 // 日本語の平均読書速度
    const wordCount = this.stripHtml(content).length
    return Math.ceil(wordCount / wordsPerMinute)
  }
}

export const wordpressAPI = new WordPressAPI()
```

### 3.2 型定義

```typescript
// types/wordpress.ts
export interface Article {
  id: number
  slug: string
  title: string
  content: string
  excerpt: string
  date: string
  modified: string
  featuredImage: {
    url: string
    alt: string
    width: number
    height: number
  }
  categories: Category[]
  tags: Tag[]
  author: Author
  readingTime: number
  seo: {
    title: string
    description: string
    canonical: string
  }
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  parent?: number
  count?: number
}

export interface Tag {
  id: number
  name: string
  slug: string
  description?: string
  count?: number
}

export interface Author {
  id: number
  name: string
  avatar: string
}

export interface ArticleParams {
  page?: number
  perPage?: number
  categories?: number[]
  tags?: number[]
  search?: string
  orderBy?: 'date' | 'title' | 'relevance'
  order?: 'asc' | 'desc'
}
```

## 4. React Query 実装

### 4.1 カスタムフック

```typescript
// lib/hooks/useArticles.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { wordpressAPI } from '@/lib/wordpress/api'
import { ArticleParams } from '@/types/wordpress'

export const useArticles = (params: ArticleParams) => {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => wordpressAPI.fetchArticles(params),
    staleTime: 5 * 60 * 1000, // 5分間は新鮮
    cacheTime: 10 * 60 * 1000, // 10分間キャッシュ
    keepPreviousData: true, // ページネーション時のUX向上
  })
}

export const useArticleBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => wordpressAPI.fetchArticleBySlug(slug),
    staleTime: 30 * 60 * 1000, // 30分間は新鮮
    cacheTime: 60 * 60 * 1000, // 1時間キャッシュ
    enabled: !!slug,
  })
}

export const useInfiniteArticles = (params: ArticleParams) => {
  return useInfiniteQuery({
    queryKey: ['infinite-articles', params],
    queryFn: ({ pageParam = 1 }) =>
      wordpressAPI.fetchArticles({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return allPages.length < lastPage.totalPages
        ? allPages.length + 1
        : undefined
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => wordpressAPI.fetchCategories(),
    staleTime: 60 * 60 * 1000, // 1時間
    cacheTime: 24 * 60 * 60 * 1000, // 24時間
  })
}

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => wordpressAPI.fetchTags(),
    staleTime: 60 * 60 * 1000, // 1時間
    cacheTime: 24 * 60 * 60 * 1000, // 24時間
  })
}
```

### 4.2 Query Client 設定

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
})
```

## 5. 関連商品ロジック実装

### 5.1 商品関連付けアルゴリズム

```typescript
// lib/utils/productMatcher.ts
import { Article } from '@/types/wordpress'
import { Product } from '@/types/product'

export class ProductMatcher {
  /**
   * 記事に関連する商品を取得
   */
  static async getRelatedProducts(
    article: Article,
    allProducts: Product[],
    maxResults: number = 5
  ): Promise<Product[]> {
    const scoredProducts = allProducts.map(product => ({
      product,
      score: this.calculateRelevanceScore(article, product)
    }))

    return scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.product)
  }

  /**
   * 関連性スコア計算（0-100）
   */
  private static calculateRelevanceScore(
    article: Article,
    product: Product
  ): number {
    let score = 0

    // タグマッチング（最重要）
    const articleTags = article.tags.map(tag => tag.name.toLowerCase())
    const productTags = product.tags.map(tag => tag.toLowerCase())
    
    const tagMatches = articleTags.filter(tag => 
      productTags.some(pTag => pTag.includes(tag) || tag.includes(pTag))
    )
    score += tagMatches.length * 30

    // カテゴリーマッチング
    const categoryMatches = this.getCategoryMatches(article, product)
    score += categoryMatches * 25

    // キーワードマッチング
    const keywordScore = this.getKeywordMatchScore(article, product)
    score += keywordScore

    // 初心者向け記事は初心者向け商品を優先
    if (articleTags.includes('初心者') && productTags.includes('初心者')) {
      score += 20
    }

    // 室内栽培記事は小さいサイズの商品を優先
    if (articleTags.includes('室内') && product.size === 'small') {
      score += 15
    }

    return Math.min(score, 100)
  }

  private static getCategoryMatches(
    article: Article,
    product: Product
  ): number {
    const categoryMap: Record<string, string[]> = {
      '育て方': ['盆栽', '鉢', '土', '道具'],
      '選び方': ['盆栽', '鉢'],
      '知識': ['書籍', '盆栽'],
      'お手入れ': ['道具', '肥料', '薬剤']
    }

    return article.categories.reduce((matches, category) => {
      const relatedProductCategories = categoryMap[category.name] || []
      return relatedProductCategories.includes(product.category) 
        ? matches + 1 
        : matches
    }, 0)
  }

  private static getKeywordMatchScore(
    article: Article,
    product: Product
  ): number {
    const articleText = `${article.title} ${article.excerpt}`.toLowerCase()
    const productText = `${product.name} ${product.description}`.toLowerCase()
    
    const keywords = ['松', '楓', 'もみじ', '桜', '梅', '竹', '水やり', '剪定']
    
    return keywords.reduce((score, keyword) => {
      if (articleText.includes(keyword) && productText.includes(keyword)) {
        return score + 5
      }
      return score
    }, 0)
  }
}
```

### 5.2 関連商品コンポーネント

```typescript
// components/features/guides/RelatedProducts.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { Article } from '@/types/wordpress'
import { ProductMatcher } from '@/lib/utils/productMatcher'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/features/products/ProductCard'

interface RelatedProductsProps {
  article: Article
  maxProducts?: number
  variant?: 'carousel' | 'grid'
}

export function RelatedProducts({ 
  article, 
  maxProducts = 5,
  variant = 'grid' 
}: RelatedProductsProps) {
  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ['related-products', article.slug],
    queryFn: async () => {
      // 全商品を取得
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)

      if (!products) return []

      // 関連商品を計算
      return ProductMatcher.getRelatedProducts(
        article, 
        products, 
        maxProducts
      )
    },
    staleTime: 60 * 60 * 1000, // 1時間
  })

  if (isLoading) {
    return <RelatedProductsSkeleton />
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="related-products">
      <h3 className="text-2xl font-bold mb-6">
        この記事に関連する商品
      </h3>
      
      <div className={
        variant === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'
          : 'flex overflow-x-auto space-x-4 pb-4'
      }>
        {relatedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            variant="compact"
            showQuickView
          />
        ))}
      </div>
    </section>
  )
}
```

## 6. SEO実装

### 6.1 メタデータ生成

```typescript
// app/guides/[slug]/page.tsx
import { Metadata } from 'next'
import { wordpressAPI } from '@/lib/wordpress/api'

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const article = await wordpressAPI.fetchArticleBySlug(params.slug)
  
  if (!article) {
    return {
      title: 'ページが見つかりません | 盆栽コレクション'
    }
  }

  const url = `https://bonsai-collection.com/guides/${params.slug}`
  
  return {
    title: article.seo.title,
    description: article.seo.description,
    keywords: article.tags.map(tag => tag.name).join(', '),
    authors: [{ name: article.author.name }],
    
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.modified,
      authors: [article.author.name],
      images: [
        {
          url: article.featuredImage.url,
          width: article.featuredImage.width,
          height: article.featuredImage.height,
          alt: article.featuredImage.alt,
        }
      ],
      url,
    },
    
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.featuredImage.url],
    },
    
    alternates: {
      canonical: url,
    },
    
    other: {
      'article:published_time': article.date,
      'article:modified_time': article.modified,
      'article:author': article.author.name,
      'article:section': article.categories[0]?.name || '盆栽ガイド',
      'article:tag': article.tags.map(tag => tag.name).join(','),
    },
  }
}
```

### 6.2 構造化データ

```typescript
// components/seo/StructuredData.tsx
import { Article } from '@/types/wordpress'

interface StructuredDataProps {
  article: Article
}

export function StructuredData({ article }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: {
      '@type': 'ImageObject',
      url: article.featuredImage.url,
      width: article.featuredImage.width,
      height: article.featuredImage.height,
    },
    datePublished: article.date,
    dateModified: article.modified,
    author: {
      '@type': 'Person',
      name: article.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: '盆栽コレクション',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bonsai-collection.com/logo.png',
        width: 240,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.seo.canonical,
    },
    keywords: article.tags.map(tag => tag.name).join(', '),
    articleSection: article.categories.map(cat => cat.name),
    wordCount: article.content.length,
    timeRequired: `PT${article.readingTime}M`,
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
```

## 7. パフォーマンス最適化

### 7.1 画像最適化

```typescript
// components/ui/OptimizedImage.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  sizes?: string
  className?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {error ? (
        <div className="flex items-center justify-center bg-gray-200 w-full h-full">
          <span className="text-gray-500">画像を読み込めませんでした</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => setError(true)}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+kHl+8XW+IlqZhZgW9IZGn0deTaMx4+9/K2aNqJlqAJGDEhUn1rD6cKZuC8OOWu5fDdNsaLWrQkdLOPJHzpGbEzfaS2OKMY0xtwj3DKMS/FrSCU0k9Z3R8/DlGb6hjL4Jz8/qDlOx9PHxQGE8+2cEjFPhNZUdXuVslNABJ4vCKB8RIGKe5t7gOTQJ"
        />
      )}
    </div>
  )
}
```

### 7.2 コード分割と遅延読み込み

```typescript
// components/features/guides/ArticleDetail.tsx
import { lazy, Suspense } from 'react'

// 重いコンポーネントを遅延読み込み
const TableOfContents = lazy(() => import('./TableOfContents'))
const RelatedProducts = lazy(() => import('./RelatedProducts'))
const ShareButtons = lazy(() => import('./ShareButtons'))

export function ArticleDetail({ article }: { article: Article }) {
  return (
    <article className="article-detail">
      <header>
        <h1>{article.title}</h1>
        <meta property="article:published_time" content={article.date} />
      </header>

      <div className="article-content">
        <Suspense fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
          <TableOfContents content={article.content} />
        </Suspense>

        <div dangerouslySetInnerHTML={{ __html: article.content }} />

        <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
          <RelatedProducts article={article} />
        </Suspense>

        <Suspense fallback={<div className="h-16 bg-gray-100 rounded animate-pulse" />}>
          <ShareButtons article={article} />
        </Suspense>
      </div>
    </article>
  )
}
```

## 8. エラーハンドリング

### 8.1 グローバルエラーハンドリング

```typescript
// app/guides/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Guides page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          記事の読み込みに失敗しました
        </h2>
        <p className="text-gray-600 mb-6">
          一時的な問題が発生している可能性があります。
        </p>
        <div className="space-x-4">
          <Button onClick={() => reset()}>
            再試行
          </Button>
          <Button variant="outline" href="/guides">
            記事一覧に戻る
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 8.2 API エラーハンドリング

```typescript
// lib/utils/errorHandler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown, endpoint: string): never {
  if (error instanceof Response) {
    throw new APIError(
      `API request failed: ${error.statusText}`,
      error.status,
      endpoint
    )
  }
  
  if (error instanceof Error) {
    throw new APIError(
      `Network error: ${error.message}`,
      0,
      endpoint
    )
  }
  
  throw new APIError(
    'Unknown error occurred',
    0,
    endpoint
  )
}
```

---

**文書情報**
- バージョン: 1.0
- 作成日: 2024年
- 最終更新日: 2024年
- 次回レビュー予定: 実装開始時