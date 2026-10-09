'use client'

import Link from 'next/link'
import { useEffect } from 'react'

// ページの表示中にサーバー側で一時的なエラーが起きたときの画面（再読み込みで直ることが多い）
export default function ErrorPage({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('ページの表示エラー:', error.digest ?? error.message)
  }, [error])

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="font-mincho text-2xl font-bold text-navy">ページを表示できませんでした</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        一時的に読み込みに失敗しました。お手数ですが、もう一度読み込んでください。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {/* 画面の切り替えではなくページ全体を読み込み直す（保存済みの正常なページが表示される） */}
        <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-light">
          もう一度読み込む
        </button>
        <Link href="/" className="rounded-lg border border-line bg-white px-5 py-2.5 text-sm text-ink hover:border-gold">トップへ</Link>
      </div>
      {error.digest && <p className="mt-6 text-[11px] text-ink-muted">エラー番号：{error.digest}</p>}
    </div>
  )
}
