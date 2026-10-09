'use client'

// 全画面のシート（検索・条件）で共通に使う小さなフック
import { useCallback, useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// シートの中で Tab / Shift+Tab を回す（後ろのページにフォーカスが移らないようにする）
export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    const root = ref.current
    if (!active || !root) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null || el === document.activeElement)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement as HTMLElement | null
      if (e.shiftKey && (current === first || !root.contains(current))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (current === last || !root.contains(current))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ref, active])
}

// シートを開いたときに履歴を1つ積み、ブラウザの「戻る」でシートだけを閉じる
// - 閉じるボタン・Escape では dismiss()（積んだ履歴を戻して閉じる）
// - シートの中からページを移動するときは、Link の replace / router.replace を使うと積んだ履歴が置き換わる
//   （isMarked() で、積んだ履歴の上にいるかを確かめられる）
export function useHistoryDismiss(open: boolean, onClose: () => void, key: string) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const isMarked = useCallback(() => {
    try {
      return Boolean(window.history.state && window.history.state[key])
    } catch {
      return false
    }
  }, [key])

  // 開いている間は、今の履歴に印を付けた複製を積む（条件を選んで URL が変わったら、また積み直す）
  const mark = useCallback(() => {
    if (isMarked()) return
    try {
      window.history.pushState({ ...(window.history.state ?? {}), [key]: true }, '', window.location.href)
    } catch {
      // 履歴を操作できない環境では、戻るボタンでの閉じる動作は省く
    }
  }, [isMarked, key])

  useEffect(() => {
    if (!open) return
    mark()
    const onPop = () => {
      if (!isMarked()) onCloseRef.current()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [open, mark, isMarked])

  const dismiss = useCallback(() => {
    if (isMarked()) window.history.back()
    else onCloseRef.current()
  }, [isMarked])

  return { dismiss, isMarked, mark }
}
