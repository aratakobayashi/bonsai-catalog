'use client'

// 「気になる」（お気に入り）。商品 id だけをブラウザに保存し、画面どうしで同期する
// 上限（FAVORITES_MAX）に達したら、古いものを黙って消さずに追加を止めてお知らせする
import { useCallback, useSyncExternalStore } from 'react'

const KEY = 'bc:favorites'
const EVENT = 'bc:favorites-change'
const NOTICE_EVENT = 'bc:favorites-notice'
// このタブで最初に「気になる」に入れたときだけ案内を出す
const FIRST_ADD_KEY = 'bc:favorites-first-add'
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

// ---- お知らせ（「気になるに入れました ・ 比べる →」「上限に達しました」）。FavoritesDock が表示する ----

export type FavoriteNotice = { kind: 'first-add' | 'full' | 'partial'; message: string; at: number }

let notice: FavoriteNotice | null = null

export function showFavoriteNotice(kind: FavoriteNotice['kind'], message: string) {
  notice = { kind, message, at: Date.now() }
  window.dispatchEvent(new Event(NOTICE_EVENT))
}

export function clearFavoriteNotice() {
  notice = null
  window.dispatchEvent(new Event(NOTICE_EVENT))
}

function subscribeNotice(callback: () => void) {
  window.addEventListener(NOTICE_EVENT, callback)
  return () => window.removeEventListener(NOTICE_EVENT, callback)
}

export function useFavoriteNotice(): FavoriteNotice | null {
  return useSyncExternalStore(subscribeNotice, () => notice, () => null)
}

export const FULL_MESSAGE = `気になるは${FAVORITES_MAX}件までです。いくつか外してから入れてください`

function noticeFirstAdd() {
  try {
    if (window.sessionStorage.getItem(FIRST_ADD_KEY)) return
    window.sessionStorage.setItem(FIRST_ADD_KEY, '1')
  } catch {
    // sessionStorage が使えない環境では、毎回は出さないようこのページの間だけ覚えておく
    if (firstAddShown) return
  }
  firstAddShown = true
  showFavoriteNotice('first-add', '気になるに入れました')
}
let firstAddShown = false

export type AddResult = 'added' | 'exists' | 'full'

// 1件を先頭に追加する。上限なら追加せず、お知らせを出す
export function addFavorite(id: string): AddResult {
  const current = read()
  if (current.includes(id)) return 'exists'
  if (current.length >= FAVORITES_MAX) {
    showFavoriteNotice('full', FULL_MESSAGE)
    return 'full'
  }
  write([id, ...current])
  noticeFirstAdd()
  return 'added'
}

// 複数をまとめて追加する（共有されたリストから）。並び順は ids の順で先頭に入れる。入りきらない分は追加しない
export function addFavorites(ids: string[]): { added: number; skipped: number } {
  const current = read()
  const fresh = ids.filter((id, i) => !current.includes(id) && ids.indexOf(id) === i)
  const room = Math.max(0, FAVORITES_MAX - current.length)
  const adding = fresh.slice(0, room)
  const skipped = fresh.length - adding.length
  if (adding.length) write([...adding, ...current])
  if (skipped > 0) {
    showFavoriteNotice(
      'partial',
      adding.length
        ? `${adding.length}件を追加しました。上限の${FAVORITES_MAX}件のため、残り${skipped}件は追加していません`
        : FULL_MESSAGE,
    )
  } else if (adding.length) {
    noticeFirstAdd()
  }
  return { added: adding.length, skipped }
}

const EMPTY: string[] = []

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY)
  const has = useCallback((id: string) => ids.includes(id), [ids])
  // 入っていれば外す。入っていなければ追加（上限なら追加しない）
  const toggle = useCallback((id: string): AddResult | 'removed' => {
    const current = read()
    if (current.includes(id)) {
      write(current.filter(v => v !== id))
      return 'removed'
    }
    return addFavorite(id)
  }, [])
  const remove = useCallback((id: string) => write(read().filter(v => v !== id)), [])
  const removeMany = useCallback((targets: string[]) => {
    const drop = new Set(targets)
    write(read().filter(v => !drop.has(v)))
  }, [])
  const addMany = useCallback((targets: string[]) => addFavorites(targets), [])
  const clear = useCallback(() => write([]), [])
  return { ids, has, toggle, remove, removeMany, addMany, clear, full: ids.length >= FAVORITES_MAX }
}
