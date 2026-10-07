'use client'

import { useState } from 'react'

interface SyncResult {
  ok?: boolean
  fetched?: number
  upserted?: number
  deactivated?: number
  failedRequests?: number
  errors?: string[]
  error?: string
}

// 楽天の商品同期を手動で実行する（通常は3日ごとに自動実行）
export function RakutenSyncButton() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)

  const run = async () => {
    setRunning(true)
    setResult(null)
    try {
      const response = await fetch('/api/cron/sync-rakuten')
      setResult(await response.json())
    } catch {
      setResult({ error: '通信に失敗しました' })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={run}
        disabled={running}
        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        {running ? '同期中…（1分ほどかかります）' : '楽天の商品を今すぐ同期する'}
      </button>
      {result && (
        <div className="text-sm bg-gray-50 border rounded p-3 space-y-1">
          {result.error ? (
            <p className="text-red-700">{result.error}</p>
          ) : (
            <>
              <p>取得 {result.fetched} 件／保存 {result.upserted} 件／非表示 {result.deactivated} 件</p>
              {!!result.failedRequests && <p className="text-amber-700">取得に失敗したリクエスト：{result.failedRequests} 件</p>}
              {result.errors?.map(error => <p key={error} className="text-red-700">{error}</p>)}
            </>
          )}
        </div>
      )}
    </div>
  )
}
