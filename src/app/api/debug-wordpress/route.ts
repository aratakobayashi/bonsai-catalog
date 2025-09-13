import { NextResponse } from 'next/server'

export async function GET() {
  const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://bonsai-guidebook.net/wp-json/wp/v2'
  
  try {
    console.log('WordPress API URL:', WORDPRESS_API_URL)
    
    const response = await fetch(`${WORDPRESS_API_URL}/posts?_embed=true&per_page=3`, {
      headers: {
        'Accept': 'application/json',
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      return NextResponse.json({
        error: `WordPress API error: ${response.status} ${response.statusText}`,
        url: WORDPRESS_API_URL,
        status: response.status
      }, { status: 500 })
    }
    
    const posts = await response.json()
    
    return NextResponse.json({
      success: true,
      url: WORDPRESS_API_URL,
      postsCount: posts.length,
      firstPost: posts[0] ? {
        id: posts[0].id,
        title: posts[0].title?.rendered,
        slug: posts[0].slug,
        date: posts[0].date
      } : null
    })
    
  } catch (error) {
    console.error('WordPress API debug error:', error)
    return NextResponse.json({
      error: 'Failed to fetch from WordPress API',
      message: error instanceof Error ? error.message : 'Unknown error',
      url: WORDPRESS_API_URL
    }, { status: 500 })
  }
}