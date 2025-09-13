import { NextResponse } from 'next/server'

export async function GET() {
  // 段階的テストで原因を特定
  const tests = []
  
  try {
    // Test 1: 環境変数確認
    const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://bonsai-guidebook.net/wp-json/wp/v2'
    tests.push({
      test: 'Environment Variables',
      status: 'PASS',
      data: {
        WORDPRESS_API_URL,
        NODE_ENV: process.env.NODE_ENV,
        nodeVersion: process.version
      }
    })

    // Test 2: 基本的なfetch機能テスト
    const simpleUrl = 'https://api.github.com/zen'
    try {
      const githubResponse = await fetch(simpleUrl, { 
        headers: { 'User-Agent': 'Test' },
        signal: AbortSignal.timeout(5000)
      })
      const githubText = await githubResponse.text()
      
      tests.push({
        test: 'Basic Fetch (GitHub API)',
        status: 'PASS',
        data: { 
          status: githubResponse.status,
          text: githubText.substring(0, 50) + '...'
        }
      })
    } catch (error) {
      tests.push({
        test: 'Basic Fetch (GitHub API)',
        status: 'FAIL',
        error: error instanceof Error ? error.message : String(error)
      })
    }

    // Test 3: WordPress API直接テスト
    const wpUrl = `${WORDPRESS_API_URL}/posts?per_page=1`
    try {
      console.log('🔍 Testing WordPress URL:', wpUrl)
      
      const wpResponse = await fetch(wpUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bonsai-Collection-Test/1.0'
        },
        signal: AbortSignal.timeout(10000)
      })
      
      console.log('📊 WordPress Response status:', wpResponse.status)
      console.log('📊 WordPress Response ok:', wpResponse.ok)
      
      if (!wpResponse.ok) {
        const errorText = await wpResponse.text()
        console.error('❌ WordPress Error:', errorText)
        
        tests.push({
          test: 'WordPress API Direct',
          status: 'FAIL',
          error: `HTTP ${wpResponse.status}: ${errorText}`,
          data: {
            status: wpResponse.status,
            statusText: wpResponse.statusText,
            headers: Object.fromEntries(wpResponse.headers.entries())
          }
        })
      } else {
        const wpData = await wpResponse.json()
        
        tests.push({
          test: 'WordPress API Direct',
          status: 'PASS',
          data: {
            status: wpResponse.status,
            postsCount: wpData.length,
            firstPost: wpData[0] ? {
              id: wpData[0].id,
              title: wpData[0].title?.rendered?.substring(0, 50),
              date: wpData[0].date
            } : null,
            headers: {
              total: wpResponse.headers.get('X-WP-Total'),
              totalPages: wpResponse.headers.get('X-WP-TotalPages')
            }
          }
        })
      }
    } catch (error) {
      console.error('❌ WordPress API Error:', error)
      
      tests.push({
        test: 'WordPress API Direct',
        status: 'FAIL',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
    }

    // Test 4: 実際のgetArticles関数テスト
    try {
      // getArticles関数を直接呼び出してテスト
      const { getArticles } = await import('@/lib/microcms')
      const articlesResult = await getArticles({ limit: 2 })
      
      tests.push({
        test: 'getArticles Function',
        status: 'PASS',
        data: {
          articlesCount: articlesResult.articles.length,
          totalCount: articlesResult.totalCount,
          firstArticle: articlesResult.articles[0] ? {
            id: articlesResult.articles[0].id,
            title: articlesResult.articles[0].title.substring(0, 50),
            source: articlesResult.articles[0].id.includes('error') ? 'ERROR' : 
                   articlesResult.articles[0].id === '206' || articlesResult.articles[0].id === '2' ? 'FALLBACK' : 'WORDPRESS'
          } : null
        }
      })
    } catch (error) {
      tests.push({
        test: 'getArticles Function',
        status: 'FAIL',
        error: error instanceof Error ? error.message : String(error)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'WordPress API diagnostic completed',
      timestamp: new Date().toISOString(),
      tests
    })

  } catch (globalError) {
    return NextResponse.json({
      success: false,
      error: 'Global test failure',
      message: globalError instanceof Error ? globalError.message : String(globalError),
      tests
    }, { status: 500 })
  }
}