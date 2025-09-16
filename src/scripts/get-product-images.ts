import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// 環境変数を読み込み
config({ path: '.env.local' })

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getProductImagesBySpecies() {
  console.log('🔍 各樹種の商品画像を検索します...')

  try {
    // 各樹種のキーワードで商品を検索
    const speciesKeywords = {
      '真柏': ['真柏', 'シンパク', 'しんぱく', 'Juniper'],
      'もみじ': ['もみじ', '山もみじ', 'モミジ', 'もみじ', 'maple'],
      '黒松': ['黒松', '松', 'クロマツ', 'まつ', 'Pine'],
      '欅': ['欅', 'ケヤキ', 'けやき', 'keyaki'],
      '山野草': ['山野草', 'ナンテン', 'なんてん', '南天']
    }

    const productImages: Record<string, any> = {}

    for (const [species, keywords] of Object.entries(speciesKeywords)) {
      console.log(`\n🔍 ${species}の商品を検索中...`)

      // キーワードでOR検索
      let query = supabase
        .from('products')
        .select('id, name, image_url, price')

      // 各キーワードでOR検索を構築
      const conditions = keywords.map(keyword => `name.ilike.%${keyword}%`).join(',')

      const { data, error } = await query
        .or(conditions)
        .limit(3) // 各樹種最大3商品

      if (error) {
        console.error(`❌ ${species}の検索エラー:`, error)
        continue
      }

      if (data && data.length > 0) {
        productImages[species] = data
        console.log(`✅ ${species}: ${data.length}件の商品を発見`)
        data.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - ¥${product.price?.toLocaleString()}`)
        })
      } else {
        console.log(`❌ ${species}: 商品が見つかりませんでした`)
      }
    }

    console.log('\n📊 検索結果まとめ:')
    console.log(JSON.stringify(productImages, null, 2))

    return productImages

  } catch (error) {
    console.error('🚫 エラーが発生しました:', error)
  }
}

// スクリプト実行
if (require.main === module) {
  getProductImagesBySpecies()
}

export { getProductImagesBySpecies }