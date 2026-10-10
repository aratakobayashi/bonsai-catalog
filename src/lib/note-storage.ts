'use client'

// 「わたしの盆栽ノート」（/note）の記録。このブラウザの localStorage だけに保存し、サーバーには送らない
import { useCallback, useSyncExternalStore } from 'react'

const KEY = 'bc:note-trees'
const EVENT = 'bc:note-trees-change'
export const NOTE_MAX = 50
export const NOTE_NAME_MAX = 30
export const NOTE_MEMO_MAX = 300

export interface NoteTree {
  id: string
  speciesKey: string
  name: string
  // 迎えた日（YYYY-MM-DD）。分からなければ空
  acquiredAt: string
  // 最後に植え替えた年。分からなければ null
  lastRepotYear: number | null
  memo: string
  createdAt: number
}

export type NoteTreeInput = Omit<NoteTree, 'id' | 'createdAt'>

let cache: NoteTree[] | null = null
// 保存できない環境（プライベートモードなど）かどうか
let storageFailed = false

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function sanitize(value: unknown): NoteTree | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  if (typeof v.id !== 'string' || typeof v.speciesKey !== 'string') return null
  const year = typeof v.lastRepotYear === 'number' && Number.isInteger(v.lastRepotYear) && v.lastRepotYear > 1900 && v.lastRepotYear < 3000 ? v.lastRepotYear : null
  return {
    id: v.id,
    speciesKey: v.speciesKey,
    name: typeof v.name === 'string' ? v.name.slice(0, NOTE_NAME_MAX) : '',
    acquiredAt: typeof v.acquiredAt === 'string' && DATE_RE.test(v.acquiredAt) ? v.acquiredAt : '',
    lastRepotYear: year,
    memo: typeof v.memo === 'string' ? v.memo.slice(0, NOTE_MEMO_MAX) : '',
    createdAt: typeof v.createdAt === 'number' ? v.createdAt : 0,
  }
}

function read(): NoteTree[] {
  if (cache) return cache
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]')
    cache = Array.isArray(parsed) ? parsed.map(sanitize).filter((t): t is NoteTree => t !== null).slice(0, NOTE_MAX) : []
  } catch {
    cache = []
  }
  return cache
}

function write(trees: NoteTree[]) {
  cache = trees.slice(0, NOTE_MAX)
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache))
    storageFailed = false
  } catch {
    // 保存できない環境では、このページを開いている間だけ覚えておく
    storageFailed = true
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

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  } catch {
    // 下の方法で作る
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// サーバーで描くとき（と読み込む前）は null。画面では「読み込み中」として扱う
const serverSnapshot = (): NoteTree[] | null => null

export function useNoteTrees() {
  const trees = useSyncExternalStore<NoteTree[] | null>(subscribe, read, serverSnapshot)
  const add = useCallback((input: NoteTreeInput): boolean => {
    const current = read()
    if (current.length >= NOTE_MAX) return false
    write([...current, { ...input, id: newId(), createdAt: Date.now() }])
    return true
  }, [])
  const update = useCallback((id: string, input: NoteTreeInput) => {
    write(read().map(t => (t.id === id ? { ...t, ...input } : t)))
  }, [])
  const remove = useCallback((id: string) => {
    write(read().filter(t => t.id !== id))
  }, [])
  return { trees, add, update, remove, storageFailed, full: (trees?.length ?? 0) >= NOTE_MAX }
}
