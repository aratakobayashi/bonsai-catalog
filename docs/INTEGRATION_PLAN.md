# 盆栽サイト統合プロジェクト - 詳細計画書

## 📋 プロジェクト概要

### 現状
- **bonsai-collection（Next.js）**: 商品カタログサイト（12商品登録済み）
- **bonsai-guidebook.net（WordPress）**: 盆栽に関するメディアサイト

### 統合後の目標
- SEO効果最大化のため、両サイトを一つのドメインに統合
- 記事→商品への導線構築でコンバージョン向上
- 運営効率化（一元管理）

## 🎯 技術仕様

### アーキテクチャ設計

```
統合後のサイト構成:
新ドメイン (独自ドメイン取得予定)
├── / (トップページ)
│   ├── 商品カテゴリ
│   ├── おすすめ商品
│   ├── 最新記事
│   └── 盆栽園情報
├── /products (商品関連)
│   ├── /products (一覧)
│   └── /products/[id] (詳細)
├── /guides (記事関連) ← NEW!
│   ├── /guides (一覧)
│   ├── /guides/category/[category] (カテゴリ別)
│   ├── /guides/tag/[tag] (タグ別)
│   └── /guides/[slug] (記事詳細)
└── /gardens (盆栽園)
    ├── /gardens (一覧)
    └── /gardens/[id] (詳細)
```

### データフロー

```
記事管理:
WordPress (bonsai-guidebook.net) → REST API → Next.js (統合サイト)

商品管理:
Supabase PostgreSQL → Next.js

記事→商品連携:
記事内タグ・カテゴリ → 関連商品自動表示
```

## 📱 UI/UX設計

### 記事一覧ページ (`/guides`)

```typescript
interface GuideListPage {
  filters: {
    category: string[]     // 育て方、選び方、知識
    tags: string[]         // 初心者、室内、松柏類等
    search: string         // キーワード検索
    sortBy: 'date' | 'popularity' | 'title'
  }
  
  articles: ArticleCard[] // 記事カード一覧
  pagination: Pagination  // ページネーション
  sidebar: {
    categories: Category[]
    tags: Tag[]
    popularArticles: Article[]
  }
}
```

### 記事詳細ページ (`/guides/[slug]`)

```typescript
interface GuideDetailPage {
  article: {
    title: string
    content: string        // WordPress HTML
    category: string
    tags: string[]
    publishedAt: Date
    featuredImage: string
    readingTime: number
  }
  
  relatedProducts: Product[]  // 記事タグに基づく関連商品
  relatedArticles: Article[]  // 関連記事
  shareButtons: SocialShare[]
  breadcrumbs: Breadcrumb[]
}
```

## 🔗 WordPress API連携

### 記事取得

```typescript
// 記事一覧取得
const getArticles = async (params: {
  category?: string
  tags?: string[]
  search?: string
  page?: number
  limit?: number
}) => {
  const queryParams = new URLSearchParams({
    per_page: params.limit?.toString() || '12',
    page: params.page?.toString() || '1',
    ...(params.category && { categories: params.category }),
    ...(params.tags && { tags: params.tags.join(',') }),
    ...(params.search && { search: params.search }),
  })
  
  const response = await fetch(
    `https://bonsai-guidebook.net/wp-json/wp/v2/posts?${queryParams}`
  )
  return response.json()
}

// 記事詳細取得
const getArticleBySlug = async (slug: string) => {
  const response = await fetch(
    `https://bonsai-guidebook.net/wp-json/wp/v2/posts?slug=${slug}&_embed`
  )
  const [article] = await response.json()
  return article
}
```

### カテゴリ・タグ取得

```typescript
// カテゴリ一覧
const getCategories = async () => {
  const response = await fetch(
    'https://bonsai-guidebook.net/wp-json/wp/v2/categories'
  )
  return response.json()
}

// タグ一覧  
const getTags = async () => {
  const response = await fetch(
    'https://bonsai-guidebook.net/wp-json/wp/v2/tags'
  )
  return response.json()
}
```

## 🎨 記事→商品連携ロジック

### 関連商品の自動表示

```typescript
const getRelatedProducts = (article: Article, products: Product[]) => {
  const articleTags = article.tags.map(tag => tag.name.toLowerCase())
  
  // タグベースの関連商品検索
  const tagMatches = products.filter(product => {
    const productTags = product.tags.map(tag => tag.toLowerCase())
    return productTags.some(tag => articleTags.includes(tag))
  })
  
  // カテゴリベースの関連商品検索
  const categoryMatches = products.filter(product => {
    if (article.category.name === '育て方' && articleTags.includes('松柏類')) {
      return product.category === '松柏類'
    }
    if (article.category.name === '選び方' && articleTags.includes('初心者')) {
      return product.beginner_friendly === true
    }
    return false
  })
  
  // 重複除去・優先度順ソート
  const relatedProducts = [...new Set([...tagMatches, ...categoryMatches])]
    .slice(0, 4)
  
  return relatedProducts
}
```

## 📊 SEO戦略

### URL構造

```
記事URL例:
/guides/how-to-water-bonsai
/guides/category/care-guide
/guides/tag/beginner

商品URL例:  
/products/五葉松-初心者向け-abc123
/products/category/松柏類

盆栽園URL例:
/gardens/東京-有名盆栽園-xyz456
```

### メタデータ設定

```typescript
// 記事詳細ページのメタデータ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)
  
  return {
    title: `${article.title} | 盆栽コレクション`,
    description: article.excerpt || article.title,
    keywords: article.tags.map(tag => tag.name).join(', '),
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.featured_image }],
      type: 'article',
      publishedTime: article.published_at,
      authors: ['盆栽コレクション'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.featured_image],
    },
    alternates: {
      canonical: `https://new-domain.com/guides/${params.slug}`,
    }
  }
}
```

## 🛠️ 実装順序

### Phase 1: 基盤構築
1. **WordPress API接続テスト**
   ```bash
   curl "https://bonsai-guidebook.net/wp-json/wp/v2/posts?per_page=1"
   ```

2. **Next.js記事ページルーティング作成**
   ```typescript
   // app/guides/page.tsx (記事一覧)
   // app/guides/[slug]/page.tsx (記事詳細)
   ```

3. **基本的なデータ取得・表示機能**

### Phase 2: 機能拡充
1. **検索・フィルタ機能**
2. **記事→商品連携**
3. **パフォーマンス最適化**

### Phase 3: 移行・最適化
1. **301リダイレクト設定**
2. **sitemap.xml統合**
3. **SEO最適化**

## 📈 成功指標（KPI）

### SEO指標
- 月間オーガニック流入数: +200%目標
- 検索順位向上: 主要キーワードTop10入り
- ページ滞在時間: +50%目標

### ビジネス指標  
- 記事経由の商品購入率: 5%目標
- 月間商品購入数: +300%目標
- リピートユーザー率: +100%目標

## 🔄 運用フロー

### 記事作成フロー（統合後）
1. **WordPress管理画面**でログイン（bonsai-guidebook.net）
2. 記事作成・編集（従来通り）
3. カテゴリ・タグ設定
4. 公開ボタン押下
5. **自動で統合サイト**（/guides）に反映
6. **関連商品も自動表示**

### 商品追加フロー
1. 商品データ準備（CSV/手動）
2. データベース登録スクリプト実行
3. 自動で商品ページに反映
4. 関連記事からの自動リンク生成

---

このドキュメントは統合プロジェクトの進捗に応じて随時更新されます。