'use client'

import { useState } from 'react'

export function EventApplyButton() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState<string[]>([])

  const run = async () => {
    setRunning(true)
    setMessage([])
    try {
      const response = await fetch('/api/admin/events/apply', { method: 'POST' })
      const result = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      setMessage(result.error
        ? [`エラー：${result.error}`]
        : [
            `完了：古いイベント${result.deleted}件を削除、${result.inserted}件を追加、${result.updated}件を更新しました`,
            ...(result.errors ?? []).map((e: string) => `　エラー：${e}`),
          ])
    } catch {
      setMessage(['通信に失敗しました'])
    }
    setRunning(false)
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-medium"
      >
        {running ? '反映中…' : 'イベントデータを反映する'}
      </button>
      {message.map(line => <p key={line} className="text-sm text-gray-800">{line}</p>)}
    </div>
  )
}
