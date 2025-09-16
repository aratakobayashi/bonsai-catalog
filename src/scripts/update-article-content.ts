import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

// 環境変数を読み込み
config({ path: '.env.local' })

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateArticleContent() {
  console.log('🔄 記事コンテンツを更新します...')

  try {
    // Markdownファイルを読み込み
    const filePath = join(process.cwd(), 'public/content/guides/beginner-tree-species-guide.md')
    const fileContent = readFileSync(filePath, 'utf8')

    // Front matterを解析
    const { data: frontMatter, content } = matter(fileContent)

    console.log('📄 記事データ:', {
      title: frontMatter.title,
      slug: 'beginner-tree-species-guide'
    })

    // 記事コンテンツを更新
    const { data, error } = await supabase
      .from('articles')
      .update({
        content: content,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'beginner-tree-species-guide')
      .select()

    if (error) {
      console.error('❌ 記事更新エラー:', error)
      return
    }

    console.log('✅ 記事コンテンツを更新しました!')
    console.log(`🔗 記事URL: http://localhost:3000/guides/beginner-tree-species-guide`)

  } catch (error) {
    console.error('🚫 エラーが発生しました:', error)
  }
}

// スクリプト実行
if (require.main === module) {
  updateArticleContent()
}

export { updateArticleContent }