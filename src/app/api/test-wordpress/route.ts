import { NextResponse } from 'next/server'

export async function GET() {
  const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://bonsai-guidebook.net/wp-json/wp/v2'
  
  // 環境情報を詳細に記録
  console.log('🧪 Testing WordPress API connection from server...')
  console.log('🌐 WordPress URL:', WORDPRESS_API_URL)
  console.log('🔧 Node version:', process.version)
  console.log('🌍 Environment:', process.env.NODE_ENV)
  
  // まず基本的な接続テスト
  console.log('📡 Testing basic HTTP connection...')
  
  try {
    const startTime = Date.now()
    
    const response = await fetch(`${WORDPRESS_API_URL}/posts?per_page=3`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bonsai-Collection-Test/1.0'
      }
    })
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log('⏱️ Response time:', responseTime, 'ms')
    console.log('📊 Response status:', response.status)
    console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `WordPress API responded with ${response.status}: ${response.statusText}`,
        responseTime,
        url: WORDPRESS_API_URL
      }, { status: 500 })
    }
    
    const posts = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'WordPress API connection successful!',
      url: WORDPRESS_API_URL,
      responseTime,
      postsCount: posts.length,
      totalPosts: response.headers.get('X-WP-Total'),
      firstPost: posts[0] ? {
        id: posts[0].id,
        title: posts[0].title?.rendered,
        slug: posts[0].slug,
        date: posts[0].date
      } : null
    })
    
  } catch (error) {
    console.error('❌ WordPress API test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to WordPress API',
      message: error instanceof Error ? error.message : 'Unknown error',
      url: WORDPRESS_API_URL
    }, { status: 500 })
  }
}