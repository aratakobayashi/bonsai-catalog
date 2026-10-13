'use client'

import { useState } from 'react'

export function GardenApplyButton() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState<string[]>([])

  const run = async () => {
    setRunning(true)
    setMessage([])
    try {
      const response = await fetch('/api/admin/gardens/apply', { method: 'POST' })
      const result = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      setMessage(result.error
        ? [`エラー：${result.error}`]
        : [
            `完了：${result.updated}園を更新、${result.inserted}園を追加しました（追加済み ${result.alreadyPresent}園）`,
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
        {running ? '反映中…' : '盆栽園データを反映する'}
      </button>
      {message.map(line => <p key={line} className="text-sm text-gray-800">{line}</p>)}
    </div>
  )
}
