import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// 環境変数を読み込み
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTables() {
  console.log('🔧 テーブル作成開始...')

  try {
    // カテゴリーテーブル作成とデータ挿入
    console.log('1. カテゴリーテーブル作成とデータ挿入...')

    const categories = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'お手入れ・管理',
        slug: 'care-bonsai',
        description: '盆栽の日常管理、水やり、剪定等の育て方ガイド',
        color: 'bg-green-100 text-green-800',
        icon: '🌱'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'はじめての盆栽',
        slug: 'start-guide',
        description: '初心者向けの樹種選びや購入のポイント',
        color: 'bg-blue-100 text-blue-800',
        icon: '🎯'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: '種類別ガイド',
        slug: 'kinds',
        description: '松柏類、雑木類、花もの等の種類別詳細ガイド',
        color: 'bg-emerald-100 text-emerald-800',
        icon: '🌲'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'イベント・展示',
        slug: 'info',
        description: '盆栽展示会やイベント情報',
        color: 'bg-purple-100 text-purple-800',
        icon: '🎪'
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: '道具・鉢の選び方',
        slug: 'select',
        description: '盆栽道具や鉢の選び方ガイド',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🛠️'
      }
    ]

    const { error: categoryError } = await supabase
      .from('article_categories')
      .upsert(categories, { onConflict: 'slug' })

    if (categoryError) {
      console.error('❌ カテゴリー挿入エラー:', categoryError)
    } else {
      console.log('✅ カテゴリー作成完了')
    }

    // タグテーブル作成とデータ挿入
    console.log('2. タグテーブル作成とデータ挿入...')

    const tags = [
      { name: '初心者', slug: 'beginner', color: 'bg-blue-50 text-blue-700' },
      { name: '中級者', slug: 'intermediate', color: 'bg-yellow-50 text-yellow-700' },
      { name: '上級者', slug: 'advanced', color: 'bg-red-50 text-red-700' },
      { name: 'もみじ', slug: 'maple', color: 'bg-orange-50 text-orange-700' },
      { name: '松', slug: 'pine', color: 'bg-green-50 text-green-700' },
      { name: '桜', slug: 'sakura', color: 'bg-pink-50 text-pink-700' },
      { name: '水やり', slug: 'watering', color: 'bg-cyan-50 text-cyan-700' },
      { name: '剪定', slug: 'pruning', color: 'bg-lime-50 text-lime-700' },
      { name: '植え替え', slug: 'repotting', color: 'bg-amber-50 text-amber-700' },
      { name: '肥料', slug: 'fertilizer', color: 'bg-emerald-50 text-emerald-700' },
      { name: '病害虫', slug: 'pest-disease', color: 'bg-rose-50 text-rose-700' },
      { name: '開花', slug: 'flowering', color: 'bg-purple-50 text-purple-700' },
      { name: '紅葉', slug: 'autumn-leaves', color: 'bg-orange-50 text-orange-700' },
      { name: '実もの', slug: 'fruit-bearing', color: 'bg-red-50 text-red-700' },
      { name: '花もの', slug: 'flowering-tree', color: 'bg-pink-50 text-pink-700' },
      { name: '雑木類', slug: 'deciduous', color: 'bg-green-50 text-green-700' },
      { name: '松柏類', slug: 'coniferous', color: 'bg-teal-50 text-teal-700' },
      { name: '年間管理', slug: 'annual-care', color: 'bg-indigo-50 text-indigo-700' },
      { name: '道具', slug: 'tools', color: 'bg-gray-50 text-gray-700' },
      { name: '鉢', slug: 'pot', color: 'bg-stone-50 text-stone-700' }
    ]

    const { error: tagError } = await supabase
      .from('article_tags')
      .upsert(tags, { onConflict: 'slug' })

    if (tagError) {
      console.error('❌ タグ挿入エラー:', tagError)
    } else {
      console.log('✅ タグ作成完了')
    }

    console.log('✅ テーブル作成完了')
  } catch (error) {
    console.error('❌ テーブル作成エラー:', error)
  }
}

createTables().catch(console.error)