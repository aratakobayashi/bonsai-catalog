'use client'

import { useState } from 'react'

interface SyncResult {
  ok?: boolean
  processedCategories?: string[]
  remainingCategories?: number
  fetched?: number
  upserted?: number
  deactivated?: number
  failedRequests?: number
  errors?: string[]
  error?: string
}

// 1回の実行は40秒程度で区切られるため、全カテゴリが終わるまで数回に分けて実行する
const MAX_ROUNDS = 5

export function RakutenSyncButton() {
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const run = async () => {
    setRunning(true)
    setLog([])
    let total = 0
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      let result: SyncResult
      try {
        const response = await fetch('/api/cron/sync-rakuten')
        const text = await response.text()
        try {
          result = JSON.parse(text)
        } catch {
          result = { error: `HTTP ${response.status}（時間切れなどでサーバーが応答を返せませんでした）` }
        }
      } catch {
        result = { error: '通信に失敗しました' }
      }

      if (result.error) {
        setLog(prev => [...prev, `${round}回目：${result.error}`])
        break
      }
      total += result.upserted ?? 0
      setLog(prev => [
        ...prev,
        `${round}回目：${result.processedCategories?.length ?? 0}カテゴリを処理、${result.upserted ?? 0}件を保存（残り${result.remainingCategories ?? 0}カテゴリ）`,
        ...(result.errors ?? []).map(error => `　エラー：${error}`),
      ])
      if (!result.remainingCategories || !result.processedCategories?.length) break
    }
    setLog(prev => [...prev, `完了：合計 ${total} 件を保存しました`])
    setRunning(false)
  }

  return (
    <div className="space-y-3">
      <button
        onClick={run}
        disabled={running}
        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        {running ? '同期中…（全部で1〜2分ほどかかります）' : '楽天の商品を今すぐ同期する'}
      </button>
      {log.length > 0 && (
        <div className="text-sm bg-gray-50 border rounded p-3 space-y-1">
          {log.map((line, i) => (
            <p key={i} className={line.includes('エラー') || line.includes('HTTP') || line.includes('失敗') ? 'text-red-700' : ''}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}
