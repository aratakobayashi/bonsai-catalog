'use client'

// 「はじめての1か月ガイド」のチェック欄。チェックした項目の id だけをブラウザ（localStorage）に保存する
// JavaScript が動かないときも、ふつうのチェックボックス付きの一覧として読める（保存はされない）
import Link from 'next/link'
import { useCallback, useSyncExternalStore } from 'react'

const KEY = 'bc:hajimete-checks'
const EVENT = 'bc:hajimete-checks-change'
const EMPTY: string[] = []

let cache: string[] | null = null

function read(): string[] {
  if (cache) return cache
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]')
    cache = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, 200) : []
  } catch {
    cache = []
  }
  return cache
}

function write(ids: string[]) {
  cache = ids
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    // 保存できない環境（プライベートモードなど）では、このページを開いている間だけ覚えておく
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return
    cache = null
    callback()
  }
  window.addEventListener(EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

function useChecks() {
  const checked = useSyncExternalStore(subscribe, read, () => EMPTY)
  const toggle = useCallback((id: string, on: boolean) => {
    const current = read()
    write(on ? Array.from(new Set([...current, id])) : current.filter(v => v !== id))
  }, [])
  const clear = useCallback((ids: string[]) => {
    write(read().filter(v => !ids.includes(v)))
  }, [])
  return { checked, toggle, clear }
}

export interface ChecklistEntry {
  id: string
  text: string
  tip?: string
  link?: { href: string; label: string }
}

export function Checklist({ items }: { items: ChecklistEntry[] }) {
  const { checked, toggle } = useChecks()
  return (
    <ul className="mt-3 border-t border-line">
      {items.map(item => {
        const on = checked.includes(item.id)
        return (
          <li key={item.id} className="border-b border-line">
            <label className="grid min-h-[48px] cursor-pointer grid-cols-[28px_minmax(0,1fr)] gap-3 py-3">
              <input
                type="checkbox"
                name={item.id}
                checked={on}
                onChange={e => toggle(item.id, e.target.checked)}
                className="mt-0.5 h-5 w-5 cursor-pointer accent-[#22201c]"
              />
              <span className={`text-[14px] leading-[1.8] ${on ? 'text-ink-muted line-through decoration-ink-muted/60' : 'text-ink'}`}>
                {item.text}
                {item.tip && <span className="mt-1.5 block border-l-2 border-gold bg-paper px-3 py-1.5 text-[13px] leading-[1.8] text-ink-soft no-underline">{item.tip}</span>}
              </span>
            </label>
            {item.link && (
              <p className="-mt-1.5 pb-3 pl-[40px]">
                <Link href={item.link.href} className="inline-flex min-h-[32px] items-center border-b border-ink text-[12.5px] text-ink">{item.link.label} →</Link>
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// 全体の進み具合と、チェックをすべて外すボタン
export function ChecklistProgress({ ids }: { ids: string[] }) {
  const { checked, clear } = useChecks()
  const done = ids.filter(id => checked.includes(id)).length
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-soft">
      <span>
        <span className="font-bold text-ink">{done}</span> / {ids.length} 項目
      </span>
      <span aria-hidden="true" className="relative block h-1.5 w-32 bg-line">
        <span className="absolute inset-y-0 left-0 bg-gold-dark" style={{ width: `${ids.length ? (done / ids.length) * 100 : 0}%` }} />
      </span>
      {done > 0 && (
        <button type="button" onClick={() => clear(ids)} className="min-h-[44px] border-b border-ink-muted text-[12.5px] text-ink-muted hover:text-ink">
          チェックをすべて外す
        </button>
      )}
      <span className="w-full text-[11.5px] text-ink-muted">チェックはこの端末のブラウザにだけ保存されます。</span>
    </div>
  )
}
