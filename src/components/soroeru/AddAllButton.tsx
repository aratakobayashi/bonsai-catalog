'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFavorites } from '@/lib/favorites'

// そろえるリストの商品を、まとめて「気になる」に入れる（買い物リストとして使う）
export function AddAllButton({ ids }: { ids: string[] }) {
  const { addMany } = useFavorites()
  const [done, setDone] = useState<number | null>(null)
  if (ids.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        onClick={() => setDone(addMany(ids).added)}
        className="inline-flex min-h-12 items-center justify-center bg-ink px-6 text-[14px] tracking-[0.06em] text-white hover:bg-gold-dark"
      >
        ♡ この{ids.length}点をまとめて「気になる」に入れる
      </button>
      {done !== null && (
        <p className="text-[13px] text-ink-soft" role="status">
          {done > 0 ? `${done}点を入れました。` : 'すでに入っています。'}
          <Link href="/favorites" className="ml-2 border-b border-ink text-ink">気になるで比べる ›</Link>
        </p>
      )}
    </div>
  )
}
