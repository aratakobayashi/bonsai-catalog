'use client'

import { useState, useEffect } from 'react'

interface TOCItem {
  level: number
  text: string
  id: string
}

interface TableOfContentsProps {
  items: TOCItem[]
}

// 見出しへスクロール（固定ヘッダーの分だけ上に余白を取る）
function scrollToHeading(id: string) {
  const element = document.getElementById(id)
  if (!element) return
  const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 90
  window.scrollTo({ top: offsetTop, behavior: 'smooth' })
}

// 今読んでいる見出しと、記事本文をどこまで読んだか（%）
function useReadingState(items: TOCItem[]) {
  const [activeId, setActiveId] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-20% 0% -35% 0%', threshold: 0 }
    )
    items.forEach(item => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [items])

  useEffect(() => {
    const update = () => {
      const body = document.getElementById('article-body')
      if (!body) return
      const rect = body.getBoundingClientRect()
      const total = rect.height - window.innerHeight * 0.5
      const read = Math.min(Math.max(-rect.top + window.innerHeight * 0.5, 0), Math.max(total, 1))
      setProgress(Math.round((read / Math.max(total, 1)) * 100))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const activeIndex = items.findIndex(item => item.id === activeId)
  return { activeId, activeIndex, progress }
}

function TocList({ items, activeId, onSelect }: { items: TOCItem[]; activeId: string; onSelect?: () => void }) {
  const minLevel = Math.min(...items.map(item => item.level))
  return (
    <ul className="border-l border-line">
      {items.map((item, index) => {
        const isActive = activeId === item.id
        return (
          <li key={`${item.id}-${index}`}>
            <button
              type="button"
              onClick={() => {
                scrollToHeading(item.id)
                onSelect?.()
              }}
              className={`-ml-px block w-full border-l-[3px] py-2 pr-1 text-left text-[13px] leading-snug transition-colors ${
                item.level > minLevel ? 'pl-6' : 'pl-3'
              } ${isActive ? 'border-gold font-bold text-navy' : 'border-transparent text-ink-soft hover:text-navy'}`}
            >
              {item.text}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// PC：サイドバーの目次（読了率つき）
export function TableOfContents({ items }: TableOfContentsProps) {
  const { activeId, progress } = useReadingState(items)
  if (items.length === 0) return null

  return (
    <nav aria-label="目次" className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-baseline">
        <span className="text-[13px] font-bold text-navy">目次</span>
        <span className="ml-auto text-[11px] text-ink-muted">読了 {progress}%</span>
      </div>
      <div className="mb-3 mt-2 h-[2px] bg-line">
        <div className="h-full bg-gold transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        <TocList items={items} activeId={activeId} />
      </div>
    </nav>
  )
}

// SP：本文前の開閉できる目次と、画面下の「目次 2/5」ボタン
export function MobileTableOfContents({ items }: TableOfContentsProps) {
  const { activeId, activeIndex } = useReadingState(items)
  const [open, setOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  if (items.length === 0) return null

  return (
    <>
      <nav aria-label="目次" className="rounded-[10px] border border-line bg-white">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center px-3.5 py-3 text-left">
          <span className="text-[13px] font-bold text-navy">目次（{items.length}項目）</span>
          <span className="ml-auto text-[11px] text-ink-muted">{open ? '閉じる ▴' : '開く ▾'}</span>
        </button>
        {open && (
          <div className="px-3.5 pb-3">
            <TocList items={items} activeId={activeId} />
          </div>
        )}
      </nav>

      {/* 画面下の目次ボタン（下部タブバーの上） */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-30 rounded-full bg-navy px-4 py-2.5 text-[13px] font-bold text-white shadow-lg"
      >
        目次 <span className="ml-1 font-normal text-[#e9c793]">{Math.max(activeIndex + 1, 1)}/{items.length}</span>
      </button>

      {sheetOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="目次">
          <button type="button" aria-label="閉じる" className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
            <div className="mb-2 flex items-center">
              <span className="text-sm font-bold text-navy">目次</span>
              <button type="button" onClick={() => setSheetOpen(false)} className="ml-auto text-xs text-ink-muted">閉じる ✕</button>
            </div>
            <TocList items={items} activeId={activeId} onSelect={() => setSheetOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
