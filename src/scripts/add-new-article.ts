import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, basename } from 'path'
import matter from 'gray-matter'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// カテゴリー名を取得
function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    'start-guide': '初心者向け',
    'care-guide': 'お手入れ・管理',
    'species-guide': '樹種別ガイド',
    'techniques': 'テクニック',
    '初心者向け': '初心者向け',
    'お手入れ・管理': 'お手入れ・管理',
  }
  return categoryMap[category] || category
}

// カテゴリーの色を取得
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'start-guide': '#10B981', // emerald-500
    'care-guide': '#3B82F6', // blue-500
    'species-guide': '#F97316', // orange-500
    'techniques': '#8B5CF6', // violet-500
    '初心者向け': '#10B981',
    'お手入れ・管理': '#3B82F6',
  }
  return colorMap[category] || '#6B7280' // gray-500
}

// カテゴリーのアイコンを取得
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'start-guide': '🌱',
    'care-guide': '💧',
    'species-guide': '🌲',
    'techniques': '✂️',
    '初心者向け': '🌱',
    'お手入れ・管理': '💧',
  }
  return iconMap[category] || '📝'
}

// タグの色をランダムに取得
function getTagColor(): string {
  const colors = [
    '#EF4444', // red-500
    '#F59E0B', // amber-500
    '#10B981', // emerald-500
    '#3B82F6', // blue-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// カテゴリースラッグを正規化
function normalizeCategorySlug(category: string): string {
  const slugMap: Record<string, string> = {
    '初心者向け': 'start-guide',
    'お手入れ・管理': 'care-guide',
    '樹種別ガイド': 'species-guide',
    'テクニック': 'techniques',
  }
  return slugMap[category] || category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

async function addArticleToSupabase(filePath: string) {
  console.log('🚀 Supabaseに記事を追加します...')
  console.log('📄 ファイル:', filePath)

  try {
    // Markdownファイルを読み込み
    const fullPath = join(process.cwd(), filePath)
    const fileContent = readFileSync(fullPath, 'utf8')

    // Front matterを解析
    const { data: frontMatter, content } = matter(fileContent)

    // slugを取得（ファイル名またはfront matterから）
    const slug = frontMatter.slug || basename(filePath, '.md')

    console.log('📄 記事データ:', {
      title: frontMatter.title,
      slug: slug,
      category: frontMatter.category
    })

    // カテゴリーIDを取得または作成
    let categoryId = 'start-guide' // デフォルト
    if (frontMatter.category) {
      const categorySlug = normalizeCategorySlug(frontMatter.category)

      const { data: categories, error: categoryError } = await supabase
        .from('article_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (categoryError && categoryError.code === 'PGRST116') {
        // カテゴリーが存在しない場合は作成
        const { data: newCategory, error: createError } = await supabase
          .from('article_categories')
          .insert({
            id: uuidv4(),
            name: getCategoryName(frontMatter.category),
            slug: categorySlug,
            description: `${getCategoryName(frontMatter.category)}に関する記事`,
            color: getCategoryColor(categorySlug),
            icon: getCategoryIcon(categorySlug)
          })
          .select('id')
          .single()

        if (createError) {
          console.error('❌ カテゴリー作成エラー:', createError)
        } else {
          categoryId = newCategory.id
          console.log('✅ カテゴリーを作成しました:', categorySlug)
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
      slug: slug,
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
    console.log(`🔗 記事URL: https://bonsai-catalog.vercel.app/guides/${slug}`)

  } catch (error) {
    console.error('🚫 エラーが発生しました:', error)
  }
}

// コマンドライン引数から記事ファイルを取得
const articleFile = process.argv[2]

if (!articleFile) {
  console.error('❌ 記事ファイルを指定してください')
  console.log('使用方法: npx tsx src/scripts/add-new-article.ts <ファイルパス>')
  process.exit(1)
}

// 実行
addArticleToSupabase(articleFile)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })