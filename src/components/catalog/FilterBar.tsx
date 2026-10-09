'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { SpeciesTab } from '@/lib/catalog-menus'

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
        className="flex items-baseline gap-2 whitespace-nowrap text-[13px]"
      >
        <span className="text-ink-muted">{menu.label}</span>
        <span className="border-b border-line pb-px text-ink">{menu.current}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
          <div className={`absolute ${alignRight ? 'right-0' : 'left-0'} top-full z-50 mt-3 max-h-[60vh] w-56 overflow-y-auto border border-line bg-white py-1 shadow-[0_18px_40px_rgba(34,32,28,0.1)]`}>
            {menu.groups.map((group, i) => (
              <div key={group.title ?? i}>
                {group.title && <div className="px-4 pb-1 pt-2 text-[11.5px] text-ink-muted">{group.title}</div>}
                {group.options.map(option => (
                  <Link
                    key={option.href + option.label}
                    href={option.href}
                    scroll={false}
                    onClick={onClose}
                    aria-current={option.active ? 'true' : undefined}
                    className={`flex items-baseline gap-2 border-b border-paper-deep px-4 py-2.5 text-[13.5px] last:border-b-0 hover:bg-paper ${option.active ? 'text-ink' : 'text-ink-soft'}`}
                  >
                    <span className="w-2.5 text-gold-dark" aria-hidden="true">{option.active ? '—' : ''}</span>
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

// 条件の選択肢（PCのパネル・スマホのシート共通）。押すとすぐ一覧に反映され、パネルは開いたまま
function OptionGroups({ menus, variant }: { menus: FilterMenu[]; variant: 'panel' | 'sheet' }) {
  const groups = menus.flatMap(menu => menu.groups.map((g, i) => ({ key: `${menu.key}-${i}`, title: g.title ?? menu.label, options: g.options })))
  return (
    <div className={variant === 'panel' ? 'grid grid-cols-4 gap-x-7 gap-y-5' : ''}>
      {groups.map(group => (
        <div key={group.key} className={variant === 'sheet' ? 'border-b border-line pb-2 pt-4' : ''}>
          <div className="mb-1.5 text-[11.5px] tracking-[0.06em] text-ink-muted">{group.title}</div>
          {group.options.map(option => (
            <Link
              key={option.href + option.label}
              href={option.href}
              scroll={false}
              aria-current={option.active ? 'true' : undefined}
              className={`flex w-full items-center gap-2 text-left hover:text-ink ${
                variant === 'panel' ? 'border-b border-paper-deep py-2 text-[13.5px]' : 'min-h-[44px] text-[14.5px]'
              } ${option.active ? 'text-ink' : 'text-ink-soft'}`}
            >
              <span className="w-3 shrink-0 text-gold-dark" aria-hidden="true">{option.active ? '—' : ''}</span>
              <span className="flex-1">{option.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

function TabLink({ tab }: { tab: SpeciesTab }) {
  return (
    <Link
      href={tab.href}
      prefetch={false}
      aria-current={tab.active ? 'page' : undefined}
      className={`flex h-full shrink-0 items-center gap-1 font-mincho text-[14.5px] font-bold lg:gap-[5px] lg:text-[15.5px] ${
        tab.active ? 'text-ink shadow-[inset_0_-1.5px_0_#22201c] hover:text-ink' : 'text-ink-muted hover:text-ink'
      }`}
    >
      {tab.inSeason && (
        <>
          <span className="h-[5px] w-[5px] rounded-full bg-gold" aria-hidden="true" />
          <span className="sr-only">今が見頃の</span>
        </>
      )}
      {tab.label}
      <span className="hidden font-sans text-[11px] font-normal text-ink-muted lg:inline">{tab.count.toLocaleString()}<span className="sr-only">件</span></span>
    </Link>
  )
}

interface FilterBarProps {
  allTab: SpeciesTab
  tabs: SpeciesTab[]
  // 条件のパネルに出す選択肢
  menus: FilterMenu[]
  sort: FilterMenu
  // 選択中の条件の名前（「条件」の横に表示）
  conditions: string[]
  activeCount: number
  total: number
  clearHref: string
  // キーワード・価格の細かい指定のフォーム
  children: ReactNode
}

// 一覧の上の帯：樹種のタブ（横スクロール）と、PCは「条件」「並び順」、スマホは「条件」ボタン
export function FilterBar({ allTab, tabs, menus, sort, conditions, activeCount, total, clearHref, children }: FilterBarProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const tabsRef = useRef<HTMLElement>(null)

  // 選択中の樹種のタブが見えるように、横スクロールの位置を合わせる
  useEffect(() => {
    const nav = tabsRef.current
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!nav || !active) return
    nav.scrollLeft = Math.max(0, active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2)
  }, [allTab.active, tabs])

  useEffect(() => {
    if (!sheetOpen && !panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setSheetOpen(false)
      setPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    if (sheetOpen) document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [sheetOpen, panelOpen])

  const conditionText = conditions.length ? conditions.join('・') : '指定なし'

  return (
    <div className="sticky top-14 z-30 border-y border-line bg-paper/[.97] lg:border-t-0">
      <div className="relative mx-auto flex h-12 max-w-[1280px] items-stretch lg:h-14 lg:items-center lg:gap-6 lg:px-12">
        <nav
          ref={tabsRef}
          aria-label="樹種"
          className="relative flex h-full min-w-0 flex-1 items-stretch gap-5 overflow-x-auto px-4 [scrollbar-width:none] lg:gap-[26px] lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <TabLink tab={allTab} />
          {tabs.map(tab => <TabLink key={tab.key} tab={tab} />)}
        </nav>

        {/* PC：条件のパネルと並び順 */}
        <div className="hidden h-[22px] w-px bg-line lg:block" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setPanelOpen(v => !v)}
          aria-expanded={panelOpen}
          className="hidden max-w-[330px] shrink-0 items-baseline gap-2 whitespace-nowrap text-[13px] lg:flex"
        >
          <span className="text-ink-muted">条件</span>
          <span className={`overflow-hidden text-ellipsis border-b pb-px ${conditions.length ? 'border-ink text-ink' : 'border-line text-ink-muted'}`}>{conditionText}</span>
          <span className="text-[9px] text-ink-muted" aria-hidden="true">{panelOpen ? '▲' : '▼'}</span>
        </button>
        <div className="hidden lg:block">
          <Dropdown alignRight menu={{ ...sort, label: '並び順' }} open={sortOpen} onToggle={() => setSortOpen(v => !v)} onClose={() => setSortOpen(false)} />
        </div>

        {/* スマホ：条件のシートを開く */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex shrink-0 items-center gap-1.5 border-l border-line bg-paper px-4 text-[13px] text-ink shadow-[-12px_0_12px_-6px_#faf9f6] lg:hidden"
        >
          条件
          {activeCount > 0 && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-sumi px-1 text-[10.5px] text-white">
              {activeCount}<span className="sr-only">件の条件を指定中</span>
            </span>
          )}
        </button>

        {panelOpen && (
          <>
            <div className="fixed inset-0 z-40 hidden lg:block" onClick={() => setPanelOpen(false)} aria-hidden="true" />
            <div role="dialog" aria-label="条件" className="absolute right-12 top-full z-50 hidden w-[820px] max-w-[calc(100vw-96px)] border border-line bg-white shadow-[0_18px_40px_rgba(34,32,28,0.1)] lg:block">
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-[26px] pb-2.5 pt-[22px]">
                <OptionGroups menus={menus} variant="panel" />
              </div>
              <div className="flex items-center gap-5 border-t border-paper-deep px-[26px] pb-[18px] pt-3.5">
                <Link href={clearHref} scroll={false} onClick={() => setPanelOpen(false)} className="text-[12.5px] text-ink-muted hover:text-ink">すべて解除</Link>
                <button type="button" onClick={() => { setPanelOpen(false); setSheetOpen(true) }} className="border-b border-ink pb-0.5 text-[12.5px] text-ink">
                  キーワード・価格を指定する
                </button>
                <span className="ml-auto text-xs text-ink-muted">条件を選ぶと、すぐ一覧に反映されます</span>
                <button type="button" onClick={() => setPanelOpen(false)} className="h-10 bg-sumi px-6 text-[13px] tracking-[0.06em] text-white hover:bg-sumi-light">
                  {total.toLocaleString()}件を見る
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 固定の見出し行の中だと下部タブより下に重なるため、body 直下に出す */}
      {sheetOpen && createPortal(
        <div className="fixed inset-0 z-[60] bg-paper lg:flex lg:items-center lg:justify-center lg:bg-black/40" onClick={() => setSheetOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="条件"
            onClick={e => e.stopPropagation()}
            className="flex h-full w-full flex-col bg-paper lg:h-auto lg:max-h-[88vh] lg:max-w-xl"
          >
            <div className="flex h-[52px] shrink-0 items-center border-b border-line px-5">
              <span className="font-mincho text-[17px] font-bold">条件</span>
              <button type="button" onClick={() => setSheetOpen(false)} className="ml-auto h-11 text-[13px]">閉じる</button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5">
              <div className="lg:hidden">
                <OptionGroups menus={menus} variant="sheet" />
                <div className="pb-2 pt-5 text-[11.5px] tracking-[0.06em] text-ink-muted">キーワード・価格・並び順</div>
              </div>
              <div className="pb-6 lg:pt-5">{children}</div>
            </div>
            <div className="flex shrink-0 items-center gap-4 border-t border-line px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-3 lg:pb-[18px]">
              <Link href={clearHref} scroll={false} onClick={() => setSheetOpen(false)} className="text-[13px] text-ink-muted">すべて解除</Link>
              <button type="button" onClick={() => setSheetOpen(false)} className="h-[50px] flex-1 bg-sumi text-sm tracking-[0.06em] text-white">
                {total.toLocaleString()}件を見る
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// スマホの並び替え（一覧の件数の横）
export function SortSelect({ sort }: { sort: FilterMenu }) {
  const [open, setOpen] = useState(false)
  return <Dropdown alignRight menu={{ ...sort, label: '並び順' }} open={open} onToggle={() => setOpen(!open)} onClose={() => setOpen(false)} />
}

// PCでは商品カードを押すと、ページを移動せず右の詳細を切り替える（スマホ・JavaScriptなしは商品ページへ）
export function ListSelectArea({ children, className = '' }: { children: ReactNode; className?: string }) {
  const router = useRouter()
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-select-href]')
    if (!anchor || !window.matchMedia('(min-width: 1024px)').matches) return
    e.preventDefault()
    router.push(anchor.dataset.selectHref!, { scroll: false })
  }
  // リンク自身の処理より先に受け取るため、キャプチャで処理する
  return <div className={className} onClickCapture={onClick}>{children}</div>
}
