import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// 環境変数を読み込み
config({ path: '.env.local' })

// 環境変数を直接読み込んで確認
console.log('環境変数チェック:')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定')
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定済み' : '未設定')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const CONTENT_DIR = path.join(process.cwd(), 'public/content/guides')

// カテゴリーマッピング（日本語 → UUID）
const categoryMapping: Record<string, string> = {
  'care-bonsai': '11111111-1111-1111-1111-111111111111',
  'start-guide': '22222222-2222-2222-2222-222222222222',
  'kinds': '33333333-3333-3333-3333-333333333333',
  'info': '44444444-4444-4444-4444-444444444444',
  'select': '55555555-5555-5555-5555-555555555555'
}

// 日本語カテゴリー名からslugに変換
function getCategorySlug(categoryInput: string): string {
  const validSlugs = ['care-bonsai', 'start-guide', 'kinds', 'info', 'select']
  if (validSlugs.includes(categoryInput)) {
    return categoryInput
  }

  const nameToSlugMap: Record<string, string> = {
    'お手入れ・管理': 'care-bonsai',
    'はじめての盆栽': 'start-guide',
    '種類別ガイド': 'kinds',
    'イベント・展示': 'info',
    '道具・鉢の選び方': 'select',
    '盆栽の基礎知識': 'care-bonsai'
  }

  return nameToSlugMap[categoryInput] || 'care-bonsai'
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 400
  const wordCount = content.length
  return Math.ceil(wordCount / wordsPerMinute)
}

async function createTables() {
  console.log('🔧 データベーステーブルを作成中...')

  try {
    const sqlContent = await fs.readFile(
      path.join(process.cwd(), 'supabase/migrations/create_articles_tables.sql'),
      'utf8'
    )

    // SQLを実行（Supabaseでは複数のクエリを一度に実行できないため、分割）
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('実行中:', statement.substring(0, 50) + '...')
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.error('SQL実行エラー:', error)
        }
      }
    }

    console.log('✅ テーブル作成完了')
  } catch (error) {
    console.error('❌ テーブル作成エラー:', error)
  }
}

async function migrateArticles() {
  console.log('📝 既存記事をデータベースに移行中...')

  try {
    const files = await fs.readdir(CONTENT_DIR)
    const markdownFiles = files.filter(file => file.endsWith('.md'))

    console.log(`発見した記事: ${markdownFiles.length}件`)

    // 既存のタグをすべて取得
    const { data: existingTags } = await supabase
      .from('article_tags')
      .select('*')

    const tagMap = new Map()
    existingTags?.forEach(tag => {
      tagMap.set(tag.slug, tag.id)
    })

    for (const file of markdownFiles) {
      console.log(`処理中: ${file}`)

      const filePath = path.join(CONTENT_DIR, file)
      const fileContent = await fs.readFile(filePath, 'utf8')
      const { data: frontMatter, content } = matter(fileContent)

      const slug = frontMatter.slug || file.replace('.md', '')
      const categorySlug = getCategorySlug(frontMatter.category || 'care-bonsai')
      const categoryId = categoryMapping[categorySlug]

      if (!categoryId) {
        console.warn(`カテゴリーIDが見つかりません: ${categorySlug}`)
        continue
      }

      // タグIDsを取得/作成
      const tagIds: string[] = []
      if (frontMatter.tags && Array.isArray(frontMatter.tags)) {
        for (const tagName of frontMatter.tags) {
          const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-')

          if (tagMap.has(tagSlug)) {
            tagIds.push(tagMap.get(tagSlug))
          } else {
            // 新しいタグを作成
            const { data: newTag, error } = await supabase
              .from('article_tags')
              .insert({
                name: tagName,
                slug: tagSlug,
                color: 'bg-gray-50 text-gray-700'
              })
              .select()
              .single()

            if (newTag && !error) {
              tagMap.set(tagSlug, newTag.id)
              tagIds.push(newTag.id)
            }
          }
        }
      }

      // 記事をデータベースに挿入
      const articleData = {
        title: frontMatter.title || 'タイトルなし',
        slug,
        content,
        excerpt: frontMatter.excerpt || content.slice(0, 150) + '...',
        featured_image_url: frontMatter.featuredImage,
        featured_image_alt: frontMatter.title || 'タイトルなし',
        category_id: categoryId,
        tag_ids: tagIds,
        related_product_ids: frontMatter.relatedProducts || [],
        seo_title: frontMatter.seoTitle || frontMatter.title,
        seo_description: frontMatter.seoDescription || frontMatter.excerpt,
        reading_time: frontMatter.readingTime || estimateReadingTime(content),
        published_at: frontMatter.publishedAt || new Date().toISOString(),
        status: 'published'
      }

      const { error } = await supabase
        .from('articles')
        .upsert(articleData, { onConflict: 'slug' })

      if (error) {
        console.error(`記事挿入エラー (${slug}):`, error)
      } else {
        console.log(`✅ ${slug} 移行完了`)
      }
    }

    console.log('✅ 記事移行完了')
  } catch (error) {
    console.error('❌ 記事移行エラー:', error)
  }
}

async function main() {
  console.log('🚀 データベース移行開始')

  // await createTables()  // 手動でSQLを実行するため、コメントアウト
  await migrateArticles()

  console.log('🎉 データベース移行完了')
}

main().catch(console.error)