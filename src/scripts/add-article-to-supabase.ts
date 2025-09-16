import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { v4 as uuidv4 } from 'uuid'

// 環境変数を読み込み
config({ path: '.env.local' })

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function addArticleToSupabase() {
  console.log('🚀 Supabaseに記事を追加します...')

  try {
    // Markdownファイルを読み込み
    const filePath = join(process.cwd(), 'public/content/guides/beginner-tree-species-guide.md')
    const fileContent = readFileSync(filePath, 'utf8')

    // Front matterを解析
    const { data: frontMatter, content } = matter(fileContent)

    console.log('📄 記事データ:', {
      title: frontMatter.title,
      slug: 'beginner-tree-species-guide',
      category: frontMatter.category
    })

    // カテゴリーIDを取得または作成
    let categoryId = 'start-guide' // デフォルト
    if (frontMatter.category) {
      const { data: categories, error: categoryError } = await supabase
        .from('article_categories')
        .select('id')
        .eq('slug', frontMatter.category)
        .single()

      if (categoryError && categoryError.code === 'PGRST116') {
        // カテゴリーが存在しない場合は作成
        const { data: newCategory, error: createError } = await supabase
          .from('article_categories')
          .insert({
            id: uuidv4(),
            name: getCategoryName(frontMatter.category),
            slug: frontMatter.category,
            description: `${getCategoryName(frontMatter.category)}に関する記事`,
            color: getCategoryColor(frontMatter.category),
            icon: getCategoryIcon(frontMatter.category)
          })
          .select('id')
          .single()

        if (createError) {
          console.error('❌ カテゴリー作成エラー:', createError)
        } else {
          categoryId = newCategory.id
          console.log('✅ カテゴリーを作成しました:', frontMatter.category)
        }
      } else if (!categoryError) {
        categoryId = categories.id
      }
    }

    // タグを処理
    const tagIds: string[] = []
    if (frontMatter.tags && Array.isArray(frontMatter.tags)) {
      for (const tagName of frontMatter.tags) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

        // タグを取得または作成
        const { data: existingTag, error: tagError } = await supabase
          .from('article_tags')
          .select('id')
          .eq('slug', tagSlug)
          .single()

        if (tagError && tagError.code === 'PGRST116') {
          // タグが存在しない場合は作成
          const { data: newTag, error: createTagError } = await supabase
            .from('article_tags')
            .insert({
              id: uuidv4(),
              name: tagName,
              slug: tagSlug,
              color: getTagColor()
            })
            .select('id')
            .single()

          if (createTagError) {
            console.error('❌ タグ作成エラー:', createTagError)
          } else {
            tagIds.push(newTag.id)
            console.log('✅ タグを作成しました:', tagName)
          }
        } else if (!tagError) {
          tagIds.push(existingTag.id)
        }
      }
    }

    // 記事をデータベースに挿入
    const articleData = {
      id: uuidv4(),
      title: frontMatter.title,
      slug: 'beginner-tree-species-guide',
      content: content,
      excerpt: frontMatter.excerpt,
      featured_image_url: frontMatter.featuredImage || '',
      featured_image_alt: frontMatter.title,
      category_id: categoryId,
      tag_ids: tagIds,
      related_product_ids: frontMatter.relatedProducts || [],
      seo_title: frontMatter.seoTitle || frontMatter.title,
      seo_description: frontMatter.seoDescription || frontMatter.excerpt,
      reading_time: frontMatter.readingTime || 8,
      published_at: frontMatter.publishedAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'published' as const
    }

    const { data, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()

    if (error) {
      console.error('❌ 記事挿入エラー:', error)
      return
    }

    console.log('✅ 記事をSupabaseに追加しました!')
    console.log(`🔗 記事URL: http://localhost:3000/guides/beginner-tree-species-guide`)

  } catch (error) {
    console.error('🚫 エラーが発生しました:', error)
  }
}

// ヘルパー関数
function getCategoryName(slug: string): string {
  const categoryNames: Record<string, string> = {
    'start-guide': 'はじめての盆栽',
    'care-bonsai': '盆栽の育て方',
    'kinds': '樹種について',
    'info': '盆栽の基礎知識',
    'select': '盆栽の選び方'
  }
  return categoryNames[slug] || 'その他'
}

function getCategoryColor(slug: string): string {
  const categoryColors: Record<string, string> = {
    'start-guide': 'bg-green-100 text-green-800',
    'care-bonsai': 'bg-blue-100 text-blue-800',
    'kinds': 'bg-purple-100 text-purple-800',
    'info': 'bg-orange-100 text-orange-800',
    'select': 'bg-pink-100 text-pink-800'
  }
  return categoryColors[slug] || 'bg-gray-100 text-gray-800'
}

function getCategoryIcon(slug: string): string {
  const categoryIcons: Record<string, string> = {
    'start-guide': '🌱',
    'care-bonsai': '🌿',
    'kinds': '🌲',
    'info': '📚',
    'select': '🎯'
  }
  return categoryIcons[slug] || '📄'
}

function getTagColor(): string {
  const colors = [
    'bg-blue-50 text-blue-600 border-blue-200',
    'bg-green-50 text-green-600 border-green-200',
    'bg-purple-50 text-purple-600 border-purple-200',
    'bg-orange-50 text-orange-600 border-orange-200',
    'bg-pink-50 text-pink-600 border-pink-200'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// スクリプト実行
if (require.main === module) {
  addArticleToSupabase()
}

export { addArticleToSupabase }