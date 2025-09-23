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

// Twitter投稿用のテンプレート
const templates = {
  event: {
    upcoming: (event: any) => `🗓 イベント情報

【${event.title}】
📅 ${formatDate(event.start_date)}
📍 ${event.venue || 'オンライン'}
${event.is_free ? '🎫 入場無料' : `💴 ${event.price}円`}

${truncateText(event.description, 50)}

詳細👉 https://bonsai-catalog.vercel.app/events/${event.slug}

#盆栽 #盆栽イベント`,

    reminder: (event: any) => `⏰ 明日開催！

【${event.title}】
${event.venue ? `場所: ${event.venue}` : 'オンライン開催'}

${event.highlights ? event.highlights.slice(0, 2).map((h: string) => `✅ ${h}`).join('\n') : ''}

お見逃しなく！
詳細: https://bonsai-catalog.vercel.app/events/${event.slug}`,

    seasonal: (event: any) => `🍁 ${getSeason(event.start_date)}のイベント

「${event.title}」

${event.category === 'exhibition' ? '🎨 展示会' : ''}
${event.category === 'workshop' ? '🔨 ワークショップ' : ''}
${event.category === 'sale' ? '🛒 即売会' : ''}

予約受付中！
https://bonsai-catalog.vercel.app/events/${event.slug}`
  },

  article: {
    howto: (article: any) => `💡 盆栽の知恵

【${article.title}】

${extractKeyPoints(article.excerpt)}

続きはこちら👇
https://bonsai-catalog.vercel.app/guides/${article.slug}

#盆栽 #園芸 #ガーデニング`,

    tips: (article: any) => `🌲 今日の盆栽テクニック

${article.title}

知ってた？
${extractInterestingFact(article.excerpt)}

詳しい解説はこちら
https://bonsai-catalog.vercel.app/guides/${article.slug}`,

    beginner: (article: any) => `🔰 初心者向け

${article.title}

ポイント：
${extractBulletPoints(article.excerpt, 3)}

もっと詳しく👉
https://bonsai-catalog.vercel.app/guides/${article.slug}

#盆栽初心者 #盆栽入門`
  },

  mixed: {
    eventWithArticle: (event: any, article: any) => `📢 イベント×学習

イベント「${event.title}」
${formatDate(event.start_date)} 開催

参加前に読んでおきたい記事
「${article.title}」

イベント: https://bonsai-catalog.vercel.app/events/${event.slug}
予習記事: https://bonsai-catalog.vercel.app/guides/${article.slug}`,

    weeklyDigest: (events: any[], articles: any[]) => `📊 今週の盆栽情報

【イベント】
${events.slice(0, 2).map(e => `・${e.title}`).join('\n')}

【人気記事】
${articles.slice(0, 2).map(a => `・${a.title}`).join('\n')}

詳細はプロフィールのリンクから🔗`
  }
}

// ヘルパー関数
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}(${['日','月','火','水','木','金','土'][date.getDay()]})`
}

function getSeason(dateStr: string): string {
  const month = new Date(dateStr).getMonth() + 1
  if (month >= 3 && month <= 5) return '春'
  if (month >= 6 && month <= 8) return '夏'
  if (month >= 9 && month <= 11) return '秋'
  return '冬'
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

function extractKeyPoints(text: string): string {
  if (!text) return ''
  const points = text.split('。').slice(0, 2).join('。')
  return truncateText(points, 80)
}

function extractInterestingFact(text: string): string {
  if (!text) return ''
  const sentences = text.split('。')
  return sentences.find(s => s.includes('実は') || s.includes('意外') || s.includes('知')) || sentences[0]
}

function extractBulletPoints(text: string, count: number): string {
  if (!text) return ''
  const sentences = text.split('。').filter(s => s.trim())
  return sentences.slice(0, count).map(s => `・${truncateText(s, 30)}`).join('\n')
}

async function generateTwitterContent() {
  try {
    console.log('📊 Twitter投稿コンテンツを生成中...\n')

    // イベント情報を取得（今後30日以内）
    const today = new Date()
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', today.toISOString())
      .lte('start_date', thirtyDaysLater.toISOString())
      .order('start_date', { ascending: true })
      .limit(10)

    if (eventsError) {
      console.error('イベント取得エラー:', eventsError)
    }

    // 記事情報を取得（人気記事）
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, category_id, reading_time')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10)

    if (articlesError) {
      console.error('記事取得エラー:', articlesError)
    }

    const twitterPosts = []

    // イベント投稿を生成
    if (events && events.length > 0) {
      console.log(`📅 ${events.length}件のイベントを処理中...`)

      events.forEach((event, index) => {
        // 通常告知
        twitterPosts.push({
          type: 'event_upcoming',
          content: templates.event.upcoming(event),
          scheduledFor: `Day ${Math.floor(index / 3) + 1} - Morning`
        })

        // 直前リマインダー（開催日の前日）
        const eventDate = new Date(event.start_date)
        const reminderDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000)
        if (reminderDate > today) {
          twitterPosts.push({
            type: 'event_reminder',
            content: templates.event.reminder(event),
            scheduledFor: `${reminderDate.getMonth() + 1}/${reminderDate.getDate()} - Evening`
          })
        }
      })
    }

    // 記事投稿を生成
    if (articles && articles.length > 0) {
      console.log(`📝 ${articles.length}件の記事を処理中...`)

      articles.forEach((article, index) => {
        // 初心者向け記事
        if (article.title.includes('初心者') || article.title.includes('入門')) {
          twitterPosts.push({
            type: 'article_beginner',
            content: templates.article.beginner(article),
            scheduledFor: `Day ${Math.floor(index / 2) + 1} - Afternoon`
          })
        }
        // ハウツー記事
        else if (article.title.includes('方法') || article.title.includes('テクニック')) {
          twitterPosts.push({
            type: 'article_howto',
            content: templates.article.howto(article),
            scheduledFor: `Day ${Math.floor(index / 2) + 1} - Morning`
          })
        }
        // その他のTips
        else {
          twitterPosts.push({
            type: 'article_tips',
            content: templates.article.tips(article),
            scheduledFor: `Day ${Math.floor(index / 2) + 1} - Evening`
          })
        }
      })
    }

    // 複合投稿（イベント×記事）
    if (events && events.length > 0 && articles && articles.length > 0) {
      twitterPosts.push({
        type: 'mixed_event_article',
        content: templates.mixed.eventWithArticle(events[0], articles[0]),
        scheduledFor: 'Special - Weekend'
      })

      twitterPosts.push({
        type: 'mixed_weekly',
        content: templates.mixed.weeklyDigest(events.slice(0, 3), articles.slice(0, 3)),
        scheduledFor: 'Weekly Digest - Sunday'
      })
    }

    // 結果をJSON形式で保存
    const outputPath = path.join(process.cwd(), 'twitter-content.json')
    fs.writeFileSync(outputPath, JSON.stringify(twitterPosts, null, 2), 'utf-8')

    console.log(`\n✅ ${twitterPosts.length}件の投稿コンテンツを生成しました`)
    console.log(`📁 保存先: ${outputPath}`)

    // サンプルを表示
    console.log('\n--- サンプル投稿 ---')
    twitterPosts.slice(0, 3).forEach((post, index) => {
      console.log(`\n投稿${index + 1} (${post.type}):\n${post.content}`)
      console.log(`予定: ${post.scheduledFor}`)
      console.log('-'.repeat(50))
    })

  } catch (error) {
    console.error('エラーが発生しました:', error)
  }
}

// スクリプトを実行
generateTwitterContent()