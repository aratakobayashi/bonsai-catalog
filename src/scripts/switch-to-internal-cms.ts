// フロントエンドを内製CMSに切り替えるスクリプト

import { promises as fs } from 'fs'
import path from 'path'

const MICROCMS_FILE = path.join(process.cwd(), 'src/lib/microcms.ts')
const BACKUP_FILE = path.join(process.cwd(), 'src/lib/microcms-wordpress-backup.ts')

async function switchToInternalCMS() {
  console.log('🔄 フロントエンドを内製CMSに切り替えます...')
  
  try {
    // 1. 現在のmicrocms.tsをバックアップ
    console.log('📦 WordPressバージョンをバックアップ中...')
    const currentContent = await fs.readFile(MICROCMS_FILE, 'utf8')
    await fs.writeFile(BACKUP_FILE, currentContent, 'utf8')
    console.log('✅ バックアップ完了')

    // 2. 内製CMS用のmicrocms.tsを作成
    console.log('🔧 内製CMS対応版を作成中...')
    
    const internalCMSContent = `// 内製CMS対応版 - ファイルベースの記事管理
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Article, ArticleCategory, Tag } from '@/types'

const CONTENT_DIR = path.join(process.cwd(), 'src/content/guides')

export interface GetArticlesResponse {
  articles: Article[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface GetArticlesParams {
  category?: string
  tags?: string[]
  search?: string
  page?: number
  limit?: number
}

// 記事一覧取得
export async function getArticles(filters: GetArticlesParams = {}): Promise<GetArticlesResponse> {
  console.log('🔍 getArticles called with filters:', filters)
  
  try {
    // ディレクトリの存在確認
    try {
      await fs.access(CONTENT_DIR)
    } catch {
      console.log('📁 Content directory not found, returning empty result')
      return {
        articles: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    }

    const files = await fs.readdir(CONTENT_DIR)
    const markdownFiles = files.filter(file => file.endsWith('.md'))
    
    // 全記事を読み込み
    const allArticles = await Promise.all(
      markdownFiles.map(async (file) => {
        const filePath = path.join(CONTENT_DIR, file)
        const fileContent = await fs.readFile(filePath, 'utf8')
        const { data: frontMatter, content } = matter(fileContent)
        
        return {
          id: frontMatter.slug || file.replace('.md', ''),
          slug: frontMatter.slug || file.replace('.md', ''),
          title: frontMatter.title || 'タイトルなし',
          content,
          excerpt: frontMatter.excerpt || content.slice(0, 150) + '...',
          featuredImage: frontMatter.featuredImage ? {
            url: frontMatter.featuredImage,
            alt: frontMatter.title || 'タイトルなし',
            width: 1200,
            height: 630
          } : undefined,
          category: {
            id: frontMatter.category || 'care-bonsai',
            name: getCategoryName(frontMatter.category || 'care-bonsai'),
            slug: frontMatter.category || 'care-bonsai',
            color: getCategoryColor(frontMatter.category || 'care-bonsai'),
            icon: getCategoryIcon(frontMatter.category || 'care-bonsai')
          },
          tags: (frontMatter.tags || []).map((tag: string) => ({
            id: tag,
            name: tag,
            slug: tag
          })),
          seoTitle: frontMatter.seoTitle || frontMatter.title || 'タイトルなし',
          seoDescription: frontMatter.seoDescription || frontMatter.excerpt || content.slice(0, 150) + '...',
          readingTime: frontMatter.readingTime || estimateReadingTime(content),
          publishedAt: frontMatter.publishedAt || new Date().toISOString(),
          updatedAt: frontMatter.updatedAt || new Date().toISOString(),
          status: 'published' as const
        } as Article
      })
    )

    // フィルタリング
    let filteredArticles = allArticles

    // カテゴリーフィルター
    if (filters.category) {
      filteredArticles = filteredArticles.filter(article => 
        article.category.slug === filters.category
      )
    }

    // タグフィルター
    if (filters.tags && filters.tags.length > 0) {
      filteredArticles = filteredArticles.filter(article =>
        filters.tags!.some(tag => 
          article.tags.some(articleTag => articleTag.slug === tag)
        )
      )
    }

    // 検索フィルター
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.excerpt.toLowerCase().includes(searchTerm)
      )
    }

    // 日付順でソート（新しい順）
    filteredArticles.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    // ページネーション
    const page = filters.page || 1
    const limit = filters.limit || 12
    const totalCount = filteredArticles.length
    const totalPages = Math.ceil(totalCount / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

    console.log(\`📝 \${paginatedArticles.length}件の記事を返却 (全\${totalCount}件中)\`)

    return {
      articles: paginatedArticles,
      totalCount,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }

  } catch (error) {
    console.error('❌ 記事取得エラー:', error)
    return {
      articles: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
  }
}

// 特定記事取得
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const filePath = path.join(CONTENT_DIR, \`\${decodeURIComponent(slug)}.md\`)
    const fileContent = await fs.readFile(filePath, 'utf8')
    const { data: frontMatter, content } = matter(fileContent)
    
    return {
      id: frontMatter.slug || slug,
      slug: frontMatter.slug || slug,
      title: frontMatter.title || 'タイトルなし',
      content,
      excerpt: frontMatter.excerpt || content.slice(0, 150) + '...',
      featuredImage: frontMatter.featuredImage ? {
        url: frontMatter.featuredImage,
        alt: frontMatter.title || 'タイトルなし',
        width: 1200,
        height: 630
      } : undefined,
      category: {
        id: frontMatter.category || 'care-bonsai',
        name: getCategoryName(frontMatter.category || 'care-bonsai'),
        slug: frontMatter.category || 'care-bonsai',
        color: getCategoryColor(frontMatter.category || 'care-bonsai'),
        icon: getCategoryIcon(frontMatter.category || 'care-bonsai')
      },
      tags: (frontMatter.tags || []).map((tag: string) => ({
        id: tag,
        name: tag,
        slug: tag
      })),
      seoTitle: frontMatter.seoTitle || frontMatter.title || 'タイトルなし',
      seoDescription: frontMatter.seoDescription || frontMatter.excerpt || content.slice(0, 150) + '...',
      readingTime: frontMatter.readingTime || estimateReadingTime(content),
      publishedAt: frontMatter.publishedAt || new Date().toISOString(),
      updatedAt: frontMatter.updatedAt || new Date().toISOString(),
      status: 'published'
    }
  } catch (error) {
    console.error(\`❌ 記事取得エラー (\${slug}):\`, error)
    return null
  }
}

// カテゴリー一覧取得
export async function getCategories(): Promise<ArticleCategory[]> {
  return [
    {
      id: 'care-bonsai',
      name: 'お手入れ・管理',
      slug: 'care-bonsai',
      description: '盆栽の日常管理、水やり、剪定等の育て方ガイド',
      color: 'bg-green-100 text-green-800',
      icon: '🌱'
    },
    {
      id: 'start-guide',
      name: 'はじめての盆栽',
      slug: 'start-guide',
      description: '初心者向けの樹種選びや購入のポイント',
      color: 'bg-blue-100 text-blue-800',
      icon: '🎯'
    },
    {
      id: 'kinds',
      name: '種類別ガイド',
      slug: 'kinds',
      description: '松柏類、雑木類、花もの等の種類別詳細ガイド',
      color: 'bg-emerald-100 text-emerald-800',
      icon: '🌲'
    },
    {
      id: 'info',
      name: 'イベント・展示',
      slug: 'info',
      description: '盆栽展示会やイベント情報',
      color: 'bg-purple-100 text-purple-800',
      icon: '🎪'
    },
    {
      id: 'select',
      name: '道具・鉢の選び方',
      slug: 'select',
      description: '盆栽道具や鉢の選び方ガイド',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '🛠️'
    }
  ]
}

// タグ一覧取得
export async function getTags(): Promise<Tag[]> {
  try {
    const files = await fs.readdir(CONTENT_DIR)
    const markdownFiles = files.filter(file => file.endsWith('.md'))
    
    const allTags = new Set<string>()
    
    for (const file of markdownFiles) {
      const filePath = path.join(CONTENT_DIR, file)
      const fileContent = await fs.readFile(filePath, 'utf8')
      const { data: frontMatter } = matter(fileContent)
      
      if (frontMatter.tags && Array.isArray(frontMatter.tags)) {
        frontMatter.tags.forEach((tag: string) => allTags.add(tag))
      }
    }
    
    return Array.from(allTags).map(tag => ({
      id: tag,
      name: tag,
      slug: tag
    }))
  } catch (error) {
    console.error('❌ タグ取得エラー:', error)
    return []
  }
}

// ヘルパー関数
function getCategoryName(slug: string): string {
  const categoryMap: Record<string, string> = {
    'care-bonsai': 'お手入れ・管理',
    'start-guide': 'はじめての盆栽',
    'kinds': '種類別ガイド',
    'info': 'イベント・展示',
    'select': '道具・鉢の選び方'
  }
  return categoryMap[slug] || 'その他'
}

function getCategoryColor(slug: string): string {
  const colorMap: Record<string, string> = {
    'care-bonsai': 'bg-green-100 text-green-800',
    'start-guide': 'bg-blue-100 text-blue-800',
    'kinds': 'bg-emerald-100 text-emerald-800',
    'info': 'bg-purple-100 text-purple-800',
    'select': 'bg-yellow-100 text-yellow-800'
  }
  return colorMap[slug] || 'bg-gray-100 text-gray-800'
}

function getCategoryIcon(slug: string): string {
  const iconMap: Record<string, string> = {
    'care-bonsai': '🌱',
    'start-guide': '🎯',
    'kinds': '🌲',
    'info': '🎪',
    'select': '🛠️'
  }
  return iconMap[slug] || '📄'
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 400 // 日本語の平均読解速度
  const wordCount = content.length
  return Math.ceil(wordCount / wordsPerMinute)
}
`

    await fs.writeFile(MICROCMS_FILE, internalCMSContent, 'utf8')
    console.log('✅ 内製CMS対応版を作成完了')

    console.log('\n🎉 切り替え完了!')
    console.log('📝 変更内容:')
    console.log('  - フロントエンドが内製CMS（ファイルベース）から記事を取得')
    console.log('  - WordPressバージョンは microcms-wordpress-backup.ts に保存')
    console.log('  - 開発サーバーを再起動してください')

  } catch (error) {
    console.error('❌ 切り替えでエラーが発生しました:', error)
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  switchToInternalCMS()
}

export { switchToInternalCMS }