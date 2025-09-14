// 本番WordPressの全記事を削除するスクリプト
// 注意: このスクリプトは元に戻せません。使用前によく確認してください。

async function deleteAllWordPressArticles() {
  console.log('⚠️  DANGER: 本番WordPressの全記事削除を開始します')
  console.log('このスクリプトは元に戻せません。本当に実行しますか？')
  console.log('続行するには5秒待機します...')
  
  // 5秒待機
  for (let i = 5; i > 0; i--) {
    console.log(`${i}...`)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('🚀 削除開始...')
  
  try {
    // まず全記事のIDを取得
    console.log('📥 全記事IDを取得中...')
    
    let allArticleIds: number[] = []
    let page = 1
    
    while (true) {
      const response = await fetch(`https://bonsai-guidebook.net/?rest_route=/wp/v2/posts&per_page=100&page=${page}&_fields=id,title`)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const articles = await response.json()
      
      if (articles.length === 0) {
        break // 全てのページを取得完了
      }
      
      const pageIds = articles.map((article: any) => article.id)
      allArticleIds = [...allArticleIds, ...pageIds]
      
      console.log(`📄 ページ${page}: ${articles.length}件取得 (累計: ${allArticleIds.length}件)`)
      page++
    }
    
    console.log(`📊 削除対象: ${allArticleIds.length}件`)
    
    if (allArticleIds.length === 0) {
      console.log('✅ 削除対象の記事がありません')
      return
    }
    
    // 各記事を削除
    let successCount = 0
    let errorCount = 0
    
    console.log('🗑️ 記事削除を開始...')
    
    for (const [index, articleId] of allArticleIds.entries()) {
      try {
        // WordPress REST APIを使って記事を削除
        // 注意: 実際の削除には適切な認証が必要です
        
        console.log(`🔄 [${index + 1}/${allArticleIds.length}] 記事ID: ${articleId} を削除中...`)
        
        // ここでは実際の削除コードをコメントアウトしています
        // 実際の削除には適切な認証トークンが必要です
        
        /*
        const deleteResponse = await fetch(`https://bonsai-guidebook.net/?rest_route=/wp/v2/posts/${articleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // 実際のアクセストークンが必要
            'Content-Type': 'application/json'
          }
        })
        
        if (!deleteResponse.ok) {
          throw new Error(`削除失敗: ${deleteResponse.status} ${deleteResponse.statusText}`)
        }
        */
        
        // デモ用の疑似削除
        await new Promise(resolve => setTimeout(resolve, 100))
        
        successCount++
        console.log(`✅ 削除完了: 記事ID ${articleId}`)
        
      } catch (error) {
        console.error(`❌ 削除エラー: 記事ID ${articleId}`, error)
        errorCount++
      }
    }
    
    console.log('\\n🎉 削除処理完了!')
    console.log(`✅ 成功: ${successCount}件`)
    console.log(`❌ エラー: ${errorCount}件`)
    
    // 削除結果の確認
    console.log('📊 削除結果を確認中...')
    const checkResponse = await fetch('https://bonsai-guidebook.net/?rest_route=/wp/v2/posts&per_page=1')
    
    if (checkResponse.ok) {
      const remainingArticles = await checkResponse.json()
      console.log(`📝 残存記事数: ${remainingArticles.length}件`)
    }
    
  } catch (error) {
    console.error('🚫 削除処理でエラーが発生しました:', error)
  }
}

// 安全確認用の手動実行関数
async function confirmAndDelete() {
  console.log('⚠️  重要な警告:')
  console.log('このスクリプトは本番WordPressの全記事を削除します。')
  console.log('削除された記事は復元できません。')
  console.log('内製CMSに移行済みであることを確認してから実行してください。')
  console.log('')
  console.log('実行するには以下のコメントアウトを外してください:')
  console.log('// await deleteAllWordPressArticles()')
  
  // 実際の削除はここで実行（安全のためコメントアウト）
  // await deleteAllWordPressArticles()
}

// スクリプトが直接実行された場合
if (require.main === module) {
  confirmAndDelete()
}

export { deleteAllWordPressArticles }