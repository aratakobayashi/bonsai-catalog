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

async function exportAllContentToCSV() {
  try {
    console.log('📊 すべての投稿データをCSV形式で出力中...\n')

    // 1. イベントデータを取得
    const today = new Date()
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', today.toISOString())
      .order('start_date', { ascending: true })
      .limit(30)

    if (eventsError) {
      console.error('イベント取得エラー:', eventsError)
    }

    // 2. 記事データを取得
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50)

    if (articlesError) {
      console.error('記事取得エラー:', articlesError)
    }

    // 3. 商品データを取得
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (productsError) {
      console.error('商品取得エラー:', productsError)
    }

    // CSV作成
    const csvRows: string[] = []
    const baseUrl = 'https://bonsai-catalog.vercel.app'

    // ヘッダー行
    csvRows.push('type,title,description,url,date,image_url,tags,price')

    // イベントデータをCSVに追加
    if (events && events.length > 0) {
      console.log(`📅 ${events.length}件のイベントを処理中...`)
      events.forEach(event => {
        const row = [
          'イベント',
          `"${(event.title || '').replace(/"/g, '""')}"`,
          `"${(event.description || '').replace(/"/g, '""').substring(0, 100)}"`,
          `${baseUrl}/events/${event.slug}`,
          event.start_date ? new Date(event.start_date).toLocaleDateString('ja-JP') : '',
          event.featured_image_url || '',
          `"${event.category || ''}"`,
          event.price || '無料'
        ]
        csvRows.push(row.join(','))
      })
    }

    // 記事データをCSVに追加
    if (articles && articles.length > 0) {
      console.log(`📝 ${articles.length}件の記事を処理中...`)
      articles.forEach(article => {
        const row = [
          '記事',
          `"${(article.title || '').replace(/"/g, '""')}"`,
          `"${(article.excerpt || '').replace(/"/g, '""').substring(0, 100)}"`,
          `${baseUrl}/guides/${article.slug}`,
          article.published_at ? new Date(article.published_at).toLocaleDateString('ja-JP') : '',
          article.featured_image_url || '',
          `"${article.tag_ids?.join(';') || ''}"`,
          ''
        ]
        csvRows.push(row.join(','))
      })
    }

    // 商品データをCSVに追加
    if (products && products.length > 0) {
      console.log(`🛍️ ${products.length}件の商品を処理中...`)
      products.forEach(product => {
        const row = [
          '商品',
          `"${(product.name || '').replace(/"/g, '""')}"`,
          `"${(product.description || '').replace(/"/g, '""').substring(0, 100)}"`,
          `${baseUrl}/products/${product.id}`,
          product.created_at ? new Date(product.created_at).toLocaleDateString('ja-JP') : '',
          product.image_url || '',
          `"${product.tags?.join(';') || ''}"`,
          product.price || ''
        ]
        csvRows.push(row.join(','))
      })
    }

    // CSVファイルに書き出し
    const csvContent = csvRows.join('\n')
    const outputPath = path.join(process.cwd(), 'twitter-source-data.csv')
    fs.writeFileSync(outputPath, csvContent, 'utf-8')

    console.log(`\n✅ CSV出力完了`)
    console.log(`📁 ファイル: ${outputPath}`)
    console.log(`📊 内訳:`)
    console.log(`   - イベント: ${events?.length || 0}件`)
    console.log(`   - 記事: ${articles?.length || 0}件`)
    console.log(`   - 商品: ${products?.length || 0}件`)
    console.log(`   合計: ${(events?.length || 0) + (articles?.length || 0) + (products?.length || 0)}件`)

    // Twitter投稿用テンプレートCSVも作成
    const twitterRows: string[] = []
    twitterRows.push('category,text,url,scheduled_time')

    let dayCount = 0
    const times = ['09:00', '12:00', '19:00']
    let timeIndex = 0

    // イベント投稿
    if (events && events.length > 0) {
      events.slice(0, 10).forEach(event => {
        const scheduleDate = new Date(today)
        scheduleDate.setDate(today.getDate() + Math.floor(dayCount / 3))
        const scheduledTime = `${scheduleDate.toLocaleDateString('ja-JP')} ${times[timeIndex]}`

        twitterRows.push([
          'イベント告知',
          `"🗓【${event.title}】${event.start_date ? new Date(event.start_date).toLocaleDateString('ja-JP') : ''}開催！詳細は👉"`,
          `${baseUrl}/events/${event.slug}`,
          scheduledTime
        ].join(','))

        timeIndex = (timeIndex + 1) % 3
        if (timeIndex === 0) dayCount++
      })
    }

    // 記事投稿
    if (articles && articles.length > 0) {
      articles.slice(0, 20).forEach(article => {
        const scheduleDate = new Date(today)
        scheduleDate.setDate(today.getDate() + Math.floor(dayCount / 3))
        const scheduledTime = `${scheduleDate.toLocaleDateString('ja-JP')} ${times[timeIndex]}`

        twitterRows.push([
          '記事紹介',
          `"📚【${article.title}】${(article.excerpt || '').substring(0, 50)}...続きは👉"`,
          `${baseUrl}/guides/${article.slug}`,
          scheduledTime
        ].join(','))

        timeIndex = (timeIndex + 1) % 3
        if (timeIndex === 0) dayCount++
      })
    }

    // Twitter投稿用CSVを保存
    const twitterCsvPath = path.join(process.cwd(), 'twitter-posts-template.csv')
    fs.writeFileSync(twitterCsvPath, twitterRows.join('\n'), 'utf-8')

    console.log(`\n📱 Twitter投稿用テンプレートCSVも作成しました`)
    console.log(`📁 ファイル: ${twitterCsvPath}`)
    console.log(`📅 ${Math.ceil(dayCount)}日分の投稿スケジュール`)

  } catch (error) {
    console.error('エラーが発生しました:', error)
  }
}

// スクリプトを実行
exportAllContentToCSV()