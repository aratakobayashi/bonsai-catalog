'use client'

import Link from 'next/link'
import { useEffect } from 'react'

// ページの表示中にサーバー側で一時的なエラーが起きたときの画面（再読み込みで直ることが多い）
export default function ErrorPage({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('ページの表示エラー:', error.digest ?? error.message)
  }, [error])

  return (
    <div className="mx-auto max-w-[624px] px-4 pb-14 pt-[72px] text-center lg:pb-20 lg:pt-24">
      <p className="font-mincho text-[22px] font-bold leading-[1.45] tracking-[0.08em] text-ink lg:text-[32px]">
        ページを<br className="lg:hidden" />表示できませんでした
      </p>
      <p className="mt-2.5 text-[13px] leading-[2] text-ink-soft lg:mt-3.5 lg:text-[14.5px]">
        一時的に読み込みに失敗しました。お手数ですが、もう一度読み込んでください。
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3 lg:mt-9">
        {/* 画面の切り替えではなくページ全体を読み込み直す（保存済みの正常なページが表示される） */}
        <button type="button" onClick={() => window.location.reload()} className="inline-flex h-[50px] items-center justify-center bg-sumi px-7 text-sm tracking-[0.08em] text-paper hover:bg-sumi-light">
          もう一度読み込む
        </button>
        <Link href="/" className="inline-flex h-[50px] items-center justify-center border border-sumi px-6 text-sm tracking-[0.06em] text-ink hover:border-gold-dark hover:text-gold-dark">
          トップへ
        </Link>
      </div>
      {error.digest && <p className="mt-8 font-mono text-[11px] text-ink-muted">エラー番号：{error.digest}</p>}
    </div>
  )
}
