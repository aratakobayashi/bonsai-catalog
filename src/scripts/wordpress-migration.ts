import { saveInternalArticle } from '../lib/cms/article-manager'
import { getArticles } from '../lib/microcms'

// WordPress記事を内製CMSに移行するスクリプト
async function migrateWordPressArticles() {
  console.log('🚀 WordPress記事移行を開始します...')
  
  try {
    // WordPressから全記事を取得
    console.log('📥 WordPress記事を取得中...')
    const response = await getArticles({
      category: undefined,
      tags: undefined,
      search: undefined,
      page: 1,
      limit: 100, // 最大100記事取得
    })

    // getArticles の戻り値の構造をログ出力して確認
    console.log('📊 getArticles response:', typeof response, Object.keys(response || {}))
    
    const articles = Array.isArray(response) ? response : response?.articles || []
    console.log(`📝 ${articles.length}件の記事を取得しました`)

    let successCount = 0
    let errorCount = 0

    for (const [index, article] of articles.entries()) {
      try {
        console.log(`🔄 [${index + 1}/${articles.length}] 処理中: ${article.title}`)

        // デバッグ: 記事データの構造を確認
        if (index === 0) {
          console.log('🔍 記事データ構造:', JSON.stringify(article, null, 2))
        }

        // WordPressの記事データを内製CMS形式に変換
        const internalArticle = {
          slug: article.slug || `article-${index + 1}`,
          title: article.title || '無題',
          excerpt: article.excerpt || article.content?.slice(0, 100) + '...' || '説明なし',
          content: convertWordPressContent(article.content || ''),
          category: mapWordPressCategory(article.category?.slug) || 'care-bonsai',
          tags: article.tags || [],
          featuredImage: (typeof article.featuredImage === 'object' ? article.featuredImage?.url : article.featuredImage) || '',
          publishedAt: article.publishedAt || new Date().toISOString(),
          readingTime: estimateReadingTime(article.content || ''),
          seoTitle: article.title || '無題',
          seoDescription: article.excerpt || article.content?.slice(0, 100) + '...' || '説明なし',
        }

        // undefined値のクリーンアップ
        Object.keys(internalArticle).forEach(key => {
          if (internalArticle[key as keyof typeof internalArticle] === undefined) {
            delete (internalArticle as any)[key]
          }
        })

        // 内製CMSに保存
        await saveInternalArticle(internalArticle)
        successCount++
        console.log(`✅ 保存完了: ${article.title}`)

      } catch (error) {
        console.error(`❌ エラー: ${article.title}`, error)
        errorCount++
      }

      // レート制限対策（100ms間隔）
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n🎉 移行完了!')
    console.log(`✅ 成功: ${successCount}件`)
    console.log(`❌ エラー: ${errorCount}件`)

  } catch (error) {
    console.error('🚫 移行処理でエラーが発生しました:', error)
  }
}

// WordPressコンテンツを内製CMS用に変換
function convertWordPressContent(content: string): string {
  // HTMLタグを適切にMarkdownに変換
  let markdown = content

  // 基本的なHTML -> Markdown変換
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1')
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1')
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1')
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
  markdown = markdown.replace(/<br\s*\/?>/g, '\n')
  
  // リンクの変換
  markdown = markdown.replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
  
  // 画像の変換
  markdown = markdown.replace(/<img\s+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/g, '![$2]($1)')
  markdown = markdown.replace(/<img\s+src="([^"]*)"[^>]*>/g, '![]($1)')

  // リストの変換
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/g, '- $1') + '\n'
  })

  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (match, content) => {
    let counter = 1
    return content.replace(/<li[^>]*>(.*?)<\/li>/g, (match: string, item: string) => `${counter++}. ${item}`) + '\n'
  })

  // 不要なHTMLタグを削除
  markdown = markdown.replace(/<[^>]+>/g, '')
  
  // 複数の改行を整理
  markdown = markdown.replace(/\n{3,}/g, '\n\n')
  
  return markdown.trim()
}

// WordPressカテゴリーを内製CMSカテゴリーにマッピング
function mapWordPressCategory(wpCategory: string): string {
  const categoryMap: Record<string, string> = {
    'care-bonsai': 'care-bonsai',
    'start-guide': 'start-guide', 
    'kinds': 'kinds',
    'info': 'info',
    'select': 'select',
  }
  
  return categoryMap[wpCategory] || 'care-bonsai' // デフォルトはcare-bonsai
}

// 読了時間を計算（日本語対応）
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 400 // 日本語の平均読解速度
  const wordCount = content.length
  return Math.ceil(wordCount / wordsPerMinute)
}

// スクリプトが直接実行された場合
if (require.main === module) {
  migrateWordPressArticles()
}

export { migrateWordPressArticles }