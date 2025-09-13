/**
 * 日付フォーマットユーティリティ
 * Hydrationエラーを防ぐため、サーバーとクライアントで一貫した結果を返す
 */

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  
  // ISO形式でパースして、日本時間として扱う
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // 固定フォーマットでhydrationエラーを防ぐ
  return `${year}年${month}月${day}日`
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今日'
  } else if (diffDays === 1) {
    return '昨日' 
  } else if (diffDays < 7) {
    return `${diffDays}日前`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}週間前`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}ヶ月前`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years}年前`
  }
}