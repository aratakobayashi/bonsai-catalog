import type { Product, Article } from '@/types'

export interface BreadcrumbItem {
  name: string
  url: string
  position: number
}

// パンくずリストのベースURL
const baseUrl = 'https://www.bonsai-collection.com'

// 商品ページのパンくずリスト生成
export function generateProductBreadcrumbs(product: Product): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'ホーム',
      url: baseUrl,
      position: 1
    },
    {
      name: '商品一覧',
      url: `${baseUrl}/products`,
      position: 2
    }
  ]

  // カテゴリがある場合は追加
  if (product.category) {
    breadcrumbs.push({
      name: product.category,
      url: `${baseUrl}/products?category=${encodeURIComponent(product.category)}`,
      position: 3
    })
  }

  // 商品名を追加
  breadcrumbs.push({
    name: product.name,
    url: `${baseUrl}/products/${product.id}`,
    position: breadcrumbs.length + 1
  })

  return breadcrumbs
}

// 記事ページのパンくずリスト生成
export function generateArticleBreadcrumbs(article: Article): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'ホーム',
      url: baseUrl,
      position: 1
    },
    {
      name: 'ガイド',
      url: `${baseUrl}/guides`,
      position: 2
    }
  ]

  // カテゴリがある場合は追加
  if (article.category?.name) {
    breadcrumbs.push({
      name: article.category.name,
      url: `${baseUrl}/guides?category=${encodeURIComponent(article.category.slug)}`,
      position: 3
    })
  }

  // 記事タイトルを追加
  breadcrumbs.push({
    name: article.title,
    url: `${baseUrl}/guides/${article.slug}`,
    position: breadcrumbs.length + 1
  })

  return breadcrumbs
}

// 盆栽園ページのパンくずリスト生成
export function generateGardenBreadcrumbs(gardenName: string, gardenId: string): BreadcrumbItem[] {
  return [
    {
      name: 'ホーム',
      url: baseUrl,
      position: 1
    },
    {
      name: '盆栽園',
      url: `${baseUrl}/gardens`,
      position: 2
    },
    {
      name: gardenName,
      url: `${baseUrl}/gardens/${gardenId}`,
      position: 3
    }
  ]
}

// 静的ページのパンくずリスト生成
export function generateStaticPageBreadcrumbs(pageName: string, pageUrl: string): BreadcrumbItem[] {
  return [
    {
      name: 'ホーム',
      url: baseUrl,
      position: 1
    },
    {
      name: pageName,
      url: pageUrl,
      position: 2
    }
  ]
}

// カテゴリ一覧ページのパンくずリスト生成
export function generateCategoryBreadcrumbs(
  type: 'products' | 'guides',
  categoryName?: string,
  categorySlug?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'ホーム',
      url: baseUrl,
      position: 1
    },
    {
      name: type === 'products' ? '商品一覧' : 'ガイド',
      url: `${baseUrl}/${type}`,
      position: 2
    }
  ]

  // カテゴリがある場合は追加
  if (categoryName && categorySlug) {
    breadcrumbs.push({
      name: categoryName,
      url: `${baseUrl}/${type}?category=${encodeURIComponent(categorySlug)}`,
      position: 3
    })
  }

  return breadcrumbs
}

// パンくずリストの妥当性チェック
export function validateBreadcrumbs(breadcrumbs: BreadcrumbItem[]): boolean {
  // 最低限の要件チェック
  if (breadcrumbs.length < 2) return false

  // position の連続性チェック
  for (let i = 0; i < breadcrumbs.length; i++) {
    if (breadcrumbs[i].position !== i + 1) return false
  }

  // URL の妥当性チェック
  return breadcrumbs.every(item =>
    item.url.startsWith('http') && item.name.trim().length > 0
  )
}

// URL からパンくずリストを自動生成（フォールバック用）
export function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'ホーム',
      url: baseUrl,
      position: 1
    }
  ]

  let currentPath = baseUrl

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // セグメント名をユーザーフレンドリーに変換
    let segmentName = segment
    switch (segment) {
      case 'products':
        segmentName = '商品一覧'
        break
      case 'guides':
        segmentName = 'ガイド'
        break
      case 'gardens':
        segmentName = '盆栽園'
        break
      case 'contact':
        segmentName = 'お問い合わせ'
        break
      case 'privacy':
        segmentName = 'プライバシーポリシー'
        break
      case 'terms':
        segmentName = '利用規約'
        break
      default:
        // IDやスラッグの場合はそのまま（実際のページで上書きされる）
        segmentName = decodeURIComponent(segment)
    }

    breadcrumbs.push({
      name: segmentName,
      url: currentPath,
      position: index + 2
    })
  })

  return breadcrumbs
}