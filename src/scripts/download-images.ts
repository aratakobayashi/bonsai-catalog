// 画像ダウンロード機能 - WordPress画像を内製システムに取り込み
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'src/content/guides')
const IMAGES_DIR = path.join(process.cwd(), 'public/images/articles')

interface ImageDownloadResult {
  originalUrl: string
  localPath: string
  filename: string
  success: boolean
  error?: string
}

// 画像をダウンロードして保存
async function downloadImage(imageUrl: string, filename: string): Promise<ImageDownloadResult> {
  try {
    console.log(`📥 ダウンロード開始: ${imageUrl}`)
    
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // ファイル拡張子を取得（URLから推測）
    const urlParts = imageUrl.split('.')
    const ext = urlParts[urlParts.length - 1].split('?')[0] // クエリパラメータを除去
    const finalFilename = `${filename}.${ext}`
    
    // 保存先パス
    const localPath = path.join(IMAGES_DIR, finalFilename)
    
    // ディレクトリが存在しない場合は作成
    await fs.mkdir(IMAGES_DIR, { recursive: true })
    
    // ファイルを保存
    await fs.writeFile(localPath, buffer)
    
    const result: ImageDownloadResult = {
      originalUrl: imageUrl,
      localPath: `/images/articles/${finalFilename}`,
      filename: finalFilename,
      success: true
    }
    
    console.log(`✅ ダウンロード完了: ${finalFilename}`)
    return result
    
  } catch (error) {
    const result: ImageDownloadResult = {
      originalUrl: imageUrl,
      localPath: '',
      filename: '',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
    
    console.error(`❌ ダウンロード失敗: ${imageUrl}`, error)
    return result
  }
}

// 記事ファイルの画像URLを更新
async function updateArticleImages(articleSlug: string, downloadResults: ImageDownloadResult[]): Promise<void> {
  try {
    const filePath = path.join(CONTENT_DIR, `${articleSlug}.md`)
    const fileContent = await fs.readFile(filePath, 'utf8')
    const { data: frontMatter, content } = matter(fileContent)
    
    let updatedContent = content
    let updatedFrontMatter = { ...frontMatter }
    
    // featuredImageの更新
    if (frontMatter.featuredImage) {
      const featuredImageResult = downloadResults.find(r => r.originalUrl === frontMatter.featuredImage)
      if (featuredImageResult && featuredImageResult.success) {
        updatedFrontMatter.featuredImage = featuredImageResult.localPath
        console.log(`🖼️ featuredImage更新: ${articleSlug}`)
      }
    }
    
    // コンテンツ内の画像URLを更新
    for (const result of downloadResults) {
      if (result.success) {
        updatedContent = updatedContent.replace(
          new RegExp(result.originalUrl.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'),
          result.localPath
        )
      }
    }
    
    // ファイルを更新
    const newContent = matter.stringify(updatedContent, updatedFrontMatter)
    await fs.writeFile(filePath, newContent, 'utf8')
    
    console.log(`📝 記事更新完了: ${articleSlug}`)
    
  } catch (error) {
    console.error(`❌ 記事更新エラー: ${articleSlug}`, error)
  }
}

// 全記事の画像をダウンロード
async function downloadAllImages() {
  console.log('🖼️ 画像ダウンロード機能を開始します...')
  
  try {
    // 記事ファイル一覧を取得
    const files = await fs.readdir(CONTENT_DIR)
    const markdownFiles = files.filter(file => file.endsWith('.md') && file !== 'test-internal-cms.md')
    
    console.log(`📝 ${markdownFiles.length}件の記事を処理します`)
    
    let totalImages = 0
    let successImages = 0
    let errorImages = 0
    
    for (const [index, file] of markdownFiles.entries()) {
      const articleSlug = file.replace('.md', '')
      console.log(`\n🔄 [${index + 1}/${markdownFiles.length}] 処理中: ${articleSlug}`)
      
      try {
        const filePath = path.join(CONTENT_DIR, file)
        const fileContent = await fs.readFile(filePath, 'utf8')
        const { data: frontMatter, content } = matter(fileContent)
        
        // 画像URLを抽出
        const imageUrls = new Set<string>()
        
        // featuredImageを追加
        if (frontMatter.featuredImage && frontMatter.featuredImage.startsWith('http')) {
          imageUrls.add(frontMatter.featuredImage)
        }
        
        // コンテンツ内の画像URLを抽出
        const imageRegex = /https:\/\/bonsai-guidebook\.net\/wp-content\/uploads\/[^\s"')]+\.(jpg|jpeg|png|gif|webp)/gi
        const matches = content.match(imageRegex)
        if (matches) {
          matches.forEach(url => imageUrls.add(url))
        }
        
        console.log(`🔍 ${imageUrls.size}個の画像URL発見`)
        
        if (imageUrls.size === 0) {
          console.log('⏭️ 画像なし、スキップ')
          continue
        }
        
        // 画像をダウンロード
        const downloadResults: ImageDownloadResult[] = []
        
        for (const [imgIndex, imageUrl] of Array.from(imageUrls).entries()) {
          const filename = `${articleSlug}-img-${imgIndex + 1}`
          const result = await downloadImage(imageUrl, filename)
          downloadResults.push(result)
          totalImages++
          
          if (result.success) {
            successImages++
          } else {
            errorImages++
          }
          
          // レート制限対策
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        // 記事ファイルの画像URLを更新
        await updateArticleImages(articleSlug, downloadResults)
        
      } catch (error) {
        console.error(`❌ 記事処理エラー: ${file}`, error)
      }
    }
    
    console.log('\n🎉 画像ダウンロード完了!')
    console.log(`📊 統計:`)
    console.log(`  - 対象記事: ${markdownFiles.length}件`)
    console.log(`  - 総画像数: ${totalImages}件`)
    console.log(`  - 成功: ${successImages}件`)
    console.log(`  - 失敗: ${errorImages}件`)
    
  } catch (error) {
    console.error('🚫 画像ダウンロード処理でエラーが発生しました:', error)
  }
}

// 画像ディレクトリの容量確認
async function checkImageDirectory() {
  try {
    await fs.access(IMAGES_DIR)
    const files = await fs.readdir(IMAGES_DIR)
    console.log(`📁 画像ディレクトリ: ${files.length}ファイル`)
    
    let totalSize = 0
    for (const file of files) {
      const filePath = path.join(IMAGES_DIR, file)
      const stats = await fs.stat(filePath)
      totalSize += stats.size
    }
    
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2)
    console.log(`💾 総容量: ${sizeMB}MB`)
    
  } catch (error) {
    console.log('📁 画像ディレクトリが存在しません')
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  console.log('🖼️ 画像ダウンロード機能')
  console.log('')
  checkImageDirectory().then(() => {
    downloadAllImages()
  })
}

export { downloadAllImages, downloadImage, checkImageDirectory }