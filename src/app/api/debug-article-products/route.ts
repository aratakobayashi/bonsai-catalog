import { NextResponse } from 'next/server'
import { getRecommendedProducts } from '@/lib/product-recommendation'

export async function POST(request: Request) {
  try {
    const { title, content, slug } = await request.json()
    
    console.log('🎯 記事商品推薦デバッグ')
    console.log('📝 記事タイトル:', title)
    console.log('🔗 記事スラッグ:', slug)
    
    // 推薦システムをテスト
    const recommendedProducts = await getRecommendedProducts(title, content, 4)
    
    return NextResponse.json({
      success: true,
      articleInfo: {
        title,
        slug,
        contentLength: content?.length || 0
      },
      recommendedProducts,
      productCount: recommendedProducts.length,
      debugInfo: {
        timestamp: new Date().toISOString(),
        systemWorking: true
      }
    })
    
  } catch (error) {
    console.error('❌ 記事商品推薦エラー:', error)
    return NextResponse.json({
      success: false,
      error: 'Article product recommendation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}