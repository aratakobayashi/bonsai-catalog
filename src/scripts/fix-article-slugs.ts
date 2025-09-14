// 記事ファイル名のURL Encodeを修正するスクリプト
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'src/content/guides')

async function fixArticleSlugs() {
  console.log('🔧 記事ファイル名とslugを修正します...')
  
  try {
    const files = await fs.readdir(CONTENT_DIR)
    const markdownFiles = files.filter(file => file.endsWith('.md') && file !== 'test-internal-cms.md')
    
    console.log(`📝 ${markdownFiles.length}件のファイルを処理します`)

    let processedCount = 0
    let errorCount = 0

    for (const file of markdownFiles) {
      try {
        const filePath = path.join(CONTENT_DIR, file)
        const fileContent = await fs.readFile(filePath, 'utf8')
        const { data: frontMatter, content } = matter(fileContent)
        
        // URL Decodedスラグを生成（短くて読みやすい形に）
        const originalSlug = file.replace('.md', '')
        let decodedSlug: string
        
        try {
          decodedSlug = decodeURIComponent(originalSlug)
        } catch {
          decodedSlug = originalSlug
        }

        // より短いslugを生成（記事タイトルベース）
        const title = frontMatter.title || 'untitled'
        let shortSlug = title
          .toLowerCase()
          .replace(/【.*?】/g, '') // 【】を削除
          .replace(/[^\w\s-]/g, '') // 特殊文字を削除
          .replace(/\s+/g, '-') // スペースをハイフンに
          .replace(/-+/g, '-') // 重複ハイフンを単一に
          .trim()
          .slice(0, 50) // 最大50文字
          .replace(/-$/, '') // 末尾のハイフンを削除

        // 基本的なslug生成
        if (!shortSlug || shortSlug.length < 5) {
          shortSlug = `article-${processedCount + 1}`
        }

        console.log(`🔄 処理中: ${file}`)
        console.log(`   元slug: ${originalSlug.slice(0, 50)}...`)
        console.log(`   新slug: ${shortSlug}`)

        // frontmatterを更新
        const updatedFrontMatter = {
          ...frontMatter,
          slug: shortSlug
        }

        // 新しいMarkdownコンテンツを生成
        const newContent = matter.stringify(content, updatedFrontMatter)
        
        // 新しいファイル名でファイルを作成
        const newFilePath = path.join(CONTENT_DIR, `${shortSlug}.md`)
        await fs.writeFile(newFilePath, newContent, 'utf8')
        
        // 元のファイルが違う名前の場合は削除
        if (filePath !== newFilePath) {
          await fs.unlink(filePath)
        }

        processedCount++
        console.log(`✅ 完了: ${shortSlug}.md`)

      } catch (error) {
        console.error(`❌ エラー: ${file}`, error)
        errorCount++
      }
    }

    console.log('\n🎉 処理完了!')
    console.log(`✅ 成功: ${processedCount}件`)
    console.log(`❌ エラー: ${errorCount}件`)

  } catch (error) {
    console.error('❌ スクリプト実行エラー:', error)
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  fixArticleSlugs()
}

export { fixArticleSlugs }