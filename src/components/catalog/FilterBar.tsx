'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { SpeciesTab } from '@/lib/catalog-menus'
import { useFocusTrap, useHistoryDismiss } from '@/components/layout/dialog-utils'

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

// 条件のシートの下にある、キーワード・価格の入力欄の送信先
export interface KeywordFormTarget {
  // 送信先のパス（カテゴリページではカテゴリの URL）
  action: string
  // キーワード・価格・ページ以外の今の条件（URL の検索パラメーター）
  params: [string, string][]
  q?: string
  min?: number
  max?: number
  maxLength: number
}

function Dropdown({ menu, open, onToggle, onClose, alignRight = false }: { menu: FilterMenu; open: boolean; onToggle: () => void; onClose: () => void; alignRight?: boolean }) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-11 items-center gap-2 whitespace-nowrap text-[13px] lg:min-h-0"
      >
        <span className="text-ink-muted">{menu.label}</span>
        <span className="border-b border-line pb-px text-ink">{menu.current}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
          <div className={`absolute ${alignRight ? 'right-0' : 'left-0'} top-full z-50 mt-3 max-h-[60vh] w-56 overflow-y-auto border border-line bg-white py-1 shadow-[0_18px_40px_rgba(34,32,28,0.1)] max-lg:mt-0`}>
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
                    className={`flex min-h-11 items-center gap-2 border-b border-paper-deep px-4 py-2.5 text-[13.5px] last:border-b-0 hover:bg-paper lg:min-h-0 ${option.active ? 'text-ink' : 'text-ink-soft'}`}
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

interface OptionGroup {
  key: string
  title: string
  options: FilterOption[]
}

function flattenGroups(menus: FilterMenu[]): OptionGroup[] {
  return menus.flatMap(menu => menu.groups.map((g, i) => ({ key: `${menu.key}-${i}`, title: g.title ?? menu.label, options: g.options })))
}

// 選択中の選択肢の名前（「指定なし」「すべて」以外が選ばれているとき）
function activeLabel(group: OptionGroup): string | undefined {
  const active = group.options.filter((o, i) => o.active && !(i === 0 && /^(指定なし|すべて)$/.test(o.label)))
  return active.length ? active.map(o => o.label).join('・') : undefined
}

// スマホのシートでは、予算・育てやすさを先に並べる
const SHEET_FIRST = ['予算', '育てやすさ']
function sheetGroups(menus: FilterMenu[]): OptionGroup[] {
  const groups = flattenGroups(menus)
  const first = SHEET_FIRST.flatMap(title => groups.filter(g => g.title === title))
  return [...first, ...groups.filter(g => !first.includes(g))]
}

function OptionLink({ option, variant, replace = false }: { option: FilterOption; variant: 'panel' | 'sheet'; replace?: boolean }) {
  return (
    <Link
      href={option.href}
      scroll={false}
      replace={replace}
      aria-current={option.active ? 'true' : undefined}
      className={`flex w-full items-center gap-2 text-left hover:text-ink ${
        variant === 'panel' ? 'border-b border-paper-deep py-2 text-[13.5px]' : 'min-h-11 text-[14.5px]'
      } ${option.active ? 'text-ink' : 'text-ink-soft'}`}
    >
      <span className="w-3 shrink-0 text-gold-dark" aria-hidden="true">{option.active ? '—' : ''}</span>
      <span className="flex-1">{option.label}</span>
    </Link>
  )
}

// PCのパネル：条件の選択肢を4列に並べる。押すとすぐ一覧に反映され、パネルは開いたまま
function PanelGroups({ menus }: { menus: FilterMenu[] }) {
  return (
    <div className="grid grid-cols-4 gap-x-7 gap-y-5">
      {flattenGroups(menus).map(group => (
        <div key={group.key}>
          <div className="mb-1.5 text-[11.5px] tracking-[0.06em] text-ink-muted">{group.title}</div>
          {group.options.map(option => <OptionLink key={option.href + option.label} option={option} variant="panel" />)}
        </div>
      ))}
    </div>
  )
}

// スマホのシート：条件ごとに開閉できる一覧。押すとすぐ一覧に反映され、シートは開いたまま
// （シートを開いたときに積んだ履歴を置き換えるため replace で移動する）
function SheetGroups({ groups, expanded, onToggle }: { groups: OptionGroup[]; expanded: Set<string>; onToggle: (key: string) => void }) {
  return (
    <div>
      {groups.map(group => {
        const open = expanded.has(group.key)
        const current = activeLabel(group)
        const id = `sheet-group-${group.key}`
        return (
          <div key={group.key} className="border-b border-line">
            <button
              type="button"
              onClick={() => onToggle(group.key)}
              aria-expanded={open}
              aria-controls={id}
              className="flex min-h-[52px] w-full items-center gap-3 text-left"
            >
              <span className="shrink-0 text-[13.5px] tracking-[0.04em] text-ink">{group.title}</span>
              <span className={`min-w-0 flex-1 truncate text-right text-[12.5px] ${current ? 'text-ink' : 'text-ink-muted'}`}>{current ?? '指定なし'}</span>
              <span className="w-3 shrink-0 text-center text-[9px] text-ink-muted" aria-hidden="true">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div id={id} className="pb-2">
                {group.options.map(option => <OptionLink key={option.href + option.label} option={option} variant="sheet" replace />)}
              </div>
            )}
          </div>
        )
      })}
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

const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

interface FilterBarProps {
  allTab: SpeciesTab
  tabs: SpeciesTab[]
  // タブの列の名前（樹種・鉢・土・道具）
  tabsLabel?: string
  // 条件のパネルに出す選択肢
  menus: FilterMenu[]
  sort: FilterMenu
  // 選択中の条件の名前（「条件」の横に表示）
  conditions: string[]
  activeCount: number
  total: number
  clearHref: string
  // キーワード・価格の入力欄の送信先
  keywordForm: KeywordFormTarget
  // 今の一覧の URL（シートを開いたまま条件を変えたときに、戻るボタン用の履歴を積み直す）
  currentUrl: string
}

// 一覧の上の帯：樹種のタブ（横スクロール）と、PCは「条件」「並び順」、スマホは「条件」ボタン
export function FilterBar({ allTab, tabs, tabsLabel = '樹種', menus, sort, conditions, activeCount, total, clearHref, keywordForm, currentUrl }: FilterBarProps) {
  const router = useRouter()
  const [panelOpen, setPanelOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [keyword, setKeyword] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [priceError, setPriceError] = useState<string | null>(null)
  const tabsRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelTriggerRef = useRef<HTMLButtonElement>(null)
  const sheetTriggerRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const keywordRef = useRef<HTMLInputElement>(null)
  const [scrollEdge, setScrollEdge] = useState({ left: false, right: false })

  const closeSheetState = useCallback(() => setSheetOpen(false), [])
  const { dismiss, isMarked, mark } = useHistoryDismiss(sheetOpen, closeSheetState, '__bonsaiFilterSheet')
  useFocusTrap(sheetRef, sheetOpen)

  // 選択中の樹種のタブが見えるように、横スクロールの位置を合わせる
  useEffect(() => {
    const nav = tabsRef.current
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!nav || !active) return
    nav.scrollLeft = Math.max(0, active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2)
  }, [allTab.active, tabs])

  // タブの列の左右に続きがあるか（PCの「‹ ›」ボタンと、右端のぼかしに使う）
  const updateEdges = useCallback(() => {
    const nav = tabsRef.current
    if (!nav) return
    const left = nav.scrollLeft > 4
    const right = nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4
    setScrollEdge(prev => (prev.left === left && prev.right === right ? prev : { left, right }))
  }, [])
  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)
    return () => window.removeEventListener('resize', updateEdges)
  }, [updateEdges, tabs])
  const scrollTabs = (dir: 1 | -1) => {
    const nav = tabsRef.current
    nav?.scrollBy({ left: dir * Math.max(160, nav.clientWidth * 0.6), behavior: 'smooth' })
  }

  // PCのパネル：開いたら最初の選択肢へ、閉じたら「条件」ボタンへフォーカスを移す
  const panelWasOpen = useRef(false)
  useEffect(() => {
    if (panelOpen) {
      panelRef.current?.querySelector<HTMLElement>('a[href], button')?.focus()
    } else if (panelWasOpen.current && !sheetOpen) {
      panelTriggerRef.current?.focus()
    }
    panelWasOpen.current = panelOpen
  }, [panelOpen, sheetOpen])

  // シート：開いたらシートへ、閉じたら開いたボタンへフォーカスを移す
  const sheetWasOpen = useRef(false)
  useEffect(() => {
    if (sheetOpen) {
      if (isDesktop()) keywordRef.current?.focus()
      else sheetRef.current?.focus()
    } else if (sheetWasOpen.current) {
      ;(isDesktop() ? panelTriggerRef.current : sheetTriggerRef.current)?.focus()
    }
    sheetWasOpen.current = sheetOpen
  }, [sheetOpen])

  // シートを開いたまま条件を選ぶと URL が置き換わるので、戻るボタン用の履歴を積み直す
  useEffect(() => {
    if (sheetOpen) mark()
  }, [sheetOpen, currentUrl, mark])

  useEffect(() => {
    if (!sheetOpen && !panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (sheetOpen) dismiss()
      setPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    if (sheetOpen) document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [sheetOpen, panelOpen, dismiss])

  const groups = sheetGroups(menus)

  const openSheet = () => {
    // 予算・育てやすさと、選択中の条件があるものは開いた状態で始める
    setExpanded(new Set(groups.filter(g => SHEET_FIRST.includes(g.title) || activeLabel(g)).map(g => g.key)))
    setKeyword(keywordForm.q ?? '')
    setMin(initialMin)
    setMax(initialMax)
    setPriceError(null)
    setPanelOpen(false)
    setSheetOpen(true)
  }

  const toggleGroup = (key: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const toPrice = (value: string): number | undefined => {
    const n = Math.floor(Number(value.replace(/[,，円\s]/g, '').replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0) - 0xfee0))))
    return Number.isFinite(n) && n > 0 ? n : undefined
  }
  const q = keyword.trim().slice(0, keywordForm.maxLength)
  let minValue = toPrice(min)
  let maxValue = toPrice(max)
  const initialMin = keywordForm.min ? String(keywordForm.min) : ''
  const initialMax = keywordForm.max ? String(keywordForm.max) : ''
  const changed = q !== (keywordForm.q ?? '') || min.trim() !== initialMin || max.trim() !== initialMax

  // 入力したキーワード・価格で探す（空の項目は URL に入れない）。何も変えていなければ閉じるだけ
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!changed) {
      dismiss()
      return
    }
    if ((min.trim() && minValue === undefined) || (max.trim() && maxValue === undefined)) {
      setPriceError('価格は半角の数字（円）で入力してください')
      return
    }
    // 下限と上限が逆のときは入れ替える
    if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) [minValue, maxValue] = [maxValue, minValue]
    const params = new URLSearchParams(keywordForm.params)
    if (q) params.set('q', q)
    if (minValue) params.set('min', String(minValue))
    if (maxValue) params.set('max', String(maxValue))
    const query = params.toString()
    const href = query ? `${keywordForm.action}?${query}` : keywordForm.action
    const marked = isMarked()
    setSheetOpen(false)
    // シートを開いたときに積んだ履歴を置き換える（戻るで、検索する前の一覧に戻る）
    if (marked) router.replace(href)
    else router.push(href)
  }

  const conditionText = conditions.length ? conditions.join('・') : '指定なし'
  const inputClass = 'mt-1 h-11 w-full rounded-none border border-line bg-white px-3 text-sm text-ink'
  const labelClass = 'text-[11.5px] tracking-[0.06em] text-ink-muted'

  return (
    <div className="sticky top-14 z-30 border-y border-line bg-paper lg:border-t-0">
      <div className="relative mx-auto flex h-12 max-w-[1280px] items-stretch lg:h-14 lg:items-center lg:gap-6 lg:px-12">
        <div className="relative flex h-full min-w-0 flex-1 items-stretch">
          {scrollEdge.left && (
            <button
              type="button"
              onClick={() => scrollTabs(-1)}
              aria-label="前のタブを表示"
              className="absolute left-0 top-0 z-10 hidden h-full w-9 items-center justify-start bg-[linear-gradient(to_right,#faf9f6_55%,rgba(250,249,246,0))] text-ink-muted hover:text-ink lg:flex"
            >
              ‹
            </button>
          )}
          <nav
            ref={tabsRef}
            onScroll={updateEdges}
            aria-label={tabsLabel}
            className="relative flex h-full min-w-0 flex-1 items-stretch gap-5 overflow-x-auto px-4 [scrollbar-width:none] lg:gap-[26px] lg:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <TabLink tab={allTab} />
            {tabs.map(tab => <TabLink key={tab.key} tab={tab} />)}
          </nav>
          {/* 右に続きがあるときは、右端をぼかして（PCは「›」ボタンも）続きがあることを示す */}
          {scrollEdge.right && (
            <>
              <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-[linear-gradient(to_left,#faf9f6,rgba(250,249,246,0))] lg:hidden" aria-hidden="true" />
              <button
                type="button"
                onClick={() => scrollTabs(1)}
                aria-label="続きのタブを表示"
                className="absolute right-0 top-0 z-10 hidden h-full w-12 items-center justify-end bg-[linear-gradient(to_left,#faf9f6_45%,rgba(250,249,246,0))] text-base text-ink-muted hover:text-ink lg:flex"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* PC：条件のパネルと並び順 */}
        <div className="hidden h-[22px] w-px bg-line lg:block" aria-hidden="true" />
        <button
          ref={panelTriggerRef}
          type="button"
          onClick={() => setPanelOpen(v => !v)}
          aria-expanded={panelOpen}
          aria-haspopup="dialog"
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
          ref={sheetTriggerRef}
          type="button"
          onClick={openSheet}
          aria-haspopup="dialog"
          className="flex shrink-0 items-center gap-1.5 border-l border-line bg-paper px-4 text-[13px] text-ink lg:hidden"
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
            <div ref={panelRef} role="dialog" aria-label="条件" className="absolute right-12 top-full z-50 hidden w-[820px] max-w-[calc(100vw-96px)] border border-line bg-white shadow-[0_18px_40px_rgba(34,32,28,0.1)] lg:block">
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-[26px] pb-2.5 pt-[22px]">
                <PanelGroups menus={menus} />
              </div>
              <div className="flex items-center gap-5 border-t border-paper-deep px-[26px] pb-[18px] pt-3.5">
                <Link href={clearHref} scroll={false} onClick={() => setPanelOpen(false)} className="text-[12.5px] text-ink-muted hover:text-ink">すべて解除</Link>
                <button type="button" onClick={openSheet} className="border-b border-ink pb-0.5 text-[12.5px] text-ink">
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
        <div className="fixed inset-0 z-[60] bg-paper lg:flex lg:items-center lg:justify-center lg:bg-black/40" onClick={dismiss}>
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-sheet-title"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
            className="flex h-full w-full flex-col bg-paper outline-none lg:h-auto lg:max-h-[88vh] lg:max-w-xl"
          >
            <div className="flex h-[52px] shrink-0 items-center border-b border-line pl-5 pr-2">
              <span id="filter-sheet-title" className="font-mincho text-[17px] font-bold">
                <span className="lg:hidden">条件</span>
                <span className="hidden lg:inline">キーワード・価格</span>
              </span>
              <button type="button" onClick={dismiss} className="ml-auto flex h-11 min-w-11 items-center justify-center px-3 text-[13px]">閉じる</button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5">
              <div className="lg:hidden">
                <SheetGroups groups={groups} expanded={expanded} onToggle={toggleGroup} />
              </div>
              <form id="filter-sheet-form" action={keywordForm.action} method="get" onSubmit={submit} className="space-y-4 pb-6 pt-5">
                {keywordForm.params.map(([name, value], i) => <input key={`${name}-${i}`} type="hidden" name={name} value={value} />)}
                <div className="lg:hidden text-[11.5px] tracking-[0.06em] text-ink-muted">キーワード・価格を入力して探す</div>
                <label className="block">
                  <span className={labelClass}>キーワード</span>
                  <input
                    ref={keywordRef}
                    type="search"
                    name="q"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    maxLength={keywordForm.maxLength}
                    enterKeyHint="search"
                    placeholder="例：五葉松 ミニ、信楽焼 鉢"
                    className={inputClass}
                  />
                </label>
                <fieldset>
                  <legend className={labelClass}>価格（円）</legend>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="text" inputMode="numeric" name="min" value={min} onChange={e => { setMin(e.target.value); setPriceError(null) }} placeholder="下限" aria-label="価格の下限（円）" className={`${inputClass} mt-0`} />
                    <span className="shrink-0 text-ink-muted" aria-hidden="true">〜</span>
                    <input type="text" inputMode="numeric" name="max" value={max} onChange={e => { setMax(e.target.value); setPriceError(null) }} placeholder="上限" aria-label="価格の上限（円）" className={`${inputClass} mt-0`} />
                  </div>
                  {priceError && <p className="mt-1.5 text-[12px] text-red-700" role="alert">{priceError}</p>}
                </fieldset>
              </form>
            </div>
            <div className="flex shrink-0 items-center gap-4 border-t border-line px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-3 lg:pb-[18px]">
              <Link href={clearHref} scroll={false} replace onClick={closeSheetState} className="flex min-h-11 items-center text-[13px] text-ink-muted">すべて解除</Link>
              <button type="submit" form="filter-sheet-form" className="h-[50px] flex-1 bg-sumi text-sm tracking-[0.06em] text-white">
                {changed ? 'キーワード・価格で探す' : `${total.toLocaleString()}件を見る`}
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
// 履歴は置き換える（戻るボタンで一覧の前のページに戻れるように）
export function ListSelectArea({ children, className = '' }: { children: ReactNode; className?: string }) {
  const router = useRouter()
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-select-href]')
    if (!anchor || !window.matchMedia('(min-width: 1024px)').matches) return
    e.preventDefault()
    router.replace(anchor.dataset.selectHref!, { scroll: false })
  }
  // リンク自身の処理より先に受け取るため、キャプチャで処理する
  return <div className={className} onClickCapture={onClick}>{children}</div>
}
