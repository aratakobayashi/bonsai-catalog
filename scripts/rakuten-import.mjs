/**
 * 楽天市場API → Supabase 自動インポートスクリプト
 *
 * 使い方:
 *   node scripts/rakuten-import.mjs
 *
 * 必要な環境変数（.env.local）:
 *   RAKUTEN_APP_ID      ... 楽天ウェブサービス Application ID
 *   RAKUTEN_AFFILIATE_ID ... 楽天アフィリエイト ID
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// .env.local を手動読み込み
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    })
)

const RAKUTEN_APP_ID      = env.RAKUTEN_APP_ID
const RAKUTEN_AFFILIATE_ID = env.RAKUTEN_AFFILIATE_ID
const SUPABASE_URL        = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY        = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!RAKUTEN_APP_ID || !RAKUTEN_AFFILIATE_ID) {
  console.error('❌ RAKUTEN_APP_ID または RAKUTEN_AFFILIATE_ID が .env.local に設定されていません')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 検索キーワード一覧（盆栽関連の網羅的リスト）
const KEYWORDS = [
  '盆栽 松', '盆栽 黒松', '盆栽 五葉松', '盆栽 真柏',
  '盆栽 もみじ', '盆栽 楓', '盆栽 桜', '盆栽 梅',
  '盆栽 ケヤキ', '盆栽 欅', '盆栽 富士桜',
  'ミニ盆栽 セット', '盆栽 初心者', '盆栽 室内',
  '盆栽 花', '盆栽 実もの', '盆栽 ギフト',
  '盆栽 鉢', '盆栽 道具', '盆栽 肥料',
]

// 商品名からカテゴリを自動判定
function detectCategory(name, caption = '') {
  const text = (name + ' ' + caption).toLowerCase()
  if (/黒松|五葉松|赤松|真柏|杜松|檜|ヒノキ|ヒバ/.test(text)) return '松柏類'
  if (/もみじ|楓|カエデ|けやき|欅|ぶな|ブナ|コナラ|雑木/.test(text)) return '雑木類'
  if (/桜|さくら|梅|うめ|ウメ|富士桜|寒桜|枝垂れ/.test(text)) return '花もの'
  if (/りんご|リンゴ|柿|カキ|姫りんご|実もの|キンズ|ザクロ/.test(text)) return '実もの'
  if (/長寿梅|チョウジュバイ|紫式部|南天|ナンテン/.test(text)) return '花もの'
  if (/鉢|ポット|植木鉢/.test(text)) return '鉢・道具'
  if (/土|肥料|剪定|ハサミ|鋏|道具|用土|針金/.test(text)) return '鉢・道具'
  return '雑木類'
}

// 商品名からサイズカテゴリを自動判定
function detectSizeCategory(name, caption = '') {
  const text = (name + ' ' + caption).toLowerCase()
  if (/超ミニ|豆盆栽|極小/.test(text)) return 'mini'
  if (/ミニ|小型|小さい|手のひら/.test(text)) return 'small'
  if (/中型|中品|中木/.test(text)) return 'medium'
  if (/大型|大品|大木/.test(text)) return 'large'
  return 'small'
}

// 商品名から難易度を自動判定
function detectDifficulty(name, caption = '') {
  const text = (name + ' ' + caption).toLowerCase()
  if (/初心者|入門|かんたん|簡単|育てやすい/.test(text)) return 'beginner'
  if (/中級|やや難/.test(text)) return 'intermediate'
  if (/上級|難しい|熟練/.test(text)) return 'advanced'
  return 'beginner'
}

// タグ自動生成
function detectTags(name, caption = '') {
  const text = name + ' ' + caption
  const tags = []
  if (/室内|インドア/.test(text)) tags.push('室内向き')
  if (/屋外|アウトドア/.test(text)) tags.push('屋外向き')
  if (/ギフト|贈り物|プレゼント|お祝い/.test(text)) tags.push('ギフト向き')
  if (/初心者|入門/.test(text)) tags.push('初心者向き')
  if (/春|花見/.test(text)) tags.push('春')
  if (/夏/.test(text)) tags.push('夏')
  if (/秋|紅葉/.test(text)) tags.push('秋')
  if (/冬|寒/.test(text)) tags.push('冬')
  if (/セット|まとめ/.test(text)) tags.push('セット')
  return tags
}

// 楽天APIから1ページ分の商品を取得
async function fetchRakutenPage(keyword, page = 1) {
  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID,
    affiliateId:   RAKUTEN_AFFILIATE_ID,
    keyword,
    format:        'json',
    hits:          '30',
    page:          String(page),
    sort:          '-reviewCount',  // レビュー数順（人気順）
    genreId:       '101213',        // 楽天: 盆栽ジャンル
  })
  const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`楽天API エラー: ${res.status}`)
  return res.json()
}

// 楽天商品をDBスキーマに変換
function transformItem(item) {
  const name    = item.itemName?.replace(/\s+/g, ' ').trim() ?? ''
  const caption = item.itemCaption ?? ''
  const price   = item.itemPrice ?? 0

  // 盆栽関連以外をスキップ
  const isBonsai = /盆栽|ボンサイ|bonsai/i.test(name + caption)
  if (!isBonsai) return null

  // 価格帯フィルタ（異常値を除外）
  if (price < 500 || price > 500000) return null

  const imageUrl = item.mediumImageUrls?.[0]?.imageUrl?.replace('?_ex=128x128', '') ?? ''
  const buyUrl   = item.affiliateUrl || item.itemUrl || ''

  return {
    name,
    description:          caption.slice(0, 500) || `${name}の盆栽です。`,
    price,
    category:             detectCategory(name, caption),
    size_category:        detectSizeCategory(name, caption),
    difficulty_level:     detectDifficulty(name, caption),
    tags:                 detectTags(name, caption),
    image_url:            imageUrl,
    rakuten_url:          buyUrl,
    amazon_url:           '',
    source:               'rakuten',
    indoor_suitable:      /室内/.test(name + caption),
    gift_suitable:        /ギフト|プレゼント|贈り物/.test(name + caption),
    beginner_friendly:    /初心者|入門/.test(name + caption),
    season:               null,
    location:             null,
    height_cm:            null,
    width_cm:             null,
    pot_diameter_cm:      null,
    care_frequency:       null,
    sunlight_requirement: null,
    watering_frequency:   null,
    bloom_months:         null,
    foliage_months:       null,
  }
}

// メイン処理
async function main() {
  console.log('🌿 楽天商品インポート開始\n')

  // 既存の楽天商品名を取得（重複防止）
  const { data: existing } = await supabase
    .from('products')
    .select('name')
    .eq('source', 'rakuten')
  const existingNames = new Set((existing ?? []).map(p => p.name))
  console.log(`既存の楽天商品: ${existingNames.size}件\n`)

  let totalAdded   = 0
  let totalSkipped = 0

  for (const keyword of KEYWORDS) {
    console.log(`🔍 検索: "${keyword}"`)

    for (let page = 1; page <= 3; page++) {  // 各キーワード最大3ページ（=90件）
      try {
        const result = await fetchRakutenPage(keyword, page)
        const items  = result.Items ?? []

        if (items.length === 0) break

        const newItems = []
        for (const { Item: item } of items) {
          if (existingNames.has(item.itemName)) {
            totalSkipped++
            continue
          }
          const transformed = transformItem(item)
          if (!transformed) {
            totalSkipped++
            continue
          }
          newItems.push(transformed)
          existingNames.add(item.itemName)
        }

        if (newItems.length > 0) {
          const { error } = await supabase.from('products').insert(newItems)
          if (error) {
            console.error(`  ❌ 登録エラー: ${error.message}`)
          } else {
            console.log(`  ✅ page${page}: ${newItems.length}件追加`)
            totalAdded += newItems.length
          }
        } else {
          console.log(`  ⏭️  page${page}: 新規なし`)
        }

        // レート制限（楽天API: 1秒1リクエスト）
        await new Promise(r => setTimeout(r, 1100))

      } catch (err) {
        console.error(`  ❌ ${keyword} page${page}: ${err.message}`)
        await new Promise(r => setTimeout(r, 2000))
      }
    }
  }

  console.log(`\n✅ インポート完了`)
  console.log(`   追加: ${totalAdded}件`)
  console.log(`   スキップ（重複・非対象）: ${totalSkipped}件`)

  // 最終件数確認
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true })
  console.log(`   DB合計: ${count}件`)
}

main().catch(err => {
  console.error('致命的エラー:', err)
  process.exit(1)
})
