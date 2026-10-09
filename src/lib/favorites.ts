'use client'

// 「気になる」（お気に入り）。商品 id だけをブラウザに保存し、画面どうしで同期する
import { useCallback, useSyncExternalStore } from 'react'

const KEY = 'bc:favorites'
const EVENT = 'bc:favorites-change'
export const FAVORITES_MAX = 30

let cache: string[] | null = null

function read(): string[] {
  if (cache) return cache
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]')
    cache = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, FAVORITES_MAX) : []
  } catch {
    cache = []
  }
  return cache
}

function write(ids: string[]) {
  cache = ids.slice(0, FAVORITES_MAX)
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache))
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

const EMPTY: string[] = []

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY)
  const has = useCallback((id: string) => ids.includes(id), [ids])
  const toggle = useCallback((id: string) => {
    const current = read()
    write(current.includes(id) ? current.filter(v => v !== id) : [id, ...current])
  }, [])
  const remove = useCallback((id: string) => write(read().filter(v => v !== id)), [])
  const clear = useCallback(() => write([]), [])
  return { ids, has, toggle, remove, clear }
}
