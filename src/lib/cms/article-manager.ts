import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Article, ArticleCategory } from '@/types'

const CONTENT_DIR = path.join(process.cwd(), 'src/content/guides')

export interface InternalArticle {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featuredImage?: string
  publishedAt: string
  updatedAt: string
  readingTime: number
  relatedProducts?: string[]
  seoTitle?: string
  seoDescription?: string
}

// 記事ファイルの存在確認とディレクトリ作成
async function ensureContentDir() {
  try {
    await fs.access(CONTENT_DIR)
  } catch {
    await fs.mkdir(CONTENT_DIR, { recursive: true })
  }
}

// 記事一覧取得
export async function getInternalArticles(): Promise<InternalArticle[]> {
  await ensureContentDir()
  
  try {
    const files = await fs.readdir(CONTENT_DIR)
    const markdownFiles = files.filter(file => file.endsWith('.md'))
    
    const articles = await Promise.all(
      markdownFiles.map(async (file) => {
        const filePath = path.join(CONTENT_DIR, file)
        const fileContent = await fs.readFile(filePath, 'utf8')
        const { data: frontMatter, content } = matter(fileContent)
        
        return {
          slug: file.replace('.md', ''),
          title: frontMatter.title || 'タイトルなし',
          excerpt: frontMatter.excerpt || content.slice(0, 100) + '...',
          content,
          category: frontMatter.category || 'uncategorized',
          tags: frontMatter.tags || [],
          featuredImage: frontMatter.featuredImage,
          publishedAt: frontMatter.publishedAt || new Date().toISOString(),
          updatedAt: frontMatter.updatedAt || new Date().toISOString(),
          readingTime: frontMatter.readingTime || estimateReadingTime(content),
          relatedProducts: frontMatter.relatedProducts,
          seoTitle: frontMatter.seoTitle,
          seoDescription: frontMatter.seoDescription,
        } as InternalArticle
      })
    )
    
    // 更新日時でソート
    return articles.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  } catch (error) {
    console.error('記事取得エラー:', error)
    return []
  }
}

// 特定記事取得
export async function getInternalArticleBySlug(slug: string): Promise<InternalArticle | null> {
  await ensureContentDir()
  
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.md`)
    const fileContent = await fs.readFile(filePath, 'utf8')
    const { data: frontMatter, content } = matter(fileContent)
    
    return {
      slug,
      title: frontMatter.title || 'タイトルなし',
      excerpt: frontMatter.excerpt || content.slice(0, 100) + '...',
      content,
      category: frontMatter.category || 'uncategorized',
      tags: frontMatter.tags || [],
      featuredImage: frontMatter.featuredImage,
      publishedAt: frontMatter.publishedAt || new Date().toISOString(),
      updatedAt: frontMatter.updatedAt || new Date().toISOString(),
      readingTime: frontMatter.readingTime || estimateReadingTime(content),
      relatedProducts: frontMatter.relatedProducts,
      seoTitle: frontMatter.seoTitle,
      seoDescription: frontMatter.seoDescription,
    }
  } catch (error) {
    console.error(`記事取得エラー (${slug}):`, error)
    return null
  }
}

// 記事保存
export async function saveInternalArticle(article: Omit<InternalArticle, 'updatedAt'>): Promise<void> {
  await ensureContentDir()
  
  const frontMatter: Record<string, any> = {
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    tags: article.tags,
    featuredImage: article.featuredImage,
    publishedAt: article.publishedAt,
    updatedAt: new Date().toISOString(),
    readingTime: article.readingTime,
    relatedProducts: article.relatedProducts,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
  }
  
  // undefined値を除外
  Object.keys(frontMatter).forEach(key => {
    if (frontMatter[key] === undefined) {
      delete frontMatter[key]
    }
  })
  
  const markdownContent = matter.stringify(article.content, frontMatter)
  const filePath = path.join(CONTENT_DIR, `${article.slug}.md`)
  
  await fs.writeFile(filePath, markdownContent, 'utf8')
}

// 記事削除
export async function deleteInternalArticle(slug: string): Promise<void> {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`)
  await fs.unlink(filePath)
}

// 読了時間計算（日本語対応）
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 400 // 日本語の平均読解速度
  const wordCount = content.length
  return Math.ceil(wordCount / wordsPerMinute)
}

// カテゴリー一覧取得（固定リスト）
export function getAvailableCategories(): ArticleCategory[] {
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

// よく使用されるタグ一覧
export function getCommonTags(): string[] {
  return [
    'beginner', 'intermediate', 'advanced',
    'momiji', 'pine', 'sakura', 'bamboo',
    'spring', 'summer', 'autumn', 'winter',
    'watering', 'pruning', 'repotting', 'fertilizer',
    'tools', 'pots', 'styling', 'maintenance'
  ]
}