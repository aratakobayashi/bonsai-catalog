import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

// .env.localを読み込み
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function exportArticlesToCSV() {
  try {
    // 最新20件の記事を取得
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, featured_image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('記事の取得に失敗しました:', error)
      return
    }

    if (!articles || articles.length === 0) {
      console.log('記事が見つかりませんでした')
      return
    }

    console.log(`${articles.length}件の記事を取得しました`)

    // CSV用のデータを準備
    const csvRows: string[] = []

    // ヘッダー行
    csvRows.push('category,text,image_url,scheduled_time')

    // 投稿時間のパターン（9時、12時、20時）
    const scheduleTimes = ['09:00', '12:00', '20:00']
    let timeIndex = 0
    let dayOffset = 0

    // 各記事をCSV形式に変換
    articles.forEach((article, index) => {
      const baseUrl = 'https://bonsai-catalog.vercel.app'
      const articleUrl = `${baseUrl}/guides/${article.slug}`

      // カテゴリは常に "記事紹介"
      const category = '記事紹介'

      // テキストは「{title} 👉 {url}」形式
      const text = `${article.title} 👉 ${articleUrl}`

      // 画像URL
      const imageUrl = article.featured_image_url || ''

      // スケジュール時間を計算
      const today = new Date()
      const scheduleDate = new Date(today)
      scheduleDate.setDate(today.getDate() + dayOffset)

      const year = scheduleDate.getFullYear()
      const month = String(scheduleDate.getMonth() + 1).padStart(2, '0')
      const day = String(scheduleDate.getDate()).padStart(2, '0')
      const scheduledTime = `${year}-${month}-${day} ${scheduleTimes[timeIndex]}`

      // 次の時間帯へ移動
      timeIndex++
      if (timeIndex >= scheduleTimes.length) {
        timeIndex = 0
        dayOffset++
      }

      // CSVの行を作成（カンマやクォートを含む場合の処理）
      const escapedText = text.includes(',') || text.includes('"')
        ? `"${text.replace(/"/g, '""')}"`
        : text
      const escapedImageUrl = imageUrl.includes(',') || imageUrl.includes('"')
        ? `"${imageUrl.replace(/"/g, '""')}"`
        : imageUrl

      csvRows.push(`${category},${escapedText},${escapedImageUrl},${scheduledTime}`)
    })

    // CSVファイルに書き出し
    const csvContent = csvRows.join('\n')
    const outputPath = path.join(process.cwd(), 'posts.csv')

    fs.writeFileSync(outputPath, csvContent, 'utf-8')

    console.log(`✅ CSV出力完了: ${outputPath}`)
    console.log(`📅 投稿スケジュール:`)
    console.log(`   - ${Math.ceil(articles.length / 3)}日分の投稿`)
    console.log(`   - 毎日9時、12時、20時に投稿`)

  } catch (error) {
    console.error('エラーが発生しました:', error)
  }
}

// スクリプトを実行
exportArticlesToCSV()