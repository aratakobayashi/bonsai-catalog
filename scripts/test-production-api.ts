#!/usr/bin/env tsx

// 本番環境のAPIを直接テストするスクリプト
async function testProductionAPI() {
  try {
    console.log('🌐 Testing PRODUCTION environment API directly...\n')

    const baseUrl = 'https://bonsai-catalog.vercel.app' // 本番URL
    const testCategories = ['beginner', 'basic-care', 'species', 'scientific', 'events']

    for (const category of testCategories) {
      console.log(`🧪 Testing category: ${category}`)

      const startTime = Date.now()

      try {
        // 実際の本番APIを呼び出し
        const response = await fetch(`${baseUrl}/guides?category=${category}`)

        const endTime = Date.now()
        const duration = endTime - startTime

        if (response.ok) {
          const html = await response.text()

          // HTMLから記事数を推測（簡易的に）
          const articleMatches = html.match(/class="[^"]*article[^"]*"/g) || []
          const hasArticles = html.includes('記事が見つかりました') && !html.includes('0件の記事')

          console.log(`  ✅ Status: ${response.status}`)
          console.log(`  ⏱️  Response time: ${duration}ms`)
          console.log(`  📄 Has articles: ${hasArticles ? 'YES' : 'NO'}`)

          if (duration < 1000) {
            console.log(`  🚀 Performance: GOOD`)
          } else {
            console.log(`  🐌 Performance: SLOW`)
          }

        } else {
          console.log(`  ❌ HTTP Error: ${response.status}`)
        }

      } catch (error) {
        console.log(`  ❌ Network Error: ${error}`)
      }

      console.log('')

      // レート制限回避のため少し待つ
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // 基本的なページロードテスト
    console.log('🏠 Testing main guides page...')
    const startTime = Date.now()

    try {
      const response = await fetch(`${baseUrl}/guides`)
      const endTime = Date.now()
      const duration = endTime - startTime

      if (response.ok) {
        const html = await response.text()
        const hasCategories = html.includes('カテゴリ') || html.includes('category')
        const hasFilter = html.includes('フィルター') || html.includes('filter')

        console.log(`  ✅ Status: ${response.status}`)
        console.log(`  ⏱️  Response time: ${duration}ms`)
        console.log(`  🏷️  Has categories: ${hasCategories ? 'YES' : 'NO'}`)
        console.log(`  🔍 Has filters: ${hasFilter ? 'YES' : 'NO'}`)

      } else {
        console.log(`  ❌ HTTP Error: ${response.status}`)
      }

    } catch (error) {
      console.log(`  ❌ Network Error: ${error}`)
    }

    console.log('\n🎯 Production API test completed!')

  } catch (error) {
    console.error('❌ Production test failed:', error)
  }
}

// Run production test
testProductionAPI()