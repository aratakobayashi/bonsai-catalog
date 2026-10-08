'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface FilterOption {
  label: string
  href: string
  active: boolean
}

export interface FilterMenu {
  key: string
  label: string
  // 選択中の値（チップに表示する）
  current?: string
  groups: { title?: string; options: FilterOption[] }[]
}

function Dropdown({ menu, open, onToggle, onClose, alignRight = false }: { menu: FilterMenu; open: boolean; onToggle: () => void; onClose: () => void; alignRight?: boolean }) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[13.5px] ${
          menu.current ? 'border-navy bg-navy/5 font-bold text-navy' : 'border-line bg-white text-ink'
        }`}
      >
        {menu.current ?? menu.label}
        <span className="text-[10px] text-ink-muted" aria-hidden="true">▼</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
          <div className={`absolute ${alignRight ? 'right-0' : 'left-0'} top-full z-50 mt-2 max-h-[60vh] w-64 overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-xl`}>
            {menu.groups.map((group, i) => (
              <div key={group.title ?? i} className={i > 0 ? 'mt-2 border-t border-line pt-2' : ''}>
                {group.title && <div className="px-2 pb-1 text-[11px] font-bold text-ink-muted">{group.title}</div>}
                {group.options.map(option => (
                  <Link
                    key={option.href + option.label}
                    href={option.href}
                    scroll={false}
                    onClick={onClose}
                    className={`block rounded-lg px-2.5 py-2 text-sm ${option.active ? 'bg-gold-light font-bold text-navy' : 'text-ink hover:bg-paper'}`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// 一覧の上の絞り込みバー。チップを押すと選択肢、「すべての条件」（スマホは「絞り込み」）で詳しい条件のフォームを開く
export function FilterBar({ menus, sort, activeCount, children }: { menus: FilterMenu[]; sort: FilterMenu; activeCount: number; children: ReactNode }) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sheetOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheetOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [sheetOpen])

  return (
    <div className="sticky top-14 z-30 border-b border-line bg-white lg:top-16">
      <div className="mx-auto flex max-w-[1280px] items-center gap-2 overflow-x-auto px-4 py-3 lg:overflow-visible lg:px-7">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-navy px-4 text-[13.5px] font-bold text-white lg:order-last"
        >
          <span className="lg:hidden">絞り込み</span>
          <span className="hidden lg:inline">すべての条件</span>
          {activeCount > 0 && <span className="ml-1.5 rounded-full bg-gold px-1.5 text-[11px]">{activeCount}</span>}
        </button>
        {menus.map(menu => (
          <div key={menu.key} className="hidden lg:block">
            <Dropdown menu={menu} open={openKey === menu.key} onToggle={() => setOpenKey(openKey === menu.key ? null : menu.key)} onClose={() => setOpenKey(null)} />
          </div>
        ))}
        {/* スマホは横スクロールのチップ（押すと詳しい条件を開く） */}
        {menus.map(menu => (
          <button
            key={`sp-${menu.key}`}
            type="button"
            onClick={() => setSheetOpen(true)}
            className={`inline-flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3.5 text-[13px] lg:hidden ${
              menu.current ? 'border-navy font-bold text-navy' : 'border-line text-ink'
            }`}
          >
            {menu.current ?? menu.label}<span className="text-[9px]" aria-hidden="true">▾</span>
          </button>
        ))}
        <div className="ml-auto hidden items-center gap-1 text-[13px] text-ink-soft lg:flex">
          並び順：
          <Dropdown alignRight menu={{ ...sort, label: sort.current ?? sort.label }} open={openKey === 'sort'} onToggle={() => setOpenKey(openKey === 'sort' ? null : 'sort')} onClose={() => setOpenKey(null)} />
        </div>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 lg:items-center" onClick={() => setSheetOpen(false)}>
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="絞り込み条件"
            onClick={e => e.stopPropagation()}
            className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-paper lg:max-w-xl lg:rounded-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-paper px-4 py-3">
              <span className="font-bold text-navy">絞り込み・並び替え</span>
              <button type="button" onClick={() => setSheetOpen(false)} className="text-sm text-navy">閉じる</button>
            </div>
            <div className="p-3">{children}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// スマホの並び替え（一覧の件数の横）
export function SortSelect({ sort }: { sort: FilterMenu }) {
  const [open, setOpen] = useState(false)
  return <Dropdown alignRight menu={{ ...sort, label: sort.current ?? sort.label }} open={open} onToggle={() => setOpen(!open)} onClose={() => setOpen(false)} />
}
