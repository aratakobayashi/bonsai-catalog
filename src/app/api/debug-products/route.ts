import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 商品データベースデバッグ開始...')
    
    // 商品総数を確認
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ カウントエラー:', countError)
      return NextResponse.json({
        success: false,
        error: 'Count query failed',
        details: countError
      })
    }

    console.log(`📊 総商品数: ${count}`)

    // 実際の商品データを取得
    const { data: products, error: dataError } = await supabase
      .from('products')
      .select('id, name, category, price, status')
      .limit(10)

    if (dataError) {
      console.error('❌ データ取得エラー:', dataError)
      return NextResponse.json({
        success: false,
        error: 'Data query failed',
        details: dataError
      })
    }

    // テーブル存在確認
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')
      .catch(() => null)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      productCount: count,
      sampleProducts: products,
      supabaseConfig: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      },
      debugInfo: {
        nodeEnv: process.env.NODE_ENV,
        hasProducts: products && products.length > 0,
        tablesCheckResult: tables || tablesError?.message || 'Not available'
      }
    })

  } catch (error) {
    console.error('❌ 全般エラー:', error)
    return NextResponse.json({
      success: false,
      error: 'General error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}