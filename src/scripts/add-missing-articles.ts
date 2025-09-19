import { supabase } from '@/lib/supabase'
import { createArticle } from '@/lib/database/articles'
import fs from 'fs'
import path from 'path'

// フロントマターを解析する関数
function parseFrontmatter(content: string) {
  if (!content.startsWith('---')) {
    return { frontmatter: {}, content }
  }

  const endIndex = content.indexOf('---', 3)
  if (endIndex === -1) {
    return { frontmatter: {}, content }
  }

  const frontmatterStr = content.substring(3, endIndex).trim()
  const actualContent = content.substring(endIndex + 3).trim()

  const frontmatter: any = {}
  const lines = frontmatterStr.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const colonIndex = line.indexOf(':')
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim()
      let value = line.substring(colonIndex + 1).trim()

      // Handle YAML folded block scalar (>- syntax)
      if (value === '>-') {
        // Collect subsequent indented lines
        const indentedLines = []
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j]
          // Check if line starts with spaces (indented)
          if (nextLine.startsWith('  ') || nextLine.startsWith('\t')) {
            indentedLines.push(nextLine.trim())
          } else if (nextLine.trim() === '') {
            // Skip empty lines
            continue
          } else {
            // Non-indented line, stop collecting
            break
          }
        }
        value = indentedLines.join(' ').trim()
      }

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }

      // Handle arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''))
      }

      frontmatter[key] = value
    }
  }

  return { frontmatter, content: actualContent }
}

async function addMissingArticles() {
  try {
    console.log('🚀 不足している記事をデータベースに追加中...')

    // 利用可能なカテゴリを確認
    const { data: allCategories } = await supabase
      .from('article_categories')
      .select('*')

    console.log('利用可能なカテゴリ:', allCategories?.map(c => c.slug))

    // 初心者向けカテゴリを取得（複数の可能性をチェック）
    const beginnerCategory = allCategories?.find(c =>
      c.slug === 'beginner' ||
      c.slug === 'beginner-friendly' ||
      c.slug === 'for-beginners' ||
      c.name?.includes('初心者')
    )

    if (!beginnerCategory) {
      // フォールバック：最初のカテゴリを使用
      console.warn('初心者カテゴリが見つかりません。最初のカテゴリを使用します。')
      if (!allCategories || allCategories.length === 0) {
        console.error('カテゴリが存在しません')
        return
      }
      var defaultCategory = allCategories[0]
    }

    // 必要なタグを取得
    const { data: allTags } = await supabase
      .from('article_tags')
      .select('*')

    // 使用するカテゴリを決定
    const categoryToUse = beginnerCategory || defaultCategory

    // 記事を追加
    const articlesToAdd = [
      {
        slug: 'article-42',
        filePath: 'src/content/guides/article-42.md',
        category: categoryToUse
      },
      {
        slug: 'article-43',
        filePath: 'src/content/guides/article-43.md',
        category: categoryToUse
      },
      {
        slug: 'article-44',
        filePath: 'src/content/guides/article-44.md',
        category: categoryToUse
      }
    ]

    for (const articleInfo of articlesToAdd) {
      console.log(`\n📝 処理中: ${articleInfo.slug}`)

      // 既存記事をチェック
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', articleInfo.slug)
        .single()

      if (existingArticle) {
        console.log(`⚠️  ${articleInfo.slug} は既に存在します。スキップ。`)
        continue
      }

      // ファイル内容を読み込み
      const fullPath = path.resolve(articleInfo.filePath)
      if (!fs.existsSync(fullPath)) {
        console.error(`❌ ファイルが見つかりません: ${fullPath}`)
        continue
      }

      const fileContent = fs.readFileSync(fullPath, 'utf-8')
      const { frontmatter, content } = parseFrontmatter(fileContent)

      console.log(`📖 タイトル: ${frontmatter.title}`)

      // タグIDsを取得
      const tagIds: string[] = []
      if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
        for (const tagName of frontmatter.tags) {
          const tag = allTags?.find(t => t.name === tagName || t.slug === tagName.toLowerCase().replace(/\s+/g, '-'))
          if (tag) {
            tagIds.push(tag.id)
          } else {
            console.log(`⚠️  タグが見つかりません: ${tagName}`)
          }
        }
      }

      // 記事データを構築
      const article = {
        title: frontmatter.title,
        slug: articleInfo.slug,
        excerpt: frontmatter.excerpt || '',
        content: content,
        seoDescription: frontmatter.seoDescription || frontmatter.excerpt || '',
        readingTime: Math.ceil(content.length / 400), // 400文字/分で計算
        category: {
          id: articleInfo.category.id,
          name: articleInfo.category.name,
          slug: articleInfo.category.slug,
          color: articleInfo.category.color || '',
          icon: articleInfo.category.icon || '🌱'
        },
        tags: tagIds.map(id => {
          const tag = allTags?.find(t => t.id === id)
          return {
            id,
            name: tag?.name || '',
            slug: tag?.slug || '',
            color: tag?.color || ''
          }
        }),
        featuredImage: frontmatter.featuredImage ? {
          url: frontmatter.featuredImage,
          alt: frontmatter.title
        } : undefined,
        status: 'published' as const
      }

      console.log(`💾 データベースに追加中...`)
      const createdArticle = await createArticle(article)

      if (createdArticle) {
        console.log(`✅ ${articleInfo.slug} を正常に追加しました`)
        console.log(`🔗 URL: https://bonsai-collection.com/guides/${articleInfo.slug}`)
      } else {
        console.error(`❌ ${articleInfo.slug} の追加に失敗しました`)
      }
    }

    console.log('\n🎉 すべての記事の処理が完了しました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  }
}

// スクリプト実行
addMissingArticles()