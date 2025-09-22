#!/usr/bin/env tsx

async function testLocalAPI() {
  try {
    console.log('🏠 Testing LOCAL development server...\n')

    const baseUrl = 'http://localhost:3000'
    const testCategories = [
      { slug: 'beginner', name: 'はじめての盆栽' },
      { slug: 'basic-care', name: '基本のお手入れ' }
    ]

    for (const category of testCategories) {
      console.log(`🧪 Testing LOCAL category: ${category.name} (${category.slug})`)

      const testUrl = `${baseUrl}/guides?category=${category.slug}`
      console.log(`📍 URL: ${testUrl}`)

      const startTime = Date.now()

      try {
        const response = await fetch(testUrl)
        const endTime = Date.now()
        const duration = endTime - startTime

        if (response.ok) {
          const html = await response.text()

          const hasResults = html.match(/(\d+)件の記事が見つかりました/)
          const articleCount = hasResults ? hasResults[1] : '0'

          console.log(`  ✅ Status: ${response.status}`)
          console.log(`  ⏱️  Response time: ${duration}ms`)
          console.log(`  📊 Articles shown: ${articleCount}`)

          if (parseInt(articleCount) > 0) {
            console.log(`  ✅ LOCAL SUCCESS: Shows ${articleCount} articles`)
          } else {
            console.log(`  ❌ LOCAL PROBLEM: Shows 0 articles`)
          }

        } else {
          console.log(`  ❌ HTTP Error: ${response.status}`)
        }

      } catch (error) {
        console.log(`  ❌ Network Error: ${error}`)
        console.log(`    (Development server might not be running)`)
      }

      console.log('')
    }

    // Test main guides page
    console.log('🏠 Testing LOCAL main guides page...')
    try {
      const response = await fetch(`${baseUrl}/guides`)
      if (response.ok) {
        const html = await response.text()
        const hasResults = html.match(/(\d+)件の記事が見つかりました/)
        const totalCount = hasResults ? hasResults[1] : '0'
        console.log(`  ✅ LOCAL total articles: ${totalCount}`)
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error}`)
    }

  } catch (error) {
    console.error('❌ Local API test failed:', error)
  }
}

// Run test
testLocalAPI()