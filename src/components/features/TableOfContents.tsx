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
    <ul>
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
              aria-current={isActive ? 'location' : undefined}
              className={`block w-full py-[9px] text-left text-[13px] leading-[1.65] transition-colors ${
                item.level > minLevel ? 'pl-4' : ''
              } ${isActive ? 'font-bold text-ink' : 'text-ink-muted hover:text-ink'}`}
            >
              {item.text}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// PC：サイドバーの目次（細い線で読了率を示す）
export function TableOfContents({ items }: TableOfContentsProps) {
  const { activeId, progress } = useReadingState(items)
  if (items.length === 0) return null

  return (
    <nav aria-label="目次">
      <div className="flex items-baseline text-[11px] tracking-[0.1em] text-ink-muted">
        <span>目次</span>
        <span className="sr-only">読了 {progress}%</span>
      </div>
      <div className="relative mb-1 mt-2.5 h-px bg-line" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="max-h-[55vh] overflow-y-auto">
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
      <nav aria-label="目次" className="border-y border-line">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center py-3 text-left text-[13.5px] text-ink">
          <span>目次</span>
          <span className="ml-auto text-xs text-ink-muted">
            {items.length}項目
            <span className={`ml-3 inline-block transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">▾</span>
          </span>
        </button>
        {open && (
          <div className="border-t border-line pb-2">
            <TocList items={items} activeId={activeId} />
          </div>
        )}
      </nav>

      {/* 画面下の目次ボタン（下部タブバーの上） */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-10 items-center gap-2 rounded-full bg-sumi px-4 text-[12.5px] text-paper shadow-lg"
      >
        目次 <span className="text-[#d9c7a3]">{Math.max(activeIndex + 1, 1)}/{items.length}</span>
      </button>

      {sheetOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="目次">
          <button type="button" aria-label="閉じる" className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto bg-paper px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 shadow-lg">
            <div className="mb-1 flex items-center border-b border-line pb-3">
              <span className="text-[11px] tracking-[0.1em] text-ink-muted">目次</span>
              <button type="button" onClick={() => setSheetOpen(false)} className="ml-auto text-xs text-ink-muted">閉じる ✕</button>
            </div>
            <TocList items={items} activeId={activeId} onSelect={() => setSheetOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
