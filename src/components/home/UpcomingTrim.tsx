'use client'
import { useEffect, useRef, type ReactNode } from 'react'

// トップのイベント一覧を、見ている日の日付に合わせて整える（サイトは数日おきに作り直すため）
// ・終わったイベント（data-end が今日より前）を隠し、残りの先頭 visible 件だけを表示する
// ・開催中なら「開催中」、今週末（土日）にかかるなら「今週末」の札を出す
export function UpcomingTrim({ children, visible = 4, className = '' }: { children: ReactNode; visible?: number; className?: string }) {
  const ref = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const list = ref.current
    if (!list) return
    const jst = new Date(Date.now() + 9 * 3600 * 1000)
    const ymd = (d: Date) => d.toISOString().slice(0, 10)
    const today = ymd(jst)
    const day = jst.getUTCDay()
    // 今週末：平日はこの先の土日、土日はその週末
    const toSat = day === 0 ? -1 : 6 - day
    const sat = new Date(jst.getTime() + toSat * 86400000)
    const weekendStart = ymd(sat)
    const weekendEnd = ymd(new Date(sat.getTime() + 86400000))
    let shown = 0
    list.querySelectorAll<HTMLLIElement>('li[data-end]').forEach(li => {
      const start = li.dataset.start ?? ''
      const end = li.dataset.end ?? ''
      if (end < today) {
        li.hidden = true
        return
      }
      li.hidden = shown >= visible
      shown++
      const badge = li.querySelector<HTMLElement>('[data-badge]')
      if (!badge || li.dataset.tentative) return
      const text = start <= today ? '開催中' : start <= weekendEnd && end >= weekendStart ? '今週末' : ''
      badge.textContent = text
      badge.hidden = !text
    })
  }, [visible])
  return <ul ref={ref} className={className}>{children}</ul>
}
